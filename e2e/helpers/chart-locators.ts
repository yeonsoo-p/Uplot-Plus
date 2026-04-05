import type { Page, Locator } from '@playwright/test';

/**
 * Locator for the chart interaction container (div with cursor:crosshair and tabIndex=0).
 * This is the div that receives mouse events in Chart.tsx.
 */
export function getChartContainer(page: Page, nth = 0): Locator {
  return page.locator('div[tabindex="0"][style*="cursor: crosshair"]').nth(nth);
}

/** Locator for the canvas element inside a chart container. */
export function getCanvas(page: Page, nth = 0): Locator {
  return getChartContainer(page, nth).locator('canvas');
}

/** Tooltip overlay (zIndex: 100, pointer-events: none). */
export function getTooltip(page: Page): Locator {
  return page.locator('div[style*="pointer-events: none"][style*="z-index"]').first();
}

/** Floating legend overlay (zIndex: 50). */
export function getFloatingLegend(page: Page): Locator {
  return page.locator('div[style*="z-index: 50"]').first();
}

/** Legend wrapper div (flex-wrap container rendered by Legend.tsx). */
export function getLegendWrapper(page: Page, nth = 0): Locator {
  return page.locator('div[style*="flex-wrap: wrap"][style*="justify-content: center"]').nth(nth);
}

/** Individual legend item spans (clickable, with cursor:pointer). */
export function getLegendItems(page: Page, nth = 0): Locator {
  return getLegendWrapper(page, nth).locator('span[style*="cursor: pointer"]');
}

/** The demo content area (excludes sidebar and source code). */
export function getDemoContent(page: Page): Locator {
  return page.locator('main');
}
