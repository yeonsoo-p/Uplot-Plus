import { useMemo, useState } from 'react';
import { Chart, Series, Scale, Axis, Legend, ThemeProvider } from 'uplot-plus';
import type { ChartTheme } from 'uplot-plus';

const data = [{
  x: Array.from({ length: 60 }, (_, i) => i),
  series: [
    Array.from({ length: 60 }, (_, i) => Math.sin(i * 0.1) * 30 + 50),
    Array.from({ length: 60 }, (_, i) => Math.cos(i * 0.08) * 25 + 50),
    Array.from({ length: 60 }, (_, i) => Math.sin(i * 0.06 + 1) * 20 + 40),
  ],
}];

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center gap-2">
      <input type="color" value={value} onChange={e => onChange(e.target.value)} />
      <span className="text-sm">{label}</span>
    </label>
  );
}

export default function CustomTheme() {
  const [axisStroke, setAxisStroke] = useState('#666666');
  const [gridStroke, setGridStroke] = useState('#e0e0e0');
  const [cursorStroke, setCursorStroke] = useState('#ff0000');
  const [color1, setColor1] = useState('#e74c3c');
  const [color2, setColor2] = useState('#3498db');
  const [color3, setColor3] = useState('#2ecc71');

  const theme: ChartTheme = useMemo(() => ({
    axisStroke,
    gridStroke,
    cursor: { stroke: cursorStroke },
    seriesColors: [color1, color2, color3],
  }), [axisStroke, gridStroke, cursorStroke, color1, color2, color3]);

  return (
    <div>
      <div className="flex gap-4 flex-wrap mb-2">
        <ColorInput label="Axis" value={axisStroke} onChange={setAxisStroke} />
        <ColorInput label="Grid" value={gridStroke} onChange={setGridStroke} />
        <ColorInput label="Cursor" value={cursorStroke} onChange={setCursorStroke} />
        <ColorInput label="Series 1" value={color1} onChange={setColor1} />
        <ColorInput label="Series 2" value={color2} onChange={setColor2} />
        <ColorInput label="Series 3" value={color3} onChange={setColor3} />
      </div>

      <ThemeProvider theme={theme}>
        <Chart width={800} height={350} data={data} title="Custom Theme">
          <Scale id="x" />
          <Scale id="y" />
          <Axis scale="x" />
          <Axis scale="y" />
          <Series group={0} index={0} label="Alpha" />
          <Series group={0} index={1} label="Beta" />
          <Series group={0} index={2} label="Gamma" />
          <Legend />
        </Chart>
      </ThemeProvider>
    </div>
  );
}
