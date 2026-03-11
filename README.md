# uPlot+

High-performance React charting library built from scratch in TypeScript. Canvas 2D rendering, native React components, multi-x-axis support.

## Features

- **Canvas 2D rendering** — no SVG or DOM elements for data visualization
- **Native React components** — declarative `<Chart>`, `<Series>`, `<Scale>`, `<Axis>` API
- **Multi-x-axis support** — multiple data groups with independent x-ranges on one chart
- **TypeScript-first** — strict types, full type exports, no `any`
- **7 path builders** — line, step, bar, monotone cubic, Catmull-Rom, scatter, candlestick
- **Interactive** — wheel/touch zoom, drag-to-zoom, cursor snapping, series focus
- **Cursor sync** — linked crosshairs and tooltips across multiple charts
- **Small bundle** — ~18KB (5.7KB gzip), React 18+ peer dependency
- **Dual output** — ES module + CommonJS

## Installation

```sh
npm install uplot-plus
```

Peer dependencies:

```sh
npm install react react-dom
```

## Quick Start

```tsx
import { Chart, Scale, Series, Axis } from 'uplot-plus';

const data = [
  {
    x: [1, 2, 3, 4, 5],
    series: [
      [10, 25, 13, 30, 18],
      [5, 15, 20, 12, 28],
    ],
  },
];

function App() {
  return (
    <Chart width={800} height={400} data={data}>
      <Scale id="x" auto ori={0} dir={1} />
      <Scale id="y" auto ori={1} dir={1} />
      <Axis scale="x" side={2} label="X-Axis" />
      <Axis scale="y" side={3} label="Y-Axis" />
      <Series group={0} index={0} yScale="y" stroke="#e74c3c" width={2} label="Series A" />
      <Series group={0} index={1} yScale="y" stroke="#3498db" width={2} label="Series B" />
    </Chart>
  );
}
```

## Components

| Component | Description |
|-----------|-------------|
| `<Chart>` | Root container — creates the canvas, manages the chart store |
| `<Scale>` | Registers a scale (linear, log, asinh, ordinal) |
| `<Series>` | Registers a data series with stroke, fill, path builder |
| `<Axis>` | Renders an axis with ticks, labels, grid lines |
| `<Band>` | Fills a region between two series |
| `<Legend>` | Interactive legend with live cursor values, click-to-toggle |
| `<Tooltip>` | Floating tooltip at cursor position, auto-flips at edges |
| `<ZoomRanger>` | Overview mini-chart with draggable selection for zoom control |
| `<Timeline>` | Horizontal lanes of colored event spans |
| `<Sparkline>` | Compact inline chart for tables and dashboards (no axes, no interaction) |
| `<ResponsiveChart>` | Auto-sizes to container via ResizeObserver |
| `<HLine>` | Declarative horizontal line annotation |
| `<VLine>` | Declarative vertical line annotation |
| `<Region>` | Declarative shaded region annotation |
| `<AnnotationLabel>` | Declarative text label at data coordinates |

## Data Model

Data is organized as groups, each with its own x-values:

```ts
import type { ChartData, XGroup } from 'uplot-plus';

// Single x-axis (most common)
const data: ChartData = [
  {
    x: [1, 2, 3, 4, 5],
    series: [
      [10, 20, 30, 40, 50],   // series 0
      [5, 15, 25, 35, 45],    // series 1
    ],
  },
];

// Multi x-axis — two groups with independent x-ranges
const multiData: ChartData = [
  { x: [0, 1, 2, 3], series: [[10, 20, 15, 25]] },
  { x: [0, 0.5, 1.5, 2.5, 3], series: [[8, 18, 22, 12, 30]] },
];
```

Each series is referenced by a `(group, index)` tuple — `group` is the index into the `ChartData` array, `index` is the index into that group's `series` array.

Null values in series arrays create gaps in the chart. Use `spanGaps` on `<Series>` to bridge them.

## Path Builders

| Builder | Import | Use case |
|---------|--------|----------|
| `linear()` | `linear` | Line/area charts (default). Pixel-level decimation for large datasets |
| `stepped()` | `stepped` | Step charts — step-after, step-before, or mid-step |
| `bars()` | `bars` | Bar/column charts with configurable width, gaps, grouped bars |
| `monotoneCubic()` | `monotoneCubic` | Smooth curves that preserve monotonicity (no overshoot) |
| `catmullRom()` | `catmullRom` | Centripetal Catmull-Rom splines |
| `points()` | `points` | Scatter plots — points only, no connecting lines |
| `drawCandlesticks()` | `drawCandlesticks` | OHLC financial candlestick charts |

```tsx
import { Series, bars } from 'uplot-plus';

<Series group={0} index={0} yScale="y" paths={bars()} stroke="#3498db" fill="#3498db80" />
```

## Hooks

### `useChart()`

Access the chart store from any child of `<Chart>`:

```tsx
import { useChart } from 'uplot-plus';

function CustomControl() {
  const store = useChart();
  return <button onClick={() => store.toggleSeries(0, 0)}>Toggle</button>;
}
```

