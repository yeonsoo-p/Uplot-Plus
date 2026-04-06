// Layout constants for overlay components — used for pixel math in estimatePanelSize.
// Themeable values (colors, fonts, opacity, z-index) live in src/rendering/theme.ts.

import { THEME_DEFAULTS } from '../../rendering/theme';
import type { ResolvedTheme } from '../../rendering/theme';

// --- Swatch ---
export const SWATCH_W = 12;
export const SWATCH_H = 3;
export const SWATCH_RADIUS = 1;

// --- Layout ---
export const ROW_GAP = 4;
export const PANEL_BORDER = 1;
export const PANEL_PAD_X = 6;
export const PANEL_PAD_Y = 4;
export const ROW_PAD_X = 4;
export const ROW_LINE_H = 16;

// --- Fonts (derived from theme defaults, used for pixel measurement) ---
export const PANEL_FONT = `${THEME_DEFAULTS.overlayFontSize}px ${THEME_DEFAULTS.overlayFontFamily}`;
export const PANEL_BOLD_FONT = `bold ${THEME_DEFAULTS.overlayFontSize}px ${THEME_DEFAULTS.overlayFontFamily}`;

/** Build a panel font string from a resolved theme. */
export function panelFont(theme: ResolvedTheme): string {
  return `${theme.overlayFontSize}px ${theme.overlayFontFamily}`;
}

/** Build a bold panel font string from a resolved theme. */
export function panelBoldFont(theme: ResolvedTheme): string {
  return `bold ${theme.overlayFontSize}px ${theme.overlayFontFamily}`;
}
