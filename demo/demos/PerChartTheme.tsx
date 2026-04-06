import { Chart, Series, Scale, Axis, Legend } from 'uplot-plus';
import type { ChartTheme } from 'uplot-plus';

const data = [{
  x: Array.from({ length: 40 }, (_, i) => i),
  series: [
    Array.from({ length: 40 }, (_, i) => Math.sin(i * 0.15) * 30 + 50),
    Array.from({ length: 40 }, (_, i) => Math.cos(i * 0.12) * 25 + 50),
  ],
}];

const warmTheme: ChartTheme = {
  axisStroke: '#8b4513',
  gridStroke: 'rgba(139, 69, 19, 0.15)',
  seriesColors: ['#e74c3c', '#f39c12'],
  cursor: { stroke: '#d35400' },
};

const coolTheme: ChartTheme = {
  axisStroke: '#2c3e50',
  gridStroke: 'rgba(44, 62, 80, 0.12)',
  seriesColors: ['#3498db', '#1abc9c'],
  cursor: { stroke: '#2980b9' },
};

export default function PerChartTheme() {
  return (
    <div>
      <div className="flex gap-4 flex-wrap">
        <div>
          <h4 className="mb-1">Warm</h4>
          <Chart width={380} height={280} data={data} theme={warmTheme}>
            <Scale id="x" />
            <Scale id="y" />
            <Axis scale="x" />
            <Axis scale="y" />
            <Series group={0} index={0} label="Fire" />
            <Series group={0} index={1} label="Sun" />
            <Legend />
          </Chart>
        </div>
        <div>
          <h4 className="mb-1">Cool</h4>
          <Chart width={380} height={280} data={data} theme={coolTheme}>
            <Scale id="x" />
            <Scale id="y" />
            <Axis scale="x" />
            <Axis scale="y" />
            <Series group={0} index={0} label="Ocean" />
            <Series group={0} index={1} label="Teal" />
            <Legend />
          </Chart>
        </div>
      </div>
    </div>
  );
}
