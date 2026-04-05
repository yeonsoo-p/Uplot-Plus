import { test, expect } from '../../fixtures/demo-page';
import { getTooltip } from '../../helpers/chart-locators';
import { hoverChart, leaveChart } from '../../helpers/interactions';

test.describe('Tooltip overlay', () => {
  test.beforeEach(async ({ demoPage }) => {
    await demoPage.navigateTo('cursor-tooltip');
  });

  test('tooltip hidden when cursor is outside chart', async ({ page }) => {
    const tooltip = getTooltip(page);
    await expect(tooltip).not.toBeVisible();
  });

  test('tooltip appears on hover', async ({ page }) => {
    await hoverChart(page, 0, 0.5);

    const tooltip = getTooltip(page);
    await expect(tooltip).toBeVisible();
  });

  test('tooltip contains series label text', async ({ page }) => {
    await hoverChart(page, 0, 0.5);

    const tooltip = getTooltip(page);
    const text = await tooltip.textContent();
    expect(text).toBeTruthy();
    // Tooltip should contain at least some numeric value
    expect(text).toMatch(/\d/);
  });

  test('tooltip follows cursor horizontally', async ({ page }) => {
    await hoverChart(page, 0, 0.25);
    const tooltip = getTooltip(page);
    const box1 = await tooltip.boundingBox();

    await hoverChart(page, 0, 0.75);
    const box2 = await tooltip.boundingBox();

    expect(box1).not.toBeNull();
    expect(box2).not.toBeNull();
    // Tooltip should have moved right
    expect(box2!.x).toBeGreaterThan(box1!.x);
  });

  test('tooltip disappears when cursor leaves', async ({ page }) => {
    await hoverChart(page, 0, 0.5);
    const tooltip = getTooltip(page);
    await expect(tooltip).toBeVisible();

    await leaveChart(page);
    await expect(tooltip).not.toBeVisible();
  });
});
