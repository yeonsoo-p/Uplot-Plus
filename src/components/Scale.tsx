import type { ScaleConfig } from '../types';
import { useRegisterConfig } from '../hooks/useRegisterConfig';

export type ScaleProps = ScaleConfig;

/**
 * Renderless component that registers a scale config with the chart store.
 * Must be a child of <Chart>.
 */
export function Scale(props: ScaleProps): null {
  useRegisterConfig(
    { ...props },
    [props.id],
    (store, cfg) => store.registerScale(cfg),
    (store, cfg) => store.unregisterScale(cfg.id),
    (store, cfg) => {
      store.scaleConfigs = store.scaleConfigs.map(s => s.id === cfg.id ? cfg : s);
      store.scaleManager.addScale(cfg);
      store.renderer.clearCache();
    },
  );
  return null;
}
