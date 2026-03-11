import { useEffect, useRef } from 'react';
import type { BandConfig } from '../types/bands';
import { useChart } from '../hooks/useChart';

/**
 * Renderless component that registers a band config with the chart store.
 * A band fills the area between two series.
 *
 * Uses a mount/update split: registers once on mount, replaces config immutably on prop changes.
 * Destructures series tuple to primitives for stable dependency comparison.
 */
export function Band({ series, group, fill, dir }: BandConfig): null {
  const store = useChart();
  const cfgRef = useRef<BandConfig | null>(null);

  // Destructure tuple to primitives for stable deps
  const s0 = series[0];
  const s1 = series[1];

  // Mount effect: register once
  useEffect(() => {
    const cfg: BandConfig = { series: [s0, s1], group, fill, dir };
    cfgRef.current = cfg;
    store.bandConfigs.push(cfg);
    store.scheduleRedraw();

    return () => {
      store.bandConfigs = store.bandConfigs.filter(b => b !== cfgRef.current);
      cfgRef.current = null;
      store.scheduleRedraw();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount/update split: fill and dir are handled by the update effect below
  }, [store, s0, s1, group]);

  // Update effect: replace config immutably when fill/dir change
  useEffect(() => {
    if (cfgRef.current == null) return;
    const updated: BandConfig = { ...cfgRef.current, fill, dir };
    store.bandConfigs = store.bandConfigs.map(b => b === cfgRef.current ? updated : b);
    cfgRef.current = updated;
    store.scheduleRedraw();
  }, [store, fill, dir]);

  return null;
}
