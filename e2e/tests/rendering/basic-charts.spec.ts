import { test, expect } from '../../fixtures/demo-page';
import { getChartContainer } from '../../helpers/chart-locators';

test.describe('Basic chart rendering', () => {
  test('basic-line renders canvas with correct dimensions', async ({ demoPage }) => {
    await demoPage.navigateTo('basic-line');

    const canvas = demoPage.canvas();
    await expect(canvas).toBeVisible();

    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(100);
    expect(box!.height).toBeGreaterThan(100);
  });

  test('basic-line visual regression', async ({ demoPage, page }) => {
    await demoPage.navigateTo('basic-line');
    const chart = getChartContainer(page);
    await expect(chart).toHaveScreenshot('basic-line.png');
  });

  test('area-fill visual regression', async ({ demoPage, page }) => {
    await demoPage.navigateTo('area-fill');
    const chart = getChartContainer(page);
    await expect(chart).toHaveScreenshot('area-fill.png');
  });

  test('bar-chart visual regression', async ({ demoPage, page }) => {
    await demoPage.navigateTo('bar-chart');
    const chart = getChartContainer(page);
    await expect(chart).toHaveScreenshot('bar-chart.png');
  });

  test('heatmap visual regression', async ({ demoPage, page }) => {
    await demoPage.navigateTo('heatmap');
    const chart = getChartContainer(page);
    await expect(chart).toHaveScreenshot('heatmap.png');
  });
});
