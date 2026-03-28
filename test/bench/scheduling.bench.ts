import { bench, describe } from 'vitest';
import { RenderScheduler } from '@/core/RenderScheduler';

// DirtyFlag is a const enum — replicate values
const Scales = 1;
const Axes   = 2;
const Paths  = 4;
const Cursor = 8;
const Select = 16;
const Size   = 32;
const Full   = 63;

describe('RenderScheduler: flag operations', () => {
  bench('mark single flag', () => {
    const sched = new RenderScheduler();
    sched.mark(Scales);
  });

  bench('mark 6 flags sequentially', () => {
    const sched = new RenderScheduler();
    sched.mark(Scales);
    sched.mark(Axes);
    sched.mark(Paths);
    sched.mark(Cursor);
    sched.mark(Select);
    sched.mark(Size);
  });

  bench('mark Full flag', () => {
    const sched = new RenderScheduler();
    sched.mark(Full);
  });

  bench('has() check', () => {
    const sched = new RenderScheduler();
    sched.mark(Scales | Paths | Cursor);
    sched.has(Paths);
  });

  bench('mark + clear cycle', () => {
    const sched = new RenderScheduler();
    sched.mark(Full);
    sched.clear();
  });
});

describe('RenderScheduler: coalescing overhead', () => {
  bench('100 marks without callback (pure accumulation)', () => {
    const sched = new RenderScheduler();
    for (let i = 0; i < 100; i++) {
      sched.mark(Scales);
    }
    sched.cancel(); // prevent rAF from firing
  });

  bench('100 marks with noop callback (coalesced)', () => {
    const sched = new RenderScheduler();
    sched.onRedraw(() => { /* noop */ });
    for (let i = 0; i < 100; i++) {
      sched.mark(Scales);
    }
    sched.cancel();
  });
});

describe('RenderScheduler: dispose', () => {
  bench('create + mark + dispose', () => {
    const sched = new RenderScheduler();
    sched.onRedraw(() => { /* noop */ });
    sched.mark(Full);
    sched.dispose();
  });
});
