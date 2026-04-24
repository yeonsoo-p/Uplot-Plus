import { Orientation, Direction } from '../types';
import type { ScaleState } from '../types';
import type { SeriesPaths, PathBuilderOpts } from './types';
import { clamp } from '../math/utils';
import { at } from '../utils/at';

/** lineTo function for the chart's current x-orientation. */
type LineToFn = (path: Path2D, primary: number, cross: number) => void;

/** Line-to for horizontal orientation */
export function lineToH(path: Path2D, x: number, y: number): void {
  path.lineTo(x, y);
}

/** Line-to for vertical orientation */
export function lineToV(path: Path2D, y: number, x: number): void {
  path.lineTo(x, y);
}

/**
 * Find gaps (null regions) in data for clip path generation.
 */
export function findGaps(
  dataX: ArrayLike<number>,
  dataY: ArrayLike<number | null>,
  idx0: number,
  idx1: number,
  dir: Direction,
  pixelForX: (val: number) => number,
): [number, number][] {
  const gaps: [number, number][] = [];
  let gapStart = -1;

  const start = dir === Direction.Forward ? idx0 : idx1;
  const end = dir === Direction.Forward ? idx1 : idx0;
  const step = dir;

  for (let i = start; dir === Direction.Forward ? i <= end : i >= end; i += step) {
    if (dataY[i] === null || dataY[i] === undefined) {
      if (gapStart === -1) {
        // Use the previous non-null point's x pixel as gap start.
        // i - dir gives the previous index in iteration order; clamp to [idx0, idx1].
        const prevI = clamp(i - dir, idx0, idx1);
        gapStart = pixelForX(at(dataX, prevI));
      }
    } else {
      if (gapStart !== -1) {
        gaps.push([gapStart, pixelForX(at(dataX, i))]);
        gapStart = -1;
      }
    }
  }

  if (gapStart !== -1) {
    gaps.push([gapStart, pixelForX(at(dataX, idx1))]);
  }

  return gaps;
}

/**
 * Create a clip path that excludes gap regions.
 */
export function clipGaps(
  gaps: [number, number][],
  ori: Orientation,
  xOff: number,
  yOff: number,
  xDim: number,
  yDim: number,
): Path2D {
  const clip = new Path2D();

  let prevEnd = ori === Orientation.Horizontal ? xOff : yOff;
  const dimEnd = ori === Orientation.Horizontal ? xOff + xDim : yOff + yDim;
  const crossOff = ori === Orientation.Horizontal ? yOff : xOff;
  const crossDim = ori === Orientation.Horizontal ? yDim : xDim;

  for (const [gapStart, gapEnd] of gaps) {
    if (gapStart > prevEnd) {
      if (ori === Orientation.Horizontal)
        clip.rect(prevEnd, crossOff, gapStart - prevEnd, crossDim);
      else
        clip.rect(crossOff, prevEnd, crossDim, gapStart - prevEnd);
    }
    prevEnd = gapEnd;
  }

  if (prevEnd < dimEnd) {
    if (ori === Orientation.Horizontal)
      clip.rect(prevEnd, crossOff, dimEnd - prevEnd, crossDim);
    else
      clip.rect(crossOff, prevEnd, crossDim, dimEnd - prevEnd);
  }

  return clip;
}

/**
 * Close a stroke path into a fill path that drops to the value-axis baseline.
 *
 * Two modes:
 *   - opts.fillToData supplied → trace backwards along per-point baseline values (stacked fills).
 *   - otherwise → close to a constant baseline (opts.fillTo, falling back to scaleY.min ?? 0).
 *
 * Same shape used by linear/stepped/spline. Lifted here so future fillToData semantics
 * change in one place.
 */
export function closeFill(
  fill: Path2D,
  lineTo: LineToFn,
  pixelForX: (val: number) => number,
  pixelForY: (val: number) => number,
  scaleY: ScaleState,
  dataX: ArrayLike<number>,
  idx0: number,
  idx1: number,
  dir: Direction,
  opts: PathBuilderOpts | undefined,
): void {
  const fillToData = opts?.fillToData;

  if (fillToData != null) {
    for (let i = dir === Direction.Forward ? idx1 : idx0; i >= idx0 && i <= idx1; i -= dir) {
      const bv = fillToData[i];
      const xv = dataX[i];
      if (bv != null && xv != null) {
        lineTo(fill, pixelForX(xv), pixelForY(bv));
      }
    }
  } else {
    const fillToVal = opts?.fillTo ?? scaleY.min ?? 0;
    const fillToY = pixelForY(fillToVal);

    let frX = pixelForX(at(dataX, idx0));
    let toX = pixelForX(at(dataX, idx1));
    if (dir === Direction.Backward) [toX, frX] = [frX, toX];

    lineTo(fill, toX, fillToY);
    lineTo(fill, frX, fillToY);
  }
}

/**
 * If hasGap, compute gap rects from the data and attach the gap list + clip path to _paths.
 * Same boilerplate previously copied across linear/stepped/spline.
 */
export function attachGapClip(
  _paths: SeriesPaths,
  dataX: ArrayLike<number>,
  dataY: ArrayLike<number | null>,
  idx0: number,
  idx1: number,
  dir: Direction,
  pixelForX: (val: number) => number,
  scaleX: ScaleState,
  xOff: number,
  yOff: number,
  xDim: number,
  yDim: number,
): void {
  const gaps = findGaps(dataX, dataY, idx0, idx1, dir, pixelForX);
  _paths.gaps = gaps;
  _paths.clip = clipGaps(gaps, scaleX.ori, xOff, yOff, xDim, yDim);
}
