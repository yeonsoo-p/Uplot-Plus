import React from 'react';
import { createRoot } from 'react-dom/client';
import uPlot from 'uplot';
import UplotReact from './uplot-react-shim';
import { markStart, markEnd, getHeapMB, displayResults, postResults } from './metrics';
import type { BenchResult } from './metrics';

// ── Data prep (same flat-array format as original uPlot) ────────────

function round2(val: number): number {
  return Math.round(val * 100) / 100;
}

function round3(val: number): number {
  return Math.round(val * 1000) / 1000;
}

function prepData(packed: number[]): { data: uPlot.AlignedData; prepMs: number } {
  markStart('prep');

  const numFields = packed[0]!;
  packed = packed.slice(numFields + 1);

  const len = packed.length / numFields;
  const data: uPlot.AlignedData = [
    new Array(len),
    new Array(len),
    new Array(len),
    new Array(len),
  ];

  for (let i = 0, j = 0; i < packed.length; i += numFields, j++) {
    data[0]![j] = packed[i]! * 60;
    data[1]![j] = round3(100 - packed[i + 1]!);
    data[2]![j] = round2(100 * packed[i + 5]! / (packed[i + 5]! + packed[i + 6]!));
    data[3]![j] = packed[i + 3]!;
  }

  const prepMs = markEnd('prep');
  return { data, prepMs };
}

// ── Main ────────────────────────────────────────────────────────────

const status = document.getElementById('status')!;
status.textContent = 'Fetching data.json (2.07 MB)...';

fetch('./data.json')
  .then(r => r.json())
  .then((packed: number[]) => {
    status.textContent = 'Rendering...';
    const { data, prepMs } = prepData(packed);
    console.log('prep:', prepMs.toFixed(1), 'ms');

    const heapBefore = getHeapMB();

    const opts: uPlot.Options = {
      title: 'Server Events',
      width: 1920,
      height: 600,
      series: [
        {},
        {
          label: 'CPU',
          scale: '%',
          value: (_u: uPlot, v: number | null) => v == null ? '--' : v.toFixed(1) + '%',
          stroke: 'red',
          width: 1 / devicePixelRatio,
        },
        {
          label: 'RAM',
          scale: '%',
          value: (_u: uPlot, v: number | null) => v == null ? '--' : v.toFixed(1) + '%',
          stroke: 'blue',
          width: 1 / devicePixelRatio,
        },
        {
          label: 'TCP Out',
          scale: 'mb',
          value: (_u: uPlot, v: number | null) => v == null ? '--' : v.toFixed(2) + ' MB',
          stroke: 'green',
          width: 1 / devicePixelRatio,
        },
      ],
      axes: [
        {},
        {
          scale: '%',
          values: (_u: uPlot, vals: number[]) => vals.map(v => +v.toFixed(1) + '%'),
        },
        {
          side: 1,
          scale: 'mb',
          size: 60,
          values: (_u: uPlot, vals: number[]) => vals.map(v => +v.toFixed(2) + ' MB'),
          grid: { show: false },
        },
      ],
    };

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
              name: 'uPlot + React wrapper',
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
  });
