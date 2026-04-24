import { useEffect } from 'react';
import type { ChartStore } from '../hooks/useChartStore';
import { getCursorSyncGroup } from './CursorSyncGroup';

/**
 * Hook that joins a chart to a cursor sync group.
 * Charts with the same `syncCursorKey` will have their cursors linked.
 * Only publishes when cursor state actually changes to prevent infinite loops.
 */
export function useCursorSyncGroup(store: ChartStore, syncCursorKey: string | undefined): void {
  useEffect(() => {
    if (syncCursorKey == null) return;

    const group = getCursorSyncGroup(syncCursorKey);
    group.join(store);

    // Track last-published state to avoid redundant publishes
    let lastGroup = -1;
    let lastIdx = -1;

    const unsub = store.subscribeCursor(() => {
      const { activeGroup, activeDataIndex } = store.cursorManager.state;
      if (activeGroup === lastGroup && activeDataIndex === lastIdx) return;
      lastGroup = activeGroup;
      lastIdx = activeDataIndex;
      group.pub(store);
    });

    return () => {
      unsub();
      group.leave(store);
    };
  }, [store, syncCursorKey]);
}
