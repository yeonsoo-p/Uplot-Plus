import { describe, it, expect } from 'vitest';
import { renderChart, flushEffects } from '../helpers/rtl';
import { Series } from '@/components/Series';
import { Band } from '@/components/Band';

describe('Band registration timing', () => {
  it('registers band config before first redraw (layout effect)', () => {
    const { store } = renderChart(
      {},
      <>
        <Series group={0} index={0} label="S0" stroke="red" />
        <Series group={0} index={1} label="S1" stroke="blue" />
        <Band series={[0, 1]} group={0} fill="rgba(0,0,255,0.1)" />
      </>,
    );
    // Band should be registered immediately (layout effect), not deferred
    expect(store.bandConfigs.length).toBe(1);
    expect(store.bandConfigs[0]!.series).toEqual([0, 1]);
  });

  it('unregisters band on unmount', async () => {
    const { store, unmount } = renderChart(
      {},
      <>
        <Series group={0} index={0} stroke="red" />
        <Series group={0} index={1} stroke="blue" />
        <Band series={[0, 1]} group={0} fill="rgba(0,0,255,0.1)" />
      </>,
    );
    await flushEffects();
    expect(store.bandConfigs.length).toBe(1);
    unmount();
    expect(store.bandConfigs.length).toBe(0);
  });
});
