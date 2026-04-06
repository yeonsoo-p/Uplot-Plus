import { describe, it, expect, vi } from 'vitest';
import React, { useContext } from 'react';
import { render, act } from '@testing-library/react';
import { ThemeProvider, ThemeRevisionContext } from '@/components/ThemeProvider';
import { Chart } from '@/components/Chart';
import { StoreProbe, defaultData } from '../helpers/rtl';
import type { ChartStore } from '@/hooks/useChartStore';
import type { ChartTheme } from '@/types/theme';

const THEME_A: ChartTheme = { axisStroke: '#111' };
const THEME_B: ChartTheme = { axisStroke: '#999', gridStroke: '#ccc' };

describe('ThemeProvider repaint path', () => {
  it('triggers invalidateSnapshot + scheduleRedraw when ancestor theme changes', async () => {
    const storeRef: React.MutableRefObject<ChartStore | null> = { current: null };

    const { rerender } = render(
      <ThemeProvider theme={THEME_A}>
        <Chart width={400} height={300} data={defaultData}>
          <StoreProbe storeRef={storeRef} />
        </Chart>
      </ThemeProvider>,
    );
    await act(async () => {});

    const store = storeRef.current!;
    const invalidateSpy = vi.spyOn(store.renderer, 'invalidateSnapshot');
    const redrawSpy = vi.spyOn(store, 'scheduleRedraw');

    rerender(
      <ThemeProvider theme={THEME_B}>
        <Chart width={400} height={300} data={defaultData}>
          <StoreProbe storeRef={storeRef} />
        </Chart>
      </ThemeProvider>,
    );
    await act(async () => {});

    expect(invalidateSpy).toHaveBeenCalled();
    expect(redrawSpy).toHaveBeenCalled();
  });

  it('does NOT repaint when the same theme reference is reused', async () => {
    const storeRef: React.MutableRefObject<ChartStore | null> = { current: null };

    const { rerender } = render(
      <ThemeProvider theme={THEME_A}>
        <Chart width={400} height={300} data={defaultData}>
          <StoreProbe storeRef={storeRef} />
        </Chart>
      </ThemeProvider>,
    );
    await act(async () => {});

    const store = storeRef.current!;
    const invalidateSpy = vi.spyOn(store.renderer, 'invalidateSnapshot');
    const redrawSpy = vi.spyOn(store, 'scheduleRedraw');

    // Rerender with the exact same theme object reference
    rerender(
      <ThemeProvider theme={THEME_A}>
        <Chart width={400} height={300} data={defaultData}>
          <StoreProbe storeRef={storeRef} />
        </Chart>
      </ThemeProvider>,
    );
    await act(async () => {});

    expect(invalidateSpy).not.toHaveBeenCalled();
    expect(redrawSpy).not.toHaveBeenCalled();
  });

  it('increments revision counter on theme change', () => {
    const revisions: number[] = [];

    function RevisionProbe() {
      const rev = useContext(ThemeRevisionContext);
      revisions.push(rev);
      return null;
    }

    const { rerender } = render(
      <ThemeProvider theme={THEME_A}>
        <RevisionProbe />
      </ThemeProvider>,
    );

    rerender(
      <ThemeProvider theme={THEME_B}>
        <RevisionProbe />
      </ThemeProvider>,
    );

    // First render → revision 1, second render → revision 2
    expect(revisions[0]).toBe(1);
    expect(revisions[1]).toBe(2);
  });

  it('sets CSS custom properties on wrapper div', () => {
    const { container } = render(
      <ThemeProvider theme={{ axisStroke: '#ff0000', gridStroke: 'rgba(0,0,0,0.1)' }}>
        <div data-testid="child" />
      </ThemeProvider>,
    );

    const wrapper = container.querySelector<HTMLElement>('div[style]');
    expect(wrapper).not.toBeNull();
    expect(wrapper!.style.getPropertyValue('--uplot-axis-stroke')).toBe('#ff0000');
    expect(wrapper!.style.getPropertyValue('--uplot-grid-stroke')).toBe('rgba(0,0,0,0.1)');
  });
});
