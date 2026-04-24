import type { ChartStore } from '../hooks/useChartStore';

/** Global registry of cursor sync groups by key. */
const groups = new Map<string, CursorSyncGroup>();

/**
 * Get or create a cursor sync group by key.
 * Charts with the same key share cursor position.
 */
export function getCursorSyncGroup(key: string): CursorSyncGroup {
  let group = groups.get(key);
  if (group == null) {
    group = new CursorSyncGroup(key);
    groups.set(key, group);
  }
  return group;
}

/**
 * Pub/sub group for synchronizing cursor position across multiple charts.
 * Charts publish their cursor's x-value, and all other charts in the group
 * move their cursor to match.
 *
 * Two-layer loop prevention:
 * 1. `publishing` flag blocks re-entrant synchronous calls
 * 2. `syncedStores` WeakSet blocks stores that were just synced-to
 *    from echoing back on their next async redraw
 */
export class CursorSyncGroup {
  readonly key: string;
  private members: Set<ChartStore> = new Set();
  private publishing = false;
  private syncedStores = new WeakSet<ChartStore>();

  constructor(key: string) {
    this.key = key;
  }

  /** Add a chart to this sync group. */
  join(store: ChartStore): void {
    this.members.add(store);
  }

  /** Remove a chart from this sync group. Cleans up empty groups. */
  leave(store: ChartStore): void {
    this.members.delete(store);
    if (this.members.size === 0) {
      groups.delete(this.key);
    }
  }

  /**
   * Publish cursor position from one chart to all others in the group.
   * Skips if the source was just synced-to (prevents async echo loops).
   */
  pub(source: ChartStore): void {
    if (this.publishing) return;

    // If this store was just synced-to by another pub(), don't echo back
    if (this.syncedStores.has(source)) {
      this.syncedStores.delete(source);
      return;
    }

    this.publishing = true;

    const cursor = source.cursorManager.state;
    const { activeGroup, activeDataIndex } = cursor;

    // Get the x-value at the cursor position from the source chart
    if (activeGroup < 0 || activeDataIndex < 0) {
      // Cursor left the source — hide on all others
      for (const member of this.members) {
        if (member === source) continue;
        this.syncedStores.add(member);
        member.cursorManager.hide();
        member.scheduleCursorRedraw();
      }
      this.publishing = false;
      return;
    }

    const xData = source.dataStore.getXValues(activeGroup);
    const xVal = xData[activeDataIndex];
    if (xVal == null) {
      this.publishing = false;
      return;
    }

    // Move cursor on all other charts to the same x-value
    for (const member of this.members) {
      if (member === source) continue;
      this.syncedStores.add(member);
      member.cursorManager.syncToValue(xVal, member, activeGroup);
      member.scheduleCursorRedraw();
    }

    this.publishing = false;
  }
}
