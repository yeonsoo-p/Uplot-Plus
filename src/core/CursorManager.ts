import type { CursorState, ScaleState, BBox } from '../types';
import type { ChartData } from '../types/data';
import type { SeriesConfig } from '../types/series';
import { valToPos, posToVal, isScaleReady } from './Scale';
import { closestIdx } from '../math/utils';
import { Orientation } from '../types/common';

/** Orientation-aware (cssCoord, dim, off) for a scale. */
function axisDims(scale: ScaleState, cssX: number, cssY: number, plotBox: BBox): { css: number; dim: number; off: number } {
  if (scale.ori === Orientation.Horizontal) {
    return { css: cssX, dim: plotBox.width, off: plotBox.left };
  }
  return { css: cssY, dim: plotBox.height, off: plotBox.top };
}

/** Minimal store interface to avoid circular dependency with ChartStore. */
export interface SyncTarget {
  dataStore: { data: ChartData; getWindow(gi: number): [number, number] };
  scaleManager: { getGroupXScaleId(gi: number): string | undefined; getScale(id: string): ScaleState | undefined };
  seriesConfigs: SeriesConfig[];
  plotBox: BBox;
}

/**
 * Manages cursor position and nearest-point snapping.
 * Computes the closest data point across all visible series/groups
 * using pixel-space Euclidean distance.
 */
/** Off-screen position used to hide the cursor */
const CURSOR_HIDDEN = -10;

export class CursorManager {
  state: CursorState = {
    left: CURSOR_HIDDEN,
    top: CURSOR_HIDDEN,
    activeGroup: -1,
    activeSeriesIndex: -1,
    activeDataIndex: -1,
  };

  /** Cached grouping of visible series configs by group index */
  private _groupedConfigs = new Map<number, SeriesConfig[]>();
  private _groupedConfigsSource: SeriesConfig[] | null = null;

  /** Rebuild grouped configs only when seriesConfigs array reference changes */
  private getGroupedConfigs(seriesConfigs: SeriesConfig[]): Map<number, SeriesConfig[]> {
    if (this._groupedConfigsSource !== seriesConfigs) {
      this._groupedConfigsSource = seriesConfigs;
      this._groupedConfigs.clear();
      for (const sc of seriesConfigs) {
        if (sc.show === false) continue;
        let arr = this._groupedConfigs.get(sc.group);
        if (arr == null) {
          arr = [];
          this._groupedConfigs.set(sc.group, arr);
        }
        arr.push(sc);
      }
    }
    return this._groupedConfigs;
  }

  /** Invalidate groupedConfigs cache (call after toggleSeries, etc.) */
  invalidateGroupedConfigs(): void {
    this._groupedConfigsSource = null;
  }

  /** Hide the cursor (move off-screen) */
  hide(): void {
    this.state.left = CURSOR_HIDDEN;
    this.state.top = CURSOR_HIDDEN;
    this.state.activeGroup = -1;
    this.state.activeSeriesIndex = -1;
    this.state.activeDataIndex = -1;
  }

