import React from 'react';
import { Chart, Scale, Series, Axis, bars } from '../../src';
import type { ChartData } from '../../src';

const ITEMS = ['Revenue', 'Expenses', 'Profit', 'Users', 'Sessions', 'Bounce Rate'];

function makeBarData(n: number): ChartData {
  const x = Array.from({ length: n }, (_, i) => i);
  const y = x.map(() => Math.random() * 80 + 20);
  return [{ x, series: [y] }];
}

function SparkBar({ data, color }: { data: ChartData; color: string }) {
  return (
    <div style={{ pointerEvents: 'none' }}>
      <Chart width={120} height={28} data={data}>
        <Scale id="x" auto ori={0} dir={1} time={false} />
        <Scale id="y" auto ori={1} dir={1} />
        <Axis scale="x" side={2} show={false} />
        <Axis scale="y" side={3} show={false} />
        <Series group={0} index={0} yScale="y" stroke={color} fill={color + '99'} width={0} paths={bars()} fillTo={0} />
      </Chart>
    </div>
  );
}

export default function SparklinesBars() {
  const colors = ['#2980b9', '#e74c3c', '#27ae60', '#8e44ad', '#f39c12', '#1abc9c'];

  const rows = ITEMS.map((name, i) => ({
    name,
    data: makeBarData(20),
    color: colors[i % colors.length]!,
    value: (Math.random() * 1000).toFixed(0),
  }));

  return (
    <table className="sparkline-table">
      <thead>
        <tr>
          <th>Metric</th>
          <th>Trend</th>
          <th>Current</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.name}>
            <td style={{ fontWeight: 600 }}>{r.name}</td>
            <td><SparkBar data={r.data} color={r.color} /></td>
            <td>{r.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
