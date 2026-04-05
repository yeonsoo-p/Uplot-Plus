import type { Page } from '@playwright/test';

/**
 * Wait for the chart canvas to appear and for rendering to stabilize.
 * Waits for the canvas element, then flushes two rAF cycles to ensure
 * the RenderScheduler has completed its draw.
 */
export async function waitForChartRender(page: Page): Promise<void> {
  await page.waitForSelector('canvas', { timeout: 10_000 });
  await page.evaluate(() =>
    new Promise<void>(resolve =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    )
  );
}
