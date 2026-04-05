import { test, expect } from '../../fixtures/demo-page';
import { getChartContainer } from '../../helpers/chart-locators';
import { wheelOnChart } from '../../helpers/interactions';

test.describe('Zoom via mouse wheel', () => {
  test.beforeEach(async ({ demoPage }) => {
    await demoPage.navigateTo('basic-line');
  });

  test('wheel down zooms in', async ({ page }) => {
    const chart = getChartContainer(page);
    const before = await chart.screenshot();

    // Negative deltaY = scroll up = zoom in
    await wheelOnChart(page, 0, -300);

    const after = await chart.screenshot();
    expect(Buffer.compare(before, after)).not.toBe(0);
  });
});
