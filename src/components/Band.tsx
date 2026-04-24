import { useRef } from 'react';
import type { BandConfig } from '../types/bands';
import { useRegisterConfig } from '../hooks/useRegisterConfig';

/**
 * Renderless component that registers a band config with the chart store.
 * A band fills the area between two series.
 *
 * Identity is the bound series pair + group — changing those remounts the
 * band; fill/dir changes go through update-in-place.
 */
export function Band({ series, group, fill, dir }: BandConfig): null {
  const registeredRef = useRef<BandConfig | null>(null);
  const s0 = series[0];
  const s1 = series[1];
  const cfg: BandConfig = { series: [s0, s1], group, fill, dir };

  useRegisterConfig(
    cfg,
    [s0, s1, group],
    (store, c) => {
      registeredRef.current = c;
      store.registerBand(c);
    },
    (store) => {
      if (registeredRef.current != null) {
        store.unregisterBand(registeredRef.current);
        registeredRef.current = null;
      }
    },
    (store, c) => {
      const prev = registeredRef.current;
      if (prev == null) return;
      store.updateBand(prev, c);
      registeredRef.current = c;
    },
  );
  return null;
}
