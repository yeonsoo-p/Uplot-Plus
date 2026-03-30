import type { AxisConfig } from '../types';
import { Side } from '../types';
import { useRegisterConfig } from '../hooks/useRegisterConfig';

export type AxisProps = Omit<AxisConfig, 'side'> & { side?: Side };

function resolveAxis(p: AxisProps): AxisConfig {
  return { ...p, side: p.side ?? (p.scale === 'x' ? Side.Bottom : Side.Left), show: p.show ?? true };
}

/**
 * Renderless component that registers an axis config with the chart store.
 * Must be a child of <Chart>.
 */
export function Axis(props: AxisProps): null {
  const resolved = resolveAxis(props);

  useRegisterConfig(
    resolved,
    [resolved.scale, resolved.side],
    (store, cfg) => {
      store.axisConfigs = store.axisConfigs.filter(a => !(a.scale === cfg.scale && a.side === cfg.side));
      store.axisConfigs.push(cfg);
    },
    (store, cfg) => {
      store.axisConfigs = store.axisConfigs.filter(a => !(a.scale === cfg.scale && a.side === cfg.side));
    },
    (store, cfg) => {
      store.axisConfigs = store.axisConfigs.map(a =>
        (a.scale === cfg.scale && a.side === cfg.side) ? cfg : a,
      );
    },
  );
  return null;
}
