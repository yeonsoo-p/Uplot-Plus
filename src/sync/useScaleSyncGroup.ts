import { useEffect } from 'react';
import type { ChartStore } from '../hooks/useChartStore';
import { getScaleSyncGroup } from './ScaleSyncGroup';

/**
 * Hook that joins a chart to a scale sync group.
 * Charts with the same `syncScaleKey` will have their scale ranges linked —
 * wheel/drag-zoom or programmatic range changes propagate to all peers.
 */
export function useScaleSyncGroup(store: ChartStore, syncScaleKey: string | undefined): void {
  useEffect(() => {
    if (syncScaleKey == null) return;

    const group = getScaleSyncGroup(syncScaleKey);
    const member = group.joinStore(store);

    const onLocalChange = (scaleId: string, min: number, max: number): void => {
      group.pubFromStore(store, scaleId, min, max);
    };
    store.scaleListeners.add(onLocalChange);

    return () => {
      store.scaleListeners.delete(onLocalChange);
      group.leave(member);
    };
  }, [store, syncScaleKey]);
}
