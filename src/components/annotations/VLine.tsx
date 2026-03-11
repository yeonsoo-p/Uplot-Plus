import { useDrawHook } from '../../hooks/useDrawHook';
import { drawVLine } from '../../annotations';
import { useLayoutEffect, useRef } from 'react';

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
  const propsRef = useRef(props);
  useLayoutEffect(() => { propsRef.current = props; });

  useDrawHook((dc) => {
    const p = propsRef.current;
    const scaleId = p.xScale ?? 'x';
    const scale = dc.getScale(scaleId);
    if (scale == null) return;

    drawVLine(dc, scale, p.value, {
      stroke: p.stroke,
      width: p.width,
      dash: p.dash,
    });

    if (p.label != null) {
      const x = dc.valToX(p.value, scaleId);
      if (x == null) return;
      const { ctx, plotBox } = dc;
      ctx.font = p.labelFont ?? '11px sans-serif';
      ctx.fillStyle = p.stroke ?? 'red';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(p.label, x, plotBox.top - 4);
    }
  });

  return null;
}