### `useDrawHook()` / `useCursorDrawHook()`

Register custom Canvas 2D draw callbacks for the persistent layer or cursor overlay:

```tsx
import { useDrawHook } from 'uplot-plus';
import type { DrawCallback } from 'uplot-plus';

const onDraw: DrawCallback = (dc) => {
  dc.ctx.fillStyle = 'rgba(255,0,0,0.2)';
  dc.ctx.fillRect(dc.plotBox.left, dc.plotBox.top, dc.plotBox.width, dc.plotBox.height);
};
```

### `useStreamingData()`

Sliding-window data management for real-time charts:

```tsx
import { useStreamingData } from 'uplot-plus';

const { data, push, start, stop, fps } = useStreamingData(initialData, {
  window: 1000,   // keep last 1000 points
  batchSize: 10,  // push 10 points per tick
});

// In your tick callback:
push([newX], [newY1], [newY2]);
```

## Axis Value Formatters

Pre-built formatters for common axis label patterns:

```tsx
import { fmtCompact, fmtSuffix, fmtHourMin, fmtMonthName, fmtLabels } from 'uplot-plus';

<Axis scale="y" side={3} values={fmtCompact()} />           // 1.2K, 3.5M
<Axis scale="y" side={3} values={fmtSuffix('%')} />         // 42%
<Axis scale="y" side={3} values={fmtSuffix('°C', 1)} />    // 23.5°C
<Axis scale="x" side={2} values={fmtHourMin({ utc: true })} /> // 14:30
<Axis scale="x" side={2} values={fmtMonthName()} />         // Jan, Feb, ...
<Axis scale="x" side={2} values={fmtLabels(['Q1','Q2','Q3','Q4'])} />
```

## Color Utilities

```tsx
import { fadeGradient, withAlpha, palette } from 'uplot-plus';

// Gradient that fades from color to transparent (for area fills)
<Series fill={fadeGradient('#3498db')} />
<Series fill={fadeGradient('#e74c3c', 1.0, 0.2)} />

// Match fill to stroke with lower opacity
<Series stroke="#2980b9" fill={withAlpha('#2980b9', 0.1)} />

// Generate N distinct colors
const colors = palette(5); // 5 visually distinct HSL colors
```

## Data Utilities

### `stackGroup`

Computes stacked series values and generates band configs:

```tsx
import { stackGroup, Band } from 'uplot-plus';

const raw = { x: [1, 2, 3], series: [[10, 20, 30], [5, 10, 15]] };
const { group, bands } = stackGroup(raw);

<Chart data={[group]}>
  {bands.map((b, i) => <Band key={i} {...b} />)}
</Chart>
```

### `alignData`

Aligns data across multiple x-axes for multi-group charts.

## Annotations

Declarative annotation components — place inside `<Chart>`:

```tsx
import { HLine, VLine, Region, AnnotationLabel } from 'uplot-plus';

<Chart data={data}>
  {/* ... scales, axes, series */}
  <HLine value={65} yScale="y" stroke="#e74c3c" dash={[6, 4]} label="Threshold" />
  <VLine value={100} xScale="x" stroke="#8e44ad" dash={[4, 4]} />
  <Region yMin={40} yMax={60} yScale="y" fill="rgba(46,204,113,0.12)" />
  <AnnotationLabel x={50} y={65} text="Alert zone" fill="#e74c3c" />
</Chart>
```

Imperative helpers are also available for custom draw hooks:

```tsx
import { drawHLine, drawVLine, drawLabel, drawRegion } from 'uplot-plus';
```

## Scale Utilities

For advanced draw hooks that need pixel conversions:

```tsx
import { valToPos, posToVal } from 'uplot-plus';

const px = valToPos(dataValue, scale, dimension, offset);
const val = posToVal(pixelPos, scale, dimension, offset);
```

## Examples

### Legend and Tooltip

```tsx
import { Chart, Scale, Series, Axis, Legend, Tooltip } from 'uplot-plus';

<Chart width={800} height={400} data={data}>
  <Scale id="x" auto ori={0} dir={1} />
  <Scale id="y" auto ori={1} dir={1} />
  <Axis scale="x" side={2} />
  <Axis scale="y" side={3} />
  <Series group={0} index={0} yScale="y" stroke="red" label="Revenue" />
  <Series group={0} index={1} yScale="y" stroke="blue" label="Costs" />
  <Legend position="bottom" />
  <Tooltip />
</Chart>
```

### Synced Charts

```tsx
<Chart width={800} height={200} data={data1} syncKey="sync1">
  {/* ... scales, axes, series */}
  <Tooltip />
</Chart>

<Chart width={800} height={200} data={data2} syncKey="sync1">
  {/* ... scales, axes, series */}
  <Tooltip />
</Chart>
```

### ZoomRanger

```tsx
import { Chart, ZoomRanger } from 'uplot-plus';

const [range, setRange] = useState<[number, number] | null>(null);

<ZoomRanger
  width={800}
  height={80}
  data={data}
  onRangeChange={(min, max) => setRange([min, max])}
/>

<Chart width={800} height={300} data={data}>
  {/* detail chart */}
</Chart>
```

