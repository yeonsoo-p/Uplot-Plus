import React, { useMemo } from 'react';
import { Chart, Scale, Series, Axis, Legend } from '../../src';
import type { ChartData } from '../../src';

export default function YShiftedSeries() {
  const data: ChartData = useMemo(() => {
    const n = 150;
    const x = Array.from({ length: n }, (_, i) => i);
    const temp = x.map(i => Math.sin(i * 0.04) * 15 + 22 + (Math.random() - 0.5) * 2);
    const pressure = x.map(i => Math.sin(i * 0.04 + 0.5) * 30 + 1013 + (Math.random() - 0.5) * 5);
    const humidity = x.map(i => Math.sin(i * 0.04 + 1.0) * 20 + 60 + (Math.random() - 0.5) * 3);
    return [{ x, series: [temp, pressure, humidity] }];
  }, []);

  return (
    <div>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
        Three series on different y-scales — overlapping patterns at vastly different magnitudes.
      </p>
      <Chart width={800} height={400} data={data}>
        <Scale id="x" auto ori={0} dir={1} time={false} />
        <Scale id="temp" auto ori={1} dir={1} />
        <Scale id="pressure" auto ori={1} dir={1} />
        <Scale id="humidity" auto ori={1} dir={1} />
        <Axis scale="x" side={2} label="Sample" />
        <Axis scale="temp" side={3} label="Temp (C)" stroke="#e74c3c" />
        <Axis scale="pressure" side={1} label="Pressure (hPa)" stroke="#3498db" />
        {/* Humidity shares left side, offset by temp axis */}
        <Series group={0} index={0} yScale="temp" stroke="#e74c3c" width={2} label="Temperature" />
        <Series group={0} index={1} yScale="pressure" stroke="#3498db" width={2} label="Pressure" />
        <Series group={0} index={2} yScale="humidity" stroke="#27ae60" width={2} dash={[6, 3]} label="Humidity" />
        <Legend />
      </Chart>
    </div>
  );
}
