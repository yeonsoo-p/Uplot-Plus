import { test, expect } from '../../fixtures/demo-page';

test.describe('Large dataset rendering', () => {
  test('2M points loads without crash', async ({ demoPage }) => {
    test.setTimeout(60_000);

    await demoPage.navigateTo('large-dataset');

    const canvas = demoPage.canvas();
    await expect(canvas).toBeVisible({ timeout: 30_000 });

    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(0);
    expect(box!.height).toBeGreaterThan(0);
  });
});
