import { describe, it, expect } from 'vitest';
import { horizontalBars, horizontalGroupedBars, horizontalStackedBars, bars } from '@/paths/bars';
import { H_BAR_DEFAULTS, BAR_DEFAULTS } from '@/paths/types';
import { createScaleState } from '@/core/Scale';
import type { ScaleState } from '@/types';
import { Orientation, Direction } from '@/types';
import { round } from '@/math/utils';
import { getMockCalls } from '../helpers/mockCanvas';
import type { PathCall } from '../setup';

type RectCall = ['rect', number, number, number, number];
const isRect = (c: PathCall): c is RectCall => c[0] === 'rect';

function makeScale(id: string, min: number, max: number, ori: Orientation): ScaleState {
  return { ...createScaleState({ id }), min, max, ori, dir: Direction.Forward };
}

const pxRound = (v: number) => round(v);
const dataX = [0, 1, 2, 3, 4];

// Horizontal-bar configuration: x-scale is vertical (categories), y-scale is horizontal (values).
// CanvasRenderer would pass dim/off accordingly: x-scale uses height/top, y-scale uses width/left.
const scaleXVertical = makeScale('x', -0.5, 4.5, Orientation.Vertical);
const scaleYHorizontal: ScaleState = { ...makeScale('y', 0, 100, Orientation.Horizontal) };

describe('horizontalBars defaults', () => {
  it('declares transposed: true', () => {
    expect(horizontalBars().defaults?.transposed).toBe(true);
  });

  it('inherits all other defaults from BAR_DEFAULTS (width, fill, fillTo, points, cursor)', () => {
    expect(H_BAR_DEFAULTS).toMatchObject({
      strokeWidth: BAR_DEFAULTS!.strokeWidth,
      fill: BAR_DEFAULTS!.fill,
      fillTo: BAR_DEFAULTS!.fillTo,
    });
  });

  it('horizontalGroupedBars and horizontalStackedBars also declare transposed: true', () => {
    expect(horizontalGroupedBars(0, 2).defaults?.transposed).toBe(true);
    expect(horizontalStackedBars().defaults?.transposed).toBe(true);
  });

  it('regular bars() does NOT declare transposed', () => {
    expect(bars().defaults?.transposed).toBeUndefined();
  });
});

describe('horizontalBars geometry', () => {
  const builder = horizontalBars();
  // Renderer would call with xDim=plotBox.height (since xScale.ori=Vertical),
  // yDim=plotBox.strokeWidth (since yScale.ori=Horizontal).
  // Use 300 for "height" and 400 for "width" to mirror the BarChart demo.
  const xDim = 300;  // plotBox.height — column axis (categories) maps along this
  const yDim = 400;  // plotBox.strokeWidth  — value axis maps along this
  const xOff = 50;   // plotBox.top
  const yOff = 30;   // plotBox.left

  it('produces one rect per non-null data point', () => {
    const dataY: (number | null)[] = [10, 40, 30, 80, 50];
    const result = builder(dataX, dataY, scaleXVertical, scaleYHorizontal, xDim, yDim, xOff, yOff, 0, 4, 1, pxRound);
    expect(result.fill).toBe(result.stroke);
    const rects = getMockCalls(result.stroke).filter((c) => c[0] === 'rect');
    expect(rects.length).toBe(5);
  });

  it('skips null values', () => {
    const dataY: (number | null)[] = [10, null, 30, null, 50];
    const result = builder(dataX, dataY, scaleXVertical, scaleYHorizontal, xDim, yDim, xOff, yOff, 0, 4, 1, pxRound);
    const rects = getMockCalls(result.stroke).filter((c) => c[0] === 'rect');
    expect(rects.length).toBe(3);
  });

  it('rect spans horizontally — width grows with value, height stays bar-thickness', () => {
    const dataY: (number | null)[] = [25, 50, 75, 100];
    const result = builder([0, 1, 2, 3], dataY, scaleXVertical, scaleYHorizontal, xDim, yDim, xOff, yOff, 0, 3, 1, pxRound);
    const rects = getMockCalls(result.stroke).filter(isRect);
    // For horizontal bars, rects are rect(x, y, w, h) where:
    //   x = baseline (always at scaleY.min → yOff side)
    //   w = bar length (proportional to value)
    //   y = category position - barThickness/2
    //   h = barThickness (constant per category)
    const widths = rects.map(r => r[3]);
    // Widths increase monotonically because dataY values increase
    expect(widths[0]).toBeLessThan(widths[1]!);
    expect(widths[1]).toBeLessThan(widths[2]!);
    expect(widths[2]).toBeLessThan(widths[3]!);
    // All bars have the same height (thickness along category axis)
    const heights = rects.map(r => r[4]);
    expect(heights.every(h => h === heights[0])).toBe(true);
  });

  it('rect x position is at the baseline (yScale.min mapped through yScale)', () => {
    const dataY: (number | null)[] = [50];
    const result = builder([0], dataY, scaleXVertical, scaleYHorizontal, xDim, yDim, xOff, yOff, 0, 0, 1, pxRound);
    const rects = getMockCalls(result.stroke).filter(isRect);
    expect(rects.length).toBe(1);
    // baseline = scaleY.min = 0, mapped via yScale (Horizontal) with dim=yDim, off=yOff
    // valToPos(0, scaleY, 400, 30) for a [0,100] horizontal scale with dir=Forward = 30 + 0 = 30
    expect(rects[0]![1]).toBe(yOff);
  });

  it('barRadius produces arcTo calls (no rects)', () => {
    const dataY: (number | null)[] = [10, 40, 30];
    const result = builder([0, 1, 2], dataY, scaleXVertical, scaleYHorizontal, xDim, yDim, xOff, yOff, 0, 2, 1, pxRound, { barRadius: 0.3 });
    const calls = getMockCalls(result.stroke);
    expect(calls.filter(c => c[0] === 'arcTo').length).toBeGreaterThan(0);
    expect(calls.filter(c => c[0] === 'rect').length).toBe(0);
  });
});

