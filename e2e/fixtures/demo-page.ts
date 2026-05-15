import { test as base } from '@playwright/test';
import type { Page } from '@playwright/test';
import { waitForChartRender } from '../helpers/wait-for-chart';
import { getChartContainer, getCanvas } from '../helpers/chart-locators';

/**
 * Custom fixture that seeds Math.random for deterministic rendering
 * and provides navigation helpers for the demo app.
 */
export const test = base.extend<{ demoPage: DemoPage }>({
  demoPage: async ({ page }, use) => {
    // Seed Math.random before any page script runs for deterministic charts
    await page.addInitScript(() => {
      let seed = 42;
      Math.random = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };
    });

    // Hide the source-code side panel so the chart fills the full main column.
    // Otherwise visual snapshots are layout-sensitive to source-panel width.
    await page.addInitScript(() => {
      document.addEventListener('DOMContentLoaded', () => {
        const style = document.createElement('style');
        style.textContent = '[data-testid="source-panel"]{display:none !important;}';
        document.head.appendChild(style);
      }, { once: true });
    });

    const demoPage = new DemoPage(page);
    await use(demoPage);
  },
});

export { expect } from '@playwright/test';

class DemoPage {
  constructor(private page: Page) {}

  /** Navigate to a demo by its hash ID and wait for chart render. */
  async navigateTo(demoId: string) {
    await this.page.goto(`#${demoId}`);
    await waitForChartRender(this.page);
  }

  /** Get the nth chart container locator. */
  chartContainer(nth = 0) {
    return getChartContainer(this.page, nth);
  }

  /** Get the nth canvas locator. */
  canvas(nth = 0) {
    return getCanvas(this.page, nth);
  }
}
