import { bench, describe } from 'vitest';
import { convergeSize } from '@/axes/layout';
import { createScaleState } from '@/core/Scale';
import type { ScaleState } from '@/types';
import type { AxisState } from '@/types/axes';
import { Side, Orientation, Distribution, Direction } from '@/types';

function makeScale(id: string, min: number, max: number, ori: Orientation): ScaleState {
  return {
    ...createScaleState({ id }),
    min, max, ori,
    dir: Direction.Forward,
    distr: Distribution.Linear,
  };
}

function makeAxisState(scale: string, side: Side): AxisState {
  return {
    config: { scale, side },
    _show: true,
    _size: 0,
    _pos: 0,
    _lpos: 0,
    _splits: null,
    _values: null,
    _incr: 0,
    _space: 0,
    _rotate: 0,
  };
}

const scales: Record<string, ScaleState> = {
  x: makeScale('x', 0, 1000, Orientation.Horizontal),
  y: makeScale('y', 0, 100, Orientation.Vertical),
  y2: makeScale('y2', -50, 50, Orientation.Vertical),
  y3: makeScale('y3', 0, 1, Orientation.Vertical),
};

const getScale = (id: string) => scales[id];

describe('convergeSize: axis layout', () => {
  bench('2 axes (x + y)', () => {
    const axes = [
      makeAxisState('x', Side.Bottom),
      makeAxisState('y', Side.Left),
    ];
    convergeSize(800, 600, axes, getScale);
  });

  bench('4 axes (x + y + y2 + y3)', () => {
    const axes = [
      makeAxisState('x', Side.Bottom),
      makeAxisState('y', Side.Left),
      makeAxisState('y2', Side.Right),
      makeAxisState('y3', Side.Right),
    ];
    convergeSize(800, 600, axes, getScale);
  });

  bench('6 axes (x-top + x-bottom + 4 y-axes)', () => {
    const axes = [
      makeAxisState('x', Side.Bottom),
      makeAxisState('x', Side.Top),
      makeAxisState('y', Side.Left),
      makeAxisState('y2', Side.Right),
      makeAxisState('y3', Side.Left),
      makeAxisState('y', Side.Right),
    ];
    convergeSize(800, 600, axes, getScale);
  });

  bench('2 axes, narrow chart (300x200)', () => {
    const axes = [
      makeAxisState('x', Side.Bottom),
      makeAxisState('y', Side.Left),
    ];
    convergeSize(300, 200, axes, getScale);
  });

  bench('2 axes, wide chart (1920x1080)', () => {
    const axes = [
      makeAxisState('x', Side.Bottom),
      makeAxisState('y', Side.Left),
    ];
    convergeSize(1920, 1080, axes, getScale);
  });
});
