import React, { useSyncExternalStore, useCallback, useRef } from 'react';
import { useChart } from '../hooks/useChart';
import type { TooltipProps, TooltipData, TooltipItem } from '../types/tooltip';

/** Estimated tooltip width for edge-flip detection (CSS px) */
const TOOLTIP_FLIP_WIDTH = 160;

interface TooltipSnapshot {
  left: number;
  top: number;
  activeGroup: number;
  activeDataIdx: number;
  revision: number;
}

/**
 * Tooltip component that shows data values at the cursor position.
 * Uses useSyncExternalStore to subscribe to cursor state updates.
 * Positioned as an absolute HTML overlay inside the chart container.
 */
export function Tooltip({
  show = true,
  className,
  children,
  offset = {},
}: TooltipProps): React.ReactElement | null {
  const store = useChart();
  const snapRef = useRef<TooltipSnapshot>({ left: -10, top: -10, activeGroup: -1, activeDataIdx: -1, revision: -1 });

  const subscribe = useCallback(
    (cb: () => void) => store.subscribe(cb),
    [store],
  );

  const getSnapshot = useCallback((): TooltipSnapshot => {
    const cursor = store.cursorManager.state;
    const { revision } = store;
    const prev = snapRef.current;
    if (
      prev.left === cursor.left &&
      prev.top === cursor.top &&
      prev.activeGroup === cursor.activeGroup &&
      prev.activeDataIdx === cursor.activeDataIdx &&
      prev.revision === revision
    ) {
      return prev;
    }
    const next: TooltipSnapshot = {
      left: cursor.left,
      top: cursor.top,
      activeGroup: cursor.activeGroup,
      activeDataIdx: cursor.activeDataIdx,
      revision,
    };
    snapRef.current = next;
    return next;
  }, [store]);

  const snap = useSyncExternalStore(subscribe, getSnapshot);

  if (!show) return null;
  if (snap.activeDataIdx < 0 || snap.activeGroup < 0) return null;
  if (snap.left < 0) return null;

  // Build tooltip data
  const { activeGroup, activeDataIdx } = snap;
  const plotBox = store.plotBox;

  // X value
  const group = store.dataStore.data[activeGroup];
  const xVal = group != null ? (group.x[activeDataIdx] as number | undefined) ?? null : null;
  const xLabel = xVal != null ? parseFloat(xVal.toPrecision(6)).toString() : '';

  // Series values
  const items: TooltipItem[] = [];
  for (const cfg of store.seriesConfigs) {
    if (cfg.show === false) continue;
    const yData = store.dataStore.getYValues(cfg.group, cfg.index);
    const val = cfg.group === activeGroup ? (yData[activeDataIdx] as number | null) : null;
    items.push({
      label: cfg.label ?? `Series ${cfg.index}`,
      value: val,
      color: typeof cfg.stroke === 'string' ? cfg.stroke : '#000',
      group: cfg.group,
      index: cfg.index,
    });
  }

  const tooltipData: TooltipData = {
    x: xVal,
    xLabel,
    items,
    left: snap.left + plotBox.left,
    top: snap.top + plotBox.top,
  };

  const offX = offset.x ?? 12;
  const offY = offset.y ?? -12;

  // Flip tooltip to left side when near right edge
  const flipX = (snap.left + plotBox.left + offX + TOOLTIP_FLIP_WIDTH) > (plotBox.left + plotBox.width);
  const flipY = (snap.top + plotBox.top + offY) < plotBox.top;

  const posLeft = flipX ? tooltipData.left - offX : tooltipData.left + offX;
  const posTop = flipY ? tooltipData.top + Math.abs(offY) : tooltipData.top + offY;

  if (children) {
    return (
      <div
        className={className}
        style={{
          position: 'absolute',
          left: posLeft,
          top: posTop,
          transform: flipX ? 'translateX(-100%)' : undefined,
          pointerEvents: 'none',
          zIndex: 100,
        }}
      >
        {children(tooltipData)}
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        left: posLeft,
        top: posTop,
        transform: flipX ? 'translateX(-100%)' : undefined,
        pointerEvents: 'none',
        zIndex: 100,
        background: 'rgba(0,0,0,0.85)',
        color: '#fff',
        padding: '6px 10px',
        borderRadius: 4,
        fontSize: 12,
        fontFamily: 'sans-serif',
        whiteSpace: 'nowrap',
        lineHeight: 1.5,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 2 }}>{xLabel}</div>
      {items.map((item) => (
        <div key={`${item.group}:${item.index}`} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: item.color, display: 'inline-block' }} />
          <span>{item.label}:</span>
          <span style={{ fontWeight: 600 }}>{item.value != null ? item.value.toPrecision(4) : '—'}</span>
        </div>
      ))}
    </div>
  );
}
