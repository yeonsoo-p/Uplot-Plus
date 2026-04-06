import type { Page, Locator } from '@playwright/test';

/** Locator for the chart interaction container (div with data-testid and tabIndex=0). */
export function getChartContainer(page: Page, nth = 0): Locator {
  return page.locator('[data-testid="chart-container"]').nth(nth);
}

/** Locator for the canvas element inside a chart container. */
export function getCanvas(page: Page, nth = 0): Locator {
  return getChartContainer(page, nth).locator('canvas');
}

/** Tooltip overlay panel. */
export function getTooltip(page: Page): Locator {
  return page.locator('[data-testid="tooltip-panel"]').first();
}

/** Floating legend overlay panel. */
export function getFloatingLegend(page: Page): Locator {
  return page.locator('[data-testid="floating-legend"]').first();
}

/** Legend wrapper div rendered by Legend.tsx. */
export function getLegendWrapper(page: Page, nth = 0): Locator {
  return page.locator('[data-testid="legend"]').nth(nth);
}

/** Individual legend item spans. */
export function getLegendItems(page: Page, nth = 0): Locator {
  return getLegendWrapper(page, nth).locator('[data-testid^="legend-item-"]');
}

/** The demo content area (excludes sidebar and source code). */
export function getDemoContent(page: Page): Locator {
  return page.locator('main');
}

/** Read a scale's min/max from the ChartStore attached to the canvas element. */
export async function getScaleState(
  page: Page,
  scaleId: string,
  nth = 0,
): Promise<{ min: number | null; max: number | null }> {
  const canvas = getCanvas(page, nth);
  return canvas.evaluate((el, id) => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any -- browser context: accessing internal test-only property on DOM element
    const store = (el as any).__chartStore;
    if (!store) throw new Error('No __chartStore on canvas');
    const scale = store.scaleManager.getScale(id);
    if (!scale) throw new Error(`Scale "${id}" not found`);
    return { min: scale.min, max: scale.max };
  }, scaleId);
}
