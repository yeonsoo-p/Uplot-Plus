import React, { useMemo } from 'react';
import type { ChartTheme } from '../types/theme';
import { themeToVars } from '../rendering/theme';

export interface ThemeProviderProps {
  /** Theme overrides — mapped to CSS custom properties on a wrapper div. */
  theme: ChartTheme;
  children: React.ReactNode;
}

/**
 * ThemeProvider — sets CSS custom properties on a wrapper `<div>`.
 * No React context — the browser's CSS cascade resolves the variables.
 * RSC-compatible.
 */
export function ThemeProvider({ theme, children }: ThemeProviderProps): React.ReactElement {
  const style = useMemo(() => themeToVars(theme), [theme]);
  return <div style={style}>{children}</div>;
}
