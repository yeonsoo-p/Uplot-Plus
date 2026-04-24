import type { ChartStore } from '../hooks/useChartStore';
import { invalidateScaleCache } from '../core/Scale';

/**
 * Subscribers can be either a chart store (which exposes a scale via its
 * scaleManager) or a plain callback (used by overlay components like
 * ZoomRanger that have no chart store of their own).
 */
type ChartMember = { kind: 'chart'; store: ChartStore };
type CallbackMember = { kind: 'callback'; cb: (scaleId: string, min: number, max: number) => void };
type Member = ChartMember | CallbackMember;

/** Global registry of scale sync groups by key. */
const groups = new Map<string, ScaleSyncGroup>();

/** Get or create a scale sync group by key. */
export function getScaleSyncGroup(key: string): ScaleSyncGroup {
  let group = groups.get(key);
  if (group == null) {
    group = new ScaleSyncGroup(key);
    groups.set(key, group);
  }
  return group;
}

/**
 * Pub/sub group for synchronizing scale ranges across charts (and overlay
 * components like ZoomRanger). A publisher emits `(scaleId, min, max)` and
 * every other member updates its matching scale (or invokes its callback).
 *
 * Loop prevention mirrors CursorSyncGroup:
 * 1. `publishing` flag blocks re-entrant synchronous calls.
 * 2. `syncedSources` WeakSet/Set blocks members that were just synced-to
 *    from echoing back on their next async redraw.
 */
export class ScaleSyncGroup {
  readonly key: string;
  private members: Set<Member> = new Set();
  private publishing = false;
  private syncedStores = new WeakSet<ChartStore>();
  private syncedCallbacks = new WeakSet();

  constructor(key: string) {
    this.key = key;
  }

  /** Add a chart store as a member. Returns the inserted member token (for leave). */
  joinStore(store: ChartStore): Member {
    const m: Member = { kind: 'chart', store };
    this.members.add(m);
    return m;
  }

  /** Add a callback subscriber (e.g. ZoomRanger). Returns the inserted member token. */
  joinCallback(cb: (scaleId: string, min: number, max: number) => void): Member {
    const m: Member = { kind: 'callback', cb };
    this.members.add(m);
    return m;
  }

  /** Remove a member. Cleans up empty groups. */
  leave(member: Member): void {
    this.members.delete(member);
    if (this.members.size === 0) {
      groups.delete(this.key);
    }
  }

  /**
   * Suppress the next echo from this store — call before mutating a scale
   * when you don't want the resulting subscribeCursor/onScaleChange to bounce
   * the same value back to peers.
   */
  suppressNext(store: ChartStore): void {
    this.syncedStores.add(store);
  }

  /**
   * Publish a scale range from a chart store to all other members.
   * Skips if the source was just synced-to (prevents async echo loops).
   */
  pubFromStore(source: ChartStore, scaleId: string, min: number, max: number): void {
    if (this.publishing) return;
    if (this.syncedStores.has(source)) {
      this.syncedStores.delete(source);
      return;
    }
    this.publish(source, null, scaleId, min, max);
  }

  /** Publish a scale range from a callback subscriber (e.g. ZoomRanger drag). */
  pubFromCallback(sourceCb: (scaleId: string, min: number, max: number) => void, scaleId: string, min: number, max: number): void {
    if (this.publishing) return;
    if (this.syncedCallbacks.has(sourceCb)) {
      this.syncedCallbacks.delete(sourceCb);
      return;
    }
    this.publish(null, sourceCb, scaleId, min, max);
  }

  private publish(
    sourceStore: ChartStore | null,
    sourceCb: ((scaleId: string, min: number, max: number) => void) | null,
    scaleId: string, min: number, max: number,
  ): void {
    this.publishing = true;
    for (const m of this.members) {
      if (m.kind === 'chart') {
        if (m.store === sourceStore) continue;
        const scale = m.store.scaleManager.getScale(scaleId);
        if (scale == null) continue;
        if (scale.min === min && scale.max === max) continue;
        this.syncedStores.add(m.store);
        scale.min = min;
        scale.max = max;
        scale.auto = false;
        invalidateScaleCache(scale);
        // Pre-advance _prevScaleRanges so the recipient's own notifyScaleChanges
        // call (post-redraw) sees no diff and doesn't echo back.
        m.store._prevScaleRanges.set(scaleId, { min, max });
        m.store.renderer.clearCache();
        m.store.scheduleRedraw();
      } else {
        if (m.cb === sourceCb) continue;
        this.syncedCallbacks.add(m.cb);
        try { m.cb(scaleId, min, max); } catch (err) { console.warn('[uPlot+] scale sync callback error:', err); }
      }
    }
    this.publishing = false;
  }
}
