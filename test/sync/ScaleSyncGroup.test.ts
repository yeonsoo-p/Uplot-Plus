import { describe, it, expect, vi } from 'vitest';
import { getScaleSyncGroup } from '@/sync/ScaleSyncGroup';
import { createChartStore, type ChartStore } from '@/hooks/useChartStore';
import { Orientation, Direction } from '@/types';

function makeStore(): ChartStore {
  const store = createChartStore();
  store.width = 400;
  store.height = 300;
  store.plotBox = { left: 10, top: 10, width: 380, height: 280 };
  store.registerScale({ id: 'x', ori: Orientation.Horizontal, dir: Direction.Forward, auto: false, min: 0, max: 100 });
  store.scaleManager.setGroupXScale(0, 'x');
  return store;
}

describe('ScaleSyncGroup', () => {
  it('getScaleSyncGroup returns the same instance for the same key', () => {
    const a = getScaleSyncGroup('zr-same');
    const b = getScaleSyncGroup('zr-same');
    expect(a).toBe(b);
  });

  it('publishes a store-driven range change to other store members', () => {
    const group = getScaleSyncGroup('zr-store-pub');
    const a = makeStore();
    const b = makeStore();
    const ma = group.joinStore(a);
    const mb = group.joinStore(b);

    group.pubFromStore(a, 'x', 25, 75);

    const bx = b.scaleManager.getScale('x');
    expect(bx?.min).toBe(25);
    expect(bx?.max).toBe(75);
    expect(bx?.auto).toBe(false);

    // Source unchanged by its own publish
    const ax = a.scaleManager.getScale('x');
    expect(ax?.min).toBe(0);
    expect(ax?.max).toBe(100);

    group.leave(ma);
    group.leave(mb);
  });

  it('publishes a callback-driven range change to other store members', () => {
    const group = getScaleSyncGroup('zr-cb-pub');
    const cb = vi.fn();
    const store = makeStore();
    const mc = group.joinCallback(cb);
    const ms = group.joinStore(store);

    group.pubFromCallback(cb, 'x', 10, 60);

    const sx = store.scaleManager.getScale('x');
    expect(sx?.min).toBe(10);
    expect(sx?.max).toBe(60);

    // Source callback should NOT receive its own publish
    expect(cb).not.toHaveBeenCalled();

    group.leave(mc);
    group.leave(ms);
  });

  it('after a sync round-trip, the next genuine publish from a recipient still propagates', () => {
    // Regression: previously a WeakSet-based "suppressNext" flag was set on
    // recipients during publish, but the paired pre-advance of
    // _prevScaleRanges prevented the expected echo from ever reaching
    // pubFromStore — so the flag leaked and ate the next genuine pub.
    const group = getScaleSyncGroup('zr-next-pub');
    const a = makeStore();
    const b = makeStore();
    const ma = group.joinStore(a);
    const mb = group.joinStore(b);

    // a publishes 25..75, syncing b. In the real flow b's _prevScaleRanges
    // is pre-advanced so notifyScaleChanges sees no diff and doesn't re-pub.
    group.pubFromStore(a, 'x', 25, 75);
    expect(b.scaleManager.getScale('x')?.min).toBe(25);

    // A genuine later zoom on b must still reach a — no stale suppression.
    group.pubFromStore(b, 'x', 5, 15);
    const ax = a.scaleManager.getScale('x');
    expect(ax?.min).toBe(5);
    expect(ax?.max).toBe(15);

    group.leave(ma);
    group.leave(mb);
  });

  it('per-member dedup: skips a peer whose scale already equals the incoming range', () => {
    const group = getScaleSyncGroup('zr-dedupe');
    const a = makeStore();
    const b = makeStore();
    const ma = group.joinStore(a);
    const mb = group.joinStore(b);

    // Seed both to the same range so the dedup check kicks in.
    group.pubFromStore(a, 'x', 25, 75);
    expect(b.scaleManager.getScale('x')?.auto).toBe(false);

    // Republishing identical values from b: a already equals, so no-op.
    group.pubFromStore(b, 'x', 25, 75);
    // a's scale was unchanged (still {25,75} from first pub, still whatever auto it had)
    expect(a.scaleManager.getScale('x')?.min).toBe(25);
    expect(a.scaleManager.getScale('x')?.max).toBe(75);

    group.leave(ma);
    group.leave(mb);
  });

  it('no-op when only the source is in the group', () => {
    const group = getScaleSyncGroup('zr-solo');
    const a = makeStore();
    const ma = group.joinStore(a);

    expect(() => { group.pubFromStore(a, 'x', 10, 20); }).not.toThrow();

    group.leave(ma);
  });

  it('does not propagate when the incoming scaleId does not exist on a peer', () => {
    const group = getScaleSyncGroup('zr-missing-scale');
    const a = makeStore();
    const b = makeStore();
    const ma = group.joinStore(a);
    const mb = group.joinStore(b);

    // 'nope' is not registered on either store
    group.pubFromStore(a, 'nope', 10, 20);

    // b's 'x' should be unchanged
    const bx = b.scaleManager.getScale('x');
    expect(bx?.min).toBe(0);
    expect(bx?.max).toBe(100);

    group.leave(ma);
    group.leave(mb);
  });
});
