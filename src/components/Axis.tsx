import { useEffect, useRef } from 'react';
import type { AxisConfig } from '../types';
import { useChart } from '../hooks/useChart';
import { shallowEqual } from '../utils/shallowEqual';

export type AxisProps = AxisConfig;

/**
 * Renderless component that registers an axis config with the chart store.
 * Must be a child of <Chart>.
 *
 * Mount effect registers/unregisters based on identity keys (scale, side).
 * Sync effect updates config when any prop changes (shallow-equality bail-out).
 */
export function Axis(props: AxisProps): null {
  const store = useChart();
  const propsRef = useRef(props);
  propsRef.current = props;

  // Mount/unmount: register on mount, unregister on unmount or identity change.
  useEffect(() => {
    const p = propsRef.current;
    store.axisConfigs = store.axisConfigs.filter(
      a => !(a.scale === p.scale && a.side === p.side),
    );
    store.axisConfigs.push({ ...p, show: p.show ?? true });
    store.scheduleRedraw();

    return () => {
      store.axisConfigs = store.axisConfigs.filter(
        a => !(a.scale === p.scale && a.side === p.side),
      );
      store.scheduleRedraw();
    };
  }, [store, props.scale, props.side]);

  // Sync props to store config, skipping when nothing changed.
  // No dependency array: runs every render to catch any prop change via shallow equality check.
  const prevPropsRef = useRef<AxisProps | null>(null);
  useEffect(() => {
    if (shallowEqual(prevPropsRef.current, props)) return;
    prevPropsRef.current = props;

    store.axisConfigs = store.axisConfigs.map(a =>
      (a.scale === props.scale && a.side === props.side)
        ? { ...props, show: props.show ?? true }
        : a,
    );
    store.scheduleRedraw();
  });

  return null;
}
