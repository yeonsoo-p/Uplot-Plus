import { describe, it, expect } from 'vitest';
import { createChartStore } from '@/hooks/useChartStore';

describe('plotBox half-device-pixel snap', () => {
  it('snaps plotBox edges to half-device-pixel boundaries on fractional DPRs', () => {
    const store = createChartStore();
    const canvas = document.createElement('canvas');
    store.canvas = canvas;
    store.pxRatio = 1.25; // Windows 125% scaling — the worst-case fractional DPR
    store.setSize(401, 301, 1.25); // odd CSS dims to force fractional device coords

    // Drive a redraw so plotBox is computed. No series/scales/axes registered,
    // so the no-axes margin branch runs: left=10, top=10, width=381, height=281.
    store.redrawSync();

    // Each edge × pxRatio must land on a multiple of 0.5 device pixels.
    const onHalfPx = (cssEdge: number) => {
      const dev = cssEdge * 1.25;
      return Math.abs(dev - Math.round(dev * 2) / 2) < 1e-6;
    };
    expect(onHalfPx(store.plotBox.left)).toBe(true);
    expect(onHalfPx(store.plotBox.top)).toBe(true);
    expect(onHalfPx(store.plotBox.left + store.plotBox.width)).toBe(true);
    expect(onHalfPx(store.plotBox.top + store.plotBox.height)).toBe(true);
  });

  it('is a no-op on integer DPRs', () => {
    const store = createChartStore();
    const canvas = document.createElement('canvas');
    store.canvas = canvas;
    store.pxRatio = 2;
    store.setSize(401, 301, 2);

    store.redrawSync();

    // No-axes margin branch: integer DPR leaves the box exactly as computed.
    expect(store.plotBox.left).toBe(10);
    expect(store.plotBox.top).toBe(10);
    expect(store.plotBox.width).toBe(381);
    expect(store.plotBox.height).toBe(281);
  });
});

describe('setSize', () => {
  it('updates width and height on the store', () => {
    const store = createChartStore();
    store.setSize(800, 600);
    expect(store.width).toBe(800);
    expect(store.height).toBe(600);
  });

  it('clears renderer cache on resize', () => {
    const store = createChartStore();
    let cleared = false;
    const origClearCache = store.renderer.clearCache.bind(store.renderer);
    store.renderer.clearCache = () => {
      cleared = true;
      origClearCache();
    };

    store.setSize(800, 600);
    expect(cleared).toBe(true);
  });

  it('does not auto-schedule a redraw (caller decides sync vs async)', () => {
    const store = createChartStore();
    let scheduled = false;
    store.scheduleRedraw = () => { scheduled = true; };

    store.setSize(800, 600);
    expect(scheduled).toBe(false);
  });

  it('bails out when dimensions are unchanged', () => {
    const store = createChartStore();
    store.setSize(800, 600);
    let cleared = false;
    store.renderer.clearCache = () => { cleared = true; };

    store.setSize(800, 600);
    expect(cleared).toBe(false);
  });

  it('updates canvas element dimensions if present', () => {
    const store = createChartStore();
    store.pxRatio = 2;

    // Create a mock canvas
    const canvas = document.createElement('canvas');
    store.canvas = canvas;

    store.setSize(400, 300);

    expect(canvas.width).toBe(800);  // 400 * 2
    expect(canvas.height).toBe(600); // 300 * 2
    expect(canvas.style.width).toBe('400px');
    expect(canvas.style.height).toBe('300px');
  });

  it('works without a canvas (no error)', () => {
    const store = createChartStore();
    store.canvas = null;

    // Should not throw
    expect(() => store.setSize(400, 300)).not.toThrow();
    expect(store.width).toBe(400);
    expect(store.height).toBe(300);
  });
});
