import { useEffect } from 'react';
import type { ChartStore } from './useChartStore';
import type { SelectState } from '../types/cursor';
import { posToVal, invalidateScaleCache } from '../core/Scale';
import { DirtyFlag } from '../types/common';

interface CoordSource {
  clientX: number;
  clientY: number;
}

/**
 * Hook that attaches mouse/touch listeners to the chart container
 * for cursor tracking, drag-to-zoom selection, wheel zoom, focus mode,
 * pinch zoom, and y-axis drag.
 */
export function useInteraction(
  store: ChartStore,
  containerEl: HTMLDivElement | null,
): void {
  useEffect(() => {
    if (containerEl == null) return;

    const el = containerEl;

    // Interaction state (local to this effect instance)
    let dragStart: { x: number; y: number } | null = null;
    const selectState: SelectState = { show: false, left: 0, top: 0, width: 0, height: 0 };
    let pinchState: { dist: number; midX: number; midY: number } | null = null;
    let axisDrag: { scaleId: string; startY: number; startMin: number; startMax: number } | null = null;

    function getPlotCoords(e: CoordSource): { cx: number; cy: number } | null {
      const rect = el.getBoundingClientRect();
      const plotBox = store.plotBox;
      const cx = e.clientX - rect.left - plotBox.left;
      const cy = e.clientY - rect.top - plotBox.top;
      return { cx, cy };
    }

    function isInPlot(cx: number, cy: number): boolean {
      const plotBox = store.plotBox;
      return cx >= 0 && cx <= plotBox.width && cy >= 0 && cy <= plotBox.height;
    }

    function hitTestAxis(clientX: number, clientY: number): { scaleId: string; ori: number } | null {
      const rect = el.getBoundingClientRect();
      const localX = clientX - rect.left;
      const localY = clientY - rect.top;
      const plotBox = store.plotBox;

      for (const axState of store.axisStates) {
        const cfg = axState.config;
        const side = cfg.side;
        const size = axState._size;
        if (size <= 0) continue;

        const inVert = localY >= plotBox.top && localY <= plotBox.top + plotBox.height;
        const inHoriz = localX >= plotBox.left && localX <= plotBox.left + plotBox.width;
        const inAxis =
          (side === 3 && localX < plotBox.left && inVert) ||
          (side === 1 && localX > plotBox.left + plotBox.width && inVert) ||
          (side === 0 && localY < plotBox.top && inHoriz) ||
          (side === 2 && localY > plotBox.top + plotBox.height && inHoriz);

        if (inAxis) {
          const ori = (side === 0 || side === 2) ? 0 : 1;
          return { scaleId: cfg.scale, ori };
        }
      }
      return null;
    }

    function handleMove(e: CoordSource): void {
      // Handle y-axis drag
      if (axisDrag != null) {
        const rect = el.getBoundingClientRect();
        const localY = e.clientY - rect.top;
        const plotBox = store.plotBox;
        const deltaFrac = (localY - axisDrag.startY) / plotBox.height;
        const range = axisDrag.startMax - axisDrag.startMin;

        const scale = store.scaleManager.getScale(axisDrag.scaleId);
        if (scale != null) {
          scale.min = axisDrag.startMin + deltaFrac * range;
          scale.max = axisDrag.startMax + deltaFrac * range;
          scale.auto = false;
          invalidateScaleCache(scale);
          store.renderer.clearCache();
          store.scheduleRedraw();
        }
        return;
      }

      const coords = getPlotCoords(e);
      if (coords == null) return;

      const { cx, cy } = coords;

      if (!isInPlot(cx, cy) && dragStart == null) {
        store.cursorManager.hide();
        if (store.focusedSeries != null) {
          store.setFocus(null);
        }
        store.scheduleCursorRedraw();
        return;
      }

      // Update cursor
      store.cursorManager.update(
        cx,
        cy,
        store.plotBox,
        store.dataStore.data,
        store.seriesConfigs,
        (id) => store.scaleManager.getScale(id),
        (gi) => store.dataStore.getWindow(gi),
        (gi) => store.scaleManager.getGroupXScaleKey(gi),
      );

      // Focus mode: auto-trigger on hover proximity
      if (store.focusAlpha < 1) {
        const cursor = store.cursorManager.state;
        if (cursor.activeGroup >= 0 && cursor.activeSeriesIdx >= 0) {
          const idx = store.seriesConfigs.findIndex(
            s => s.group === cursor.activeGroup && s.index === cursor.activeSeriesIdx,
          );
          if (idx >= 0 && store.focusedSeries !== idx) {
            store.focusedSeries = idx;
            store.renderer.clearCache();
            store.scheduleRedraw();
          }
        }
      }

      // Update selection during drag
      if (dragStart != null) {
        const startX = dragStart.x;
        const plotBox = store.plotBox;
        const clampedCx = Math.max(0, Math.min(cx, plotBox.width));

        selectState.show = true;
        selectState.left = Math.min(startX, clampedCx);
        selectState.top = 0;
        selectState.width = Math.abs(clampedCx - startX);
        selectState.height = plotBox.height;

        store.selectState = selectState;
      }

      // Cursor move (and optional drag) only needs cursor+select redraw
      if (dragStart != null) {
        store.scheduler.mark(DirtyFlag.Cursor | DirtyFlag.Select);
      } else {
        store.scheduleCursorRedraw();
      }
    }

    function onMouseMove(e: MouseEvent): void {
      handleMove(e);
    }

    function onMouseDown(e: MouseEvent): void {
      if (e.button !== 0) return;

      // Check for axis gutter hit
      const axisHit = hitTestAxis(e.clientX, e.clientY);
      if (axisHit != null && axisHit.ori === 1) {
        const scale = store.scaleManager.getScale(axisHit.scaleId);
        if (scale != null && scale.min != null && scale.max != null) {
          const rect = el.getBoundingClientRect();
          axisDrag = {
            scaleId: axisHit.scaleId,
            startY: e.clientY - rect.top,
            startMin: scale.min,
            startMax: scale.max,
          };
          e.preventDefault();
          return;
        }
      }

      const coords = getPlotCoords(e);
      if (coords == null) return;
      if (!isInPlot(coords.cx, coords.cy)) return;

      dragStart = { x: coords.cx, y: coords.cy };

      // Reset selection
      selectState.show = false;
      selectState.left = 0;
      selectState.width = 0;
      store.selectState = selectState;
    }

    function handleUp(_e: CoordSource): void {
      // Handle axis drag end
      if (axisDrag != null) {
        axisDrag = null;
        return;
      }

      if (dragStart == null) return;

      // Minimum drag width to trigger zoom (5 CSS pixels)
      if (selectState.width > 5) {
        applyZoom(selectState);
      }

      // Clear selection
      dragStart = null;
      selectState.show = false;
      selectState.left = 0;
      selectState.width = 0;
      store.selectState = selectState;
      store.scheduleRedraw();
    }

    function onMouseUp(e: MouseEvent): void {
      handleUp(e);
    }

    function onMouseLeave(_e: MouseEvent): void {
      store.cursorManager.hide();

      if (store.focusedSeries != null) {
        store.setFocus(null);
      }

      if (dragStart != null) {
        dragStart = null;
        selectState.show = false;
        selectState.width = 0;
        store.selectState = selectState;
      }

      if (axisDrag != null) {
        axisDrag = null;
      }

      store.scheduleCursorRedraw();
    }

    function onDblClick(_e: MouseEvent): void {
      // Restore each scale to its original declarative state from React props,
      // rather than blindly setting auto=true. This preserves auto={false} scales
      // (e.g., Heatmap, BoxWhisker) that have explicit min/max.
      for (const cfg of store.scaleConfigs) {
        store.scaleManager.addScale(cfg);
      }
      store.renderer.clearCache();
      store.scheduleRedraw();
    }

    function onWheel(e: WheelEvent): void {
      if (!store.wheelZoom) return;

      const coords = getPlotCoords(e);
      if (coords == null) return;
      if (!isInPlot(coords.cx, coords.cy)) return;

      e.preventDefault();

      const factor = Math.max(0.1, Math.min(10, 1 - e.deltaY * 0.001));
      const plotBox = store.plotBox;

      for (const scale of store.scaleManager.getAllScales()) {
        if (scale.ori !== 0) continue;
        if (scale.min == null || scale.max == null) continue;

        const cursorVal = posToVal(coords.cx + plotBox.left, scale, plotBox.width, plotBox.left);
        const newMin = cursorVal - (cursorVal - scale.min) * factor;
        const newMax = cursorVal + (scale.max - cursorVal) * factor;

        scale.min = Math.min(newMin, newMax);
        scale.max = Math.max(newMin, newMax);
        scale.auto = false;
        invalidateScaleCache(scale);
      }

      store.renderer.clearCache();
      store.scheduleRedraw();
    }

    function applyZoom(sel: SelectState): void {
      const plotBox = store.plotBox;
      const fracLeft = sel.left / plotBox.width;
      const fracRight = (sel.left + sel.width) / plotBox.width;

      for (const scale of store.scaleManager.getAllScales()) {
        if (scale.ori !== 0) continue;
        if (scale.min == null || scale.max == null) continue;

        const newMin = posToVal(
          plotBox.left + fracLeft * plotBox.width,
          scale,
          plotBox.width,
          plotBox.left,
        );
        const newMax = posToVal(
          plotBox.left + fracRight * plotBox.width,
          scale,
          plotBox.width,
          plotBox.left,
        );

        scale.min = Math.min(newMin, newMax);
        scale.max = Math.max(newMin, newMax);
        scale.auto = false;
        invalidateScaleCache(scale);
      }

      store.renderer.clearCache();
    }

    // Touch support
    function onTouchStart(e: TouchEvent): void {
      if (e.touches.length === 2) {
        const t0 = e.touches[0] as Touch;
        const t1 = e.touches[1] as Touch;
        const dx = t1.clientX - t0.clientX;
        const dy = t1.clientY - t0.clientY;
        pinchState = {
          dist: Math.sqrt(dx * dx + dy * dy),
          midX: (t0.clientX + t1.clientX) / 2,
          midY: (t0.clientY + t1.clientY) / 2,
        };
        dragStart = null;
        return;
      }

      const touch = e.touches[0];
      if (touch == null) return;

      const coords = getPlotCoords(touch);
      if (coords == null) return;
      if (!isInPlot(coords.cx, coords.cy)) return;

      dragStart = { x: coords.cx, y: coords.cy };
    }

    function onTouchMove(e: TouchEvent): void {
      // Pinch zoom
      if (e.touches.length === 2 && pinchState != null) {
        e.preventDefault();
        const t0 = e.touches[0] as Touch;
        const t1 = e.touches[1] as Touch;
        const dx = t1.clientX - t0.clientX;
        const dy = t1.clientY - t0.clientY;
        const newDist = Math.sqrt(dx * dx + dy * dy);
        const factor = newDist / pinchState.dist;

        const rect = el.getBoundingClientRect();
        const plotBox = store.plotBox;
        const midCx = pinchState.midX - rect.left - plotBox.left;

        for (const scale of store.scaleManager.getAllScales()) {
          if (scale.ori !== 0) continue;
          if (scale.min == null || scale.max == null) continue;

          const cursorVal = posToVal(midCx + plotBox.left, scale, plotBox.width, plotBox.left);
          const newMin = cursorVal - (cursorVal - scale.min) / factor;
          const newMax = cursorVal + (scale.max - cursorVal) / factor;

          scale.min = Math.min(newMin, newMax);
          scale.max = Math.max(newMin, newMax);
          scale.auto = false;
          invalidateScaleCache(scale);
        }

        pinchState.dist = newDist;
        store.renderer.clearCache();
        store.scheduleRedraw();
        return;
      }

      const touch = e.touches[0];
      if (touch == null) return;

      // Reuse shared move logic directly instead of synthesizing a MouseEvent
      handleMove(touch);

      // Prevent scroll while dragging in chart
      if (dragStart != null) {
        e.preventDefault();
      }
    }

    function onTouchEnd(e: TouchEvent): void {
      if (pinchState != null) {
        pinchState = null;
        return;
      }

      const touch = e.changedTouches[0];
      if (touch == null) return;

      handleUp(touch);
    }

    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('mouseup', onMouseUp);
    el.addEventListener('mouseleave', onMouseLeave);
    el.addEventListener('dblclick', onDblClick);
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);

    return () => {
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('mouseleave', onMouseLeave);
      el.removeEventListener('dblclick', onDblClick);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [store, containerEl]);
}
