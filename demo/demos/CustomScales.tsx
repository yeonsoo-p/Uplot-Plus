import React, { useMemo } from 'react';
import { Chart, Scale, Series, Axis, Legend } from '../../src';
import type { ChartData } from '../../src';

export default function CustomScales() {
  const data: ChartData = useMemo(() => {
    const n = 100;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = x.map(i => Math.sin(i * 0.08) * 30 + 50 + (Math.random() - 0.5) * 5);
    return [{ x, series: [y] }];
  }, []);

  return (
    <div>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
        Custom scale with manual <code>min</code>/<code>max</code> configuration.
        Data ranges ~20-80 but scale is fixed to 0-100.
      </p>
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ margin: '0 0 4px' }}>Fixed scale: 0 to 100</h4>
        <Chart width={800} height={220} data={data}>
          <Scale id="x" auto ori={0} dir={1} time={false} />
          <Scale id="y" ori={1} dir={1} auto={false} min={0} max={100} />
          <Axis scale="x" side={2} label="Index" />
          <Axis scale="y" side={3} label="Value (0-100)" />
          <Series group={0} index={0} yScale="y" stroke="#e74c3c" width={2} label="Fixed Range" />
        </Chart>
      </div>
      <div>
        <h4 style={{ margin: '0 0 4px' }}>Auto scale (for comparison)</h4>
        <Chart width={800} height={220} data={data}>
          <Scale id="x" auto ori={0} dir={1} time={false} />
          <Scale id="y" auto ori={1} dir={1} />
          <Axis scale="x" side={2} label="Index" />
          <Axis scale="y" side={3} label="Value (auto)" />
          <Series group={0} index={0} yScale="y" stroke="#3498db" width={2} label="Auto Range" />
        </Chart>
      </div>
    </div>
  );
}
