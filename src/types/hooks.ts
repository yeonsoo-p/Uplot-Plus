import type { BBox } from './common';
import type { CursorState } from './cursor';
import type { ScaleState } from './scales';

/** Context passed to draw callbacks — everything needed to draw on the canvas.
 *
 * The canvas context is pre-configured by the library:
 * - **Clipped** to the plot area (persistent hooks only) — drawing outside is impossible
 * - **Scaled** by `pxRatio` — all coordinates are in CSS pixels, not device pixels
 *
 * Use the `valToX` / `valToY` helpers to convert data values to CSS pixel positions
 * without needing to look up scales or call `valToPos` manually.
 */
export interface DrawContext {
  ctx: CanvasRenderingContext2D;
  plotBox: BBox;
  pxRatio: number;
  /** Get a live scale state by id (reflects current zoom/pan). */
  getScale: (id: string) => ScaleState | undefined;
  /** Convert a data value to CSS pixel X position. Uses scale `'x'` by default. Returns `null` if scale is not ready. */
  valToX: (val: number, scaleId?: string) => number | null;
  /** Convert a data value to CSS pixel Y position. Returns `null` if scale is not ready. */
  valToY: (val: number, scaleId: string) => number | null;
}

/** Callback that draws persistent content (included in snapshot, not redrawn on cursor move). */
export type DrawCallback = (dc: DrawContext) => void;

/** Callback that draws on the cursor overlay (redrawn every frame). */
export type CursorDrawCallback = (dc: DrawContext, cursor: CursorState) => void;
