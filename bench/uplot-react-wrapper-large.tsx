import React from 'react';
import { createRoot } from 'react-dom/client';
import uPlot from 'uplot';
import UplotReact from './uplot-react-shim';
import { prepLargeDataFlat } from './large-data';
import { markStart, markEnd, getHeapMB, displayResults, postResults } from './metrics';
import type { BenchResult } from './metrics';

const NUM_POINTS = 2_000_000;
const NUM_SERIES = 1;

const status = document.getElementById('status')!;
status.textContent = 'Preparing 2M×1...';

markStart('prep');
const data = prepLargeDataFlat(NUM_POINTS, NUM_SERIES, 0) as uPlot.AlignedData;
const prepMs = markEnd('prep');
console.log('prep:', prepMs.toFixed(1), 'ms');

const heapBefore = getHeapMB();

const colors = ['red', 'blue', 'green', 'orange', 'purple', 'cyan', 'magenta', 'yellow'];
const series: uPlot.Series[] = [{}];
for (let i = 0; i < NUM_SERIES; i++) {
  series.push({
    label: `S${i + 1}`,
    width: 1 / devicePixelRatio,
    stroke: colors[i % colors.length],
  });
}

const opts: uPlot.Options = {
  width: 1920,
  height: 400,
  scales: { x: { time: false } },
  series,
};

status.textContent = 'Rendering 2M×1...';

markStart('total');
performance.mark('canvas-start');

const root = createRoot(document.getElementById('chart-root')!);

root.render(
  <UplotReact
    options={opts}
    data={data}
    onCreate={() => {
      performance.mark('canvas-end');

      queueMicrotask(() => {
        const totalMs = markEnd('total');
        const canvasMs = performance.measure('canvas', 'canvas-start', 'canvas-end').duration;
        const heapAfter = getHeapMB();

        status.textContent = 'Done!';
        console.log('chart (total):', totalMs.toFixed(1), 'ms');
        console.log('chart (canvas only):', canvasMs.toFixed(1), 'ms');

        const result: BenchResult = {
          name: 'uPlot + React wrapper — 2M×1',
          prepMs,
          chartMs: totalMs,
          canvasMs,
          heapPeakMB: heapBefore,
          heapFinalMB: heapAfter,
        };

        displayResults(document.getElementById('results')!, result);
        postResults(result);
      });
    }}
  />
);