  /**
   * Update cursor position and snap to nearest data point.
   *
   * @param cssX - cursor X in CSS pixels relative to plot area left
   * @param cssY - cursor Y in CSS pixels relative to plot area top
   * @param plotBox - current plot bounding box
   * @param data - chart data groups
   * @param seriesConfigs - all series configs
   * @param getScale - scale lookup
   */
  update(
    cssX: number,
    cssY: number,
    plotBox: BBox,
    data: ChartData,
    seriesConfigs: SeriesConfig[],
    getScale: (id: string) => ScaleState | undefined,
    getWindow: (groupIdx: number) => [number, number],
    getGroupXScaleId: (groupIdx: number) => string | undefined,
  ): void {
    this.state.left = cssX;
    this.state.top = cssY;

    let bestDist = Infinity;
    let bestGroup = -1;
    let bestSeries = -1;
    let bestIdx = -1;

    // Use cached grouped configs (rebuilt only when seriesConfigs reference changes)
    const groupedConfigs = this.getGroupedConfigs(seriesConfigs);

    for (let gi = 0; gi < data.length; gi++) {
      const group = data[gi];
      if (group == null) continue;

      const xData = group.x;
      if (xData.length === 0) continue;

      // Determine x-scale for this group
      const xScaleId = getGroupXScaleId(gi);
      if (xScaleId == null) continue;
      const xScale = getScale(xScaleId);
      if (xScale == null || !isScaleReady(xScale)) continue;

      const [wi0, wi1] = getWindow(gi);

      // Orientation-aware: pick cssX/cssY based on each scale's ori. For horizontal
      // bars (xScale.ori = Vertical), the category position is read from cssY.
      const xAxis = axisDims(xScale, cssX, cssY, plotBox);

      // closestIdx on the x data within the visible window
      const cursorXVal = posToVal(xAxis.css + xAxis.off, xScale, xAxis.dim, xAxis.off);
      const dataIdx = closestIdx(cursorXVal, xData, wi0, wi1);

      // Check adjacent x-indices for better snapping accuracy
      // The nearest point in pixel space may be at dataIdx ± 1 due to y-value proximity
      const candidates = [dataIdx];
      if (dataIdx > wi0) candidates.push(dataIdx - 1);
      if (dataIdx < wi1) candidates.push(dataIdx + 1);

      // Cache y-scale lookups to avoid redundant calls when multiple series share the same y-scale
      const yScaleCache = new Map<string, ScaleState | undefined>();

      for (const di of candidates) {
        const xVal = xData[di];
        if (xVal == null) continue;

        const pxX = valToPos(xVal, xScale, xAxis.dim, xAxis.off);

        // Check each series in this group
        for (const sc of groupedConfigs.get(gi) ?? []) {

          const yData = group.series[sc.index];
          if (yData == null) continue;

          const yVal = yData[di];
          if (yVal == null) continue;

          let yScaleState = yScaleCache.get(sc.yScaleId);
          if (yScaleState == null && !yScaleCache.has(sc.yScaleId)) {
            yScaleState = getScale(sc.yScaleId);
            yScaleCache.set(sc.yScaleId, yScaleState);
          }
          if (yScaleState == null || !isScaleReady(yScaleState)) continue;

          const yAxis = axisDims(yScaleState, cssX, cssY, plotBox);
          const pxY = valToPos(yVal, yScaleState, yAxis.dim, yAxis.off);

          // pxX runs along xScale's screen axis; pxY along yScale's. In any sane setup
          // one is Horizontal and the other Vertical, so they recombine into (canvasX, canvasY):
          const xIsHoriz = xScale.ori === Orientation.Horizontal;
          const pointCanvasX = xIsHoriz ? pxX : pxY;
          const pointCanvasY = xIsHoriz ? pxY : pxX;

          // Euclidean distance in CSS pixel space
          const dx = (cssX + plotBox.left) - pointCanvasX;
          const dy = (cssY + plotBox.top)  - pointCanvasY;
          const dist = dx * dx + dy * dy; // skip sqrt for comparison

          if (dist < bestDist) {
            bestDist = dist;
            bestGroup = gi;
            bestSeries = sc.index;
            bestIdx = di;

            // Early exit on exact hit
            if (dist === 0) break;
          }
        }

        if (bestDist === 0) break;
      }
    }

    this.state.activeGroup = bestGroup;
    this.state.activeSeriesIndex = bestSeries;
    this.state.activeDataIndex = bestIdx;
  }

  /**
   * Sync cursor to a specific x-value (from another chart in a sync group).
   * Finds the closest data index and positions the cursor there.
   */
  syncToValue(xVal: number, store: SyncTarget, sourceGroup = 0): void {
    const data = store.dataStore.data;
    if (data.length === 0) return;

    // Resolve target group — fall back to 0 if sourceGroup doesn't exist
    const groupIdx = sourceGroup < data.length ? sourceGroup : 0;

    const group = data[groupIdx];
    if (group == null) return;

    const xScaleId = store.scaleManager.getGroupXScaleId(groupIdx);
    if (xScaleId == null) return;
    const xScale = store.scaleManager.getScale(xScaleId);
    if (xScale == null || !isScaleReady(xScale)) return;

    const [wi0, wi1] = store.dataStore.getWindow(groupIdx);
    const dataIdx = closestIdx(xVal, group.x, wi0, wi1);
    const foundX = group.x[dataIdx];
    if (foundX == null) return;

    const xIsHoriz = xScale.ori === Orientation.Horizontal;
    const xDim = xIsHoriz ? store.plotBox.width : store.plotBox.height;
    const xOff = xIsHoriz ? store.plotBox.left  : store.plotBox.top;
    const pxX = valToPos(foundX, xScale, xDim, xOff);

    this.state.activeGroup = groupIdx;
    this.state.activeDataIndex = dataIdx;

    // Find first visible series to compute proper position along the y axis.
    // Fallback (no series found): center of plot area in canvas coords.
    let bestSeriesIdx = 0;
    let pxY = xIsHoriz
      ? store.plotBox.top  + store.plotBox.height / 2
      : store.plotBox.left + store.plotBox.width  / 2;

    for (const sc of store.seriesConfigs) {
      if (sc.group !== groupIdx || sc.show === false) continue;
      const yData = group.series[sc.index];
      if (yData == null) continue;
      const yVal = yData[dataIdx];
      if (yVal == null) continue;
      const yScale = store.scaleManager.getScale(sc.yScaleId);
      if (yScale == null || !isScaleReady(yScale)) continue;

      const yIsHoriz = yScale.ori === Orientation.Horizontal;
      const yDim = yIsHoriz ? store.plotBox.width : store.plotBox.height;
      const yOff = yIsHoriz ? store.plotBox.left  : store.plotBox.top;
      pxY = valToPos(yVal, yScale, yDim, yOff);
      bestSeriesIdx = sc.index;
      break;
    }

    // Recombine pixel positions into (left, top) — pxX is along xScale's axis, pxY along yScale's.
    const canvasX = xIsHoriz ? pxX : pxY;
    const canvasY = xIsHoriz ? pxY : pxX;
    this.state.left = canvasX - store.plotBox.left;
    this.state.top  = canvasY - store.plotBox.top;
    this.state.activeSeriesIndex = bestSeriesIdx;
  }
}
