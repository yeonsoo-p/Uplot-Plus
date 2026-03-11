import { describe, it, expect } from 'vitest';
import { logAxisValFilter } from '@/axes/ticks';

describe('logAxisValFilter', () => {
  it('keeps power-of-10 values for base 10', () => {
    const splits = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 100];
    const result = logAxisValFilter(splits, 10);

    // 1, 10, 100 are powers of 10
    expect(result[0]).toBe(true);   // 1 = 10^0
    expect(result[1]).toBe(false);  // 2
    expect(result[2]).toBe(false);  // 3
    expect(result[9]).toBe(true);   // 10 = 10^1
    expect(result[12]).toBe(true);  // 100 = 10^2
  });

  it('keeps power-of-2 values for base 2', () => {
    const splits = [1, 2, 3, 4, 5, 8, 16];
    const result = logAxisValFilter(splits, 2);

    expect(result[0]).toBe(true);   // 1 = 2^0
    expect(result[1]).toBe(true);   // 2 = 2^1
    expect(result[2]).toBe(false);  // 3
    expect(result[3]).toBe(true);   // 4 = 2^2
    expect(result[4]).toBe(false);  // 5
    expect(result[5]).toBe(true);   // 8 = 2^3
    expect(result[6]).toBe(true);   // 16 = 2^4
  });

  it('returns true for zero', () => {
    const result = logAxisValFilter([0, 1, 10], 10);
    expect(result[0]).toBe(true);
  });

  it('returns false for negative values', () => {
    const result = logAxisValFilter([-1, -10, 1, 10], 10);
    expect(result[0]).toBe(false);
    expect(result[1]).toBe(false);
    expect(result[2]).toBe(true);
    expect(result[3]).toBe(true);
  });

  it('handles fractional powers of 10', () => {
    const splits = [0.01, 0.1, 0.5, 1, 10];
    const result = logAxisValFilter(splits, 10);

    expect(result[0]).toBe(true);   // 0.01 = 10^-2
    expect(result[1]).toBe(true);   // 0.1 = 10^-1
    expect(result[2]).toBe(false);  // 0.5
    expect(result[3]).toBe(true);   // 1 = 10^0
    expect(result[4]).toBe(true);   // 10 = 10^1
  });

  it('returns empty array for empty splits', () => {
    expect(logAxisValFilter([], 10)).toEqual([]);
  });
});
