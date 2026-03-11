import React, { useMemo, useState, useCallback } from 'react';
import { Chart, Scale, Series, Axis, ZoomRanger } from '../../src';
import type { ChartData } from '../../src';
import { invalidateScaleCache } from '../../src/core/Scale';
import { useChart } from '../../src/hooks/useChart';

function generateData(): ChartData {
  const n = 500;
  const x: number[] = [];
  const y1: number[] = [];
  const y2: number[] = [];
  for (let i = 0; i < n; i++) {
    x.push(i);
    y1.push(Math.sin(i * 0.05) * 50 + 50 + Math.random() * 10);
    y2.push(Math.cos(i * 0.03) * 30 + 40 + Math.random() * 8);
  }
  return [{ x, series: [y1, y2] }];
}

/** Inner component that uses useChart to access the store for zooming */
function ZoomApplier({ range }: { range: [number, number] | null }) {
  const store = useChart();

  React.useEffect(() => {
    if (range == null) return;
    const scale = store.scaleManager.getScale('x');
    if (scale != null) {
      scale.min = range[0];
      scale.max = range[1];
      scale.auto = false;
      invalidateScaleCache(scale);
      store.renderer.clearCache();
      store.scheduleRedraw();
    }
  }, [range, store]);

  return null;
}

export default function ZoomRangerDemo() {
  const data = useMemo(() => generateData(), []);
  const [range, setRange] = useState<[number, number] | null>(null);

  const onRangeChange = useCallback((min: number, max: number) => {
    setRange([min, max]);
  }, []);

  return (
    <div>
      <Chart width={800} height={300} data={data}>
        <Scale id="x" auto ori={0} dir={1} />
        <Scale id="y" auto ori={1} dir={1} />
        <Axis scale="x" side={2} />
        <Axis scale="y" side={3} />
        <Series group={0} index={0} yScale="y" stroke="#2196f3" label="Signal A" />
        <Series group={0} index={1} yScale="y" stroke="#ff9800" label="Signal B" />
        <ZoomApplier range={range} />
      </Chart>

      <div style={{ marginTop: 8 }}>
        <ZoomRanger
          width={800}
          height={60}
          data={data}
          onRangeChange={onRangeChange}
          initialRange={[100, 400]}
          colors={['#2196f3', '#ff9800']}
        />
      </div>
    </div>
  );
}
