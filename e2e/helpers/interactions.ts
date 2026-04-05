import type { Page } from '@playwright/test';
import { getChartContainer } from './chart-locators';

interface FracPosition {
  x: number; // 0..1 fraction of chart width
  y: number; // 0..1 fraction of chart height
}

async function getChartBox(page: Page, nth: number) {
  const container = getChartContainer(page, nth);
  const box = await container.boundingBox();
  if (!box) throw new Error(`Chart container ${nth} not found or not visible`);
  return box;
}

/**
 * Hover the chart at a fractional position (0..1).
 */
export async function hoverChart(
  page: Page,
  nth: number,
  fracX: number,
  fracY = 0.5,
): Promise<void> {
  const box = await getChartBox(page, nth);
  await page.mouse.move(
    box.x + box.width * fracX,
    box.y + box.height * fracY,
  );
  // Small wait for cursor update + rAF redraw
  await page.waitForTimeout(100);
}

/**
 * Drag on the chart from one fractional position to another.
 * Simulates a left-button drag for zoom selection.
 */
export async function dragOnChart(
  page: Page,
  nth: number,
  from: FracPosition,
  to: FracPosition,
): Promise<void> {
  const box = await getChartBox(page, nth);
  const x1 = box.x + box.width * from.x;
  const y1 = box.y + box.height * from.y;
  const x2 = box.x + box.width * to.x;
  const y2 = box.y + box.height * to.y;

  await page.mouse.move(x1, y1);
  await page.mouse.down();
  // Move in steps so the chart recognizes the drag (MIN_DRAG_PX = 5)
  await page.mouse.move(x2, y2, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(150);
}

/**
 * Fire a wheel event on the chart at a fractional x position.
 */
export async function wheelOnChart(
  page: Page,
  nth: number,
  deltaY: number,
  fracX = 0.5,
): Promise<void> {
  const box = await getChartBox(page, nth);
  await page.mouse.move(
    box.x + box.width * fracX,
    box.y + box.height * 0.5,
  );
  await page.mouse.wheel(0, deltaY);
  await page.waitForTimeout(150);
}

/**
 * Double-click the chart center to reset zoom.
 */
export async function dblclickChart(page: Page, nth: number): Promise<void> {
  const container = getChartContainer(page, nth);
  await container.dblclick();
  await page.waitForTimeout(150);
}

/**
 * Move the mouse outside of the chart to clear cursor state.
 */
export async function leaveChart(page: Page): Promise<void> {
  // Move to top-left corner of the page (outside any chart)
  await page.mouse.move(0, 0);
  await page.waitForTimeout(100);
}