describe('horizontalGroupedBars geometry', () => {
  const xDim = 300, yDim = 400, xOff = 50, yOff = 30;

  it('groups bars at the same category, side-by-side along the category axis', () => {
    const dataY: (number | null)[] = [40, 30, 50];
    const builder0 = horizontalGroupedBars(0, 3);
    const builder1 = horizontalGroupedBars(1, 3);
    const builder2 = horizontalGroupedBars(2, 3);

    const r0 = builder0([0, 1, 2], dataY, scaleXVertical, scaleYHorizontal, xDim, yDim, xOff, yOff, 0, 2, 1, pxRound);
    const r1 = builder1([0, 1, 2], dataY, scaleXVertical, scaleYHorizontal, xDim, yDim, xOff, yOff, 0, 2, 1, pxRound);
    const r2 = builder2([0, 1, 2], dataY, scaleXVertical, scaleYHorizontal, xDim, yDim, xOff, yOff, 0, 2, 1, pxRound);

    const rects0 = getMockCalls(r0.stroke).filter(isRect);
    const rects1 = getMockCalls(r1.stroke).filter(isRect);
    const rects2 = getMockCalls(r2.stroke).filter(isRect);

    // For category 0, the three series should have different y positions (offset within group)
    // For horizontal bars: y is the canvas Y, which corresponds to the category axis position offset
    expect(rects0[0]![2]).toBeLessThan(rects1[0]![2]);
    expect(rects1[0]![2]).toBeLessThan(rects2[0]![2]);
  });
});

describe('horizontalStackedBars baseline', () => {
  const xDim = 300, yDim = 400, xOff = 50, yOff = 30;

  it('uses provided baseline data as bar origin (per-point fillTo)', () => {
    const baseline: number[] = [10, 20, 15];
    const dataY: (number | null)[] = [30, 40, 35];  // each is baseline + delta
    const noBaselineBuilder = horizontalStackedBars();
    const withBaselineBuilder = horizontalStackedBars(baseline);

    const noBase = noBaselineBuilder([0, 1, 2], dataY, scaleXVertical, scaleYHorizontal, xDim, yDim, xOff, yOff, 0, 2, 1, pxRound);
    const withBase = withBaselineBuilder([0, 1, 2], dataY, scaleXVertical, scaleYHorizontal, xDim, yDim, xOff, yOff, 0, 2, 1, pxRound);

    const noBaseRects = getMockCalls(noBase.stroke).filter(isRect);
    const withBaseRects = getMockCalls(withBase.stroke).filter(isRect);

    // Without baseline: bars span 0 → value (full width)
    // With baseline: bars span baseline → value (smaller width)
    expect(withBaseRects[0]![3]).toBeLessThan(noBaseRects[0]![3]);
  });
});
