import { useDrawHook } from '../../hooks/useDrawHook';
import { useLayoutEffect, useRef } from 'react';

export interface AnnotationLabelProps {
  /** X data value */
  x: number;
  /** Y data value */
  y: number;
  /** Label text */
  text: string;
  /** Scale id for the x-axis (default: 'x') */
  xScale?: string;
  /** Scale id for the y-axis (default: 'y') */
  yScale?: string;
  /** Text color (default: '#000') */
  fill?: string;
  /** Font (default: '12px sans-serif') */
  font?: string;
  /** Text alignment (default: 'left') */
  align?: CanvasTextAlign;
  /** Text baseline (default: 'bottom') */
  baseline?: CanvasTextBaseline;
}

/**
 * Declarative text label annotation at data coordinates.
 * Place inside `<Chart>`.
 */
export function AnnotationLabel(props: AnnotationLabelProps): null {
  const propsRef = useRef(props);
  useLayoutEffect(() => { propsRef.current = props; });

  useDrawHook((dc) => {
    const p = propsRef.current;
    const px = dc.valToX(p.x, p.xScale ?? 'x');
    const py = dc.valToY(p.y, p.yScale ?? 'y');
    if (px == null || py == null) return;

    const { ctx } = dc;
    ctx.font = p.font ?? '12px sans-serif';
    ctx.fillStyle = p.fill ?? '#000';
    ctx.textAlign = p.align ?? 'left';
    ctx.textBaseline = p.baseline ?? 'bottom';
    ctx.fillText(p.text, px, py - 4);
  });

  return null;
}
