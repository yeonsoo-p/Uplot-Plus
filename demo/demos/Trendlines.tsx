import React, { useMemo } from 'react';
import { Chart, Scale, Series, Axis } from '../../src';
import type { ChartData, DrawCallback } from '../../src';
import { valToPos } from '../../src/core/Scale';

function generateData(): ChartData {
  const n = 80;
  const x: number[] = [];
  const y: number[] = [];

  for (let i = 0; i < n; i++) {
    x.push(i);
    // Upward trend with noise
    y.push(20 + i * 0.8 + (Math.random() - 0.5) * 25);
  }

  return [{ x, series: [y] }];
}

export default function Trendlines() {
  const data = useMemo(() => generateData(), []);

  const onDraw: DrawCallback = ({ ctx, plotBox, pxRatio }) => {
    const group = data[0];
    if (group == null) return;

    const xArr = group.x;
    const yArr = group.series[0];
    if (yArr == null) return;

    const n = xArr.length;

    // Compute linear regression: least squares
    let sumX = 0, sumY = 0;
    for (let i = 0; i < n; i++) {
      sumX += xArr[i] as number;
      sumY += yArr[i] as number;
    }
    const meanX = sumX / n;
    const meanY = sumY / n;

    let num = 0, den = 0;
    for (let i = 0; i < n; i++) {
      const dx = (xArr[i] as number) - meanX;
      const dy = (yArr[i] as number) - meanY;
      num += dx * dy;
      den += dx * dx;
    }
    const slope = den !== 0 ? num / den : 0;
    const intercept = meanY - slope * meanX;

    // Compute y range for scale
    let yMin = Infinity, yMax = -Infinity;
    for (let i = 0; i < n; i++) {
      const v = yArr[i] as number;
      if (v < yMin) yMin = v;
      if (v > yMax) yMax = v;
    }
    const trendStart = intercept;
    const trendEnd = slope * (xArr[n - 1] as number) + intercept;
    yMin = Math.min(yMin, trendStart, trendEnd);
    yMax = Math.max(yMax, trendStart, trendEnd);
    const pad = (yMax - yMin) * 0.05;
    yMin -= pad;
    yMax += pad;

    const xScale = { min: xArr[0] as number, max: xArr[n - 1] as number, ori: 0 as const, dir: 1 as const, distr: 1, log: 10, asinh: 1, time: false, auto: true, id: 'x', range: null, _min: null, _max: null };
    const yScale = { min: yMin, max: yMax, ori: 1 as const, dir: 1 as const, distr: 1, log: 10, asinh: 1, time: false, auto: true, id: 'y', range: null, _min: null, _max: null };

    const x0 = xArr[0] as number;
    const x1 = xArr[n - 1] as number;
    const y0 = slope * x0 + intercept;
    const y1 = slope * x1 + intercept;

    const px0 = valToPos(x0, xScale, plotBox.width, plotBox.left) * pxRatio;
    const py0 = valToPos(y0, yScale, plotBox.height, plotBox.top) * pxRatio;
    const px1 = valToPos(x1, xScale, plotBox.width, plotBox.left) * pxRatio;
    const py1 = valToPos(y1, yScale, plotBox.height, plotBox.top) * pxRatio;

    ctx.save();
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 2.5 * pxRatio;
    ctx.setLineDash([8 * pxRatio, 4 * pxRatio]);
    ctx.beginPath();
    ctx.moveTo(px0, py0);
    ctx.lineTo(px1, py1);
    ctx.stroke();

    // Label
    ctx.setLineDash([]);
    ctx.fillStyle = '#e74c3c';
    ctx.font = `${11 * pxRatio}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(
      `y = ${slope.toFixed(2)}x + ${intercept.toFixed(1)}`,
      px0 + 8 * pxRatio,
      py0 - 8 * pxRatio,
    );

    ctx.restore();
  };

  return (
    <Chart width={800} height={400} data={data} onDraw={onDraw}>
      <Scale id="x" auto ori={0} dir={1} time={false} />
      <Scale id="y" auto ori={1} dir={1} />
      <Axis scale="x" side={2} label="X" />
      <Axis scale="y" side={3} label="Y" />
      <Series group={0} index={0} yScale="y" stroke="#3498db" width={2} label="Data"
        points={{ show: true, size: 4, fill: '#3498db' }} />
    </Chart>
  );
}
