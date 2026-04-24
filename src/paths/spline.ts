import { LINE_DEFAULTS } from './types';
import type { SeriesPaths, PathBuilder, PathBuilderOpts } from './types';
import type { ScaleState } from '../types';
import { Orientation, Direction } from '../types';
import { valToPos } from '../core/Scale';
import { nonNullIdxs } from '../math/utils';
import { lineToH, lineToV, closeFill, attachGapClip } from './utils';
import { at } from '../utils/at';

/**
 * Spline path builder — wraps an interpolation function.
 * Used by monotoneCubic and catmullRom.
 */
export function splineInterp(
  interp: SplineInterpFn,
): PathBuilder {
  const fn: PathBuilder = (
    dataX: ArrayLike<number>,
    dataY: ArrayLike<number | null>,
    scaleX: ScaleState,
    scaleY: ScaleState,
    xDim: number,
    yDim: number,
    xOff: number,
    yOff: number,
    idx0: number,
    idx1: number,
    dir: Direction,
    pxRound: (v: number) => number,
    opts?: PathBuilderOpts,
  ): SeriesPaths => {
    const spanGaps = opts?.spanGaps ?? false;

    [idx0, idx1] = nonNullIdxs(dataY, idx0, idx1);

    if (idx0 === -1) {
      return { stroke: new Path2D(), fill: null, clip: null, band: null, gaps: null };
    }

    const pixelForX = (val: number) => pxRound(valToPos(val, scaleX, xDim, xOff));
    const pixelForY = (val: number) => pxRound(valToPos(val, scaleY, yDim, yOff));

    const lineTo = scaleX.ori === Orientation.Horizontal ? lineToH : lineToV;

    const xCoords: number[] = [];
    const yCoords: number[] = [];
    let hasGap = false;

    for (let i = dir === Direction.Forward ? idx0 : idx1; i >= idx0 && i <= idx1; i += dir) {
      const yVal = dataY[i];

      if (yVal != null) {
        xCoords.push(pixelForX(at(dataX, i)));
        yCoords.push(pixelForY(yVal));
      } else if (yVal === null && !spanGaps) {
        hasGap = true;
      }
    }

    const isHoriz = scaleX.ori === Orientation.Horizontal;
    const stroke = interp(xCoords, yCoords, isHoriz, pxRound);

    const _paths: SeriesPaths = {
      stroke: stroke ?? new Path2D(),
      fill: null,
      clip: null,
      band: null,
      gaps: null,
    };

    if (stroke != null) {
      _paths.fill = new Path2D(stroke);
      closeFill(_paths.fill, lineTo, pixelForX, pixelForY, scaleY, dataX, idx0, idx1, dir, opts);
    }

    if (hasGap) attachGapClip(_paths, dataX, dataY, idx0, idx1, dir, pixelForX, scaleX, xOff, yOff, xDim, yDim);

    return _paths;
  };
  fn.defaults = LINE_DEFAULTS;
  return fn;
}

/** Interpolation function type used by splineInterp */
export type SplineInterpFn = (
  xs: number[],
  ys: number[],
  isHoriz: boolean,
  pxRound: (v: number) => number,
) => Path2D | null;
