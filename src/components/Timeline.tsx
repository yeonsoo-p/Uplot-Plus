import { useDrawHook } from '../hooks/useDrawHook';
import { useStore } from '../hooks/useChart';
import { valToPos, isScaleReady } from '../core/Scale';
import type { TimelineProps } from '../types/timeline';

/**
 * Timeline component — renders discrete event spans as horizontal colored bars.
 * Each lane is a category, each segment is a time range with optional color/label.
 * Uses useDrawHook to draw on the persistent canvas layer.
 */
export function Timeline({
  lanes,
  laneHeight = 24,
  gap = 2,
  scaleId = 'x',
}: TimelineProps): null {
  const store = useStore();

  useDrawHook(({ ctx, plotBox, pxRatio }) => {
    const scale = store.scaleManager.getScale(scaleId);
    if (scale == null || !isScaleReady(scale)) return;

    ctx.save();

    const totalLaneH = (laneHeight + gap) * pxRatio;
    const barH = laneHeight * pxRatio;
    // Start lanes from the top of the plot area
    const baseY = plotBox.top * pxRatio;

    // Draw lane labels (unclipped — visible in axis gutter)
    ctx.fillStyle = '#666';
    ctx.font = `${11 * pxRatio}px sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let li = 0; li < lanes.length; li++) {
      const lane = lanes[li];
      if (lane == null) continue;
      const laneY = baseY + li * totalLaneH;
      ctx.fillText(lane.label, (plotBox.left - 6) * pxRatio, laneY + barH / 2);
    }

    // Clip to plot area for segments
    ctx.beginPath();
    ctx.rect(
      plotBox.left * pxRatio,
      plotBox.top * pxRatio,
      plotBox.width * pxRatio,
      plotBox.height * pxRatio,
    );
    ctx.clip();

    for (let li = 0; li < lanes.length; li++) {
      const lane = lanes[li];
      if (lane == null) continue;

      const laneY = baseY + li * totalLaneH;

      for (const seg of lane.segments) {
        const x0 = valToPos(seg.start, scale, plotBox.width, plotBox.left) * pxRatio;
        const x1 = valToPos(seg.end, scale, plotBox.width, plotBox.left) * pxRatio;
        const segW = x1 - x0;

        if (segW <= 0) continue;

        // Fill segment
        ctx.fillStyle = seg.color ?? '#4dabf7';
        ctx.fillRect(x0, laneY, segW, barH);

        // Draw segment label if it fits
        if (seg.label != null && segW > 20 * pxRatio) {
          ctx.fillStyle = '#fff';
          ctx.font = `${10 * pxRatio}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(seg.label, x0 + segW / 2, laneY + barH / 2, segW - 4 * pxRatio);
        }
      }
    }

    ctx.restore();
  }, { clipped: false });

  return null;
}
