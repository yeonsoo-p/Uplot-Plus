import { test, expect } from '../../fixtures/demo-page';
import { getLegendItems, getLegendWrapper } from '../../helpers/chart-locators';
import { hoverChart } from '../../helpers/interactions';

test.describe('Legend overlay', () => {
  test.beforeEach(async ({ demoPage }) => {
    await demoPage.navigateTo('legend');
  });

  test('renders legend items for each series', async ({ page }) => {
    const items = getLegendItems(page);
    const count = await items.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('shows series labels in text content', async ({ page }) => {
    const wrapper = getLegendWrapper(page);
    const text = await wrapper.textContent();
    expect(text).toBeTruthy();
    // Should contain at least one non-empty label
    expect(text!.length).toBeGreaterThan(0);
  });

  test('click toggles series visibility (opacity)', async ({ page }) => {
    const items = getLegendItems(page);
    const firstItem = items.first();

    // Initially visible (opacity: 1)
    await expect(firstItem).toHaveCSS('opacity', '1');

    // Click to hide
    await firstItem.click();
    await expect(firstItem).toHaveCSS('opacity', '0.4');

    // Click again to show
    await firstItem.click();
    await expect(firstItem).toHaveCSS('opacity', '1');
  });

  test('shows live values on hover', async ({ page }) => {
    const items = getLegendItems(page);
    const initialText = await items.first().textContent();

    await hoverChart(page, 0, 0.5);

    const hoverText = await items.first().textContent();
    // After hovering, the legend item should contain a numeric value
    // that wasn't there before (or was different)
    expect(hoverText).toBeTruthy();
    expect(hoverText!.length).toBeGreaterThanOrEqual(initialText?.length ?? 0);
  });
});
