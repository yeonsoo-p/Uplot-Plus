/** A single time segment within a lane */
export interface TimelineSegment {
  /** Start value (in x-scale units) */
  start: number;
  /** End value (in x-scale units) */
  end: number;
  /** Fill color for the segment */
  color?: string;
  /** Label text drawn inside the segment */
  label?: string;
}

/** A horizontal lane (row) in the timeline */
export interface TimelineLane {
  /** Lane label (drawn on the left) */
  label: string;
  /** Segments to render in this lane */
  segments: TimelineSegment[];
}

/** Props for the Timeline component */
export interface TimelineProps {
  /** Lane definitions */
  lanes: TimelineLane[];
  /** Height of each lane in CSS pixels (default 24) */
  laneHeight?: number;
  /** Gap between lanes in CSS pixels (default 2) */
  gap?: number;
  /** Which x-scale to use for positioning (default 'x') */
  scaleId?: string;
}
