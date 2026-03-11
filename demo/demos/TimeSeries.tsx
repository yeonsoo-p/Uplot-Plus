import React from 'react';
import { Chart, Scale, Series, Axis, Legend } from '../../src';
import type { ChartData } from '../../src';

function generateData(): ChartData {
  const n = 288; // 24 hours at 5-min intervals
  const startTs = 1700000000; // Unix timestamp
  const x: number[] = [];
  const requests: number[] = [];
  const errors: number[] = [];

  for (let i = 0; i < n; i++) {
    x.push(startTs + i * 300);
    const hour = (i * 5) / 60;
    // Simulated daily traffic pattern
    const base = 500 + 300 * Math.sin((hour - 6) * Math.PI / 12);
    requests.push(Math.max(0, Math.round(base + (Math.random() - 0.5) * 100)));
    errors.push(Math.max(0, Math.round(base * 0.02 + (Math.random() - 0.5) * 5)));
  }

  return [{ x, series: [requests, errors] }];
}

const fmtTime = (splits: number[]) => splits.map(v => {
  const d = new Date(v * 1000);
  return d.getUTCHours().toString().padStart(2, '0') + ':' +
    d.getUTCMinutes().toString().padStart(2, '0');
});

const fmtCount = (splits: number[]) => splits.map(v => {
  if (v >= 1000) return (v / 1000).toFixed(1) + 'K';
  return v.toFixed(0);
});

export default function TimeSeries() {
  const data = generateData();

  return (
    <Chart width={800} height={400} data={data}>
      <Scale id="x" auto ori={0} dir={1} time={false} />
      <Scale id="req" auto ori={1} dir={1} />
      <Scale id="err" auto ori={1} dir={1} />
      <Axis scale="x" side={2} label="Time (UTC)" values={fmtTime} space={80} />
      <Axis scale="req" side={3} label="Requests" values={fmtCount} stroke="#2980b9" />
      <Axis scale="err" side={1} label="Errors" stroke="#e74c3c" grid={{ show: false }} />
      <Series group={0} index={0} yScale="req" stroke="#2980b9" fill="rgba(41,128,185,0.1)" width={2} label="Requests" />
      <Series group={0} index={1} yScale="err" stroke="#e74c3c" width={2} label="Errors" />
      <Legend />
    </Chart>
  );
}
