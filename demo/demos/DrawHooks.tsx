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
const onDraw: DrawCallback = ({ ctx, plotBox, valToY }) => {
  const threshold = 65;
  const yPx = valToY(threshold, 'y');
  if (yPx == null) return;

  // Draw danger zone above threshold
  ctx.fillStyle = 'rgba(231, 76, 60, 0.08)';
  ctx.fillRect(plotBox.left, plotBox.top, plotBox.width, yPx - plotBox.top);

  // Draw threshold line
  ctx.strokeStyle = '#e74c3c';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(plotBox.left, yPx);
  ctx.lineTo(plotBox.left + plotBox.width, yPx);
  ctx.stroke();

  // Label
  ctx.setLineDash([]);
  ctx.fillStyle = '#e74c3c';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Threshold: 65', plotBox.left + 4, yPx - 4);
};

// Draw crosshair coordinates on the cursor overlay
const onCursorDraw: CursorDrawCallback = ({ ctx, plotBox }, cursor) => {
  if (cursor.left < 0 || cursor.top < 0) return;

  const x = cursor.left;
  const y = cursor.top;

  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.font = '10px monospace';
  ctx.textAlign = 'left';

  const label = `(${cursor.left.toFixed(0)}, ${cursor.top.toFixed(0)})`;
  const textW = ctx.measureText(label).width;

  // Background box
  const padX = 4;
  const padY = 2;
  const boxX = Math.min(x + 8, plotBox.left + plotBox.width - textW - padX * 2);
  const boxY = y - 20;

  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(boxX, boxY, textW + padX * 2, 16);

  ctx.fillStyle = '#fff';
  ctx.fillText(label, boxX + padX, boxY + 12);
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
