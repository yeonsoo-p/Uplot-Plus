import React from 'react';
import { useDrawHook } from '../hooks/useDrawHook';
import { useStore } from '../hooks/useChart';
import { drawRangeBox } from '../rendering/drawRangeBox';
import { Series } from './Series';

export interface CandlestickProps {
  /** Data group containing OHLC series (default: 0) */
  group?: number;
  /** Series indices within the group: [open, high, low, close] (default: [0, 1, 2, 3]) */
  series?: [number, number, number, number];
  /** Y scale to use (default: 'y') */
  yScale?: string;
  /** Color for up candles — close >= open (default: '#26a69a') */
  upColor?: string;
  /** Color for down candles — close < open (default: '#ef5350') */
  downColor?: string;
  /** Body width as fraction of available space (default: 0.6) */
  bodyWidth?: number;
  /** Wick width in CSS pixels (default: 1) */
  wickWidth?: number;
  /** When true, helper OHLC series appear in legend and are toggleable (default: false) */
  exposeUnderlyingSeries?: boolean;
}

export function Candlestick({
  group = 0,
  series: seriesIndices = [0, 1, 2, 3],
  yScale: yScaleId = 'y',
  upColor: upColorProp,
  downColor: downColorProp,
  bodyWidth = 0.6,
  wickWidth = 1,
  exposeUnderlyingSeries = false,
}: CandlestickProps): React.ReactElement {
  const store = useStore();
  const upColor = upColorProp ?? store.theme.candlestickUp;
  const downColor = downColorProp ?? store.theme.candlestickDown;

  useDrawHook(({ ctx, plotBox, valToX, valToY }) => {
    const dataGroup = store.dataStore.data[group];
    if (dataGroup == null) return;

    const xArr = dataGroup.x;
    const openArr = dataGroup.series[seriesIndices[0]];
    const highArr = dataGroup.series[seriesIndices[1]];
    const lowArr = dataGroup.series[seriesIndices[2]];
    const closeArr = dataGroup.series[seriesIndices[3]];
    if (openArr == null || highArr == null || lowArr == null || closeArr == null) return;

    const n = xArr.length;
    if (n === 0) return;

    const candleW = Math.max(2, (plotBox.width / n) * bodyWidth);

    for (let i = 0; i < n; i++) {
      const xv = xArr[i];
      const o = openArr[i];
      const h = highArr[i];
      const l = lowArr[i];
      const c = closeArr[i];
      if (xv == null || o == null || h == null || l == null || c == null) continue;

      const cx = valToX(xv);
      const hPx = valToY(h, yScaleId);
      const lPx = valToY(l, yScaleId);
      const oPx = valToY(o, yScaleId);
      const cPx = valToY(c, yScaleId);
      if (cx == null || hPx == null || lPx == null || oPx == null || cPx == null) continue;

      const isUp = c >= o;
      const color = isUp ? upColor : downColor;

      drawRangeBox(ctx, cx, hPx, lPx, oPx, cPx, candleW, null, {
        wickColor: color,
        wickWidth,
        bodyFill: color,
      });
    }
  });

  // Auto-register hidden series so users don't need to declare them manually.
  // Internal helpers are hidden from legend/tooltip and yield to explicit user <Series>.
  return (
    <>
      {seriesIndices.map(idx => (
        <Series key={idx} group={group} index={idx} yScaleId={yScaleId} show={false}
          _internal={!exposeUnderlyingSeries} />
      ))}
    </>
  );
}
