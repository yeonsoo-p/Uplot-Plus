import type { ChartData } from '../types/data';

/**
 * Align multiple datasets with different x-values to a common x-axis.
 * Merges all unique x-values and fills gaps with null.
 *
 * @param datasets - Array of [xValues, yValues] tuples
 * @returns ChartData with one group containing all aligned series
 */
export function alignData(
  datasets: [ArrayLike<number>, ArrayLike<number | null>][],
): ChartData {
  // Collect all unique x-values and sort them
  const xSet = new Set<number>();
  for (const [xs] of datasets) {
    for (let i = 0; i < xs.length; i++) {
      const v = xs[i];
      if (v != null) xSet.add(v);
    }
  }

  const sortedX = Float64Array.from([...xSet].sort((a, b) => a - b));
  const xIndex = new Map<number, number>();
  for (let i = 0; i < sortedX.length; i++) {
    const sv = sortedX[i];
    if (sv != null) xIndex.set(sv, i);
  }

  // Build aligned y-arrays
  const series: (number | null)[][] = [];
  for (const [xs, ys] of datasets) {
    const aligned: (number | null)[] = new Array<number | null>(sortedX.length).fill(null);
    for (let i = 0; i < xs.length; i++) {
      const xv = xs[i];
      if (xv == null) continue;
      const idx = xIndex.get(xv);
      if (idx != null) {
        aligned[idx] = ys[i] ?? null;
      }
    }
    series.push(aligned);
  }

  return [{ x: sortedX, series }];
}
