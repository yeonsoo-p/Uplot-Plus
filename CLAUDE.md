# uPlot+

High-performance React charting library rewriting uPlot from scratch in TypeScript. Canvas 2D rendering, native React components, multi-x-axis support.

## Project Layout

Library code lives at the project root. The `uPlot/` and `uplot-wrappers/` directories are reference-only copies of the original library and its framework wrappers — do not modify them.

```
./
├── src/
│   ├── components/    Chart, Series, Scale, Axis, Band, Legend, Tooltip, ZoomRanger, Timeline
│   ├── core/          DataStore, ScaleManager, CursorManager, RenderScheduler, Scale
│   ├── rendering/     CanvasRenderer, drawSeries, drawAxes, drawCursor, drawSelect
│   ├── hooks/         useChart, useInteraction, useChartStore, useDrawHook
│   ├── math/          utils, increments, stack, align
│   ├── axes/          ticks, layout
│   ├── paths/         linear, stepped, bars, monotoneCubic, catmullRom, points, candlestick
│   ├── types/         all type definitions (common, scales, axes, hooks, bands, etc.)
│   ├── time/          timeIncrs, timeSplits, timeVals, fmtDate
│   ├── annotations.ts Annotation drawing helpers (drawHLine, drawVLine, drawLabel, drawRegion)
│   └── index.ts       public API exports
├── test/              Vitest test suite
├── demo/              demo app (vite dev server)
└── dist/              build output (gitignored)
```

## Commands

All commands run from the project root:

```sh
npm run dev         # Start demo dev server
npm run build       # Build library (ES + CJS to dist/)
npm run typecheck   # TypeScript strict check (tsc --noEmit)
npm run lint        # ESLint with strict TS rules
npm run test        # Vitest
```

## Code Conventions

- **Strict TypeScript**: `strict: true`, `noUncheckedIndexedAccess: true`
- **No `any`**: ESLint enforces `@typescript-eslint/no-explicit-any`
- **Type-only imports**: use `import type { ... }` for types
- **Path alias**: `@/*` maps to `src/*`
- **No non-null assertions**: use proper narrowing instead

## Architecture

- **Data model**: `ChartData = XGroup[]` — each group has its own x-values and y-series arrays. Series are referenced by `(group, index)` tuple.
- **Mutable ChartStore**: canvas operations are imperative, not driven by React re-renders. `useSyncExternalStore` powers Legend/Tooltip subscriptions.
- **Cursor**: snaps to nearest point by pixel distance across all series/groups.
- **Zoom**: linked by default — pixel fraction applied to all x-scales.
- **Rendering**: Canvas 2D via `CanvasRenderer`. Axis layout uses a convergence loop (max 3 cycles).

## Testing

- **Framework**: Vitest with jsdom environment
- **Run**: `npm run test`
- **Mocks**: `test/setup.ts` provides Path2D, Canvas context, and requestAnimationFrame stubs
- **Pattern**: `describe`/`it` blocks with `@/` path aliases; helper factories for scales/data
- **Coverage**: math (utils, increments, stack, align), core (Scale, ScaleManager, DataStore), axes (ticks, layout, log filter), paths (linear, stepped, bars, spline, candlestick), annotations, time formatting, integration tests (convergence, auto-ranging, cursor snapping, resize, mount, focus)

## Reference Code

When porting features, consult the original uPlot source in `uPlot/src/`:
- `uPlot.js` — main implementation (axes calc at ~line 1864, convergeSize at ~line 791)
- `opts.js` — defaults and tick generation (~line 550 for axis opts, ~line 591 for splits/values)
- `utils.js`, `fmtDate.js` — utilities
