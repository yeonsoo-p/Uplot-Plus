import type { BenchResult } from './metrics';

const results: { original?: BenchResult; wrapper?: BenchResult; plus?: BenchResult } = {};

function tryRender(): void {
  if (!results.original || !results.wrapper || !results.plus) return;

  const el = document.getElementById('comparison')!;
  el.innerHTML = '';

  const orig = results.original;
  const wrap = results.wrapper;
  const plus = results.plus;

  const table = document.createElement('table');
  table.className = 'compare-table';

  // Header
  const thead = document.createElement('thead');
  const hr = document.createElement('tr');
  for (const text of ['Metric', 'uPlot (original)', 'uPlot + React wrapper', 'uPlot+', 'Diff (wrapper)', 'Diff (uPlot+)']) {
    const th = document.createElement('th');
    th.textContent = text;
    hr.append(th);
  }
  thead.append(hr);
  table.append(thead);

  const tbody = document.createElement('tbody');

  function diffCell(origVal: number | undefined, testVal: number | undefined): HTMLTableCellElement {
    const td = document.createElement('td');
    if (origVal != null && testVal != null && origVal > 0) {
      const pct = ((testVal - origVal) / origVal) * 100;
      const sign = pct > 0 ? '+' : '';
      td.textContent = sign + pct.toFixed(0) + '%';
      td.className = pct < -2 ? 'better' : pct > 2 ? 'worse' : 'neutral';
    } else {
      td.textContent = '—';
      td.className = 'neutral';
    }
    return td;
  }

  function addRow(label: string, origVal: number | undefined, wrapVal: number | undefined, plusVal: number | undefined): void {
    const tr = document.createElement('tr');

    const tdLabel = document.createElement('td');
    tdLabel.textContent = label;
    tr.append(tdLabel);

    for (const v of [origVal, wrapVal, plusVal]) {
      const td = document.createElement('td');
      td.textContent = v != null ? v.toFixed(1) + ' ms' : '—';
      tr.append(td);
    }

    tr.append(diffCell(origVal, wrapVal));
    tr.append(diffCell(origVal, plusVal));

    tbody.append(tr);
  }

  addRow('Data prep', orig.prepMs, wrap.prepMs, plus.prepMs);
  addRow('Chart render (total)', orig.chartMs, wrap.chartMs, plus.chartMs);

  // Canvas-only row — compare wrapper and plus canvas times against original total
  if (wrap.canvasMs != null || plus.canvasMs != null) {
    addRow('Chart render (canvas only)', orig.chartMs, wrap.canvasMs, plus.canvasMs);
  }

  // Heap rows
  function addHeapRow(label: string, getter: (r: BenchResult) => number | undefined): void {
    const o = getter(orig);
    const w = getter(wrap);
    const p = getter(plus);
    if (o == null && w == null && p == null) return;

    const tr = document.createElement('tr');
    const tdLabel = document.createElement('td');
    tdLabel.textContent = label;
    tr.append(tdLabel);

    for (const v of [o, w, p]) {
      const td = document.createElement('td');
      td.textContent = v != null ? v + ' MB' : '—';
      tr.append(td);
    }

    // No diff for heap
    const td1 = document.createElement('td');
    td1.textContent = '—';
    td1.className = 'neutral';
    tr.append(td1);
    const td2 = document.createElement('td');
    td2.textContent = '—';
    td2.className = 'neutral';
    tr.append(td2);

    tbody.append(tr);
  }

  addHeapRow('Heap peak', r => r.heapPeakMB);
  addHeapRow('Heap final', r => r.heapFinalMB);

  table.append(tbody);
  el.append(table);

  const note = document.createElement('p');
  note.className = 'compare-note';
  note.textContent = 'For JS/render/paint/system breakdown and precise heap stats, use Chrome DevTools Performance tab with --enable-precise-memory-info.';
  el.append(note);
}

window.addEventListener('message', (e: MessageEvent) => {
  const data = e.data as { type?: string; result?: BenchResult };
  if (data.type !== 'bench-result' || !data.result) return;

  if (data.result.name.includes('+')) {
    results.plus = data.result;
  } else if (data.result.name.includes('wrapper')) {
    results.wrapper = data.result;
  } else {
    results.original = data.result;
  }

  tryRender();
});
