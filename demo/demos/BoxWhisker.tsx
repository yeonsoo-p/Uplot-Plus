import React, { useMemo } from 'react';
import { Chart, Scale, Axis } from '../../src';
import type { ChartData, DrawCallback } from '../../src';
import { valToPos } from '../../src/core/Scale';

interface BoxData {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
}

function generateBoxData(): { boxes: BoxData[]; chartData: ChartData } {
  const categories = 10;
  const boxes: BoxData[] = [];

  for (let i = 0; i < categories; i++) {
    const center = 30 + Math.random() * 60;
    const spread = 5 + Math.random() * 20;
    const min = center - spread - Math.random() * 10;
    const q1 = center - spread * 0.5;
    const median = center + (Math.random() - 0.5) * spread * 0.3;
    const q3 = center + spread * 0.5;
    const max = center + spread + Math.random() * 10;
    boxes.push({ min, q1, median, q3, max });
  }

  // Provide minimal data for axis rendering
  const x = Array.from({ length: categories }, (_, i) => i + 1);
  const y = x.map(() => 0);
  return { boxes, chartData: [{ x, series: [y] }] };
}

const fmtCategory = (splits: number[]) =>
  splits.map(v => {
    const idx = Math.round(v);
    if (idx < 1 || idx > 10) return '';
    return `Cat ${idx}`;
  });

export default function BoxWhisker() {
  const { boxes, chartData } = useMemo(() => generateBoxData(), []);

  // Compute y range
  const yRange = useMemo(() => {
    let yMin = Infinity, yMax = -Infinity;
    for (const b of boxes) {
      if (b.min < yMin) yMin = b.min;
      if (b.max > yMax) yMax = b.max;
    }
    const pad = (yMax - yMin) * 0.1;
    return { min: yMin - pad, max: yMax + pad };
  }, [boxes]);

  const onDraw: DrawCallback = ({ ctx, plotBox, pxRatio }) => {
    const xScale = { min: 0.5, max: boxes.length + 0.5, ori: 0 as const, dir: 1 as const, distr: 1, log: 10, asinh: 1, time: false, auto: true, id: 'x', range: null, _min: null, _max: null };
    const yScale = { min: yRange.min, max: yRange.max, ori: 1 as const, dir: 1 as const, distr: 1, log: 10, asinh: 1, time: false, auto: true, id: 'y', range: null, _min: null, _max: null };

    const boxW = (plotBox.width / boxes.length) * 0.5;

    ctx.save();

    for (let i = 0; i < boxes.length; i++) {
      const b = boxes[i];
      if (b == null) continue;

      const cx = valToPos(i + 1, xScale, plotBox.width, plotBox.left) * pxRatio;
      const minPx = valToPos(b.min, yScale, plotBox.height, plotBox.top) * pxRatio;
      const q1Px = valToPos(b.q1, yScale, plotBox.height, plotBox.top) * pxRatio;
      const medPx = valToPos(b.median, yScale, plotBox.height, plotBox.top) * pxRatio;
      const q3Px = valToPos(b.q3, yScale, plotBox.height, plotBox.top) * pxRatio;
      const maxPx = valToPos(b.max, yScale, plotBox.height, plotBox.top) * pxRatio;

      const halfW = (boxW / 2) * pxRatio;
      const capW = halfW * 0.6;

      // Whisker line: min to max
      ctx.strokeStyle = '#555';
      ctx.lineWidth = 1 * pxRatio;
      ctx.beginPath();
      ctx.moveTo(cx, minPx);
      ctx.lineTo(cx, maxPx);
      ctx.stroke();

      // Min cap
      ctx.beginPath();
      ctx.moveTo(cx - capW, minPx);
      ctx.lineTo(cx + capW, minPx);
      ctx.stroke();

      // Max cap
      ctx.beginPath();
      ctx.moveTo(cx - capW, maxPx);
      ctx.lineTo(cx + capW, maxPx);
      ctx.stroke();

      // Box Q1 to Q3
      const boxTop = Math.min(q1Px, q3Px);
      const boxH = Math.abs(q3Px - q1Px);
      ctx.fillStyle = 'rgba(52, 152, 219, 0.4)';
      ctx.fillRect(cx - halfW, boxTop, halfW * 2, boxH);
      ctx.strokeStyle = '#2980b9';
      ctx.lineWidth = 1.5 * pxRatio;
      ctx.strokeRect(cx - halfW, boxTop, halfW * 2, boxH);

      // Median line
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 2.5 * pxRatio;
      ctx.beginPath();
      ctx.moveTo(cx - halfW, medPx);
      ctx.lineTo(cx + halfW, medPx);
      ctx.stroke();
    }

    ctx.restore();
  };

  return (
    <Chart width={800} height={400} data={chartData} onDraw={onDraw}>
      <Scale id="x" ori={0} dir={1} auto={false} min={0.5} max={10.5} time={false} />
      <Scale id="y" ori={1} dir={1} auto={false} min={yRange.min} max={yRange.max} />
      <Axis scale="x" side={2} label="Category" values={fmtCategory} />
      <Axis scale="y" side={3} label="Value" />
    </Chart>
  );
}
