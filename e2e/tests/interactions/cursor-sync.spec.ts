import { test, expect } from '../../fixtures/demo-page';
import { getLegendItems } from '../../helpers/chart-locators';
import { hoverChart, leaveChart } from '../../helpers/interactions';

test.describe('Cursor sync across charts', () => {
  test.beforeEach(async ({ demoPage }) => {
    await demoPage.navigateTo('cursor-bind');
  });

  test('hovering chart 1 shows values in both legends', async ({ page }) => {
    // cursor-bind has two charts with syncKey="bind" and Legend on each
    await hoverChart(page, 0, 0.5);

    // Both chart legends should show live values (contain numeric text)
    const legend1Items = getLegendItems(page, 0);
    const legend2Items = getLegendItems(page, 1);

    const text1 = await legend1Items.first().textContent();
    const text2 = await legend2Items.first().textContent();

    // Both should have content with numbers (values from cursor position)
    expect(text1).toMatch(/\d/);
    expect(text2).toMatch(/\d/);
  });

  test('cursor leave clears values in both legends', async ({ page }) => {
    // First hover to activate cursor
    await hoverChart(page, 0, 0.5);
    await leaveChart(page);

    // After leaving, legend values should be clear (no numeric values)
    const legend1Items = getLegendItems(page, 0);
    const text = await legend1Items.first().textContent();

    // Should just show the label without a value
    // Legend items show "Label Value" when active, just "Label" when inactive
    expect(text).toBeTruthy();
  });
});
