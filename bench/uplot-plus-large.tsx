import React, { useRef, useCallback, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Chart, Scale, Series, Axis } from '@/index';
import type { ChartData } from '@/index';
import { prepLargeDataGrouped } from './large-data';
import { markStart, markEnd, getHeapMB, displayResults, postResults } from './metrics';
import type { BenchResult } from './metrics';

const NUM_POINTS = 2_000_000;
const NUM_SERIES = 1;

function BenchChart({ data, onFirstDraw }: { data: ChartData; onFirstDraw: () => void }) {
  const drawnRef = useRef(false);

  const handleDraw = useCallback(() => {
    if (!drawnRef.current) {
      drawnRef.current = true;
      performance.mark('canvas-end');
      onFirstDraw();
    }
  }, [onFirstDraw]);

  const colors = ['red', 'blue', 'green', 'orange', 'purple', 'cyan', 'magenta', 'yellow'];
  const seriesElements = [];
  for (let i = 0; i < NUM_SERIES; i++) {
    seriesElements.push(
      <Series key={i} group={0} index={i} yScale="y"
              stroke={colors[i % colors.length]!}
              width={1 / devicePixelRatio}
              label={`S${i + 1}`} />
    );
  }

  return (
    <Chart width={1920} height={400} data={data} onDraw={handleDraw}>
      <Scale id="x" auto time={false} />
      <Scale id="y" auto />
      <Axis scale="x" />
      <Axis scale="y" />
      {seriesElements}
    </Chart>
  );
}

function App() {
  const [phase, setPhase] = useState<'prep' | 'render' | 'redraw' | 'done'>('prep');

  const status = document.getElementById('status')!;
  status.textContent = 'Preparing 2M×1...';

  markStart('prep');
  const data = prepLargeDataGrouped(NUM_POINTS, NUM_SERIES, 0);
  const prepMs = markEnd('prep');
  console.log('prep:', prepMs.toFixed(1), 'ms');

  const heapBefore = getHeapMB();

  if (phase === 'prep') {
    setTimeout(() => setPhase('render'), 0);
    return null;
  }

  markStart('total');
  performance.mark('canvas-start');

  const onFirstDraw = () => {
    const canvasMs = performance.measure('canvas', 'canvas-start', 'canvas-end').duration;

    queueMicrotask(() => {
      const totalMs = markEnd('total');
      const heapAfter = getHeapMB();

      document.getElementById('status')!.textContent = 'Done!';
      console.log('chart (total):', totalMs.toFixed(1), 'ms');
      console.log('chart (canvas only):', canvasMs.toFixed(1), 'ms');

      const result: BenchResult = {
        name: 'uPlot+ — 2M×1',
        prepMs,
        chartMs: totalMs,
        canvasMs,
        heapPeakMB: heapBefore,
        heapFinalMB: heapAfter,
      };

      displayResults(document.getElementById('results')!, result);
      postResults(result);
    });
  };

  status.textContent = 'Rendering 2M×1...';

  return <BenchChart data={data} onFirstDraw={onFirstDraw} />;
}

const root = createRoot(document.getElementById('chart-root')!);
root.render(<App />);
