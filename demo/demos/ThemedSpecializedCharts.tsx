import { Chart, Series, Candlestick, Scale, Axis, Band, Legend, ThemeProvider } from 'uplot-plus';
import type { ChartTheme } from 'uplot-plus';

// --- Candlestick data ---
function generateOHLC() {
  const n = 40;
  const x: number[] = [];
  const open: number[] = [];
  const high: number[] = [];
  const low: number[] = [];
  const close: number[] = [];
  let price = 100;
  for (let i = 0; i < n; i++) {
    x.push(i);
    const o = price;
    const change = (Math.random() - 0.48) * 4;
    const c = o + change;
    high.push(Math.max(o, c) + Math.random() * 3);
    low.push(Math.min(o, c) - Math.random() * 3);
    open.push(o);
    close.push(c);
    price = c;
  }
  return [{ x, series: [open, high, low, close] }];
}

// --- Band / confidence data ---
function generateBandData() {
  const n = 60;
  const x = Array.from({ length: n }, (_, i) => i);
  const mean: number[] = [];
  const upper: number[] = [];
  const lower: number[] = [];
  for (let i = 0; i < n; i++) {
    const m = Math.sin(i * 0.08) * 25 + 50;
    const spread = 6 + Math.random() * 4;
    mean.push(m);
    upper.push(m + spread);
    lower.push(m - spread);
  }
  return [{ x, series: [mean, upper, lower] }];
}

const financialDark: ChartTheme = {
  axisStroke: '#aaa',
  gridStroke: 'rgba(255,255,255,0.06)',
  titleFill: '#e0e0e0',
  candlestick: { upColor: '#00e676', downColor: '#ff1744' },
  cursor: { stroke: '#ffd740', pointFill: '#222' },
  overlay: { panelBg: 'rgba(30,30,30,0.95)', panelBorder: '#555' },
};

const scienceTheme: ChartTheme = {
  axisStroke: '#455a64',
  gridStroke: 'rgba(0,0,0,0.06)',
  seriesColors: ['#1565c0', '#7986cb', '#90caf9'],
  bandFill: 'rgba(21,101,192,0.12)',
  annotation: { stroke: '#1565c0', fill: 'rgba(21,101,192,0.08)' },
};

export default function ThemedSpecializedCharts() {
  const ohlc = generateOHLC();
  const band = generateBandData();

  return (
    <div>
      <h4 className="mb-1">Financial Dark</h4>
      <ThemeProvider theme={financialDark}>
        <div style={{ background: '#1a1a2e', padding: 8, borderRadius: 6, marginBottom: 16 }}>
          <Chart width={800} height={300} data={ohlc} title="OHLC Candlestick" xlabel="Day" ylabel="Price">
            <Candlestick />
          </Chart>
        </div>
      </ThemeProvider>

      <h4 className="mb-1">Science / Research</h4>
      <ThemeProvider theme={scienceTheme}>
        <Chart width={800} height={300} data={band} title="Confidence Band">
          <Scale id="x" />
          <Scale id="y" />
          <Axis scale="x" />
          <Axis scale="y" />
          <Series group={0} index={0} label="Mean" />
          <Series group={0} index={1} label="Upper" dash={[4, 4]} />
          <Series group={0} index={2} label="Lower" dash={[4, 4]} />
          <Band series={[1, 2]} group={0} />
          <Legend />
        </Chart>
      </ThemeProvider>
    </div>
  );
}
