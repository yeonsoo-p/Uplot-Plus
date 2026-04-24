import React from 'react';
import { Chart } from './Chart';
import { Series } from './Series';
import { Axis } from './Axis';
import { useStore } from '../hooks/useChart';
import type { DataInput, ColorValue } from '../types';
import type { PathBuilder } from '../paths/types';

export interface SparklineProps {
  /** Chart data — accepts {x,y}, [{x,y}], or [{x, series:[...]}] */
  data: DataInput;
  /** Width in CSS pixels (default: 150) */
  width?: number;
  /** Height in CSS pixels (default: 30) */
  height?: number;
  /** Line/bar color (default: from theme sparklineStroke) */
  stroke?: ColorValue;
  /** Fill color */
  fill?: ColorValue;
  /** Stroke width in CSS pixels (default: 1) */
  strokeWidth?: number;
  /** Path builder — pass bars() for bar sparklines (default: linear) */
  paths?: PathBuilder;
  /** Fill target value (e.g. 0 for bars) */
  fillTo?: number;
  /** CSS class name for the wrapper div */
  className?: string;
}

/** Inner series that resolves stroke from theme when not provided by props. */
function SparklineSeries({
  stroke,
  fill,
  strokeWidth,
  paths,
  fillTo,
}: {
  stroke?: ColorValue;
  fill?: ColorValue;
  strokeWidth: number;
  paths?: PathBuilder;
  fillTo?: number;
}) {
  const store = useStore();
  return (
    <Series
      group={0}
      index={0}
      yScaleId="y"
      stroke={stroke ?? store.theme.sparklineStroke}
      fill={fill}
      strokeWidth={strokeWidth}
      paths={paths}
      fillTo={fillTo}
    />
  );
}

/**
 * Compact inline chart with no axes or interaction.
 * Ideal for sparklines in tables and dashboards.
 */
export function Sparkline({
  data,
  width = 150,
  height = 30,
  stroke,
  fill,
  strokeWidth = 1,
  paths,
  fillTo,
  className,
}: SparklineProps): React.JSX.Element {
  return (
    <div style={{ pointerEvents: 'none' }} className={className}>
      <Chart width={width} height={height} data={data}>
        <Axis scaleId="x" show={false} />
        <Axis scaleId="y" show={false} />
        <SparklineSeries
          stroke={stroke}
          fill={fill}
          strokeWidth={strokeWidth}
          paths={paths}
          fillTo={fillTo}
        />
      </Chart>
    </div>
  );
}
