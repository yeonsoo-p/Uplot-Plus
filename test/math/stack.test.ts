import { describe, it, expect } from 'vitest';
import { stackGroup } from '@/math/stack';
import type { XGroup } from '@/types/data';

function makeGroup(x: number[], series: (number | null)[][]): XGroup {
  return { x, series };
}

describe('stackGroup', () => {
  it('computes cumulative sums for all series', () => {
    const group = makeGroup([1, 2, 3], [
      [1, 2, 3],
      [4, 5, 6],
    ]);
    const result = stackGroup(group);

    // First series: cumulative of [1,2,3] = [1,2,3]
    expect(result.group.series[0]).toEqual([1, 2, 3]);
    // Second series: cumulative of [1+4, 2+5, 3+6] = [5, 7, 9]
    expect(result.group.series[1]).toEqual([5, 7, 9]);
  });

  it('stacks a subset of series via seriesIndices', () => {
    const group = makeGroup([1, 2], [
      [10, 20],
      [5, 10],
      [3, 7],
    ]);
    // Only stack series 0 and 2
    const result = stackGroup(group, [0, 2]);

    // Series 0: cumulative [10, 20]
    expect(result.group.series[0]).toEqual([10, 20]);
    // Series 2: cumulative [10+3, 20+7] = [13, 27]
    expect(result.group.series[2]).toEqual([13, 27]);
    // Series 1 should be unchanged (not in subset)
    expect(result.group.series[1]).toEqual([5, 10]);
  });

  it('handles null values in source data', () => {
    const group = makeGroup([1, 2, 3], [
      [1, null, 3],
      [4, 5, 6],
    ]);
    const result = stackGroup(group);

    // Accumulator[1] stays 0 when src[1] is null, then 5 is added
    expect(result.group.series[0]).toEqual([1, 0, 3]);
    expect(result.group.series[1]).toEqual([5, 5, 9]);
  });

  it('generates correct band configs (top-down pairing)', () => {
    const group = makeGroup([1, 2], [
      [1, 1],
      [2, 2],
      [3, 3],
    ]);
    const result = stackGroup(group);

    // Bands link each layer to the one below: [2,1], [1,0]
    expect(result.bands).toEqual([
      { group: 0, series: [2, 1] },
      { group: 0, series: [1, 0] },
    ]);
  });

  it('uses custom groupIdx for band configs', () => {
    const group = makeGroup([1], [[1], [2]]);
    const result = stackGroup(group, undefined, 3);

    expect(result.bands[0]?.group).toBe(3);
  });

  it('preserves x values unchanged', () => {
    const x = [10, 20, 30];
    const group = makeGroup(x, [[1, 2, 3]]);
    const result = stackGroup(group);

    expect(result.group.x).toBe(x);
  });

  it('returns empty bands for single series', () => {
    const group = makeGroup([1, 2], [[5, 10]]);
    const result = stackGroup(group);

    expect(result.bands).toEqual([]);
  });
});
