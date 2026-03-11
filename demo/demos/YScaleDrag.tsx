import React, { useMemo } from 'react';
import { Chart, Scale, Series, Axis, Legend } from '../../src';
import type { ChartData } from '../../src';

export default function YScaleDrag() {
  const data: ChartData = useMemo(() => {
    const N = 200;
    const x = new Float64Array(N);
    const y1 = new Float64Array(N);
    const y2 = new Float64Array(N);

    for (let i = 0; i < N; i++) {
      x[i] = i;
      y1[i] = Math.sin(i * 0.05) * 100 + 200;
      y2[i] = Math.cos(i * 0.03) * 50 + 50;
    }

    return [{ x, series: [y1, y2] }];
  }, []);

  return (
    <div>
      <p style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>
        Click and drag on the left or right y-axis to pan the scale. Double-click chart to reset.
      </p>
      <Chart width={800} height={400} data={data}>
        <Scale id="x" ori={0} dir={1} auto />
        <Scale id="y" ori={1} dir={1} auto />
        <Scale id="y2" ori={1} dir={1} auto />
        <Series group={0} index={0} yScale="y" stroke="#e24d42" label="Temperature" width={2} />
        <Series group={0} index={1} yScale="y2" stroke="#1f78b4" label="Humidity" width={2} />
        <Axis scale="x" side={2} />
        <Axis scale="y" side={3} label="Temperature" />
        <Axis scale="y2" side={1} label="Humidity" stroke="#1f78b4" />
        <Legend />
      </Chart>
    </div>
  );
}
