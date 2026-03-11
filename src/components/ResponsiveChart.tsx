import { useState, useRef, useEffect, useCallback } from 'react';
import { Chart } from './Chart';
import type { ChartProps } from '../types/chart';

export interface ResponsiveChartProps extends Omit<ChartProps, 'width' | 'height'> {
  /** Minimum width in CSS pixels (default: 100) */
  minWidth?: number;
  /** Minimum height in CSS pixels (default: 100) */
  minHeight?: number;
  /** If set, height = width / aspectRatio */
  aspectRatio?: number;
  /** Initial height when container height is auto (default: 300) */
  initialHeight?: number;
}

/**
 * Chart wrapper that auto-sizes to its container via ResizeObserver.
 * The container div takes 100% width; height is either derived from
 * container, aspectRatio, or initialHeight.
 */
export function ResponsiveChart({
  minWidth = 100,
  minHeight = 100,
  aspectRatio,
  initialHeight = 300,
  ...chartProps
}: ResponsiveChartProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  const computeSize = useCallback(
    (entry: { width: number; height: number }) => {
      const w = Math.max(entry.width, minWidth);
      let h: number;
      if (aspectRatio != null) {
        h = Math.max(w / aspectRatio, minHeight);
      } else {
        h = Math.max(entry.height || initialHeight, minHeight);
      }
      return { width: Math.round(w), height: Math.round(h) };
    },
    [minWidth, minHeight, aspectRatio, initialHeight],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (el == null) return;

    // Initial measurement
    const rect = el.getBoundingClientRect();
    setSize(computeSize({ width: rect.width, height: rect.height }));

    if (typeof ResizeObserver === 'undefined') return;

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry == null) return;
      const { width, height } = entry.contentRect;
      setSize(computeSize({ width, height }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [computeSize]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: aspectRatio != null ? 'auto' : '100%',
      }}
    >
      {size != null && (
        <Chart {...chartProps} width={size.width} height={size.height} />
      )}
    </div>
  );
}
