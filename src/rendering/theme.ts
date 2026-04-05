/** Cached CSS custom property values for themeable canvas defaults. */
export interface ThemeCache {
  axisStroke: string;
  gridStroke: string;
  titleFill: string;
  cursorStroke: string;
  pointFill: string;
  selectFill: string;
  selectStroke: string;
}

const DEFAULTS: ThemeCache = {
  axisStroke: '#000',
  gridStroke: 'rgba(0,0,0,0.12)',
  titleFill: '#000',
  cursorStroke: '#607D8B',
  pointFill: '#fff',
  selectFill: 'rgba(0,0,0,0.07)',
  selectStroke: 'rgba(0,0,0,0.15)',
};

/** Read CSS custom properties from a canvas element, with hardcoded fallbacks. */
export function readThemeVars(canvas: HTMLCanvasElement | null): ThemeCache {
  if (canvas == null) return DEFAULTS;
  const cs = getComputedStyle(canvas);
  const v = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
  return {
    axisStroke: v('--uplot-axis-stroke', DEFAULTS.axisStroke),
    gridStroke: v('--uplot-grid-stroke', DEFAULTS.gridStroke),
    titleFill: v('--uplot-title-fill', DEFAULTS.titleFill),
    cursorStroke: v('--uplot-cursor-stroke', DEFAULTS.cursorStroke),
    pointFill: v('--uplot-point-fill', DEFAULTS.pointFill),
    selectFill: v('--uplot-select-fill', DEFAULTS.selectFill),
    selectStroke: v('--uplot-select-stroke', DEFAULTS.selectStroke),
  };
}
