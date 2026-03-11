import React, { useMemo } from 'react';
import { Chart, Scale, Axis } from '../../src';
import type { ChartData, DrawCallback } from '../../src';
import { valToPos } from '../../src/core/Scale';

const HOURS = 24;
const BUCKETS = 30;
const MAX_LATENCY = 300; // ms

function generateHeatmapData(): { grid: number[][]; chartData: ChartData } {
  const grid: number[][] = [];

  for (let h = 0; h < HOURS; h++) {
    const row: number[] = [];
    for (let b = 0; b < BUCKETS; b++) {
      // Higher density in lower latency buckets, with some random hotspots
      const base = Math.exp(-b / 8) * 100;
      const spike = (Math.abs(h - 12) < 3 && b > 10 && b < 20) ? 80 : 0;
      row.push(Math.max(0, base + spike + (Math.random() - 0.3) * 30));
    }
    grid.push(row);
  }

  // Provide a minimal series so Chart renders axes
  const x = Array.from({ length: HOURS }, (_, i) => i);
  const y = x.map(() => 0);
  return { grid, chartData: [{ x, series: [y] }] };
}

function heatColor(t: number): string {
  // 0 = green, 0.5 = yellow, 1 = red
  const clamped = Math.max(0, Math.min(1, t));
  if (clamped < 0.5) {
    const f = clamped * 2;
    const r = Math.round(f * 255);
    const g = 200;
    return `rgb(${r},${g},50)`;
  }
  const f = (clamped - 0.5) * 2;
  const r = 255;
  const g = Math.round((1 - f) * 200);
  return `rgb(${r},${g},50)`;
}

const fmtHour = (splits: number[]) =>
  splits.map(v => {
    const h = Math.round(v);
    if (h < 0 || h > 23) return '';
    return `${h}:00`;
  });

const fmtLatency = (splits: number[]) =>
  splits.map(v => `${Math.round(v)}ms`);

export default function Heatmap() {
  const { grid, chartData } = useMemo(() => generateHeatmapData(), []);

  // Find max value for normalization
  const maxVal = useMemo(() => {
    let m = 0;
    for (const row of grid) {
      for (const v of row) {
        if (v > m) m = v;
      }
    }
    return m;
  }, [grid]);

  const onDraw: DrawCallback = ({ ctx, plotBox, pxRatio }) => {
    const xScale = { min: 0, max: HOURS, ori: 0 as const, dir: 1 as const, distr: 1, log: 10, asinh: 1, time: false, auto: true, id: 'x', range: null, _min: null, _max: null };
    const yScale = { min: 0, max: MAX_LATENCY, ori: 1 as const, dir: 1 as const, distr: 1, log: 10, asinh: 1, time: false, auto: true, id: 'y', range: null, _min: null, _max: null };

    const bucketHeight = MAX_LATENCY / BUCKETS;

    ctx.save();

    for (let h = 0; h < HOURS; h++) {
      const row = grid[h];
      if (row == null) continue;

      const x0 = valToPos(h, xScale, plotBox.width, plotBox.left) * pxRatio;
      const x1 = valToPos(h + 1, xScale, plotBox.width, plotBox.left) * pxRatio;
      const cellW = x1 - x0;

      for (let b = 0; b < BUCKETS; b++) {
        const val = row[b] ?? 0;
        const latLo = b * bucketHeight;
        const latHi = (b + 1) * bucketHeight;

        const y0 = valToPos(latHi, yScale, plotBox.height, plotBox.top) * pxRatio;
        const y1 = valToPos(latLo, yScale, plotBox.height, plotBox.top) * pxRatio;
        const cellH = y1 - y0;

        ctx.fillStyle = heatColor(val / maxVal);
        ctx.fillRect(x0, y0, cellW, cellH);
      }
    }

    ctx.restore();
  };

  return (
    <Chart width={800} height={400} data={chartData} onDraw={onDraw}>
      <Scale id="x" ori={0} dir={1} auto={false} min={0} max={HOURS} time={false} />
      <Scale id="y" ori={1} dir={1} auto={false} min={0} max={MAX_LATENCY} />
      <Axis scale="x" side={2} label="Hour" values={fmtHour} />
      <Axis scale="y" side={3} label="Latency" values={fmtLatency} />
    </Chart>
  );
}
