import React, { useMemo } from 'react';
import { Chart, Scale, Series, Axis, alignData } from '../../src';
import type { ChartData } from '../../src';

export default function AlignData() {
  const data: ChartData = useMemo(() => {
    // Two datasets with different x-values
    const x1 = [0, 1, 2, 3, 5, 7, 8, 10];
    const y1 = x1.map(t => Math.sin(t * 0.5) * 30 + 50);

    const x2 = [0, 2, 4, 5, 6, 8, 9, 10];
    const y2 = x2.map(t => Math.cos(t * 0.4) * 25 + 45);

    // alignData merges them onto a common x-axis, filling gaps with null
    return alignData([
      [x1, y1],
      [x2, y2],
    ]);
  }, []);

  return (
    <div>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
        Two datasets with different x-values aligned onto a common axis.
        Gaps appear where one dataset has no corresponding point.
      </p>
      <Chart width={800} height={400} data={data}>
        <Scale id="x" auto ori={0} dir={1} time={false} />
        <Scale id="y" auto ori={1} dir={1} />
        <Axis scale="x" side={2} label="X" />
        <Axis scale="y" side={3} label="Value" />
        <Series group={0} index={0} yScale="y" stroke="#e74c3c" width={2} label="Dataset A" />
        <Series group={0} index={1} yScale="y" stroke="#3498db" width={2} label="Dataset B" />
      </Chart>
    </div>
  );
}
