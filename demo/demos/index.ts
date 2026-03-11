import React from 'react';
import BasicLine from './BasicLine';
import AreaFill from './AreaFill';
import MissingData from './MissingData';
import PointStyles from './PointStyles';
import MultipleScales from './MultipleScales';
import AxisControl from './AxisControl';
import LogScales from './LogScales';
import CustomAxisValues from './CustomAxisValues';
import DashPatterns from './DashPatterns';
import Sparklines from './Sparklines';
import MultiXAxis from './MultiXAxis';
import SteppedLines from './SteppedLines';
import SmoothLines from './SmoothLines';
import BarChart from './BarChart';
import HighLowBands from './HighLowBands';
import FillTo from './FillTo';
import AsinhScales from './AsinhScales';
import DependentScales from './DependentScales';
import ScaleDirection from './ScaleDirection';
import SyncCursor from './SyncCursor';
import DrawHooks from './DrawHooks';
import StreamData from './StreamData';
import RealtimeSine from './RealtimeSine';
import SpanGaps from './SpanGaps';
import LargeDataset from './LargeDataset';
import NoData from './NoData';
import GridOverSeries from './GridOverSeries';
import LegendDemo from './LegendDemo';
import TimeSeries from './TimeSeries';
// Phase 1: Interaction
import ZoomWheel from './ZoomWheel';
import FocusCursor from './FocusCursor';
import ZoomTouch from './ZoomTouch';
import YScaleDrag from './YScaleDrag';
// Phase 2: Components
import Tooltips from './Tooltips';
import TooltipsClosest from './TooltipsClosest';
import CursorTooltip from './CursorTooltip';
import ZoomRangerDemo from './ZoomRanger';
import ZoomRangerGrips from './ZoomRangerGrips';
import ZoomRangerXY from './ZoomRangerXY';
import TimelineDiscrete from './TimelineDiscrete';
// Phase 3: Data utilities
import StackedSeries from './StackedSeries';
import BarsGroupedStacked from './BarsGroupedStacked';
import MultiBars from './MultiBars';
import AlignData from './AlignData';
// Phase 4: Rendering
import Gradients from './Gradients';
import Annotations from './Annotations';
// Phase 5: Advanced chart types
import CandlestickOHLC from './CandlestickOHLC';
import Heatmap from './Heatmap';
import BoxWhisker from './BoxWhisker';
import ScatterPlot from './ScatterPlot';
import Trendlines from './Trendlines';
import MeasureDatums from './MeasureDatums';
import DataSmoothing from './DataSmoothing';
import WindDirection from './WindDirection';
import MassSpectrum from './MassSpectrum';
// Phase 6: Remaining demos
import ZoomVariations from './ZoomVariations';
import ZoomFetch from './ZoomFetch';
import AddDelSeries from './AddDelSeries';
import AxisAutosize from './AxisAutosize';
import AxisIndicators from './AxisIndicators';
import CursorBind from './CursorBind';
import CursorSnap from './CursorSnap';
import SoftMinMax from './SoftMinMax';
import NiceScale from './NiceScale';
import PathGapClip from './PathGapClip';
import SparklinesBars from './SparklinesBars';
import ThinBarsStrokeFill from './ThinBarsStrokeFill';
import BarsValuesAutosize from './BarsValuesAutosize';
import MonthsTimeSeries from './MonthsTimeSeries';
import TimezonesDST from './TimezonesDST';
import TimePeriods from './TimePeriods';
import TimeseriesDiscrete from './TimeseriesDiscrete';
import SyncYZero from './SyncYZero';
import YShiftedSeries from './YShiftedSeries';
import ScalePadding from './ScalePadding';
import ResizeDemo from './ResizeDemo';
import ScrollSync from './ScrollSync';
import NearestNonNull from './NearestNonNull';
import UpdateCursorSelectResize from './UpdateCursorSelectResize';
import LinePaths from './LinePaths';
import LogScales2 from './LogScales2';
import CustomScales from './CustomScales';
import SparseData from './SparseData';

export interface DemoEntry {
  id: string;
  title: string;
  description: string;
  category: string;
  component: React.ComponentType;
}

