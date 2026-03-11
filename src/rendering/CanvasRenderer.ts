import type { SeriesConfig, ScaleState, BBox } from '../types';
import type { SeriesPaths } from '../paths/types';
import { linear } from '../paths/linear';
import { drawSeriesPath } from './drawSeries';
import { round } from '../math/utils';

const defaultPathBuilder = linear();

export interface RenderableSeriesInfo {
  config: SeriesConfig;
  dataX: ArrayLike<number>;
  dataY: ArrayLike<number | null>;
  xScale: ScaleState;
  yScale: ScaleState;
  window: [number, number];
}

/** Maximum number of cached path entries before LRU eviction */
const MAX_CACHE_SIZE = 64;

/**
 * Imperative canvas renderer.
 * Handles clearing, drawing series, and (later) axes, cursor, selection.
 * This is completely decoupled from React.
 */
export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D | null = null;
  private pxRatio = 1;

  // --- Path cache with window-index keying and O(1) LRU via Map insertion order ---
  private pathCache = new Map<string, SeriesPaths>();

  // --- ImageData snapshot for cursor-only redraws ---
  private savedPlot: ImageData | null = null;

  // --- Context property cache (F1) ---
  private cachedFillStyle = '';
  private cachedStrokeStyle = '';
  private cachedLineWidth = -1;
  private cachedFont = '';
  private cachedTextAlign = '';
  private cachedTextBaseline = '';
  private cachedGlobalAlpha = -1;

  setContext(ctx: CanvasRenderingContext2D, pxRatio: number): void {
    this.ctx = ctx;
    this.pxRatio = pxRatio;
    this.resetPropertyCache();
  }

  /** Reset cached property values (after context change) */
  private resetPropertyCache(): void {
    this.cachedFillStyle = '';
    this.cachedStrokeStyle = '';
    this.cachedLineWidth = -1;
    this.cachedFont = '';
    this.cachedTextAlign = '';
    this.cachedTextBaseline = '';
    this.cachedGlobalAlpha = -1;
  }

  /** Set fillStyle only if changed */
  setFillStyle(ctx: CanvasRenderingContext2D, val: string): void {
    if (val !== this.cachedFillStyle) {
      ctx.fillStyle = val;
      this.cachedFillStyle = val;
    }
  }

  /** Set strokeStyle only if changed */
  setStrokeStyle(ctx: CanvasRenderingContext2D, val: string): void {
    if (val !== this.cachedStrokeStyle) {
      ctx.strokeStyle = val;
      this.cachedStrokeStyle = val;
    }
  }

  /** Set lineWidth only if changed */
  setLineWidth(ctx: CanvasRenderingContext2D, val: number): void {
    if (val !== this.cachedLineWidth) {
      ctx.lineWidth = val;
      this.cachedLineWidth = val;
    }
  }

  /** Set font only if changed */
  setFont(ctx: CanvasRenderingContext2D, val: string): void {
    if (val !== this.cachedFont) {
      ctx.font = val;
      this.cachedFont = val;
    }
  }

  /** Set textAlign only if changed */
  setTextAlign(ctx: CanvasRenderingContext2D, val: CanvasTextAlign): void {
    if (val !== this.cachedTextAlign) {
      ctx.textAlign = val;
      this.cachedTextAlign = val;
    }
  }

  /** Set textBaseline only if changed */
  setTextBaseline(ctx: CanvasRenderingContext2D, val: CanvasTextBaseline): void {
    if (val !== this.cachedTextBaseline) {
      ctx.textBaseline = val;
      this.cachedTextBaseline = val;
    }
  }

  /** Set globalAlpha only if changed */
  setGlobalAlpha(ctx: CanvasRenderingContext2D, val: number): void {
    if (val !== this.cachedGlobalAlpha) {
      ctx.globalAlpha = val;
      this.cachedGlobalAlpha = val;
    }
  }

  // --- ImageData snapshot ---

  /** Save a snapshot of the current canvas (after static content is drawn) */
  saveSnapshot(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    this.savedPlot = ctx.getImageData(0, 0, w, h);
  }

  /** Restore a previously saved snapshot. Returns false if no snapshot exists. */
  restoreSnapshot(ctx: CanvasRenderingContext2D): boolean {
    if (this.savedPlot == null) return false;
    ctx.putImageData(this.savedPlot, 0, 0);
    return true;
  }

  /** Invalidate the saved snapshot */
  invalidateSnapshot(): void {
    this.savedPlot = null;
  }

  // --- Path cache ---

  /** Build cache key using data window indices for stable cache hits */
  private cacheKey(group: number, index: number, i0: number, i1: number): string {
    return `${group}:${index}:${i0}:${i1}`;
  }

  /** Get cached paths for a series (O(1) LRU via Map delete+reinsert) */
  getCachedPaths(group: number, index: number, i0: number, i1: number): SeriesPaths | undefined {
    const key = this.cacheKey(group, index, i0, i1);
    const paths = this.pathCache.get(key);
    if (paths != null) {
      // Move to end for LRU: delete and re-insert
      this.pathCache.delete(key);
      this.pathCache.set(key, paths);
    }
    return paths;
  }

  /** Store paths in cache (O(1) LRU eviction) */
  setCachedPaths(group: number, index: number, i0: number, i1: number, paths: SeriesPaths): void {
    const key = this.cacheKey(group, index, i0, i1);

    // Evict oldest entries if at capacity
    while (this.pathCache.size >= MAX_CACHE_SIZE) {
      const oldest = this.pathCache.keys().next().value;
      if (oldest != null) {
        this.pathCache.delete(oldest);
      } else {
        break;
      }
    }

    this.pathCache.set(key, paths);
  }

  /** Invalidate paths for a specific series (all windows) */
  invalidateSeries(group: number, index: number): void {
    const prefix = `${group}:${index}:`;
    for (const key of [...this.pathCache.keys()]) {
      if (key.startsWith(prefix)) {
        this.pathCache.delete(key);
      }
    }
  }

  /** Invalidate cached paths for a specific group */
  clearGroupCache(group: number): void {
    const prefix = `${group}:`;
    for (const key of [...this.pathCache.keys()]) {
      if (key.startsWith(prefix)) {
        this.pathCache.delete(key);
      }
    }
    this.savedPlot = null;
  }

  /** Invalidate all cached paths (e.g. on scale change) */
  clearCache(): void {
    this.pathCache.clear();
    this.savedPlot = null;
  }

  /**
   * Draw a single series onto the canvas (assumes context is already clipped).
   * Builds/caches paths and delegates to drawSeriesPath.
   */
  drawSeries(info: RenderableSeriesInfo, plotBox: BBox, pxRatio: number): void {
    const ctx = this.ctx;
    if (ctx == null || info.config.show === false) return;

    const group = info.config.group;
    const index = info.config.index;
    const [i0, i1] = info.window;

    let paths = this.getCachedPaths(group, index, i0, i1);

    if (paths == null) {
      const pathBuilder = info.config.paths ?? defaultPathBuilder;
      const dir = info.xScale.dir;
      const pxRound = (v: number) => round(v);

      const fillToCfg = info.config.fillTo;
      const fillTo = typeof fillToCfg === 'function'
        ? fillToCfg(info.yScale.min ?? 0, info.yScale.max ?? 0)
        : fillToCfg;

      paths = pathBuilder(
        info.dataX,
        info.dataY,
        info.xScale,
        info.yScale,
        plotBox.width,
        plotBox.height,
        plotBox.left,
        plotBox.top,
        i0,
        i1,
        dir,
        pxRound,
        { fillTo, spanGaps: info.config.spanGaps },
      );

      this.setCachedPaths(group, index, i0, i1, paths);
    }

    drawSeriesPath(ctx, info.config, paths, pxRatio);
  }

  /**
   * Full draw cycle: clear canvas and draw all series.
   */
  draw(
    canvasWidth: number,
    canvasHeight: number,
    plotBox: BBox,
    seriesList: RenderableSeriesInfo[],
  ): void {
    const ctx = this.ctx;
    if (ctx == null) return;

    const pr = this.pxRatio;

    ctx.clearRect(0, 0, canvasWidth * pr, canvasHeight * pr);

    ctx.save();
    ctx.scale(pr, pr);
    ctx.beginPath();
    ctx.rect(plotBox.left, plotBox.top, plotBox.width, plotBox.height);
    ctx.clip();

    for (const info of seriesList) {
      this.drawSeries(info, plotBox, 1);
    }

    ctx.restore();
    this.resetPropertyCache();
  }
}
