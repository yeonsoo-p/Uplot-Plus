import type { SelectState, BBox } from '../types';
import { round } from '../math/utils';
import type { ResolvedTheme } from './theme';
import { THEME_DEFAULTS } from './theme';

export interface SelectDrawConfig {
  /** Fill color for selection rectangle */
  fill?: string;
  /** Stroke color for selection border */
  stroke?: string;
  /** Stroke width */
  width?: number;
}

const defaultSelectConfig: Required<SelectDrawConfig> = {
  fill: THEME_DEFAULTS.selectFill,
  stroke: THEME_DEFAULTS.selectStroke,
  width: THEME_DEFAULTS.selectWidth,
};

/**
 * Draw the drag-to-zoom selection rectangle.
 */
export function drawSelection(
  ctx: CanvasRenderingContext2D,
  select: SelectState,
  plotBox: BBox,
  pxRatio: number,
  config?: SelectDrawConfig,
  theme?: ResolvedTheme,
): void {
  if (!select.show || select.width <= 0) return;

  const t = theme ?? THEME_DEFAULTS;
  const themedDefaults: SelectDrawConfig = {
    fill: t.selectFill,
    stroke: t.selectStroke,
    width: t.selectWidth,
  };
  const cfg = { ...defaultSelectConfig, ...themedDefaults, ...config };
  const pr = pxRatio;

  const x = round((plotBox.left + select.left) * pr);
  const y = round((plotBox.top + select.top) * pr);
  const w = round(select.width * pr);
  const h = round(select.height * pr);

  ctx.save();

  ctx.fillStyle = cfg.fill;
  ctx.fillRect(x, y, w, h);

  if (cfg.width > 0) {
    ctx.strokeStyle = cfg.stroke;
    ctx.lineWidth = round(cfg.width * pr);
    ctx.strokeRect(x, y, w, h);
  }

  ctx.restore();
}
