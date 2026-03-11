import { prepLargeDataFlat } from './large-data';
import { markStart, markEnd, getHeapMB, displayResults, postResults } from './metrics';
import type { BenchResult } from './metrics';

declare const uPlot: {
  new (opts: unknown, data: unknown, target: HTMLElement): { setData: (d: unknown) => void };
};

const status = document.getElementById('status')!;

function makeOpts(numSeries: number): unknown {
  const series: unknown[] = [{}];
  const colors = ['red', 'blue', 'green', 'orange', 'purple', 'cyan', 'magenta', 'yellow'];
  for (let i = 0; i < numSeries; i++) {
    series.push({
      label: `S${i + 1}`,
      width: 1 / devicePixelRatio,
      stroke: colors[i % colors.length],
    });
  }
  return {
    width: 1920,
    height: 400,
    scales: { x: { time: false } },
    series,
  };
}

function runBench(label: string, numPoints: number, numSeries: number, shift: number): void {
  status.textContent = `Preparing ${label}...`;

  markStart('prep');
  const data = prepLargeDataFlat(numPoints, numSeries, shift);
  const prepMs = markEnd('prep');
  console.log(`${label} prep:`, prepMs.toFixed(1), 'ms');

  status.textContent = `Rendering ${label}...`;
  const heapBefore = getHeapMB();

  markStart('chart');
  const chart = new uPlot(makeOpts(numSeries), data, document.body);
  Promise.resolve().then(() => {
    const chartMs = markEnd('chart');
    const heapAfter = getHeapMB();
    console.log(`${label} chart:`, chartMs.toFixed(1), 'ms');

    // Measure redraw
    setTimeout(() => {
      markStart('redraw');
      chart.setData(data);
      queueMicrotask(() => {
        const redrawMs = markEnd('redraw');
        console.log(`${label} redraw:`, redrawMs.toFixed(1), 'ms');

        status.textContent = 'Done!';
        const result: BenchResult = {
          name: `uPlot (original) — ${label}`,
          prepMs,
          chartMs,
          heapPeakMB: heapBefore,
          heapFinalMB: heapAfter,
        };

        displayResults(document.getElementById('results')!, result);
        postResults(result);
      });
    }, 500);
  });
}

// 2M points × 1 series
runBench('2M×1', 2_000_000, 1, 0);
