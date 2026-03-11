import type { ChartData } from './data';
import type { DrawCallback, CursorDrawCallback } from './hooks';

/** Focus mode configuration */
export interface FocusConfig {
  /** Alpha opacity for non-focused series (default: 0.15) */
  alpha?: number;
}

/** Cursor/interaction configuration */
export interface CursorConfig {
  /** Enable mouse wheel zoom on x-axis (default: false) */
  wheelZoom?: boolean;
  /** Focus mode: dims non-closest series on hover */
  focus?: FocusConfig;
}

/** Props for the Chart component */
export interface ChartProps {
  /** Width in CSS pixels */
  width: number;
  /** Height in CSS pixels */
  height: number;
  /** Chart data */
  data: ChartData;
  /** React children (Scale, Series, Axis, Legend, Tooltip, Band) */
  children?: React.ReactNode;
  /** CSS class name */
  className?: string;
  /** Device pixel ratio override (default: window.devicePixelRatio) */
  pxRatio?: number;
  /** Draw on the persistent layer (after series, before snapshot). */
  onDraw?: DrawCallback;
  /** Draw on the cursor overlay (redrawn every frame). */
  onCursorDraw?: CursorDrawCallback;
  /** Sync key — charts with the same key synchronize their cursors. */
  syncKey?: string;
  /** Cursor and interaction config */
  cursor?: CursorConfig;
}
