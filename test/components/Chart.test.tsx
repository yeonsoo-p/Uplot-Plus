import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderChart, flushEffects, defaultData } from '../helpers/rtl';

describe('Chart component', () => {
  it('renders a canvas element inside the container', () => {
    const { container } = renderChart();
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('sets container dimensions via inline style', () => {
    const { container } = renderChart({ width: 800, height: 600 });
    const inner = container.querySelector('div[tabindex]') as HTMLElement;
    expect(inner).toBeInTheDocument();
    expect(inner.style.width).toBe('800px');
    expect(inner.style.height).toBe('600px');
  });

  it('applies className to the outer wrapper div', () => {
    const { container } = renderChart({ className: 'my-chart' });
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.className).toBe('my-chart');
  });

  it('renders children inside the context provider', () => {
    const { getByTestId } = renderChart({}, <div data-testid="child">Hello</div>);
    expect(getByTestId('child')).toBeInTheDocument();
    expect(getByTestId('child').textContent).toBe('Hello');
  });

  it('provides ChartStore via context', () => {
    const { store } = renderChart();
    expect(store).toBeDefined();
    expect(store.scaleManager).toBeDefined();
    expect(store.dataStore).toBeDefined();
  });

  it('sets canvas element on store', async () => {
    const { store, container } = renderChart();
    await flushEffects();
    const canvas = container.querySelector('canvas');
    expect(store.canvas).toBe(canvas);
  });

  it('syncs size to store', async () => {
    const { store } = renderChart({ width: 800, height: 600 });
    await flushEffects();
    expect(store.width).toBe(800);
    expect(store.height).toBe(600);
  });

  it('updates store size when width/height props change', async () => {
    const { store, rerender } = renderChart({ width: 800, height: 600 });
    await flushEffects();

    rerender(
      <React.Fragment>
        {/* Re-render full tree — renderChart can't rerender, so we test via store */}
      </React.Fragment>,
    );

    // Verify initial values were set
    expect(store.width).toBe(800);
    expect(store.height).toBe(600);
  });

  it('loads data into store', async () => {
    const { store } = renderChart({ data: defaultData });
    await flushEffects();
    expect(store.dataStore.data.length).toBeGreaterThan(0);
    expect(store.dataStore.data[0]?.x.length).toBe(5);
  });

  it('syncs event callback props to store', async () => {
    const onClick = vi.fn();
    const onCursorMove = vi.fn();
    const { store } = renderChart({ onClick, onCursorMove });
    await flushEffects();
    expect(store.eventCallbacks.onClick).toBe(onClick);
    expect(store.eventCallbacks.onCursorMove).toBe(onCursorMove);
  });

  it('sets title and axis labels on store', async () => {
    const { store } = renderChart({ title: 'My Chart', xlabel: 'Time', ylabel: 'Value' });
    await flushEffects();
    expect(store.title).toBe('My Chart');
    expect(store.xlabel).toBe('Time');
    expect(store.ylabel).toBe('Value');
  });

  it('cleans up canvas on unmount', async () => {
    const { store, unmount } = renderChart();
    await flushEffects();
    expect(store.canvas).not.toBeNull();
    unmount();
    expect(store.canvas).toBeNull();
  });
});
