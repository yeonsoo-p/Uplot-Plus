import React from 'react';
import { Chart, Scale, Series, Axis } from '../../src';
import type { ChartData, GradientConfig } from '../../src';

function generateData(): ChartData {
  const n = 120;
  const x: number[] = [];
  const y1: number[] = [];
  const y2: number[] = [];

  for (let i = 0; i < n; i++) {
    const t = i * 0.05;
    x.push(t);
    y1.push(Math.sin(t) * 35 + 50);
    y2.push(Math.cos(t * 0.7) * 25 + 45);
  }

  return [{ x, series: [y1, y2] }];
}

const blueGradient: GradientConfig = {
  type: 'linear',
  stops: [
    [0, 'rgba(66,133,244,0.8)'],
    [1, 'rgba(66,133,244,0.0)'],
  ],
};

const purpleGradient: GradientConfig = {
  type: 'linear',
  stops: [
    [0, 'rgba(156,39,176,0.7)'],
    [1, 'rgba(156,39,176,0.0)'],
  ],
};

export default function Gradients() {
  const data = generateData();

  return (
    <div>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
        Area chart with linear gradient fills fading from top to bottom.
      </p>
      <Chart width={800} height={400} data={data}>
        <Scale id="x" auto ori={0} dir={1} time={false} />
        <Scale id="y" auto ori={1} dir={1} />
        <Axis scale="x" side={2} label="Time" />
        <Axis scale="y" side={3} label="Value" />
        <Series group={0} index={0} yScale="y" stroke="#4285f4" fill={blueGradient} width={2} label="Blue Series" />
        <Series group={0} index={1} yScale="y" stroke="#9c27b0" fill={purpleGradient} width={2} label="Purple Series" />
      </Chart>
    </div>
  );
}
