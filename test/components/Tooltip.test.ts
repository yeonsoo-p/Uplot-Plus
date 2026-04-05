import { describe, it, expect } from 'vitest';
import { createChartStore } from '@/hooks/useChartStore';
import type { ChartStore } from '@/hooks/useChartStore';
import { clamp } from '@/math/utils';
import { getSeriesColor } from '@/types/series';
import { estimatePanelSize } from '@/utils/estimatePanelSize';
import type { TooltipItem } from '@/types/tooltip';

/**
 * Tests for the Tooltip data extraction and positioning logic.
 *
 * Since @testing-library/react is not available, we recreate the Tooltip's
 * core logic (data extraction from store, position clamping) and verify it
 * against a configured ChartStore — the same pattern used by interactions.test.ts.
 */

function setupStore(): ChartStore {
  const store = createChartStore();
  store.pxRatio = 1;
  store.width = 800;
  store.height = 600;
  store.plotBox = { left: 50, top: 20, width: 700, height: 560 };

  store.scaleManager.addScale({ id: 'x', min: 0, max: 100 });
  store.scaleManager.addScale({ id: 'y', min: 0, max: 100 });
  store.scaleManager.setGroupXScale(0, 'x');

  store.registerSeries({ group: 0, index: 0, yScale: 'y', stroke: 'red', show: true, label: 'Temperature' });
  store.registerSeries({ group: 0, index: 1, yScale: 'y', stroke: 'blue', show: true, label: 'Pressure' });
  store.dataStore.setData([{
    x: [0, 25, 50, 75, 100],
    series: [[10, 40, 70, 30, 90], [20, 50, 80, 40, 100]],
  }]);

  return store;
}

/**
 * Mirrors the Tooltip component's data extraction logic (Tooltip.tsx lines 47-76).
 */
function extractTooltipData(
  store: ChartStore,
  activeGroup: number,
  activeDataIdx: number,
  cursorLeft: number,
  cursorTop: number,
  precision: number,
): { xLabel: string; items: TooltipItem[]; posLeft: number; posTop: number } | null {
  if (activeDataIdx < 0 || activeGroup < 0 || cursorLeft < 0) return null;

  const group = store.dataStore.data[activeGroup];
  const xVal = group != null ? (group.x[activeDataIdx] as number | undefined) ?? null : null;
  const xLabel = xVal != null ? parseFloat(xVal.toFixed(precision)).toString() : '';

  const items: TooltipItem[] = [];
  for (const cfg of store.seriesConfigs) {
    if (cfg.show === false || cfg.legend === false) continue;
    const yData = store.dataStore.getYValues(cfg.group, cfg.index);
    const val = cfg.group === activeGroup ? (yData[activeDataIdx] as number | null) : null;
    items.push({
      label: cfg.label ?? `Series ${cfg.index}`,
      value: val,
      color: getSeriesColor(cfg),
      group: cfg.group,
      index: cfg.index,
    });
  }

  const plotBox = store.plotBox;
  const offX = 12;
  const offY = -12;
  const estimated = estimatePanelSize({
    header: xLabel,
    rows: items.map(item => ({
      label: item.label,
      value: item.value != null ? item.value.toPrecision(4) : '—',
    })),
  });

  const posLeft = clamp(cursorLeft + plotBox.left + offX, plotBox.left, plotBox.left + plotBox.width - estimated.w);
  const posTop = clamp(cursorTop + plotBox.top + offY, plotBox.top, plotBox.top + plotBox.height - estimated.h);

  return { xLabel, items, posLeft, posTop };
}

describe('Tooltip data extraction', () => {
  it('extracts x label and series values at cursor position', () => {
    const store = setupStore();
    const result = extractTooltipData(store, 0, 2, 350, 280, 2);

    expect(result).not.toBeNull();
    expect(result!.xLabel).toBe('50');
    expect(result!.items).toHaveLength(2);
    expect(result!.items[0]!.label).toBe('Temperature');
    expect(result!.items[0]!.value).toBe(70);
    expect(result!.items[1]!.label).toBe('Pressure');
    expect(result!.items[1]!.value).toBe(80);
  });

  it('returns null when activeDataIdx is -1', () => {
    const store = setupStore();
    expect(extractTooltipData(store, 0, -1, 350, 280, 2)).toBeNull();
  });

  it('returns null when activeGroup is -1', () => {
    const store = setupStore();
    expect(extractTooltipData(store, -1, 2, 350, 280, 2)).toBeNull();
  });

  it('returns null when cursor is off-chart (left < 0)', () => {
    const store = setupStore();
    expect(extractTooltipData(store, 0, 0, -10, 100, 2)).toBeNull();
  });

  it('excludes hidden series', () => {
    const store = setupStore();
    store.toggleSeries(0, 1); // hide Pressure
    const result = extractTooltipData(store, 0, 2, 350, 280, 2);

    expect(result).not.toBeNull();
    expect(result!.items).toHaveLength(1);
    expect(result!.items[0]!.label).toBe('Temperature');
  });

  it('formats x label with specified precision', () => {
    const store = setupStore();
    // Use data point at index 1 where x=25
    const result = extractTooltipData(store, 0, 1, 175, 280, 4);
    expect(result!.xLabel).toBe('25');
  });
});

