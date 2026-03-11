import { markStart, markEnd, getHeapMB, displayResults, postResults } from './metrics';
import type { BenchResult } from './metrics';

declare const uPlot: {
  new (opts: unknown, data: unknown, target: HTMLElement): unknown;
};

function round2(val: number): number {
  return Math.round(val * 100) / 100;
}

function round3(val: number): number {
  return Math.round(val * 1000) / 1000;
}

function prepData(packed: number[]): { data: number[][]; prepMs: number } {
  markStart('prep');

  // epoch,idl,recv,send,read,writ,used,free
  const numFields = packed[0]!;
  packed = packed.slice(numFields + 1);

  // 55,550 data points × 3 series = 166,650
  const len = packed.length / numFields;
  const data: number[][] = [
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

function makeChart(data: number[][], prepMs: number): void {
  const heapBefore = getHeapMB();

  markStart('chart');

  const opts = {
    title: 'Server Events',
    width: 1920,
    height: 600,
    series: [
      {},
      {
        label: 'CPU',
        scale: '%',
        value: (_u: unknown, v: number | null) => v == null ? null : v.toFixed(1) + '%',
        stroke: 'red',
        width: 1 / devicePixelRatio,
      },
      {
        label: 'RAM',
        scale: '%',
        value: (_u: unknown, v: number | null) => v == null ? null : v.toFixed(1) + '%',
        stroke: 'blue',
        width: 1 / devicePixelRatio,
      },
      {
        label: 'TCP Out',
        scale: 'mb',
        value: (_u: unknown, v: number | null) => v == null ? null : v.toFixed(2) + ' MB',
        stroke: 'green',
        width: 1 / devicePixelRatio,
      },
    ],
    axes: [
      {},
      {
        scale: '%',
        values: (_u: unknown, vals: number[]) => vals.map(v => +v.toFixed(1) + '%'),
      },
      {
        side: 1,
        scale: 'mb',
        size: 60,
        values: (_u: unknown, vals: number[]) => vals.map(v => +v.toFixed(2) + ' MB'),
        grid: { show: false },
      },
    ],
  };

  new uPlot(opts, data, document.body);

  Promise.resolve().then(() => {
    const chartMs = markEnd('chart');
    const heapAfter = getHeapMB();

    document.getElementById('status')!.textContent = 'Done!';
    console.log('prep:', prepMs.toFixed(1), 'ms');
    console.log('chart:', chartMs.toFixed(1), 'ms');

    const result: BenchResult = {
      name: 'uPlot (original)',
      prepMs,
      chartMs,
      heapPeakMB: heapBefore,
      heapFinalMB: heapAfter,
    };

    displayResults(document.getElementById('results')!, result);
    postResults(result);
  });
}

const status = document.getElementById('status')!;
status.textContent = 'Fetching data.json (2.07 MB)...';

fetch('./data.json')
  .then(r => r.json())
  .then((packed: number[]) => {
    status.textContent = 'Rendering...';
    const { data, prepMs } = prepData(packed);
    setTimeout(() => makeChart(data, prepMs), 0);
  });
