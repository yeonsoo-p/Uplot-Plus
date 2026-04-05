import { test, expect } from '../../fixtures/demo-page';
import { getChartContainer } from '../../helpers/chart-locators';

test.describe('Dark mode', () => {
  test('toggle dark mode changes html class', async ({ demoPage, page }) => {
    await demoPage.navigateTo('basic-line');

    // Clear any persisted theme preference
    await page.evaluate(() => localStorage.removeItem('uplot-demo-theme'));
    await page.reload();
    await page.waitForSelector('canvas');

    // Should start in light mode
    const htmlEl = page.locator('html');
    await expect(htmlEl).not.toHaveClass(/dark/);

    // Click dark mode toggle button (identified by title attribute)
    const toggleBtn = page.locator('button[title="Dark mode"]');
    await toggleBtn.click();
    await page.waitForTimeout(200);

    // HTML should now have 'dark' class
    await expect(htmlEl).toHaveClass(/dark/);
  });

  test('dark mode changes chart appearance', async ({ demoPage, page }) => {
    await demoPage.navigateTo('basic-line');

    // Clear theme and reload for clean state
    await page.evaluate(() => localStorage.removeItem('uplot-demo-theme'));
    await page.reload();
    await page.waitForSelector('canvas');

    const chart = getChartContainer(page);
    const lightScreenshot = await chart.screenshot();

    // Toggle dark mode
    const toggleBtn = page.locator('button[title="Dark mode"]');
    await toggleBtn.click();
    await page.waitForTimeout(300);

    const darkScreenshot = await chart.screenshot();

    // Screenshots should differ (different theme colors)
    expect(Buffer.compare(lightScreenshot, darkScreenshot)).not.toBe(0);
  });

  test('dark mode persists across navigation', async ({ demoPage, page }) => {
    await demoPage.navigateTo('basic-line');

    // Enable dark mode
    await page.evaluate(() => localStorage.removeItem('uplot-demo-theme'));
    await page.reload();
    await page.waitForSelector('canvas');

    const toggleBtn = page.locator('button[title="Dark mode"]');
    await toggleBtn.click();
    await page.waitForTimeout(200);

    // Navigate to another demo
    await demoPage.navigateTo('area-fill');

    // Dark class should still be present
    await expect(page.locator('html')).toHaveClass(/dark/);
  });
});
