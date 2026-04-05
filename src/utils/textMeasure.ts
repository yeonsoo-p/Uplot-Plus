import { prepareWithSegments, walkLineRanges } from '@chenglou/pretext';

export function measureLabelWidth(label: string, font: string): number {
  const prepared = prepareWithSegments(label, font);
  let maxWidth = 0;
  walkLineRanges(prepared, Number.POSITIVE_INFINITY, line => {
    if (line.width > maxWidth) maxWidth = line.width;
  });
  return maxWidth;
}
