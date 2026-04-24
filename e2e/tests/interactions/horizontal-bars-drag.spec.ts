import { test, expect } from '../../fixtures/demo-page';
import { getScaleState } from '../../helpers/chart-locators';
import { dragOnChart, dblclickChart } from '../../helpers/interactions';

/**
 * Drag/zoom interaction smoke for the horizontal-bars demo.
 *
 * In transposed mode the x-scale is Vertical (categories along screen Y).
 * The default leftDrag → zoomX reaction targets the X data axis regardless of
 * orientation, so a vertical drag should narrow the x-scale.
 */
test.describe('Horizontal bars: drag interactions', () => {
  test.beforeEach(async ({ demoPage }) => {
    await demoPage.navigateTo('horizontal-bars');
  });

  test('vertical drag narrows the x-scale (categories)', async ({ page }) => {
    const baseline = await getScaleState(page, 'x');
    expect(baseline.min).not.toBeNull();
    expect(baseline.max).not.toBeNull();

    // Drag vertically through the middle of the chart (center column, top-third → bottom-third).
    await dragOnChart(page, 0, { x: 0.5, y: 0.25 }, { x: 0.5, y: 0.75 });

    const zoomed = await getScaleState(page, 'x');
    expect(zoomed.min!).toBeGreaterThan(baseline.min!);
    expect(zoomed.max!).toBeLessThan(baseline.max!);
  });

  test('y-scale (values) untouched by zoomX vertical drag', async ({ page }) => {
    const baselineY = await getScaleState(page, 'y');
    await dragOnChart(page, 0, { x: 0.5, y: 0.25 }, { x: 0.5, y: 0.75 });
    const afterY = await getScaleState(page, 'y');
    expect(afterY.min).toBe(baselineY.min);
    expect(afterY.max).toBe(baselineY.max);
  });

  test('double-click resets zoom', async ({ page }) => {
    const baseline = await getScaleState(page, 'x');
    await dragOnChart(page, 0, { x: 0.5, y: 0.25 }, { x: 0.5, y: 0.75 });
    await dblclickChart(page, 0);
    const reset = await getScaleState(page, 'x');
    expect(reset.min).toBe(baseline.min);
    expect(reset.max).toBe(baseline.max);
  });
});
