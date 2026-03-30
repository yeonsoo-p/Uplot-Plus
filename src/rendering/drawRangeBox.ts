/**
 * Style options for a range box (box-whisker / candlestick).
 */
export interface RangeBoxStyle {
  /** Wick/whisker line color */
  wickColor?: string;
  /** Wick/whisker line width (CSS px, default 1) */
  wickWidth?: number;
  /** Body fill color */
  bodyFill: string;
  /** Body stroke color (undefined = no stroke) */
  bodyStroke?: string;
  /** Body stroke width (CSS px, default 1.5) */
  bodyStrokeWidth?: number;
  /** Horizontal cap line width at wick ends (0 or undefined = no caps) */
  capWidth?: number;
  /** Median/highlight line color (undefined = no line) */
  midColor?: string;
  /** Median/highlight line width (CSS px, default 2.5) */
  midWidth?: number;
}

/**
 * Draw a single range box: vertical wick + filled body + optional caps + optional median line.
 * Used by both BoxWhisker and Candlestick components.
 *
 * All coordinates are in CSS pixels (not scaled by pxRatio — the caller handles that via valToX/valToY).
 */
export function drawRangeBox(
  ctx: CanvasRenderingContext2D,
  cx: number,
  wickLo: number,
  wickHi: number,
  boxLo: number,
  boxHi: number,
  boxWidth: number,
  mid: number | null,
  style: RangeBoxStyle,
): void {
  const halfW = boxWidth / 2;

  // Wick (vertical line from lo to hi)
  if (style.wickColor != null) {
    ctx.strokeStyle = style.wickColor;
    ctx.lineWidth = style.wickWidth ?? 1;
    ctx.beginPath();
    ctx.moveTo(cx, wickLo);
    ctx.lineTo(cx, wickHi);
    ctx.stroke();
  }

  // Caps (horizontal lines at wick ends)
  if (style.capWidth != null && style.capWidth > 0) {
    const capHalf = style.capWidth / 2;
    ctx.strokeStyle = style.wickColor ?? '#555';
    ctx.lineWidth = style.wickWidth ?? 1;
    ctx.beginPath();
    ctx.moveTo(cx - capHalf, wickLo);
    ctx.lineTo(cx + capHalf, wickLo);
    ctx.moveTo(cx - capHalf, wickHi);
    ctx.lineTo(cx + capHalf, wickHi);
    ctx.stroke();
  }

  // Body (filled rectangle)
  const boxTop = Math.min(boxLo, boxHi);
  const boxH = Math.abs(boxHi - boxLo);
  ctx.fillStyle = style.bodyFill;
  ctx.fillRect(cx - halfW, boxTop, boxWidth, boxH);

  if (style.bodyStroke != null) {
    ctx.strokeStyle = style.bodyStroke;
    ctx.lineWidth = style.bodyStrokeWidth ?? 1.5;
    ctx.strokeRect(cx - halfW, boxTop, boxWidth, boxH);
  }

  // Median / highlight line
  if (mid != null && style.midColor != null) {
    ctx.strokeStyle = style.midColor;
    ctx.lineWidth = style.midWidth ?? 2.5;
    ctx.beginPath();
    ctx.moveTo(cx - halfW, mid);
    ctx.lineTo(cx + halfW, mid);
    ctx.stroke();
  }
}
