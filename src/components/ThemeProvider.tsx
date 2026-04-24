import React, { createContext, useMemo } from 'react';
import type { ChartTheme } from '../types/theme';
import { themeToVars } from '../rendering/theme';

/**
 * Carries the current theme object from ThemeProvider down to descendant
 * Charts.  Chart only needs to detect identity changes (to repaint the
 * canvas when CSS vars change); the value itself is the theme reference.
 */
export const ThemeRevisionContext = createContext<ChartTheme | null>(null);

export interface ThemeProviderProps {
  /** Theme overrides — mapped to CSS custom properties on a wrapper div. */
  theme: ChartTheme;
  children: React.ReactNode;
}

/**
 * ThemeProvider — sets CSS custom properties on a wrapper `<div>` and
 * exposes the theme via React context so descendant Chart components can
 * detect ancestor theme changes and repaint the canvas.
 */
export function ThemeProvider({ theme, children }: ThemeProviderProps): React.ReactElement {
  const style = useMemo(() => themeToVars(theme), [theme]);
  return (
    <ThemeRevisionContext.Provider value={theme}>
      <div style={style}>{children}</div>
    </ThemeRevisionContext.Provider>
  );
}
