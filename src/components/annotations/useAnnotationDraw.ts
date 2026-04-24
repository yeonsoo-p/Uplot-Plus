import { useLayoutEffect, useRef } from 'react';
import { useDrawHook } from '../../hooks/useDrawHook';
import type { DrawContext } from '../../types/hooks';

/**
 * Shared hook for annotation components. Keeps a `propsRef` current so the
 * draw callback always sees the latest props, and registers the draw hook.
 * Scale lookups are the caller's responsibility — callers can use
 * `dc.getScale(id)` for single-scale annotations or `dc.project(...)` /
 * multiple `getScale` calls for two-scale annotations.
 */
export function useAnnotationDraw<T>(
  props: T,
  draw: (dc: DrawContext, props: T) => void,
): void {
  const propsRef = useRef(props);
  useLayoutEffect(() => { propsRef.current = props; }, [props]);
  useDrawHook((dc) => draw(dc, propsRef.current));
}