export const demos: DemoEntry[] = [
  // --- Core ---
  { id: 'basic-line', title: 'Basic Line', description: 'Sine and cosine waves. Drag to zoom, double-click to reset.', category: 'Core', component: BasicLine },
  { id: 'area-fill', title: 'Area Fill', description: 'Semi-transparent fill under each series using the fill prop.', category: 'Core', component: AreaFill },
  { id: 'missing-data', title: 'Missing Data', description: 'Null values in data arrays create gaps. Dual y-axes with custom formatters.', category: 'Core', component: MissingData },
  { id: 'point-styles', title: 'Point Styles', description: 'Line-only, line+points, points-only, and custom point colors.', category: 'Core', component: PointStyles },
  { id: 'multiple-scales', title: 'Multiple Scales', description: 'Temperature and humidity on independent y-scales with left/right axes.', category: 'Core', component: MultipleScales },
  { id: 'axis-control', title: 'Axis Control', description: '50,000 points with a fixed y-scale range and axis customization.', category: 'Core', component: AxisControl },
  { id: 'log-scales', title: 'Log Scales', description: 'Logarithmic y-scale (base 10) for exponential growth data.', category: 'Core', component: LogScales },
  { id: 'custom-axis-values', title: 'Custom Axis Values', description: 'Custom formatters: seconds as HH:MM on x-axis, MB/s units on y-axis.', category: 'Core', component: CustomAxisValues },
  { id: 'dash-patterns', title: 'Dash Patterns', description: 'Visual catalog of line dash patterns and cap styles.', category: 'Core', component: DashPatterns },
  { id: 'sparklines', title: 'Sparklines', description: 'Tiny 150x30 charts with hidden axes, embedded in a table.', category: 'Core', component: Sparklines },
  { id: 'multi-x-axis', title: 'Multi X-Axis', description: 'uPlot+ exclusive: two data groups with independent x-ranges on one chart.', category: 'Core', component: MultiXAxis },
  { id: 'stepped-lines', title: 'Stepped Lines', description: 'Staircase paths with step-after, step-before, and mid-step alignment.', category: 'Core', component: SteppedLines },
  { id: 'smooth-lines', title: 'Smooth Lines', description: 'Linear vs monotone cubic vs Catmull-Rom spline interpolation.', category: 'Core', component: SmoothLines },
  { id: 'bar-chart', title: 'Bar Chart', description: 'Bar path builder with multiple series for monthly revenue/cost data.', category: 'Core', component: BarChart },
  { id: 'high-low-bands', title: 'High/Low Bands', description: 'Band component fills the region between upper and lower confidence bounds.', category: 'Core', component: HighLowBands },
  { id: 'fill-to', title: 'Fill To', description: 'fillTo prop: fill to zero, fill to a constant, or fill to scale min/max.', category: 'Core', component: FillTo },
  { id: 'asinh-scales', title: 'Asinh Scales', description: 'Inverse hyperbolic sine scale for data spanning negative-to-positive.', category: 'Core', component: AsinhScales },
  { id: 'dependent-scales', title: 'Dependent Scales', description: 'Fahrenheit left axis with derived Celsius right axis.', category: 'Core', component: DependentScales },
  { id: 'scale-direction', title: 'Scale Direction', description: 'Reversed y-axis (dir=-1) for depth charts where values increase downward.', category: 'Core', component: ScaleDirection },
  { id: 'sync-cursor', title: 'Sync Cursor', description: 'Two charts sharing cursor position via syncKey.', category: 'Core', component: SyncCursor },
  { id: 'draw-hooks', title: 'Draw Hooks', description: 'onDraw for threshold lines/zones, onCursorDraw for crosshair labels.', category: 'Core', component: DrawHooks },
  { id: 'stream-data', title: 'Stream Data', description: '3-series 60fps streaming with 2000-point sliding window and FPS counter.', category: 'Core', component: StreamData },
  { id: 'realtime-sine', title: 'Real-Time Sine', description: '10,000-point scrolling sine waves at 60fps — inspired by webgl-plot-react.', category: 'Core', component: RealtimeSine },
  { id: 'span-gaps', title: 'Span Gaps', description: 'spanGaps connects series across null values instead of breaking the line.', category: 'Core', component: SpanGaps },
  { id: 'large-dataset', title: 'Large Dataset', description: '2,000,000 points rendered with minimal configuration to test performance.', category: 'Core', component: LargeDataset },
  { id: 'no-data', title: 'No Data / Edge Cases', description: 'Single point, two points, and all-null edge cases.', category: 'Core', component: NoData },
  { id: 'grid-over-series', title: 'Grid Over Series', description: 'Default grid-behind vs grid-over-series using onDraw hook.', category: 'Core', component: GridOverSeries },
  { id: 'legend', title: 'Legend', description: 'Legend component at top/bottom with live values and click-to-toggle.', category: 'Core', component: LegendDemo },
  { id: 'time-series', title: 'Time Series', description: 'Unix timestamps with HH:MM formatting — monitoring dashboard pattern.', category: 'Core', component: TimeSeries },

  // --- Interaction ---
  { id: 'zoom-wheel', title: 'Wheel Zoom', description: 'Mouse wheel zoom on x-axis centered at cursor position.', category: 'Interaction', component: ZoomWheel },
  { id: 'focus-cursor', title: 'Focus Cursor', description: 'Proximity-based focus dims non-closest series on hover.', category: 'Interaction', component: FocusCursor },
  { id: 'zoom-touch', title: 'Touch Zoom', description: 'Two-finger pinch to zoom on touch devices.', category: 'Interaction', component: ZoomTouch },
  { id: 'y-scale-drag', title: 'Y-Scale Drag', description: 'Click and drag on y-axis gutters to pan the scale range.', category: 'Interaction', component: YScaleDrag },
  { id: 'zoom-variations', title: 'Zoom Variations', description: 'Drag zoom, wheel zoom, and double-click reset combined.', category: 'Interaction', component: ZoomVariations },
  { id: 'zoom-fetch', title: 'Zoom Fetch', description: 'Zoom triggers simulated data re-fetch with loading indicator.', category: 'Interaction', component: ZoomFetch },
  { id: 'zoom-ranger', title: 'Zoom Ranger', description: 'Overview mini-chart with draggable selection controlling detail chart zoom.', category: 'Interaction', component: ZoomRangerDemo },
  { id: 'zoom-ranger-grips', title: 'Zoom Ranger (Grips)', description: 'Zoom ranger with visible grip handles on selection edges.', category: 'Interaction', component: ZoomRangerGrips },
  { id: 'zoom-ranger-xy', title: 'Zoom Ranger (XY)', description: 'Zoom ranger with dual y-axes and wheel zoom on detail chart.', category: 'Interaction', component: ZoomRangerXY },

  // --- Tooltips ---
  { id: 'tooltips', title: 'Tooltips', description: 'Default tooltip component showing all series values at cursor.', category: 'Tooltips', component: Tooltips },
  { id: 'tooltips-closest', title: 'Tooltips (Closest)', description: 'Custom tooltip showing only the closest series value.', category: 'Tooltips', component: TooltipsClosest },
  { id: 'cursor-tooltip', title: 'Cursor + Tooltip Sync', description: 'Two synced charts each with tooltip following cursor.', category: 'Tooltips', component: CursorTooltip },

  // --- Bars & Stacking ---
  { id: 'stacked-series', title: 'Stacked Series', description: 'Stacked area chart using stackGroup() data transformation.', category: 'Bars & Stacking', component: StackedSeries },
  { id: 'bars-grouped-stacked', title: 'Grouped & Stacked Bars', description: 'Side-by-side grouped bars and stacked bars comparison.', category: 'Bars & Stacking', component: BarsGroupedStacked },
  { id: 'multi-bars', title: 'Multi Bars', description: 'Multiple bar series grouped side-by-side per x-position.', category: 'Bars & Stacking', component: MultiBars },
  { id: 'thin-bars-stroke-fill', title: 'Thin Bars Stroke/Fill', description: 'Bar chart variations: stroke-only, fill-only, stroke+fill.', category: 'Bars & Stacking', component: ThinBarsStrokeFill },
  { id: 'bars-values-autosize', title: 'Bar Value Labels', description: 'Bar chart with value labels drawn above each bar.', category: 'Bars & Stacking', component: BarsValuesAutosize },
  { id: 'sparklines-bars', title: 'Sparklines (Bars)', description: 'Sparkline-sized bar charts embedded in a table.', category: 'Bars & Stacking', component: SparklinesBars },

  // --- Rendering ---
  { id: 'gradients', title: 'Gradients', description: 'Area chart with linear gradient fills from top to bottom.', category: 'Rendering', component: Gradients },
  { id: 'annotations', title: 'Annotations', description: 'Horizontal/vertical lines, shaded regions, and labels on chart.', category: 'Rendering', component: Annotations },
  { id: 'line-paths', title: 'Line Paths', description: 'All path builder types: linear, monotoneCubic, catmullRom, stepped, bars, points.', category: 'Rendering', component: LinePaths },

  // --- Advanced Chart Types ---
  { id: 'candlestick-ohlc', title: 'Candlestick / OHLC', description: 'Financial candlestick chart with green/red candles via onDraw hook.', category: 'Advanced', component: CandlestickOHLC },
  { id: 'heatmap', title: 'Heatmap', description: 'Latency heatmap with color-mapped rectangles via onDraw hook.', category: 'Advanced', component: Heatmap },
  { id: 'box-whisker', title: 'Box & Whisker', description: 'Box and whisker plot with Q1-Q3 boxes and min-max whiskers.', category: 'Advanced', component: BoxWhisker },
  { id: 'scatter-plot', title: 'Scatter Plot', description: 'Scatter plot with point-only series and wheel zoom.', category: 'Advanced', component: ScatterPlot },
  { id: 'trendlines', title: 'Trendlines', description: 'Line chart with linear regression trendline overlay.', category: 'Advanced', component: Trendlines },
  { id: 'measure-datums', title: 'Measure Datums', description: 'Click to set reference point, cursor shows distance measurement.', category: 'Advanced', component: MeasureDatums },
  { id: 'data-smoothing', title: 'Data Smoothing', description: 'Noisy signal with moving-average smoothed overlay.', category: 'Advanced', component: DataSmoothing },
  { id: 'wind-direction', title: 'Wind Direction', description: 'Wind speed with directional arrow markers via onDraw hook.', category: 'Advanced', component: WindDirection },
  { id: 'mass-spectrum', title: 'Mass Spectrum', description: 'Mass spectrum bars with logarithmic y-scale.', category: 'Advanced', component: MassSpectrum },

  // --- Data ---
  { id: 'align-data', title: 'Align Data', description: 'Merge datasets with different x-values using alignData() utility.', category: 'Data', component: AlignData },
  { id: 'path-gap-clip', title: 'Path Gap Clip', description: 'Null gaps vs spanGaps for handling missing data points.', category: 'Data', component: PathGapClip },
  { id: 'sparse-data', title: 'Sparse Data', description: 'Very sparse data (10 points across large x-range).', category: 'Data', component: SparseData },
  { id: 'nearest-non-null', title: 'Nearest Non-Null', description: 'Cursor snapping that skips over null values.', category: 'Data', component: NearestNonNull },

  // --- Scales ---
  { id: 'log-scales-2', title: 'Log Scales (Base 2 vs 10)', description: 'Logarithmic scale comparison: base 10 vs base 2.', category: 'Scales', component: LogScales2 },
  { id: 'custom-scales', title: 'Custom Scales', description: 'Manual fixed min/max vs auto-ranged scale comparison.', category: 'Scales', component: CustomScales },
  { id: 'scale-padding', title: 'Scale Padding', description: 'Scale with extra padding around data range.', category: 'Scales', component: ScalePadding },
  { id: 'soft-minmax', title: 'Soft Min/Max', description: 'Scale soft limits that expand but do not contract.', category: 'Scales', component: SoftMinMax },
  { id: 'nice-scale', title: 'Nice Scale', description: 'Auto-range producing "nice" round tick values.', category: 'Scales', component: NiceScale },
  { id: 'sync-y-zero', title: 'Sync Y Zero', description: 'Two y-scales both pinned at zero.', category: 'Scales', component: SyncYZero },
  { id: 'y-shifted-series', title: 'Y-Shifted Series', description: 'Series on separate y-scales showing overlapping patterns.', category: 'Scales', component: YShiftedSeries },

  // --- Axes ---
  { id: 'axis-autosize', title: 'Axis Autosize', description: 'Axis auto-sizing for wide numeric labels (millions).', category: 'Axes', component: AxisAutosize },
  { id: 'axis-indicators', title: 'Axis Indicators', description: 'Grid, tick, and border decoration options on all four axes.', category: 'Axes', component: AxisIndicators },

  // --- Cursor ---
  { id: 'cursor-bind', title: 'Cursor Bind', description: 'Two charts synced via syncKey with different data.', category: 'Cursor', component: CursorBind },
  { id: 'cursor-snap', title: 'Cursor Snap', description: 'Cursor snapping with sparse data (30 points).', category: 'Cursor', component: CursorSnap },
  { id: 'add-del-series', title: 'Add/Remove Series', description: 'Toggle buttons to dynamically add/remove series.', category: 'Cursor', component: AddDelSeries },

  // --- Time ---
  { id: 'months-time-series', title: 'Monthly Time Series', description: 'Monthly timestamps with month-name x-axis formatting.', category: 'Time', component: MonthsTimeSeries },
  { id: 'timezones-dst', title: 'Timezones & DST', description: 'Time series spanning a DST spring-forward transition.', category: 'Time', component: TimezonesDST },
  { id: 'time-periods', title: 'Time Periods', description: 'Hourly, daily, and monthly time granularities.', category: 'Time', component: TimePeriods },
  { id: 'timeseries-discrete', title: 'Discrete Time Series', description: 'Stepped interpolation for discrete status values.', category: 'Time', component: TimeseriesDiscrete },

  // --- Layout ---
  { id: 'resize-demo', title: 'Resize', description: 'Dynamically resize chart with width/height sliders.', category: 'Layout', component: ResizeDemo },
  { id: 'scroll-sync', title: 'Scroll Sync', description: 'Multiple synced charts in a scrollable container.', category: 'Layout', component: ScrollSync },
  { id: 'update-cursor-select-resize', title: 'Live Data Update', description: 'Live-updating data with cursor stability testing.', category: 'Layout', component: UpdateCursorSelectResize },

  // --- Timeline ---
  { id: 'timeline-discrete', title: 'Timeline (Discrete)', description: 'Discrete event spans as horizontal colored bars with lane labels.', category: 'Timeline', component: TimelineDiscrete },
];
