import { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import type { ChartProps } from '../types';
import { DEFAULT_ACTIONS } from '../types/interaction';
import type { DrawCallback, CursorDrawCallback } from '../types/hooks';
import { useChartStore } from '../hooks/useChartStore';
import { ChartContext } from '../hooks/useChart';
import { useInteraction } from '../hooks/useInteraction';
import { useSyncGroup } from '../sync/useSyncGroup';
import { normalizeData } from '../core/normalizeData';

/**
 * Root chart component.
 * Creates a canvas element, manages the chart store, and provides context to children.
 * Canvas drawing is completely decoupled from React's reconciliation cycle.
 */
export function Chart({
  width, height, data, children, className, pxRatio: pxRatioOverride, title, xlabel, ylabel,
  onDraw, onCursorDraw, syncKey, actions,
  onClick, onContextMenu, onDblClick, onCursorMove, onCursorLeave,
  onScaleChange, onSelect,
}: ChartProps) {
  const store = useChartStore();
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);

  const pxRatio = pxRatioOverride ?? (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);

  // Merge user action overrides with defaults and sync to store
  useEffect(() => {
    store.actionMap = actions != null
      ? new Map([...DEFAULT_ACTIONS, ...actions])
      : new Map(DEFAULT_ACTIONS);
  }, [store, actions]);

  // Sync title and axis labels to store (in effect, not render)
  useEffect(() => {
    store.title = title;
    store.xlabel = xlabel;
    store.ylabel = ylabel;
  }, [store, title, xlabel, ylabel]);

  // Sync event callback props via refs to avoid excessive effect runs
  const eventCallbacksRef = useRef(store.eventCallbacks);
  eventCallbacksRef.current = store.eventCallbacks;
  useEffect(() => {
    const cbs = eventCallbacksRef.current;
    cbs.onClick = onClick;
    cbs.onContextMenu = onContextMenu;
    cbs.onDblClick = onDblClick;
    cbs.onCursorMove = onCursorMove;
    cbs.onCursorLeave = onCursorLeave;
    cbs.onScaleChange = onScaleChange;
    cbs.onSelect = onSelect;
  });

  // Attach mouse/touch interaction handlers
  useInteraction(store, containerEl);

  // Cursor sync across charts with same key
  useSyncGroup(store, syncKey);

  // Callback ref for canvas — single assignment point
  const canvasRef = useCallback((node: HTMLCanvasElement | null) => {
    store.canvas = node;
    if (node) store.scheduleRedraw();
  }, [store]);

  // Callback ref for container — drives useInteraction and ResizeObserver via state
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    setContainerEl(node);
  }, []);

  // Update store dimensions
  useEffect(() => {
    store.pxRatio = pxRatio;
    store.setSize(width, height);
  }, [store, width, height, pxRatio]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      store.canvas = null;
      store.scheduler.cancel();
      store.focusedSeries = null;
    };
  }, [store]);

  // ResizeObserver — depends on containerEl (state) so re-runs when DOM element changes
  useEffect(() => {
    if (containerEl == null || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry == null) return;
      const { width: w, height: h } = entry.contentRect;
      if (w > 0 && h > 0 && (w !== store.width || h !== store.height)) {
        store.setSize(Math.round(w), Math.round(h));
      }
    });

    observer.observe(containerEl);
    return () => { observer.disconnect(); };
  }, [store, containerEl]);

  // Normalize flexible input → internal ChartData
  const normalized = useMemo(() => normalizeData(data), [data]);

  // Update store data
  const prevDataRef = useRef(data);
  useEffect(() => {
    if (data === prevDataRef.current && store.dataStore.data.length > 0) return;
    prevDataRef.current = data;

    store.dataStore.setData(normalized);
    store.renderer.clearCache();
    store.scheduleRedraw();
  }, [store, data, normalized]);

  // Ref wrapper for onDraw — register stable wrapper once, update ref on each render
  const onDrawRef = useRef<DrawCallback | undefined>(onDraw);
  onDrawRef.current = onDraw;

  useEffect(() => {
    const wrapper: DrawCallback = (dc) => { onDrawRef.current?.(dc); };
    store.drawHooks.add(wrapper);
    return () => { store.drawHooks.delete(wrapper); };
  }, [store]);

  // Ref wrapper for onCursorDraw
  const onCursorDrawRef = useRef<CursorDrawCallback | undefined>(onCursorDraw);
  onCursorDrawRef.current = onCursorDraw;

  useEffect(() => {
    const wrapper: CursorDrawCallback = (dc, cursor) => { onCursorDrawRef.current?.(dc, cursor); };
    store.cursorDrawHooks.add(wrapper);
    return () => { store.cursorDrawHooks.delete(wrapper); };
  }, [store]);

  return (
    <ChartContext.Provider value={store}>
      <div
        className={className}
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          width: `${width}px`,
        }}
      >
        <div
          ref={containerRef}
          tabIndex={-1}
          style={{
            position: 'relative',
            width: `${width}px`,
            height: `${height}px`,
            cursor: 'crosshair',
            outline: 'none',
            order: 0,
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
            }}
          />
        </div>
        {children}
      </div>
    </ChartContext.Provider>
  );
}
