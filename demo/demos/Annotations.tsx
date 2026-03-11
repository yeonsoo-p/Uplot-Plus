import React from 'react';
import { Chart, Scale, Series, Axis, useChart, useDrawHook, drawHLine, drawVLine, drawLabel, drawRegion } from '../../src';
import type { ChartData } from '../../src';

function generateData(): ChartData {
  const n = 150;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = x.map(i => Math.sin(i * 0.04) * 30 + 50 + (Math.random() - 0.5) * 8);
  return [{ x, series: [y] }];
}

/**
 * Renderless child component that uses useChart() + useDrawHook()
 * to draw annotations using the annotation helper functions.
 */
function AnnotationLayer() {
  const store = useChart();

  useDrawHook((dc) => {
    const yScale = store.scaleManager.getScale('y');
    const xScale = store.scaleManager.getScale('x');
    if (!yScale || !xScale) return;

    // Shaded region between y=40 and y=60
    drawRegion(dc, yScale, 40, 60, {
      fill: 'rgba(46,204,113,0.12)',
      stroke: 'rgba(46,204,113,0.4)',
      width: 1,
      dash: [3, 3],
    });

    // Horizontal threshold line at y=65
    drawHLine(dc, yScale, 65, {
      stroke: '#e74c3c',
      width: 1.5,
      dash: [6, 4],
    });

    // Horizontal baseline at y=35
    drawHLine(dc, yScale, 35, {
      stroke: '#3498db',
      width: 1.5,
      dash: [6, 4],
    });

    // Vertical marker at x=75
    drawVLine(dc, xScale, 75, {
      stroke: '#8e44ad',
      width: 1,
      dash: [4, 4],
    });

    // Labels
    drawLabel(dc, xScale, yScale, 2, 66, 'Upper threshold', {
      fill: '#e74c3c',
      font: '11px sans-serif',
    });

    drawLabel(dc, xScale, yScale, 2, 36, 'Lower threshold', {
      fill: '#3498db',
      font: '11px sans-serif',
    });

    drawLabel(dc, xScale, yScale, 76, 80, 'Event', {
      fill: '#8e44ad',
      font: '11px sans-serif',
    });
  });

  return null;
}

export default function Annotations() {
  const data = generateData();

  return (
    <div>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
        Annotation overlays: horizontal lines, vertical markers, shaded regions, and labels
        drawn using the annotation helper functions via useDrawHook().
      </p>
      <Chart width={800} height={400} data={data}>
        <Scale id="x" auto ori={0} dir={1} time={false} />
        <Scale id="y" ori={1} dir={1} auto={false} min={10} max={90} />
        <Axis scale="x" side={2} label="Sample" />
        <Axis scale="y" side={3} label="Value" />
        <Series group={0} index={0} yScale="y" stroke="#2c3e50" width={2} label="Signal" />
        <AnnotationLayer />
      </Chart>
    </div>
  );
}
