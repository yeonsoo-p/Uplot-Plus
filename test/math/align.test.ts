import { describe, it, expect } from 'vitest';
import { alignData } from '@/math/align';

describe('alignData', () => {
  it('merges two datasets with different x-values', () => {
    const result = alignData([
      [[1, 3], [10, 30]],
      [[2, 3], [20, 35]],
    ]);

    const group = result[0]!;
    // Merged x: [1, 2, 3]
    expect(Array.from(group.x)).toEqual([1, 2, 3]);
    // First dataset: 10 at x=1, null at x=2, 30 at x=3
    expect(group.series[0]).toEqual([10, null, 30]);
    // Second dataset: null at x=1, 20 at x=2, 35 at x=3
    expect(group.series[1]).toEqual([null, 20, 35]);
  });

  it('fills nulls for missing values', () => {
    const result = alignData([
      [[1, 5], [100, 500]],
      [[3], [300]],
    ]);

    const group = result[0]!;
    expect(Array.from(group.x)).toEqual([1, 3, 5]);
    expect(group.series[0]).toEqual([100, null, 500]);
    expect(group.series[1]).toEqual([null, 300, null]);
  });

  it('handles overlapping x-values correctly', () => {
    const result = alignData([
      [[1, 2, 3], [10, 20, 30]],
      [[1, 2, 3], [11, 21, 31]],
    ]);

    const group = result[0]!;
    expect(Array.from(group.x)).toEqual([1, 2, 3]);
    expect(group.series[0]).toEqual([10, 20, 30]);
    expect(group.series[1]).toEqual([11, 21, 31]);
  });

  it('returns sorted x-values', () => {
    const result = alignData([
      [[5, 1, 3], [50, 10, 30]],
    ]);

    const group = result[0]!;
    expect(Array.from(group.x)).toEqual([1, 3, 5]);
    expect(group.series[0]).toEqual([10, 30, 50]);
  });

  it('handles empty datasets', () => {
    const result = alignData([]);
    const group = result[0]!;
    expect(Array.from(group.x)).toEqual([]);
    expect(group.series).toEqual([]);
  });

  it('handles single dataset', () => {
    const result = alignData([
      [[2, 4, 6], [20, 40, 60]],
    ]);

    const group = result[0]!;
    expect(Array.from(group.x)).toEqual([2, 4, 6]);
    expect(group.series[0]).toEqual([20, 40, 60]);
  });
});
