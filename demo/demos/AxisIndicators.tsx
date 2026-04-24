import { Chart, Series, Axis, Side } from 'uplot-plus';

function generateData() {
  const n = 80;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = x.map(i => Math.sin(i * 0.1) * 40 + 50);
  return [{ x, series: [y] }];
}

export default function AxisIndicators() {
  const data = generateData();

  return (
    <div>
      <Chart width="auto" height={400} data={data}>
        {/* Bottom x-axis: blue grid dashed, red ticks, green border */}
        <Axis
          scaleId="x"
          side={Side.Bottom}
          label="X Axis (bottom)"
          grid={{ show: true, stroke: '#3498db', strokeWidth: 1, dash: [4, 4] }}
          ticks={{ show: true, stroke: '#e74c3c', strokeWidth: 2, size: 8 }}
          border={{ show: true, stroke: '#2ecc71', strokeWidth: 2 }}
        />

        {/* Top x-axis: dotted grid, no ticks, thick border */}
        <Axis
          scaleId="x"
          side={Side.Top}
          label="X Axis (top)"
          grid={{ show: true, stroke: 'rgba(155, 89, 182, 0.3)', strokeWidth: 1, dash: [2, 6] }}
          ticks={{ show: false }}
          border={{ show: true, stroke: '#9b59b6', strokeWidth: 3 }}
        />

        {/* Left y-axis: solid grid, dash ticks, dashed border */}
        <Axis
          scaleId="y"
         
          label="Y Axis (left)"
          grid={{ show: true, stroke: 'rgba(230, 126, 34, 0.3)', strokeWidth: 1 }}
          ticks={{ show: true, stroke: '#e67e22', strokeWidth: 1, size: 6, dash: [3, 3] }}
          border={{ show: true, stroke: '#e67e22', strokeWidth: 2, dash: [6, 3] }}
        />

        {/* Right y-axis: no grid, thick ticks, solid border */}
        <Axis
          scaleId="y"
          side={Side.Right}
          label="Y Axis (right)"
          grid={{ show: false }}
          ticks={{ show: true, stroke: '#c0392b', strokeWidth: 3, size: 10 }}
          border={{ show: true, stroke: '#c0392b', strokeWidth: 1 }}
        />

        <Series label="Signal" />
      </Chart>
    </div>
  );
}
