/** Shared benchmark timing, memory, and display utilities. */

export interface BenchResult {
  name: string;
  prepMs: number;
  chartMs: number;
  /** Canvas-only render time (uPlot+ only — excludes React reconciliation) */
  canvasMs?: number;
  heapPeakMB?: number;
  heapFinalMB?: number;
}

// ── Timing helpers ──────────────────────────────────────────────────

export function markStart(label: string): void {
  performance.mark(`${label}-start`);
}

export function markEnd(label: string): number {
  performance.mark(`${label}-end`);
  const m = performance.measure(label, `${label}-start`, `${label}-end`);
  return m.duration;
}

// ── Memory helpers (Chrome-only) ────────────────────────────────────

interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

function getMemory(): PerformanceMemory | null {
  const p = performance as unknown as { memory?: PerformanceMemory };
  return p.memory ?? null;
}

export function getHeapMB(): number | undefined {
  const mem = getMemory();
  return mem ? Math.round((mem.usedJSHeapSize / 1024 / 1024) * 10) / 10 : undefined;
}

// ── Display ─────────────────────────────────────────────────────────

function fmt(ms: number): string {
  return ms.toFixed(1) + ' ms';
}

export function displayResults(el: HTMLElement, result: BenchResult): void {
  const rows: [string, string][] = [
    ['Library', result.name],
    ['Data prep', fmt(result.prepMs)],
    ['Chart render (total)', fmt(result.chartMs)],
  ];

  if (result.canvasMs != null) {
    rows.push(['Chart render (canvas only)', fmt(result.canvasMs)]);
  }

  if (result.heapPeakMB != null) {
    rows.push(['Heap peak', result.heapPeakMB + ' MB']);
  }
  if (result.heapFinalMB != null) {
    rows.push(['Heap final', result.heapFinalMB + ' MB']);
  }

  rows.push(['Note', 'For JS/render/paint/system breakdown, use Chrome DevTools Performance tab']);

  const table = document.createElement('table');
  table.className = 'results-table';
  for (const [label, value] of rows) {
    const tr = document.createElement('tr');
    if (!label && !value) { tr.className = 'note-row'; continue; }
    if (label === 'Note') { tr.className = 'note-row'; }
    const th = document.createElement('th');
    th.textContent = label;
    const td = document.createElement('td');
    td.textContent = value;
    tr.append(th, td);
    table.append(tr);
  }
  el.append(table);
}

/** Post results to parent window (for compare.html iframe usage). */
export function postResults(result: BenchResult): void {
  (window as unknown as { __benchResults: BenchResult }).__benchResults = result;
  if (window.parent !== window) {
    window.parent.postMessage({ type: 'bench-result', result }, '*');
  }
}
