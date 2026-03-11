/**
 * Shared synthetic data generator for large dataset benchmarks.
 * Matches the pattern from reference/uPlot/bench/uPlot-10M.html.
 */

/** Generate flat-array data for original uPlot: [x[], y1[], y2[], ...] */
export function prepLargeDataFlat(numPoints: number, numSeries: number, seriesShift = 0): number[][] {
  const data: number[][] = [new Array(numPoints)];
  for (let s = 0; s < numSeries; s++) data.push(new Array(numPoints));

  let a = 0, b = 0, c = 0;

  for (let i = 0; i < numPoints; i++) {
    data[0]![i] = i;

    if (i % 100 === 0) a = Math.random();
    if (i % 1000 === 0) b = Math.random();
    if (i % 10000 === 0) c = Math.random();

    const spike = i % 50000 === 0 ? 10 : 0;

    for (let s = 0; s < numSeries; s++) {
      data[s + 1]![i] = s * seriesShift + 2 * Math.sin(i / 100) + a + b + c + spike + Math.random();
    }
  }

  return data;
}

/** Generate XGroup data for uPlot+: [{ x, series: [y1, y2, ...] }] */
export function prepLargeDataGrouped(numPoints: number, numSeries: number, seriesShift = 0): [{ x: number[]; series: number[][] }] {
  const x = new Array<number>(numPoints);
  const series: number[][] = [];
  for (let s = 0; s < numSeries; s++) series.push(new Array(numPoints));

  let a = 0, b = 0, c = 0;

  for (let i = 0; i < numPoints; i++) {
    x[i] = i;

    if (i % 100 === 0) a = Math.random();
    if (i % 1000 === 0) b = Math.random();
    if (i % 10000 === 0) c = Math.random();

    const spike = i % 50000 === 0 ? 10 : 0;

    for (let s = 0; s < numSeries; s++) {
      series[s]![i] = s * seriesShift + 2 * Math.sin(i / 100) + a + b + c + spike + Math.random();
    }
  }

  return [{ x, series }];
}
