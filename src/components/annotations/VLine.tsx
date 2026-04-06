import { drawVLine } from '../../annotations';
import { useAnnotationDraw } from './useAnnotationDraw';
import { useStore } from '../../hooks/useChart';

export interface VLineProps {
  /** X data value where the line is drawn */
  value: number;
  /** Scale id for the x-axis (default: 'x') */
  xScale?: string;
  /** Line color (default: 'red') */
  stroke?: string;
  /** Line width in CSS pixels (default: 1) */
  width?: number;
  /** Dash pattern */
  dash?: number[];
  /** Optional text label drawn at the top */
  label?: string;
  /** Font for the label */
  labelFont?: string;
}

/**
 * Declarative vertical line annotation.
 * Renders a vertical line at an x-data-value. Place inside `<Chart>`.
 */
export function VLine(props: VLineProps): null {
  const store = useStore();
  useAnnotationDraw(props, props.xScale ?? 'x', (dc, scale, p) => {
    const t = store.theme;
    drawVLine(dc, scale, p.value, {
      stroke: p.stroke ?? t.annotationStroke,
      width: p.width,
      dash: p.dash,
    });

    if (p.label != null) {
      const x = dc.valToX(p.value, p.xScale ?? 'x');
      if (x == null) return;
      const { ctx, plotBox } = dc;
      ctx.font = p.labelFont ?? t.annotationFont;
      ctx.fillStyle = p.stroke ?? t.annotationStroke;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(p.label, x, plotBox.top - 4);
    }
  });

  return null;
}
