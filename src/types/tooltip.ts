/** Data passed to custom tooltip renderers */
export interface TooltipData {
  /** X value at cursor */
  x: number | null;
  /** Formatted x value */
  xLabel: string;
  /** Series values at cursor */
  items: TooltipItem[];
  /** Cursor CSS position relative to chart container */
  left: number;
  top: number;
}

export interface TooltipItem {
  label: string;
  value: number | null;
  color: string;
  group: number;
  index: number;
}

export interface TooltipProps {
  /** Whether to show the tooltip (default: true) */
  show?: boolean;
  /** CSS class name */
  className?: string;
  /** Custom render function */
  children?: (data: TooltipData) => React.ReactNode;
  /** Offset from cursor in CSS pixels */
  offset?: { x?: number; y?: number };
  /** Max decimal places for the default x label (default: 2). Has no effect when using a custom render function. */
  precision?: number;
  /** Behavior mode: 'cursor' (default, follows cursor) or 'draggable' (fixed position, drag to move). */
  mode?: 'cursor' | 'draggable';
  /** Initial position for draggable mode (default: 'top-right') */
  position?: { x: number; y: number } | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** Opacity when not hovered in draggable mode (default: 0.8) */
  idleOpacity?: number;
}
