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

/** Maximum number of cached path entries before full cache clear */
const MAX_CACHE_SIZE = 64;

/**
 * Imperative canvas renderer.
 * Handles clearing, drawing series, and (later) axes, cursor, selection.
 * This is completely decoupled from React.
 */
export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D | null = null;
  private pxRatio = 1;

  // --- Two-level path cache: group -> index -> windowKey -> SeriesPaths ---
  // Enables O(1) invalidation by group or series without string prefix scanning.
  private pathCache = new Map<number, Map<number, Map<string, SeriesPaths>>>();
  private pathCacheSize = 0;

  // --- Offscreen canvas for cursor-only snapshot (avoids getImageData/putImageData) ---
  private snapshotCanvas: OffscreenCanvas | HTMLCanvasElement | null = null;
  private snapshotValid = false;

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

  // --- Offscreen canvas snapshot ---

  /** Save a snapshot of the current canvas using an offscreen canvas (much cheaper than getImageData) */
  saveSnapshot(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const canvas = ctx.canvas;

    // Lazily create or resize the offscreen canvas
    if (this.snapshotCanvas == null ||
        this.snapshotCanvas.width !== w ||
        this.snapshotCanvas.height !== h) {
      this.snapshotCanvas = typeof OffscreenCanvas !== 'undefined'
        ? new OffscreenCanvas(w, h)
        : document.createElement('canvas');
      this.snapshotCanvas.width = w;
      this.snapshotCanvas.height = h;
    }

    const snapCtx = this.snapshotCanvas.getContext('2d');
    if (snapCtx != null && typeof snapCtx.drawImage === 'function') {
      snapCtx.clearRect(0, 0, w, h);
      snapCtx.drawImage(canvas, 0, 0);
      this.snapshotValid = true;
    }
  }

  /** Restore a previously saved snapshot. Returns false if no snapshot exists. */
  restoreSnapshot(ctx: CanvasRenderingContext2D): boolean {
    if (!this.snapshotValid || this.snapshotCanvas == null || typeof ctx.drawImage !== 'function') return false;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(this.snapshotCanvas, 0, 0);
    return true;
  }

  /** Invalidate the saved snapshot */
  invalidateSnapshot(): void {
    this.snapshotValid = false;
  }

  // --- Two-level path cache ---

  private windowKey(i0: number, i1: number): string {
    return `${i0}:${i1}`;
  }

  /** Get cached paths for a series */
  getCachedPaths(group: number, index: number, i0: number, i1: number): SeriesPaths | undefined {
    const groupMap = this.pathCache.get(group);
    if (groupMap == null) return undefined;
    const indexMap = groupMap.get(index);
    if (indexMap == null) return undefined;
    const key = this.windowKey(i0, i1);
    return indexMap.get(key);
  }

  /** Store paths in cache, clearing all entries when at capacity */
  setCachedPaths(group: number, index: number, i0: number, i1: number, paths: SeriesPaths): void {
    // Clear all when at capacity (simple eviction strategy)
    if (this.pathCacheSize >= MAX_CACHE_SIZE) {
      this.pathCache.clear();
      this.pathCacheSize = 0;
    }

    let groupMap = this.pathCache.get(group);
    if (groupMap == null) {
      groupMap = new Map();
      this.pathCache.set(group, groupMap);
    }

    let indexMap = groupMap.get(index);
    if (indexMap == null) {
      indexMap = new Map();
      groupMap.set(index, indexMap);
    }

    const key = this.windowKey(i0, i1);
    if (!indexMap.has(key)) {
      this.pathCacheSize++;
    }
    indexMap.set(key, paths);
  }

  /** Invalidate paths for a specific series (all windows) — O(1) */
  invalidateSeries(group: number, index: number): void {
    const groupMap = this.pathCache.get(group);
    if (groupMap == null) return;
    const indexMap = groupMap.get(index);
    if (indexMap != null) {
      this.pathCacheSize -= indexMap.size;
      groupMap.delete(index);
    }
  }

  /** Invalidate cached paths for a specific group — O(1) */
  clearGroupCache(group: number): void {
    const groupMap = this.pathCache.get(group);
    if (groupMap != null) {
      for (const indexMap of groupMap.values()) {
        this.pathCacheSize -= indexMap.size;
      }
      this.pathCache.delete(group);
    }
    this.snapshotValid = false;
  }

  /** Invalidate all cached paths (e.g. on scale change) */
  clearCache(): void {
    this.pathCache.clear();
    this.pathCacheSize = 0;
    this.snapshotValid = false;
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

    drawSeriesPath(ctx, info.config, paths, pxRatio, plotBox);
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
