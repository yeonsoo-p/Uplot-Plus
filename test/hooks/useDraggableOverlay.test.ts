import { describe, it, expect } from 'vitest';
import {
  resolveInitialPos,
  computeCursorPos,
  clampToBounds,
  CORNER_PAD,
} from '@/hooks/useDraggableOverlay';

const plotBox = { left: 50, top: 20, width: 700, height: 560 };

// ---- resolveInitialPos ----

describe('resolveInitialPos', () => {
  const panelW = 120;
  const panelH = 80;

  it('returns exact coordinates for object position', () => {
    expect(resolveInitialPos({ x: 100, y: 200 }, plotBox, panelW, panelH)).toEqual({ x: 100, y: 200 });
  });

  it('top-left: inside plot with padding', () => {
    expect(resolveInitialPos('top-left', plotBox, panelW, panelH)).toEqual({
      x: plotBox.left + CORNER_PAD,
      y: plotBox.top + CORNER_PAD,
    });
  });

  it('top-right: accounts for panel width', () => {
    expect(resolveInitialPos('top-right', plotBox, panelW, panelH)).toEqual({
      x: plotBox.left + plotBox.width - panelW - CORNER_PAD,
      y: plotBox.top + CORNER_PAD,
    });
  });

  it('bottom-left: accounts for panel height', () => {
    expect(resolveInitialPos('bottom-left', plotBox, panelW, panelH)).toEqual({
      x: plotBox.left + CORNER_PAD,
      y: plotBox.top + plotBox.height - panelH - CORNER_PAD,
    });
  });

  it('bottom-right: accounts for both dimensions', () => {
    expect(resolveInitialPos('bottom-right', plotBox, panelW, panelH)).toEqual({
      x: plotBox.left + plotBox.width - panelW - CORNER_PAD,
      y: plotBox.top + plotBox.height - panelH - CORNER_PAD,
    });
  });

  it('defaults to top-right for undefined', () => {
    expect(resolveInitialPos(undefined, plotBox, panelW, panelH))
      .toEqual(resolveInitialPos('top-right', plotBox, panelW, panelH));
  });

  it('handles zero panel dimensions (first render)', () => {
    const pos = resolveInitialPos('bottom-right', plotBox, 0, 0);
    expect(pos).toEqual({
      x: plotBox.left + plotBox.width - CORNER_PAD,
      y: plotBox.top + plotBox.height - CORNER_PAD,
    });
  });
});

// ---- computeCursorPos ----

describe('computeCursorPos', () => {
  const pL = 50, pT = 20, pW = 700, pH = 560;
  const panelW = 100, panelH = 60;

  it('returns cursor + offset when centered', () => {
    const pos = computeCursorPos(350, 280, pL, pT, pW, pH, 12, -12, panelW, panelH);
    expect(pos).not.toBeNull();
    expect(pos!.x).toBe(350 + 50 + 12);
    expect(pos!.y).toBe(280 + 20 - 12);
  });

  it('returns null when cursor is off-chart (left < 0)', () => {
    expect(computeCursorPos(-1, 280, pL, pT, pW, pH, 12, -12, panelW, panelH)).toBeNull();
  });

  it('clamps to right edge of plot', () => {
    const pos = computeCursorPos(690, 280, pL, pT, pW, pH, 12, -12, panelW, panelH);
    expect(pos).not.toBeNull();
    // Right edge: pL + pW - panelW = 50 + 700 - 100 = 650
    expect(pos!.x).toBeLessThanOrEqual(pL + pW - panelW);
  });

  it('clamps to left edge of plot', () => {
    const pos = computeCursorPos(0, 280, pL, pT, pW, pH, -200, 0, panelW, panelH);
    expect(pos).not.toBeNull();
    expect(pos!.x).toBe(pL);
  });

  it('clamps to top edge of plot', () => {
    const pos = computeCursorPos(350, 0, pL, pT, pW, pH, 0, -200, panelW, panelH);
    expect(pos).not.toBeNull();
    expect(pos!.y).toBe(pT);
  });

  it('clamps to bottom edge of plot', () => {
    const pos = computeCursorPos(350, 560, pL, pT, pW, pH, 0, 200, panelW, panelH);
    expect(pos).not.toBeNull();
    expect(pos!.y).toBeLessThanOrEqual(pT + pH - panelH);
  });
});

// ---- clampToBounds ----

describe('clampToBounds', () => {
  const pL = 50, pT = 20, pW = 700, pH = 560;
  const w = 100, h = 60;

  it('returns same reference when already in bounds', () => {
    const pos = { x: 200, y: 200 };
    const result = clampToBounds(pos, pL, pT, pW, pH, w, h);
    expect(result).toBe(pos);
  });

  it('clamps x to left boundary', () => {
    const result = clampToBounds({ x: 10, y: 200 }, pL, pT, pW, pH, w, h);
    expect(result.x).toBe(pL);
    expect(result.y).toBe(200);
  });

  it('clamps x to right boundary', () => {
    const result = clampToBounds({ x: 800, y: 200 }, pL, pT, pW, pH, w, h);
    expect(result.x).toBe(pL + pW - w);
  });

  it('clamps y to top boundary', () => {
    const result = clampToBounds({ x: 200, y: 5 }, pL, pT, pW, pH, w, h);
    expect(result.y).toBe(pT);
  });

  it('clamps y to bottom boundary', () => {
    const result = clampToBounds({ x: 200, y: 600 }, pL, pT, pW, pH, w, h);
    expect(result.y).toBe(pT + pH - h);
  });

  it('clamps both axes simultaneously', () => {
    const result = clampToBounds({ x: 0, y: 0 }, pL, pT, pW, pH, w, h);
    expect(result).toEqual({ x: pL, y: pT });
  });
});
