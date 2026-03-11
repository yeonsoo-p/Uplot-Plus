import { DAY, MONTH, YEAR } from './timeIncrs';

/**
 * Generate tick split positions for a time axis.
 * Aligns splits to round time boundaries (midnight, hour starts, etc.).
 */
export function timeAxisSplits(
  minSec: number,
  maxSec: number,
  incr: number,
  _tz?: string,
): number[] {
  const splits: number[] = [];

  if (incr <= 0 || minSec >= maxSec) return splits;

  let start: number;

  if (incr >= YEAR) {
    // Align to January 1
    const d = new Date(minSec * 1000);
    d.setUTCMonth(0, 1);
    d.setUTCHours(0, 0, 0, 0);
    start = d.getTime() / 1000;
    if (start < minSec) {
      d.setUTCFullYear(d.getUTCFullYear() + 1);
      start = d.getTime() / 1000;
    }
    // For year increments, step by years
    while (start <= maxSec) {
      splits.push(start);
      d.setUTCFullYear(d.getUTCFullYear() + Math.round(incr / YEAR));
      start = d.getTime() / 1000;
    }
    return splits;
  }

  if (incr >= MONTH) {
    // Align to 1st of month
    const d = new Date(minSec * 1000);
    d.setUTCDate(1);
    d.setUTCHours(0, 0, 0, 0);
    start = d.getTime() / 1000;
    const monthStep = Math.max(1, Math.round(incr / MONTH));
    if (start < minSec) {
      d.setUTCMonth(d.getUTCMonth() + 1);
      start = d.getTime() / 1000;
    }
    // Snap to nearest aligned month boundary (e.g., Jan/Apr/Jul/Oct for quarterly)
    if (monthStep > 1) {
      const m = d.getUTCMonth();
      const aligned = Math.ceil((m + 1) / monthStep) * monthStep;
      d.setUTCMonth(aligned - 1);
      start = d.getTime() / 1000;
    }
    while (start <= maxSec) {
      splits.push(start);
      d.setUTCMonth(d.getUTCMonth() + monthStep);
      start = d.getTime() / 1000;
    }
    return splits;
  }

  if (incr >= DAY) {
    // Align to midnight
    const d = new Date(minSec * 1000);
    d.setUTCHours(0, 0, 0, 0);
    start = d.getTime() / 1000;
    if (start < minSec) start += DAY;
  } else {
    // Align to round multiple of increment
    start = Math.ceil(minSec / incr) * incr;
  }

  for (let n = 0; ; n++) {
    const t = start + n * incr;
    if (t > maxSec) break;
    splits.push(t);
  }

  return splits;
}
