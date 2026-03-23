import React, { useMemo } from 'react';
import { Chart, Scale, Series, Axis, Legend } from '../../src';
import type { ChartData } from '../../src';

export default function ZoomModifierKeys() {
  const data: ChartData = useMemo(() => {
    const N = 500;
    const x: number[] = [];
    const y1: number[] = [];
    const y2: number[] = [];

    for (let i = 0; i < N; i++) {
      const t = i * 0.02;
      x.push(t);
      y1.push(Math.sin(t * 3) * 40 + 50);
      y2.push(Math.cos(t * 2) * 25 + 30);
    }

    return [{ x, series: [y1, y2] }];
  }, []);

  return (
    <div>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
        <strong>Shift + Scroll</strong> to zoom X axis &middot;{' '}
        <strong>Alt + Scroll</strong> to zoom Y axis &middot;{' '}
        <strong>Drag</strong> to zoom a region &middot;{' '}
        <strong>Double-click</strong> to reset
      </p>
      <Chart
        width={800}
        height={400}
        data={data}
        cursor={{ wheelZoom: { x: { key: 'shift' }, y: { key: 'alt' } } }}
      >
        <Scale id="x" />
        <Scale id="y" />
        <Axis scale="x" label="Time" />
        <Axis scale="y" label="Value" />
        <Series group={0} index={0} yScale="y" stroke="#e24d42" width={2} label="Sine" />
        <Series group={0} index={1} yScale="y" stroke="#1f78b4" width={2} label="Cosine" />
        <Legend />
      </Chart>
    </div>
  );
}
