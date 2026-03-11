import { useState, useRef, useCallback, useEffect } from 'react';
import type { ChartData } from '../types';

export interface StreamingOptions {
  /** Maximum number of data points to retain (sliding window size) */
  window: number;
  /** Number of points to push per tick (default: 1) */
  batchSize?: number;
  /** Start streaming immediately on mount (default: true) */
  autoStart?: boolean;
}

export interface StreamingResult {
  /** Current chart data (pass to <Chart data={...}>) */
  data: ChartData;
  /**
   * Push new data points. Oldest points beyond the window are dropped.
   * @param x - new x values
   * @param ySeries - one array of new y values per series
   */
  push: (x: number[], ...ySeries: number[][]) => void;
  /** Start the rAF loop (calls the onTick callback each frame) */
  start: () => void;
  /** Stop the rAF loop */
  stop: () => void;
  /** Whether the rAF loop is running */
  running: boolean;
  /** Frames per second (smoothed) */
  fps: number;
}

/**
 * Hook for streaming/real-time chart data with a sliding window.
 *
 * Manages a requestAnimationFrame loop and FPS counter.
 * Call `push()` from your own tick callback, or use it standalone.
 */
export function useStreamingData(
  initialData: ChartData,
  options: StreamingOptions,
): StreamingResult {
  const { window: windowSize, batchSize = 1 } = options;
  const autoStart = options.autoStart ?? true;

  const [data, setData] = useState<ChartData>(initialData);
  const [running, setRunning] = useState(false);
  const [fps, setFps] = useState(0);

  const rafRef = useRef(0);
  const fpsFrames = useRef(0);
  const fpsLast = useRef(0);

  const push = useCallback(
    (x: number[], ...ySeries: number[][]) => {
      setData(prev => {
        const group = prev[0];
        if (group == null) return prev;

        const prevX = group.x as number[];
        const drop = Math.max(0, prevX.length + x.length - windowSize);
        const newX = drop > 0 ? prevX.slice(drop).concat(x) : prevX.concat(x);

        const newSeries = group.series.map((s, i) => {
          const arr = s as number[];
          const yNew = ySeries[i] ?? [];
          return drop > 0 ? arr.slice(drop).concat(yNew) : arr.concat(yNew);
        });

        return [{ x: newX, series: newSeries }];
      });
    },
    [windowSize],
  );

  const start = useCallback(() => {
    setRunning(true);
  }, []);

  const stop = useCallback(() => {
    setRunning(false);
  }, []);

  // FPS tracking + rAF loop
  useEffect(() => {
    if (!running) {
      if (rafRef.current !== 0) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
      return;
    }

    fpsLast.current = performance.now();
    fpsFrames.current = 0;

    const loop = (now: number) => {
      fpsFrames.current++;
      const elapsed = now - fpsLast.current;
      if (elapsed >= 1000) {
        setFps(Math.round((fpsFrames.current * 1000) / elapsed));
        fpsFrames.current = 0;
        fpsLast.current = now;
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== 0) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, [running]);

  // Auto-start on mount
  useEffect(() => {
    if (autoStart) setRunning(true);
  }, [autoStart]);

  // Expose batchSize for external tick callbacks
  // (consumers use push() in their own rAF or interval)
  void batchSize;

  return { data, push, start, stop, running, fps };
}
