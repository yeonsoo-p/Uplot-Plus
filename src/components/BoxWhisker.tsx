import { useDrawHook } from '../hooks/useDrawHook';
import { drawRangeBox } from '../rendering/drawRangeBox';

export interface BoxWhiskerProps {
  /** Array of box data — one per category. */
  boxes: Array<{ min: number; q1: number; median: number; q3: number; max: number }>;
  /** Y scale to use (default: 'y') */
  yScale?: string;
  /** Box width as fraction of category spacing (default: 0.5) */
  boxWidth?: number;
  /** Box fill color (default: 'rgba(52, 152, 219, 0.4)') */
  fill?: string;
  /** Box stroke color (default: '#2980b9') */
  stroke?: string;
  /** Median line color (default: '#e74c3c') */
  medianColor?: string;
  /** Whisker color (default: '#555') */
  whiskerColor?: string;
}

export function BoxWhisker({
  boxes,
  yScale: yScaleId = 'y',
  boxWidth = 0.5,
  fill = 'rgba(52, 152, 219, 0.4)',
  stroke = '#2980b9',
  medianColor = '#e74c3c',
  whiskerColor = '#555',
}: BoxWhiskerProps): null {
  useDrawHook(({ ctx, plotBox, valToX, valToY }) => {
    const w = (plotBox.width / boxes.length) * boxWidth;
    const capW = w * 0.3;

    for (let i = 0; i < boxes.length; i++) {
      const b = boxes[i];
      if (b == null) continue;

      const cx = valToX(i + 1);
      const minPx = valToY(b.min, yScaleId);
      const q1Px = valToY(b.q1, yScaleId);
      const medPx = valToY(b.median, yScaleId);
      const q3Px = valToY(b.q3, yScaleId);
      const maxPx = valToY(b.max, yScaleId);
      if (cx == null || minPx == null || q1Px == null || medPx == null || q3Px == null || maxPx == null) continue;

      drawRangeBox(ctx, cx, minPx, maxPx, q1Px, q3Px, w, medPx, {
        wickColor: whiskerColor,
        bodyFill: fill,
        bodyStroke: stroke,
        capWidth: capW,
        midColor: medianColor,
      });
    }
  });

  return null;
}
