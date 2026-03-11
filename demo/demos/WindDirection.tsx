import React, { useMemo } from 'react';
import { Chart, Scale, Series, Axis } from '../../src';
import type { ChartData, DrawCallback } from '../../src';
import { valToPos } from '../../src/core/Scale';

function generateWindData(): { directions: number[]; chartData: ChartData } {
  const n = 48; // 48 half-hour intervals
  const x: number[] = [];
  const speed: number[] = [];
  const directions: number[] = [];

  let dir = Math.random() * 360;

  for (let i = 0; i < n; i++) {
    x.push(i * 0.5); // hours
    speed.push(5 + Math.random() * 25);
    // Direction drifts gradually
    dir += (Math.random() - 0.5) * 40;
    if (dir < 0) dir += 360;
    if (dir >= 360) dir -= 360;
    directions.push(dir);
  }

  return {
    directions,
    chartData: [{ x, series: [speed] }],
  };
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  angle: number,
  size: number,
  pxRatio: number,
): void {
  const rad = (angle - 90) * (Math.PI / 180); // 0=N, 90=E
  const len = size * pxRatio;
  const headLen = len * 0.35;
  const headAngle = Math.PI / 6;

  const tipX = cx + Math.cos(rad) * len;
  const tipY = cy + Math.sin(rad) * len;
  const tailX = cx - Math.cos(rad) * len * 0.5;
  const tailY = cy - Math.sin(rad) * len * 0.5;

  // Shaft
  ctx.beginPath();
  ctx.moveTo(tailX, tailY);
  ctx.lineTo(tipX, tipY);
  ctx.stroke();

  // Arrowhead
  ctx.beginPath();
  ctx.moveTo(tipX, tipY);
  ctx.lineTo(
    tipX - headLen * Math.cos(rad - headAngle),
    tipY - headLen * Math.sin(rad - headAngle),
  );
  ctx.moveTo(tipX, tipY);
  ctx.lineTo(
    tipX - headLen * Math.cos(rad + headAngle),
    tipY - headLen * Math.sin(rad + headAngle),
  );
  ctx.stroke();
}

export default function WindDirection() {
  const { directions, chartData } = useMemo(() => generateWindData(), []);

  const onDraw: DrawCallback = ({ ctx, plotBox, pxRatio }) => {
    const group = chartData[0];
    if (group == null) return;

    const xArr = group.x;
    const speedArr = group.series[0];
    if (speedArr == null) return;

    // Compute ranges
    let xMin = Infinity, xMax = -Infinity;
    let yMin = Infinity, yMax = -Infinity;
    for (let i = 0; i < xArr.length; i++) {
      const xv = xArr[i] as number;
      const yv = speedArr[i] as number;
      if (xv < xMin) xMin = xv;
      if (xv > xMax) xMax = xv;
      if (yv < yMin) yMin = yv;
      if (yv > yMax) yMax = yv;
    }
    const yPad = (yMax - yMin) * 0.1;
    yMin -= yPad;
    yMax += yPad;

    const xScale = { min: xMin, max: xMax, ori: 0 as const, dir: 1 as const, distr: 1, log: 10, asinh: 1, time: false, auto: true, id: 'x', range: null, _min: null, _max: null };
    const yScale = { min: yMin, max: yMax, ori: 1 as const, dir: 1 as const, distr: 1, log: 10, asinh: 1, time: false, auto: true, id: 'y', range: null, _min: null, _max: null };

    ctx.save();
    ctx.strokeStyle = '#c0392b';
    ctx.lineWidth = 1.5 * pxRatio;
    ctx.lineCap = 'round';

    for (let i = 0; i < xArr.length; i++) {
      const speed = speedArr[i] as number;
      const dir = directions[i];
      if (dir == null) continue;

      const px = valToPos(xArr[i] as number, xScale, plotBox.width, plotBox.left) * pxRatio;
      const py = valToPos(speed, yScale, plotBox.height, plotBox.top) * pxRatio;

      // Arrow size proportional to wind speed
      const arrowSize = 4 + (speed / 30) * 6;
      drawArrow(ctx, px, py, dir, arrowSize, pxRatio);
    }

    ctx.restore();
  };

  const fmtHour = (splits: number[]) => splits.map(v => `${v.toFixed(0)}h`);

  return (
    <Chart width={800} height={400} data={chartData} onDraw={onDraw}>
      <Scale id="x" auto ori={0} dir={1} time={false} />
      <Scale id="y" auto ori={1} dir={1} />
      <Axis scale="x" side={2} label="Time (hours)" values={fmtHour} />
      <Axis scale="y" side={3} label="Wind Speed (km/h)" />
      <Series group={0} index={0} yScale="y" stroke="#3498db" width={1.5} label="Speed"
        dash={[4, 3]} />
    </Chart>
  );
}
