import React, { useMemo } from 'react';
import { Chart, Scale, Series, Axis } from '../../src';
import type { ChartData, DrawCallback } from '../../src';
import { drawCandlesticks } from '../../src/paths/candlestick';

function generateOHLC(): ChartData {
  const n = 60;
  const x: number[] = [];
  const open: number[] = [];
  const high: number[] = [];
  const low: number[] = [];
  const close: number[] = [];

  let price = 100;

  for (let i = 0; i < n; i++) {
    x.push(i);
    const o = price;
    const change = (Math.random() - 0.48) * 4;
    const c = o + change;
    const h = Math.max(o, c) + Math.random() * 3;
    const l = Math.min(o, c) - Math.random() * 3;
    open.push(o);
    high.push(h);
    low.push(l);
    close.push(c);
    price = c;
  }

  return [{ x, series: [open, high, low, close] }];
}

export default function CandlestickOHLC() {
  const data = useMemo(() => generateOHLC(), []);

  const onDraw: DrawCallback = useMemo(() => {
    const group = data[0];
    if (group == null) return () => {};

    const xArr = group.x;
    const openArr = group.series[0];
    const highArr = group.series[1];
    const lowArr = group.series[2];
    const closeArr = group.series[3];
    if (openArr == null || highArr == null || lowArr == null || closeArr == null) return () => {};

    // Compute scale bounds from data
    let xMin = Infinity, xMax = -Infinity;
    let yMin = Infinity, yMax = -Infinity;
    for (let i = 0; i < xArr.length; i++) {
      const xv = xArr[i] as number;
      if (xv < xMin) xMin = xv;
      if (xv > xMax) xMax = xv;
      const hi = highArr[i] as number;
      const lo = lowArr[i] as number;
      if (hi > yMax) yMax = hi;
      if (lo < yMin) yMin = lo;
    }
    const yPad = (yMax - yMin) * 0.05;
    yMin -= yPad;
    yMax += yPad;

    return drawCandlesticks({
      xValues: xArr,
      open: openArr,
      high: highArr,
      low: lowArr,
      close: closeArr,
      xScale: { min: xMin, max: xMax, ori: 0, dir: 1, distr: 1, log: 10, asinh: 1, time: false, auto: true, id: 'x', range: null, _min: null, _max: null },
      yScale: { min: yMin, max: yMax, ori: 1, dir: 1, distr: 1, log: 10, asinh: 1, time: false, auto: true, id: 'y', range: null, _min: null, _max: null },
    });
  }, [data]);

  return (
    <Chart width={800} height={400} data={data} onDraw={onDraw}>
      <Scale id="x" auto ori={0} dir={1} time={false} />
      <Scale id="y" auto ori={1} dir={1} />
      <Axis scale="x" side={2} label="Day" />
      <Axis scale="y" side={3} label="Price" />
      <Series group={0} index={0} yScale="y" show={false} label="Open" />
      <Series group={0} index={1} yScale="y" show={false} label="High" />
      <Series group={0} index={2} yScale="y" show={false} label="Low" />
      <Series group={0} index={3} yScale="y" show={false} label="Close" />
    </Chart>
  );
}
