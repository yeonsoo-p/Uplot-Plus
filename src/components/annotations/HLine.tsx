import { useDrawHook } from '../../hooks/useDrawHook';
import { drawHLine } from '../../annotations';
import { useLayoutEffect, useRef } from 'react';

export interface HLineProps {
  /** Y data value where the line is drawn */
  value: number;
  /** Scale id for the y-axis (default: 'y') */
  yScale?: string;
  /** Line color (default: 'red') */
  stroke?: string;
  /** Line width in CSS pixels (default: 1) */
  width?: number;
  /** Dash pattern */
  dash?: number[];
  /** Optional text label drawn at the left edge */
  label?: string;
  /** Font for the label */
  labelFont?: string;
}

/**
 * Declarative horizontal line annotation.
 * Renders a horizontal line at a y-data-value. Place inside `<Chart>`.
 */
export function HLine(props: HLineProps): null {
  const propsRef = useRef(props);
  useLayoutEffect(() => { propsRef.current = props; });

  useDrawHook((dc) => {
    const p = propsRef.current;
    const scaleId = p.yScale ?? 'y';
    const scale = dc.getScale(scaleId);
    if (scale == null) return;

    drawHLine(dc, scale, p.value, {
      stroke: p.stroke,
      width: p.width,
      dash: p.dash,
    });

    if (p.label != null) {
      const y = dc.valToY(p.value, scaleId);
      if (y == null) return;
      const { ctx, plotBox } = dc;
      ctx.font = p.labelFont ?? '11px sans-serif';
      ctx.fillStyle = p.stroke ?? 'red';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(p.label, plotBox.left + 4, y - 4);
    }
  });

  return null;
}
