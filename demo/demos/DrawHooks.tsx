import React from 'react';
import { Chart, Scale, Series, Axis } from '../../src';
import type { ChartData, DrawCallback, CursorDrawCallback } from '../../src';

function generateData(): ChartData {
  const n = 200;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = x.map(i => Math.sin(i * 0.04) * 30 + 50 + (Math.random() - 0.5) * 10);
  return [{ x, series: [y] }];
}

// Draw a horizontal threshold line and colored zone on the persistent layer
const onDraw: DrawCallback = ({ ctx, plotBox, pxRatio }) => {
  const threshold = 65;
  // Map threshold to pixel position (approximate: assumes y-scale auto range ~10-90)
  const yMin = 10;
  const yMax = 90;
  const yFrac = 1 - (threshold - yMin) / (yMax - yMin);
  const yPx = (plotBox.top + yFrac * plotBox.height) * pxRatio;

  // Draw danger zone above threshold
  ctx.save();
  ctx.fillStyle = 'rgba(231, 76, 60, 0.08)';
  ctx.fillRect(
    plotBox.left * pxRatio,
    plotBox.top * pxRatio,
    plotBox.width * pxRatio,
    yPx - plotBox.top * pxRatio,
  );

  // Draw threshold line
  ctx.strokeStyle = '#e74c3c';
  ctx.lineWidth = 2 * pxRatio;
  ctx.setLineDash([6 * pxRatio, 4 * pxRatio]);
  ctx.beginPath();
  ctx.moveTo(plotBox.left * pxRatio, yPx);
  ctx.lineTo((plotBox.left + plotBox.width) * pxRatio, yPx);
  ctx.stroke();

  // Label
  ctx.setLineDash([]);
  ctx.fillStyle = '#e74c3c';
  ctx.font = `${11 * pxRatio}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText('Threshold: 65', (plotBox.left + 4) * pxRatio, yPx - 4 * pxRatio);
  ctx.restore();
};

// Draw crosshair coordinates on the cursor overlay
const onCursorDraw: CursorDrawCallback = ({ ctx, plotBox, pxRatio }, cursor) => {
  if (cursor.left < 0 || cursor.top < 0) return;

  const x = cursor.left * pxRatio;
  const y = cursor.top * pxRatio;

  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.font = `${10 * pxRatio}px monospace`;
  ctx.textAlign = 'left';

  const label = `(${cursor.left.toFixed(0)}, ${cursor.top.toFixed(0)})`;
  const textW = ctx.measureText(label).width;

  // Background box
  const padX = 4 * pxRatio;
  const padY = 2 * pxRatio;
  const boxX = Math.min(x + 8 * pxRatio, (plotBox.left + plotBox.width) * pxRatio - textW - padX * 2);
  const boxY = y - 20 * pxRatio;

  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(boxX, boxY, textW + padX * 2, 16 * pxRatio);

  ctx.fillStyle = '#fff';
  ctx.fillText(label, boxX + padX, boxY + 12 * pxRatio);
  ctx.restore();
};

export default function DrawHooks() {
  const data = generateData();

  return (
    <Chart width={800} height={400} data={data} onDraw={onDraw} onCursorDraw={onCursorDraw}>
      <Scale id="x" auto ori={0} dir={1} time={false} />
      <Scale id="y" ori={1} dir={1} auto={false} min={10} max={90} />
      <Axis scale="x" side={2} label="Sample" />
      <Axis scale="y" side={3} label="Value" />
      <Series group={0} index={0} yScale="y" stroke="#2980b9" width={2} label="Signal" />
    </Chart>
  );
}
