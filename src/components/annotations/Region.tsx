import { useDrawHook } from '../../hooks/useDrawHook';
import { drawRegion } from '../../annotations';
import { useLayoutEffect, useRef } from 'react';

export interface RegionProps {
  /** Lower y data value */
  yMin: number;
  /** Upper y data value */
  yMax: number;
  /** Scale id for the y-axis (default: 'y') */
  yScale?: string;
  /** Fill color (default: 'rgba(255,0,0,0.1)') */
  fill?: string;
  /** Border stroke color */
  stroke?: string;
  /** Border stroke width */
  strokeWidth?: number;
  /** Border dash pattern */
  dash?: number[];
}

/**
 * Declarative shaded region annotation.
 * Fills the area between two y-data-values. Place inside `<Chart>`.
 */
export function Region(props: RegionProps): null {
  const propsRef = useRef(props);
  useLayoutEffect(() => { propsRef.current = props; });

  useDrawHook((dc) => {
    const p = propsRef.current;
    const scale = dc.getScale(p.yScale ?? 'y');
    if (scale == null) return;

    drawRegion(dc, scale, p.yMin, p.yMax, {
      fill: p.fill,
      stroke: p.stroke,
      width: p.strokeWidth,
      dash: p.dash,
    });
  });

  return null;
}
