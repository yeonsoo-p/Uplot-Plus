import { useState } from 'react';
import { Chart, Series, Scale, Axis, Legend } from 'uplot-plus';

const data = [{
  x: Array.from({ length: 50 }, (_, i) => i),
  series: [
    Array.from({ length: 50 }, (_, i) => Math.sin(i * 0.12) * 30 + 50),
    Array.from({ length: 50 }, (_, i) => Math.cos(i * 0.1) * 25 + 50),
  ],
}];

const snippetA = `/* Plain CSS — no ThemeProvider needed */
.chart-ocean {
  --uplot-axis-stroke: #8ab4f8;
  --uplot-grid-stroke: rgba(138,180,248,0.1);
  --uplot-series-colors: #64ffda,#80cbc4;
  --uplot-cursor-stroke: #64ffda;
}`;

const snippetB = `/* Override just the cursor */
.chart-bold-cursor {
  --uplot-cursor-stroke: #ff0;
  --uplot-cursor-width: 2;
  --uplot-cursor-dash: 0;
  --uplot-cursor-point-radius: 5;
}`;

export default function CSSCustomProperties() {
  const [variant, setVariant] = useState<'default' | 'ocean' | 'cursor'>('default');

  const cssVars: Record<string, string | number> =
    variant === 'ocean'
      ? {
          '--uplot-axis-stroke': '#8ab4f8',
          '--uplot-grid-stroke': 'rgba(138,180,248,0.1)',
          '--uplot-series-colors': '#64ffda,#80cbc4',
          '--uplot-cursor-stroke': '#64ffda',
        }
      : variant === 'cursor'
        ? {
            '--uplot-cursor-stroke': '#ff0',
            '--uplot-cursor-width': 2,
            '--uplot-cursor-dash': '0',
            '--uplot-cursor-point-radius': 5,
          }
        : {};

  const bg = variant === 'ocean' ? '#0d1b2a' : '#fff';

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <button className={`px-3 py-1 rounded border text-sm ${variant === 'default' ? 'bg-blue-600 text-white border-blue-600' : ''}`} onClick={() => setVariant('default')}>Default</button>
        <button className={`px-3 py-1 rounded border text-sm ${variant === 'ocean' ? 'bg-blue-600 text-white border-blue-600' : ''}`} onClick={() => setVariant('ocean')}>Ocean (CSS vars)</button>
        <button className={`px-3 py-1 rounded border text-sm ${variant === 'cursor' ? 'bg-blue-600 text-white border-blue-600' : ''}`} onClick={() => setVariant('cursor')}>Bold Cursor (CSS vars)</button>
      </div>

      <div style={{ ...cssVars, background: bg, padding: 10, borderRadius: 6, transition: 'background 0.3s' }}>
        <Chart key={variant} width={800} height={340} data={data}>
          <Scale id="x" />
          <Scale id="y" />
          <Axis scale="x" />
          <Axis scale="y" />
          <Series group={0} index={0} label="Series A" />
          <Series group={0} index={1} label="Series B" />
          <Legend />
        </Chart>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">{snippetA}</pre>
        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">{snippetB}</pre>
      </div>
    </div>
  );
}
