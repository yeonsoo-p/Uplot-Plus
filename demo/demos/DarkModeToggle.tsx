import { useState } from 'react';
import { Chart, Series, Scale, Axis, Legend, ThemeProvider, DARK_THEME } from 'uplot-plus';

const data = [{
  x: Array.from({ length: 50 }, (_, i) => i),
  series: [
    Array.from({ length: 50 }, (_, i) => Math.sin(i * 0.15) * 40 + 50),
    Array.from({ length: 50 }, (_, i) => Math.cos(i * 0.12) * 30 + 50),
    Array.from({ length: 50 }, (_, i) => Math.sin(i * 0.08 + 2) * 25 + 45),
  ],
}];

export default function DarkModeToggle() {
  const [dark, setDark] = useState(false);

  return (
    <div>
      <button
        className="mb-2 px-3 py-1 rounded border"
        onClick={() => setDark(d => !d)}
      >
        {dark ? 'Switch to Light' : 'Switch to Dark'}
      </button>

      <ThemeProvider theme={dark ? DARK_THEME : {}}>
        <div style={{ background: dark ? '#1e1e1e' : '#fff', padding: 8, borderRadius: 6 }}>
          <Chart width={800} height={350} data={data} title="Dark Mode Toggle">
            <Scale id="x" />
            <Scale id="y" />
            <Axis scale="x" />
            <Axis scale="y" />
            <Series group={0} index={0} label="Sine" />
            <Series group={0} index={1} label="Cosine" />
            <Series group={0} index={2} label="Phase" />
            <Legend />
          </Chart>
        </div>
      </ThemeProvider>
    </div>
  );
}
