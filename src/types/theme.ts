/** User-facing theme interface. All fields optional — defaults apply for missing values. */
export interface ChartTheme {
  // --- Axes & Grid ---
  axisStroke?: string;
  gridStroke?: string;
  titleFill?: string;
  tickFont?: string;
  labelFont?: string;
  titleFont?: string;

  // --- Bands ---
  bandFill?: string;

  // --- Cursor ---
  cursor?: {
    stroke?: string;
    strokeWidth?: number;
    dash?: number[];
    pointRadius?: number;
    pointFill?: string;
  };

  // --- Selection ---
  select?: {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
  };

  // --- Series palette ---
  seriesColors?: string[];

  // --- Specialized components ---
  candlestick?: { upColor?: string; downColor?: string };
  boxWhisker?: { fill?: string; stroke?: string; medianColor?: string; whiskerColor?: string };
  vector?: { color?: string };
  sparkline?: { stroke?: string };
  timeline?: { labelColor?: string; segmentColor?: string; segmentTextColor?: string };
  annotation?: { stroke?: string; fill?: string; font?: string; labelFill?: string };

  // --- Overlay panels (Legend, Tooltip, FloatingLegend, HoverLabel, SeriesPanel) ---
  overlay?: {
    fontFamily?: string;
    fontSize?: number;
    panelBg?: string;
    panelBorder?: string;
    panelShadow?: string;
    hiddenOpacity?: number;
    zIndex?: number;
    tooltipZIndex?: number;
  };

  // --- ZoomRanger ---
  ranger?: { accent?: string; dim?: string };
}
