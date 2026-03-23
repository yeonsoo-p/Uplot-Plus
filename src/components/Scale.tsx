import { useEffect, useRef } from 'react';
import type { ScaleConfig } from '../types';
import { useChart } from '../hooks/useChart';
import { shallowEqual } from '../utils/shallowEqual';

export type ScaleProps = ScaleConfig;

/**
 * Renderless component that registers a scale config with the chart store.
 * Must be a child of <Chart>.
 *
 * Mount effect registers/unregisters based on identity key (id).
 * Sync effect updates config when any prop changes (shallow-equality bail-out).
 */
export function Scale(props: ScaleProps): null {
  const store = useChart();
  const propsRef = useRef(props);
  propsRef.current = props;

  // Mount/unmount: register on mount, unregister on unmount or identity change.
  useEffect(() => {
    const p = propsRef.current;
    store.registerScale({ ...p });
    store.scheduleRedraw();

    return () => {
      store.unregisterScale(p.id);
      store.scheduleRedraw();
    };
  }, [store, props.id]);

  // Sync props to store config, skipping when nothing changed.
  // No dependency array: runs every render to catch any prop change via shallow equality check.
  const prevPropsRef = useRef<ScaleProps | null>(null);
  useEffect(() => {
    if (shallowEqual(prevPropsRef.current, props)) return;
    prevPropsRef.current = props;

    store.scaleConfigs = store.scaleConfigs.map(s =>
      s.id === props.id ? { ...props } : s,
    );
    store.scaleManager.addScale({ ...props });
    store.renderer.clearCache();
    store.scheduleRedraw();
  });

  return null;
}
