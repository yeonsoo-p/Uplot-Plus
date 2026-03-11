/**
 * Date formatting utilities for time-scale axes.
 * Uses Intl.DateTimeFormat for timezone-aware formatting.
 */

const fmtCache = new Map<string, Intl.DateTimeFormat>();

function getCachedFmt(opts: Intl.DateTimeFormatOptions, tz?: string): Intl.DateTimeFormat {
  const key = JSON.stringify(opts) + (tz ?? '');
  let fmt = fmtCache.get(key);
  if (fmt == null) {
    fmt = new Intl.DateTimeFormat(undefined, { ...opts, timeZone: tz });
    fmtCache.set(key, fmt);
  }
  return fmt;
}

/** Format a timestamp (seconds) as a date string using Intl.DateTimeFormat options. */
export function fmtDate(
  ts: number,
  opts: Intl.DateTimeFormatOptions,
  tz?: string,
): string {
  const date = new Date(ts * 1000);
  return getCachedFmt(opts, tz).format(date);
}

/** Compact formatters for common time axis label patterns. */
export function fmtFullDateTime(ts: number, tz?: string): string {
  return fmtDate(ts, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }, tz);
}

export function fmtDateOnly(ts: number, tz?: string): string {
  return fmtDate(ts, { year: 'numeric', month: '2-digit', day: '2-digit' }, tz);
}

export function fmtTimeOnly(ts: number, tz?: string): string {
  return fmtDate(ts, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }, tz);
}

export function fmtHourMinute(ts: number, tz?: string): string {
  return fmtDate(ts, { hour: '2-digit', minute: '2-digit', hour12: false }, tz);
}

export function fmtMonthDay(ts: number, tz?: string): string {
  return fmtDate(ts, { month: 'short', day: 'numeric' }, tz);
}

export function fmtYear(ts: number, tz?: string): string {
  return fmtDate(ts, { year: 'numeric' }, tz);
}

export function fmtMonthYear(ts: number, tz?: string): string {
  return fmtDate(ts, { year: 'numeric', month: 'short' }, tz);
}
