import React, { useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { Chart, Scale, Series, Axis } from '@/index';
import type { ChartData } from '@/index';
import { markStart, markEnd, getHeapMB, displayResults, postResults } from './metrics';
import type { BenchResult } from './metrics';

// ── Data prep ───────────────────────────────────────────────────────

function round2(val: number): number {
  return Math.round(val * 100) / 100;
}

function round3(val: number): number {
  return Math.round(val * 1000) / 1000;
}

function prepData(packed: number[]): ChartData {
  markStart('prep');

  const numFields = packed[0]!;
  packed = packed.slice(numFields + 1);

  const len = packed.length / numFields;
  const xValues = new Array<number>(len);
  const cpuValues = new Array<number>(len);
  const ramValues = new Array<number>(len);
  const tcpValues = new Array<number>(len);

  for (let i = 0, j = 0; i < packed.length; i += numFields, j++) {
    xValues[j] = packed[i]! * 60;
    cpuValues[j] = round3(100 - packed[i + 1]!);
    ramValues[j] = round2(100 * packed[i + 5]! / (packed[i + 5]! + packed[i + 6]!));
    tcpValues[j] = packed[i + 3]!;
  }

  markEnd('prep');

  return [{ x: xValues, series: [cpuValues, ramValues, tcpValues] }];
}

// ── Bench chart component ───────────────────────────────────────────

function BenchChart({ data, onFirstDraw }: { data: ChartData; onFirstDraw: () => void }) {
  const drawnRef = useRef(false);

  const handleDraw = useCallback(() => {
    if (!drawnRef.current) {
      drawnRef.current = true;
      performance.mark('canvas-end');
      onFirstDraw();
    }
  }, [onFirstDraw]);

  return (
    <Chart width={1920} height={600} data={data} onDraw={handleDraw}>
      <Scale id="x" auto />
      <Scale id="%" auto />
      <Scale id="mb" auto />
      <Axis scale="x" />
      <Axis scale="%" values={(vals: number[]) => vals.map(v => +v.toFixed(1) + '%')} />
      <Axis
        scale="mb"
        side={1 /* Side.Right */}
        size={60}
        values={(vals: number[]) => vals.map(v => +v.toFixed(2) + ' MB')}
        grid={{ show: false }}
      />
      <Series group={0} index={0} yScale="%" stroke="red"
              width={1 / devicePixelRatio} label="CPU" />
      <Series group={0} index={1} yScale="%" stroke="blue"
              width={1 / devicePixelRatio} label="RAM" />
      <Series group={0} index={2} yScale="mb" stroke="green"
              width={1 / devicePixelRatio} label="TCP Out" />
    </Chart>
  );
}

// ── Main ────────────────────────────────────────────────────────────

const status = document.getElementById('status')!;
status.textContent = 'Fetching data.json (2.07 MB)...';

fetch('./data.json')
  .then(r => r.json())
  .then((packed: number[]) => {
    status.textContent = 'Rendering...';
    const data = prepData(packed);

    const prepMeasure = performance.getEntriesByName('prep', 'measure')[0];
    const prepMs = prepMeasure ? prepMeasure.duration : 0;
    console.log('prep:', prepMs.toFixed(1), 'ms');

    const heapBefore = getHeapMB();

    // Start timing
    markStart('total');
    performance.mark('canvas-start');

    const root = createRoot(document.getElementById('chart-root')!);

    const onFirstDraw = () => {
      const canvasMs = performance.measure('canvas', 'canvas-start', 'canvas-end').duration;

      // Use queueMicrotask to capture total time including React commit
      queueMicrotask(() => {
        const totalMs = markEnd('total');
        const heapAfter = getHeapMB();

        status.textContent = 'Done!';

        const result: BenchResult = {
          name: 'uPlot+',
          prepMs,
          chartMs: totalMs,
          canvasMs,
          heapPeakMB: heapBefore,
          heapFinalMB: heapAfter,
        };

        console.log('chart (total):', totalMs.toFixed(1), 'ms');
        console.log('chart (canvas only):', canvasMs.toFixed(1), 'ms');

        displayResults(document.getElementById('results')!, result);
        postResults(result);
      });
    };

    root.render(<BenchChart data={data} onFirstDraw={onFirstDraw} />);
  });
