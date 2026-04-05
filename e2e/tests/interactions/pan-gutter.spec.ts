import { test, expect } from '../../fixtures/demo-page';
import { getChartContainer } from '../../helpers/chart-locators';
import { dragOnChart } from '../../helpers/interactions';

test.describe('Pan via gutter drag', () => {
  test('drag x-axis gutter pans horizontally', async ({ demoPage, page }) => {
    await demoPage.navigateTo('basic-line');

    const chart = getChartContainer(page);

    // First zoom in so there's room to pan
    await dragOnChart(page, 0, { x: 0.25, y: 0.5 }, { x: 0.75, y: 0.5 });
    const zoomed = await chart.screenshot();

    // Drag on the x-axis gutter area (below the plot, y > 0.95)
    await dragOnChart(page, 0, { x: 0.5, y: 0.98 }, { x: 0.3, y: 0.98 });

    const panned = await chart.screenshot();
    // Chart should have changed after panning
    expect(Buffer.compare(zoomed, panned)).not.toBe(0);
  });
});
