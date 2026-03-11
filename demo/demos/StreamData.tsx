import React, { useState, useEffect, useRef } from 'react';
import { Chart, Scale, Series, Axis, Legend } from '../../src';
import type { ChartData } from '../../src';

const WINDOW = 200;
const INTERVAL_MS = 100;

export default function StreamData() {
  const [data, setData] = useState<ChartData>(() => {
    const x = Array.from({ length: WINDOW }, (_, i) => i);
    const y = x.map(() => Math.random() * 50 + 25);
    return [{ x, series: [y] }];
  });

  const counterRef = useRef(WINDOW);

  useEffect(() => {
    const id = setInterval(() => {
      setData(prev => {
        const group = prev[0];
        if (!group) return prev;

        const newX = [...group.x.slice(1), counterRef.current++] as number[];
        const prevY = group.series[0] as number[];
        const lastY = prevY[prevY.length - 1] ?? 50;
        const newY = [...prevY.slice(1), lastY + (Math.random() - 0.5) * 8];

        return [{ x: newX, series: [newY] }];
      });
    }, INTERVAL_MS);

    return () => clearInterval(id);
  }, []);

  return (
    <Chart width={800} height={300} data={data}>
      <Scale id="x" auto ori={0} dir={1} time={false} />
      <Scale id="y" auto ori={1} dir={1} />
      <Axis scale="x" side={2} label="Tick" />
      <Axis scale="y" side={3} label="Value" />
      <Series group={0} index={0} yScale="y" stroke="#27ae60" fill="rgba(39,174,96,0.1)" width={2} label="Live Feed" />
      <Legend />
    </Chart>
  );
}