describe('Tooltip position clamping', () => {
  it('clamps tooltip to stay within plot bounds on the right edge', () => {
    const store = setupStore();
    // Cursor near right edge of plot
    const result = extractTooltipData(store, 0, 4, 690, 280, 2);
    expect(result).not.toBeNull();
    // posLeft should be clamped so tooltip doesn't extend past plotRight
    expect(result!.posLeft).toBeLessThanOrEqual(store.plotBox.left + store.plotBox.width);
  });

  it('clamps tooltip to stay within plot bounds on the bottom edge', () => {
    const store = setupStore();
    // Cursor near bottom of plot
    const result = extractTooltipData(store, 0, 2, 350, 560, 2);
    expect(result).not.toBeNull();
    expect(result!.posTop).toBeLessThanOrEqual(store.plotBox.top + store.plotBox.height);
  });

  it('places tooltip at plot left when cursor is near left edge', () => {
    const store = setupStore();
    // Cursor at leftmost position with negative offset
    const result = extractTooltipData(store, 0, 0, 0, 280, 2);
    expect(result).not.toBeNull();
    // With offset 12, posLeft = clamp(0 + 50 + 12, 50, ...) = 62, unless panel is wider
    expect(result!.posLeft).toBeGreaterThanOrEqual(store.plotBox.left);
  });
});

// ---- Draggable-mode data extraction ----

/**
 * Mirrors the Tooltip component's draggable-mode data extraction logic.
 * When cursor is off-chart, items are still built with null values (dashes).
 */
function extractDraggableTooltipData(
  store: ChartStore,
  activeGroup: number,
  activeDataIdx: number,
  cursorLeft: number,
  precision: number,
): { xLabel: string; items: TooltipItem[] } {
  const hasCursor = activeDataIdx >= 0 && activeGroup >= 0 && cursorLeft >= 0;

  let xLabel = '';
  const items: TooltipItem[] = [];

  if (hasCursor) {
    const group = store.dataStore.data[activeGroup];
    const xVal = group != null ? (group.x[activeDataIdx] as number | undefined) ?? null : null;
    xLabel = xVal != null ? parseFloat(xVal.toFixed(precision)).toString() : '';

    for (const cfg of store.seriesConfigs) {
      if (cfg.show === false || cfg.legend === false) continue;
      const yData = store.dataStore.getYValues(cfg.group, cfg.index);
      const val = cfg.group === activeGroup ? (yData[activeDataIdx] as number | null) : null;
      items.push({
        label: cfg.label ?? `Series ${cfg.index}`,
        value: val,
        color: getSeriesColor(cfg),
        group: cfg.group,
        index: cfg.index,
      });
    }
  } else {
    // Draggable mode: show all series with null values (dashes)
    for (const cfg of store.seriesConfigs) {
      if (cfg.show === false || cfg.legend === false) continue;
      items.push({
        label: cfg.label ?? `Series ${cfg.index}`,
        value: null,
        color: getSeriesColor(cfg),
        group: cfg.group,
        index: cfg.index,
      });
    }
  }

  return { xLabel, items };
}

describe('Tooltip draggable mode data extraction', () => {
  it('shows series values when cursor is on chart', () => {
    const store = setupStore();
    const result = extractDraggableTooltipData(store, 0, 2, 350, 2);

    expect(result.xLabel).toBe('50');
    expect(result.items).toHaveLength(2);
    expect(result.items[0]!.value).toBe(70);
    expect(result.items[1]!.value).toBe(80);
  });

  it('shows null values (dashes) when cursor is off chart', () => {
    const store = setupStore();
    const result = extractDraggableTooltipData(store, -1, -1, -1, 2);

    expect(result.xLabel).toBe('');
    expect(result.items).toHaveLength(2);
    expect(result.items[0]!.label).toBe('Temperature');
    expect(result.items[0]!.value).toBeNull();
    expect(result.items[1]!.label).toBe('Pressure');
    expect(result.items[1]!.value).toBeNull();
  });

  it('excludes hidden series in draggable mode', () => {
    const store = setupStore();
    store.toggleSeries(0, 1); // hide Pressure
    const result = extractDraggableTooltipData(store, -1, -1, -1, 2);

    expect(result.items).toHaveLength(1);
    expect(result.items[0]!.label).toBe('Temperature');
  });

  it('preserves item colors from series config', () => {
    const store = setupStore();
    const result = extractDraggableTooltipData(store, 0, 0, 0, 2);

    expect(result.items[0]!.color).toBe('red');
    expect(result.items[1]!.color).toBe('blue');
  });
});
