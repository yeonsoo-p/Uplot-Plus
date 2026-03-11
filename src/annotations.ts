import type { DrawContext } from './types/hooks';
import type { ScaleState } from './types';
import { valToPos } from './core/Scale';

export interface AnnotationStyle {
  stroke?: string;
  width?: number;
  dash?: number[];
  fill?: string;
  font?: string;
}

/** Draw a horizontal line at a y-value */
export function drawHLine(
  dc: DrawContext,
  yScale: ScaleState,
  value: number,
  style: AnnotationStyle = {},
): void {
  const { ctx, plotBox, pxRatio } = dc;
  const y = valToPos(value, yScale, plotBox.height, plotBox.top);

  ctx.save();
  ctx.scale(pxRatio, pxRatio);
  ctx.beginPath();
  ctx.moveTo(plotBox.left, y);
  ctx.lineTo(plotBox.left + plotBox.width, y);
  ctx.strokeStyle = style.stroke ?? 'red';
  ctx.lineWidth = style.width ?? 1;
  if (style.dash) ctx.setLineDash(style.dash);
  ctx.stroke();
  ctx.restore();
}

/** Draw a vertical line at an x-value */
export function drawVLine(
  dc: DrawContext,
  xScale: ScaleState,
  value: number,
  style: AnnotationStyle = {},
): void {
  const { ctx, plotBox, pxRatio } = dc;
  const x = valToPos(value, xScale, plotBox.width, plotBox.left);

  ctx.save();
  ctx.scale(pxRatio, pxRatio);
  ctx.beginPath();
  ctx.moveTo(x, plotBox.top);
  ctx.lineTo(x, plotBox.top + plotBox.height);
  ctx.strokeStyle = style.stroke ?? 'red';
  ctx.lineWidth = style.width ?? 1;
  if (style.dash) ctx.setLineDash(style.dash);
  ctx.stroke();
  ctx.restore();
}

/** Draw a text label at data coordinates */
export function drawLabel(
  dc: DrawContext,
  xScale: ScaleState,
  yScale: ScaleState,
  xVal: number,
  yVal: number,
  text: string,
  style: AnnotationStyle = {},
): void {
  const { ctx, plotBox, pxRatio } = dc;
  const x = valToPos(xVal, xScale, plotBox.width, plotBox.left);
  const y = valToPos(yVal, yScale, plotBox.height, plotBox.top);

  ctx.save();
  ctx.scale(pxRatio, pxRatio);
  ctx.font = style.font ?? '12px sans-serif';
  ctx.fillStyle = style.fill ?? '#000';
  ctx.textBaseline = 'bottom';
  ctx.fillText(text, x, y - 4);
  ctx.restore();
}

/** Draw a shaded region between two y-values */
export function drawRegion(
  dc: DrawContext,
  yScale: ScaleState,
  yMin: number,
  yMax: number,
  style: AnnotationStyle = {},
): void {
  const { ctx, plotBox, pxRatio } = dc;
  const top = valToPos(yMax, yScale, plotBox.height, plotBox.top);
  const btm = valToPos(yMin, yScale, plotBox.height, plotBox.top);

  ctx.save();
  ctx.scale(pxRatio, pxRatio);
  ctx.fillStyle = style.fill ?? 'rgba(255,0,0,0.1)';
  ctx.fillRect(plotBox.left, Math.min(top, btm), plotBox.width, Math.abs(btm - top));
  if (style.stroke) {
    ctx.strokeStyle = style.stroke;
    ctx.lineWidth = style.width ?? 1;
    if (style.dash) ctx.setLineDash(style.dash);
    ctx.strokeRect(plotBox.left, Math.min(top, btm), plotBox.width, Math.abs(btm - top));
  }
  ctx.restore();
}
