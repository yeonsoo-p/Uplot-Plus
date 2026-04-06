import { test, expect } from '../../fixtures/demo-page';
import { getChartContainer, getScaleState } from '../../helpers/chart-locators';
import { dragOnChart, dblclickChart } from '../../helpers/interactions';

test.describe('Zoom via drag', () => {
  test.beforeEach(async ({ demoPage }) => {
    await demoPage.navigateTo('basic-line');
  });

  test('drag zooms in (x-scale narrows)', async ({ page }) => {
    const chart = getChartContainer(page);

    // Capture baseline
    const before = await chart.screenshot();
    const baseline = await getScaleState(page, 'x');

    // Drag from 25% to 75% horizontally to zoom in
    await dragOnChart(page, 0, { x: 0.25, y: 0.5 }, { x: 0.75, y: 0.5 });

    const after = await chart.screenshot();
    const zoomed = await getScaleState(page, 'x');

    // Scale range should have narrowed
    expect(zoomed.min).toBeGreaterThan(baseline.min!);
    expect(zoomed.max).toBeLessThan(baseline.max!);

    // Visual sanity: screenshot should also differ
    expect(Buffer.compare(before, after)).not.toBe(0);
  });

  test('double-click resets zoom to baseline', async ({ page }) => {
    // Capture baseline scale state
    const baseline = await getScaleState(page, 'x');

    // Zoom in
    await dragOnChart(page, 0, { x: 0.25, y: 0.5 }, { x: 0.75, y: 0.5 });
    const zoomed = await getScaleState(page, 'x');

    // Verify zoom occurred
    expect(zoomed.min).toBeGreaterThan(baseline.min!);
    expect(zoomed.max).toBeLessThan(baseline.max!);

    // Double-click to reset
    await dblclickChart(page, 0);
    const reset = await getScaleState(page, 'x');

    // Scale should be restored to baseline
    expect(reset.min).toBe(baseline.min);
    expect(reset.max).toBe(baseline.max);
  });

  test('tiny drag below threshold does not zoom', async ({ page }) => {
    const chart = getChartContainer(page);

    // Zoom in then reset to establish a known state
    await dragOnChart(page, 0, { x: 0.25, y: 0.5 }, { x: 0.75, y: 0.5 });
    await dblclickChart(page, 0);
    const resetScale = await getScaleState(page, 'x');

    // Do a tiny drag (~2px, below MIN_DRAG_PX = 5)
    const box = await chart.boundingBox();
    expect(box).not.toBeNull();
    const startX = box!.x + box!.width * 0.5;
    const startY = box!.y + box!.height * 0.5;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 2, startY);
    await page.mouse.up();
    await page.waitForTimeout(150);

    // Scale should be unchanged
    const afterTiny = await getScaleState(page, 'x');
    expect(afterTiny.min).toBe(resetScale.min);
    expect(afterTiny.max).toBe(resetScale.max);
  });
});
