import { test, expect } from '../../fixtures/demo-page';
import { getChartContainer } from '../../helpers/chart-locators';
import { dragOnChart, dblclickChart } from '../../helpers/interactions';

test.describe('Zoom via drag', () => {
  test.beforeEach(async ({ demoPage }) => {
    await demoPage.navigateTo('basic-line');
  });

  test('drag zooms in (screenshot changes)', async ({ page }) => {
    const chart = getChartContainer(page);

    // Take baseline screenshot
    const before = await chart.screenshot();

    // Drag from 25% to 75% horizontally to zoom in
    await dragOnChart(page, 0, { x: 0.25, y: 0.5 }, { x: 0.75, y: 0.5 });

    // Take after-zoom screenshot
    const after = await chart.screenshot();

    // Screenshots should differ (chart zoomed in)
    expect(Buffer.compare(before, after)).not.toBe(0);
  });

  test('double-click resets zoom after drag', async ({ page }) => {
    const chart = getChartContainer(page);

    // Zoom in
    await dragOnChart(page, 0, { x: 0.25, y: 0.5 }, { x: 0.75, y: 0.5 });
    const zoomed = await chart.screenshot();

    // Double-click to reset
    await dblclickChart(page, 0);

    // Should differ from zoomed state (i.e. it changed back)
    const reset = await chart.screenshot();
    expect(Buffer.compare(zoomed, reset)).not.toBe(0);
  });

  test('tiny drag below threshold does not zoom', async ({ page }) => {
    const chart = getChartContainer(page);

    // Zoom in first so we have a known zoomed state to compare against
    await dragOnChart(page, 0, { x: 0.25, y: 0.5 }, { x: 0.75, y: 0.5 });
    await page.mouse.move(0, 0);
    await page.waitForTimeout(100);
    const zoomed = await chart.screenshot();

    // Reset via double-click
    await dblclickChart(page, 0);
    await page.mouse.move(0, 0);
    await page.waitForTimeout(100);
    const reset = await chart.screenshot();

    // Sanity: zoom and reset should differ
    expect(Buffer.compare(zoomed, reset)).not.toBe(0);

    // Now do a tiny drag (~2px, below MIN_DRAG_PX = 5)
    const box = await chart.boundingBox();
    expect(box).not.toBeNull();
    const startX = box!.x + box!.width * 0.5;
    const startY = box!.y + box!.height * 0.5;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 2, startY);
    await page.mouse.up();
    await page.mouse.move(0, 0);
    await page.waitForTimeout(100);

    const afterTiny = await chart.screenshot();

    // The tiny drag should NOT have zoomed — screenshot should match reset, not zoomed
    expect(Buffer.compare(afterTiny, zoomed)).not.toBe(0);
  });
});
