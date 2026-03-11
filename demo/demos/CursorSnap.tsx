import React, { useMemo } from 'react';
import { Chart, Scale, Series, Axis, Legend } from '../../src';
import type { ChartData } from '../../src';

export default function CursorSnap() {
  const data: ChartData = useMemo(() => {
    const n = 30;
    const x = Array.from({ length: n }, (_, i) => i * 3);
    const y = x.map(v => Math.sin(v * 0.1) * 40 + 50 + (Math.random() - 0.5) * 10);
    return [{ x, series: [y] }];
  }, []);

  return (
    <div>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
        Only 30 data points — cursor snaps to the nearest one. Notice the point indicator jumping between samples.
      </p>
      <Chart width={800} height={400} data={data}>
        <Scale id="x" auto ori={0} dir={1} time={false} />
        <Scale id="y" auto ori={1} dir={1} />
        <Axis scale="x" side={2} label="X" />
        <Axis scale="y" side={3} label="Value" />
        <Series
          group={0}
          index={0}
          yScale="y"
          stroke="#8e44ad"
          width={2}
          label="Sparse Signal"
          points={{ show: true, size: 8, fill: '#8e44ad', stroke: '#fff', width: 2 }}
        />
        <Legend />
      </Chart>
    </div>
  );
}
