import type { ChartStore } from '../hooks/useChartStore';
import type { Orientation } from './common';

/**
 * Context computed by the interaction hook, passed to action matchers and reaction handlers.
 */
export interface ActionContext {
  /** Plot-relative x coordinate (CSS px from plot left edge) */
  cx: number;
  /** Plot-relative y coordinate (CSS px from plot top edge) */
  cy: number;
  /** Whether (cx, cy) is inside the plot area */
  inPlot: boolean;
  /** For gutter hits: the scale ID that was hit */
  scaleId?: string;
  /** For gutter hits: the axis orientation */
  ori?: Orientation;
  /** The classified action string (e.g. 'leftClick', 'shiftLeftDrag'). Set by the hook before dispatch. */
  action?: string;
}

/**
 * Continuation for multi-event gestures (drag, pan, gutter drag).
 * Returned by reaction handlers that need to track mousemove/mouseup.
 */
export interface DragContinuation {
  onMove: (store: ChartStore, e: Event, ctx: ActionContext) => void;
  onEnd: (store: ChartStore, e: Event, ctx: ActionContext) => void;
}

/**
 * Action key: a built-in string name or a custom matcher function.
 *
 * Built-in strings follow the pattern `{modifier?}{Button}{Type}`:
 * - Drag:     left/middle/rightDrag, shift/alt/ctrlLeft/Middle/RightDrag
 * - Click:    left/middle/rightClick, shift/alt/ctrlLeft/Middle/RightClick
 * - Dblclick: leftDblclick, shift/alt/ctrlLeftDblclick
 * - Gutter:   xGutterDrag, yGutterDrag
 * - Wheel:    wheel, shiftWheel, altWheel, ctrlWheel
 * - Hover:    hover (fired on cursor position change, not when stationary)
 * - Touch:    touchDrag, pinch
 * - Keyboard: key{Key}, shift/alt/ctrlKey{Key} — e.g. shiftKeyX, ctrlKeyS, keyEscape
 */
/** Built-in action key names for standard charting gestures. */
export type BuiltinAction =
  | 'leftDrag' | 'middleDrag' | 'rightDrag'
  | 'shiftLeftDrag' | 'altLeftDrag' | 'ctrlLeftDrag'
  | 'shiftMiddleDrag' | 'altMiddleDrag' | 'ctrlMiddleDrag'
  | 'shiftRightDrag' | 'altRightDrag' | 'ctrlRightDrag'
  | 'leftClick' | 'middleClick' | 'rightClick'
  | 'shiftLeftClick' | 'altLeftClick' | 'ctrlLeftClick'
  | 'leftDblclick' | 'shiftLeftDblclick' | 'altLeftDblclick' | 'ctrlLeftDblclick'
  | 'xGutterDrag' | 'yGutterDrag'
  | 'wheel' | 'shiftWheel' | 'altWheel' | 'ctrlWheel'
  | 'hover'
  | 'touchDrag' | 'pinch';

export type ActionKey = BuiltinAction | (string & Record<never, never>) | ((e: Event, ctx: ActionContext) => boolean);

/**
 * Reaction value: a built-in string name or a custom handler function.
 *
 * Built-in reaction strings: 'zoomX', 'zoomY', 'zoomXY', 'panX', 'panY', 'panXY', 'reset', 'none'
 *
 * Custom handlers return a DragContinuation for multi-event gestures, or void for one-shot.
 */
/** Built-in reaction names for standard charting behaviors. */
export type BuiltinReaction = 'zoomX' | 'zoomY' | 'zoomXY' | 'panX' | 'panY' | 'panXY' | 'reset' | 'none';

export type ReactionValue =
  | BuiltinReaction
  | (string & Record<never, never>)
  | ((store: ChartStore, e: Event, ctx: ActionContext) => DragContinuation | void);

/** A single action→reaction binding. */
export type ActionEntry = [ActionKey, ReactionValue];

/** User-facing actions list: array of [action, reaction] tuples (merged with defaults). */
export type ActionList = ActionEntry[];

/**
 * Focus reaction factory: dims non-nearest series to the given alpha.
 * Use as a reaction for the 'hover' action:
 *   `actions={[['hover', focus(0.15)]]}`
 */
export function focus(alpha = 0.15): ReactionValue {
  return (store: ChartStore) => {
    store.focusAlpha = alpha;
  };
}

/** Default actions — standard charting interactions out of the box. */
export const DEFAULT_ACTIONS: ActionList = [
  ['leftDrag', 'zoomX'],
  ['leftDblclick', 'reset'],
  ['wheel', 'zoomX'],
  ['xGutterDrag', 'panX'],
  ['yGutterDrag', 'panY'],
  ['pinch', 'zoomX'],
  ['touchDrag', 'zoomX'],
];
