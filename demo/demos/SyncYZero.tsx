import React, { useMemo } from 'react';
import { Chart, Scale, Series, Axis, Legend } from '../../src';
import type { ChartData } from '../../src';

export default function SyncYZero() {
  const data: ChartData = useMemo(() => {
    const n = 100;
    const x = Array.from({ length: n }, (_, i) => i);
    const y1 = x.map(i => Math.sin(i * 0.08) * 30 + 40);
    const y2 = x.map(i => Math.cos(i * 0.06) * 200 + 300);
    return [{ x, series: [y1, y2] }];
  }, []);

  return (
    <div>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
        Two y-scales both pinned to zero with <code>min=0</code>. Different magnitudes but both start at zero.
      </p>
      <Chart width={800} height={400} data={data}>
        <Scale id="x" auto ori={0} dir={1} time={false} />
        <Scale id="y1" auto ori={1} dir={1} min={0} />
        <Scale id="y2" auto ori={1} dir={1} min={0} />
        <Axis scale="x" side={2} label="Index" />
        <Axis scale="y1" side={3} label="Small (0-80)" stroke="#e74c3c" />
        <Axis scale="y2" side={1} label="Large (0-600)" stroke="#3498db" />
        <Series group={0} index={0} yScale="y1" stroke="#e74c3c" width={2} label="Small Scale" />
        <Series group={0} index={1} yScale="y2" stroke="#3498db" width={2} label="Large Scale" />
        <Legend />
      </Chart>
    </div>
  );
}
