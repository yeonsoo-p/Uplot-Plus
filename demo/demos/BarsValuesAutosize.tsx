import React, { useMemo } from 'react';
import { Chart, Scale, Series, Axis, bars } from '../../src';
import type { ChartData, DrawCallback } from '../../src';

export default function BarsValuesAutosize() {
  const values = useMemo(() => Array.from({ length: 10 }, () => Math.round(Math.random() * 80 + 10)), []);

  const data: ChartData = useMemo(() => {
    const x = Array.from({ length: values.length }, (_, i) => i + 1);
    return [{ x, series: [values] }];
  }, [values]);

  // Draw value labels above each bar
  const onDraw: DrawCallback = ({ ctx, plotBox, pxRatio }) => {
    ctx.save();
    ctx.fillStyle = '#333';
    ctx.font = `${11 * pxRatio}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';

    const count = values.length;
    const barWidth = plotBox.width / count;

    // Approximate y mapping: data range ~0-100
    const yMin = 0;
    const yMax = 100;

    for (let i = 0; i < count; i++) {
      const v = values[i]!;
      const cx = (plotBox.left + (i + 0.5) * barWidth) * pxRatio;
      const yFrac = 1 - (v - yMin) / (yMax - yMin);
      const cy = (plotBox.top + yFrac * plotBox.height - 4) * pxRatio;
      ctx.fillText(String(v), cx, cy);
    }

    ctx.restore();
  };

  return (
    <div>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
        Bar chart with value labels drawn above each bar using the <code>onDraw</code> hook.
      </p>
      <Chart width={800} height={400} data={data} onDraw={onDraw}>
        <Scale id="x" auto ori={0} dir={1} time={false} />
        <Scale id="y" ori={1} dir={1} min={0} max={100} />
        <Axis scale="x" side={2} label="Category" />
        <Axis scale="y" side={3} label="Value" />
        <Series
          group={0}
          index={0}
          yScale="y"
          stroke="#2980b9"
          fill="rgba(41, 128, 185, 0.6)"
          width={0}
          label="Sales"
          paths={bars()}
          fillTo={0}
        />
      </Chart>
    </div>
  );
}
