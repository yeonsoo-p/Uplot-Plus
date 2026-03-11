import { useEffect } from 'react';
import type { SeriesConfig } from '../types';
import { useChart } from '../hooks/useChart';

export type SeriesProps = SeriesConfig;

/**
 * Renderless component that registers a series config with the chart store.
 * Must be a child of <Chart>.
 */
export function Series(props: SeriesProps): null {
  const store = useChart();

  useEffect(() => {
    store.registerSeries({
      ...props,
      show: props.show ?? true,
    });
    store.scheduleRedraw();

    return () => {
      store.unregisterSeries(props.group, props.index);
      store.scheduleRedraw();
    };
  }, [
    store,
    props.group,
    props.index,
    props.yScale,
    props.show,
    props.stroke,
    props.fill,
    props.width,
    props.alpha,
    props.label,
    props.dash,
    props.spanGaps,
    props.paths,
    props.sorted,
    props.cap,
    props.join,
    props.fillTo,
    props.points,
  ]);

  return null;
}
