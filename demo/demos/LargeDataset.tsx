import React, { useMemo } from 'react';
import { Chart, Scale, Series, Axis } from '../../src';
import type { ChartData } from '../../src';

function generateData(): ChartData {
  const n = 500_000;
  const x = new Float64Array(n);
  const y = new Float64Array(n);

  for (let i = 0; i < n; i++) {
    x[i] = i;
    y[i] = Math.sin(i * 0.00001) * 50 + Math.sin(i * 0.001) * 10 + (Math.random() - 0.5) * 5;
  }

  return [{ x: Array.from(x), series: [Array.from(y)] }];
}

export default function LargeDataset() {
  const data = useMemo(generateData, []);

  return (
    <Chart width={800} height={400} data={data}>
      <Scale id="x" auto ori={0} dir={1} time={false} />
      <Scale id="y" auto ori={1} dir={1} />
      <Axis scale="x" side={2} label="Index" />
      <Axis scale="y" side={3} label="Value" />
      <Series group={0} index={0} yScale="y" stroke="#8e44ad" width={1} label="500K Points" />
    </Chart>
  );
}