### Bands (Confidence Intervals)

```tsx
import { Band } from 'uplot-plus';

<Chart data={data}>
  <Series group={0} index={0} yScale="y" stroke="blue" label="Upper" />
  <Series group={0} index={1} yScale="y" stroke="blue" label="Lower" />
  <Band series={[0, 1]} group={0} fill="rgba(100,150,255,0.2)" />
</Chart>
```

### Sparkline

```tsx
import { Sparkline, bars } from 'uplot-plus';

// Line sparkline
<Sparkline data={priceData} stroke="#03a9f4" fill="#b3e5fc" />

// Bar sparkline
<Sparkline data={volumeData} width={120} height={28} paths={bars()} fillTo={0} stroke="#2980b9" />
```

### Responsive Chart

```tsx
import { ResponsiveChart, Scale, Series, Axis } from 'uplot-plus';

// Fills parent container, maintains 16:9 aspect ratio
<div style={{ width: '100%' }}>
  <ResponsiveChart data={data} aspectRatio={16/9}>
    <Scale id="x" auto ori={0} dir={1} />
    <Scale id="y" auto ori={1} dir={1} />
    <Axis scale="x" side={2} />
    <Axis scale="y" side={3} />
    <Series group={0} index={0} yScale="y" stroke="red" />
  </ResponsiveChart>
</div>
```

### Custom Tooltip

```tsx
<Tooltip>
  {(data) => (
    <div style={{ background: '#fff', padding: 8, borderRadius: 4 }}>
      <strong>{data.xLabel}</strong>
      {data.items.map(item => (
        <div key={item.label} style={{ color: item.color }}>
          {item.label}: {item.value?.toFixed(2)}
        </div>
      ))}
    </div>
  )}
</Tooltip>
```

## Chart Props Reference

### `<Chart>`

| Prop | Type | Description |
|------|------|-------------|
| `width` | `number` | Chart width in CSS pixels (required) |
| `height` | `number` | Chart height in CSS pixels (required) |
| `data` | `ChartData` | Chart data (required) |
| `children` | `ReactNode` | Scale, Series, Axis, Legend, etc. |
| `className` | `string` | CSS class name |
| `pxRatio` | `number` | Device pixel ratio (default: `devicePixelRatio`) |
| `syncKey` | `string` | Key to sync cursor across charts |
| `cursor` | `CursorConfig` | Cursor/interaction config |
| `onDraw` | `DrawCallback` | Custom draw on persistent layer |
| `onCursorDraw` | `CursorDrawCallback` | Custom draw on cursor overlay |

### `<Scale>`

| Prop | Type | Description |
|------|------|-------------|
| `id` | `string` | Unique scale identifier (required) |
| `auto` | `boolean` | Auto-range from data |
| `ori` | `0 \| 1` | 0 = horizontal (x), 1 = vertical (y) |
| `dir` | `1 \| -1` | 1 = normal, -1 = reversed |
| `distr` | `1\|2\|3\|4` | 1=linear, 2=ordinal, 3=log, 4=asinh |
| `log` | `number` | Log base when `distr=3` |
| `min` / `max` | `number \| null` | Fixed range limits |
| `time` | `boolean` | Time-based scale |
| `range` | `RangeConfig` | Padding and soft/hard limits |

### `<Series>`

| Prop | Type | Description |
|------|------|-------------|
| `group` | `number` | Data group index (required) |
| `index` | `number` | Series index within group (required) |
| `yScale` | `string` | Y-axis scale key (required) |
| `stroke` | `string \| GradientConfig` | Line color |
| `fill` | `string \| GradientConfig` | Fill color |
| `width` | `number` | Stroke width in CSS pixels |
| `paths` | `PathBuilder` | Path builder function |
| `label` | `string` | Legend/tooltip label |
| `show` | `boolean` | Visibility (default: true) |
| `spanGaps` | `boolean` | Connect across null gaps |
| `points` | `PointsConfig` | Point marker configuration |
| `dash` | `number[]` | Dash pattern |

### `<Axis>`

| Prop | Type | Description |
|------|------|-------------|
| `scale` | `string` | Scale key (required) |
| `side` | `0\|1\|2\|3` | 0=top, 1=right, 2=bottom, 3=left (required) |
| `label` | `string` | Axis label text |
| `show` | `boolean` | Visibility (default: true) |
| `space` | `number` | Min space between ticks (CSS px) |
| `size` | `number` | Axis size (height or width) |
| `rotate` | `number` | Tick label rotation in degrees |
| `values` | `function` | Custom tick label formatter |
| `splits` | `function` | Custom tick position generator |
| `grid` | `GridConfig` | Grid line config |
| `ticks` | `TickConfig` | Tick mark config |

For full type definitions, see the exported types from `uplot-plus`.

## Development

```sh
npm run dev         # Start demo dev server (85+ examples)
npm run build       # Build library (ES + CJS to dist/)
npm run typecheck   # TypeScript strict check
npm run lint        # ESLint
npm run test        # Vitest test suite
```

## License

MIT
