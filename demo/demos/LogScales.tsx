import React from 'react';
import { Chart, Scale, Series, Axis, fmtCompact } from '../../src';
import type { ChartData } from '../../src';

function generateData(): ChartData {
  const n = 100;
  const x: number[] = [];
  const y: number[] = [];

  for (let i = 0; i < n; i++) {
    x.push(i);
    y.push(Math.pow(10, i / 20) + (Math.random() - 0.5) * Math.pow(10, i / 25));
  }

  return [{ x, series: [y] }];
}

export default function LogScales() {
  const data = generateData();

  return (
    <Chart width={800} height={400} data={data}>
      <Scale id="x" auto ori={0} dir={1} time={false} />
      <Scale id="y" auto ori={1} dir={1} distr={3} log={10} />
      <Axis scale="x" side={2} label="Index" />
      <Axis scale="y" side={3} label="Value (log)" values={fmtCompact({ decimals: 0 })} />
      <Series group={0} index={0} yScale="y" stroke="#e67e22" width={2} label="Exponential" />
    </Chart>
  );
}
