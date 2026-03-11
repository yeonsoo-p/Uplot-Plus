import { describe, it, expect } from 'vitest';
import { BlockMinMaxTree } from '@/core/BlockMinMax';

/**
 * Simple brute-force min/max as test oracle.
 * Intentionally naive — no optimizations, no else-if.
 */
function bruteMinMax(data: ArrayLike<number | null>, i0: number, i1: number): [number, number] {
  let mn = Infinity;
  let mx = -Infinity;
  for (let i = i0; i <= i1; i++) {
    const v = data[i];
    if (v != null) {
      if (v < mn) mn = v;
      if (v > mx) mx = v;
    }
  }
  return [mn, mx];
}

/** Deterministic PRNG (mulberry32) for reproducible "random" tests */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeData(n: number): (number | null)[] {
  const data: (number | null)[] = [];
  for (let i = 0; i < n; i++) {
    data.push(Math.sin(i * 0.01) * 100);
  }
  return data;
}

function makeDataWithNulls(n: number): (number | null)[] {
  const data: (number | null)[] = [];
  for (let i = 0; i < n; i++) {
    data.push(i % 7 === 0 ? null : Math.sin(i * 0.01) * 100);
  }
  return data;
}

/** Adversarial data: spikes, nulls, constants, extremes */
function makeAdversarialData(n: number): (number | null)[] {
  const data: (number | null)[] = [];
  for (let i = 0; i < n; i++) {
    if (i % 13 === 0) data.push(null);
    else if (i === 7) data.push(1e15);
    else if (i === n - 2) data.push(-1e15);
    else if (i % 5 === 0) data.push(0);
    else data.push(((i * 7) % 200) - 100);
  }
  return data;
}

describe('BlockMinMaxTree', () => {
  it('matches brute-force for full range', () => {
    const data = makeData(10_000);
    const tree = new BlockMinMaxTree(data);
    const [tMin, tMax] = tree.rangeMinMax(0, data.length - 1);
    const [bMin, bMax] = bruteMinMax(data, 0, data.length - 1);
    expect(tMin).toBe(bMin);
    expect(tMax).toBe(bMax);
  });

  it('matches brute-force for sub-ranges', () => {
    const data = makeData(10_000);
    const tree = new BlockMinMaxTree(data);

    const ranges: [number, number][] = [
      [0, 100],
      [500, 1500],
      [100, 9999],
      [5000, 5001],
      [0, 0],
      [9999, 9999],
      [1023, 1025], // crosses block boundary
      [1024, 2048], // exact block boundaries
    ];

    for (const [i0, i1] of ranges) {
      const [tMin, tMax] = tree.rangeMinMax(i0, i1);
      const [bMin, bMax] = bruteMinMax(data, i0, i1);
      expect(tMin).toBe(bMin);
      expect(tMax).toBe(bMax);
    }
  });

  it('handles null values correctly', () => {
    const data = makeDataWithNulls(5000);
    const tree = new BlockMinMaxTree(data);

    const [tMin, tMax] = tree.rangeMinMax(0, data.length - 1);
    const [bMin, bMax] = bruteMinMax(data, 0, data.length - 1);
    expect(tMin).toBe(bMin);
    expect(tMax).toBe(bMax);
  });

  it('handles all-null range', () => {
    const data: (number | null)[] = [null, null, null, null];
    const tree = new BlockMinMaxTree(data);
    const [tMin, tMax] = tree.rangeMinMax(0, 3);
    expect(tMin).toBe(Infinity);
    expect(tMax).toBe(-Infinity);
  });

  it('handles single element', () => {
    const data = [42];
    const tree = new BlockMinMaxTree(data);
    const [tMin, tMax] = tree.rangeMinMax(0, 0);
    expect(tMin).toBe(42);
    expect(tMax).toBe(42);
  });

  it('handles constant array (all same value)', () => {
    const data = Array.from({ length: 200 }, () => 5);
    const tree = new BlockMinMaxTree(data, 16);
    const [tMin, tMax] = tree.rangeMinMax(0, 199);
    expect(tMin).toBe(5);
    expect(tMax).toBe(5);
  });

  it('handles adversarial data with spikes and nulls', () => {
    const data = makeAdversarialData(500);
    const tree = new BlockMinMaxTree(data, 16);

    // Full range
    const [tMin, tMax] = tree.rangeMinMax(0, data.length - 1);
    const [bMin, bMax] = bruteMinMax(data, 0, data.length - 1);
    expect(tMin).toBe(bMin);
    expect(tMax).toBe(bMax);

    // Sub-ranges around spikes
    const spikeRanges: [number, number][] = [
      [0, 10],   // contains the +1e15 spike at index 7
      [495, 499], // contains the -1e15 spike at index n-2=498
      [6, 8],    // tight around spike
      [0, 499],  // full range
    ];

    for (const [i0, i1] of spikeRanges) {
      const [tMn, tMx] = tree.rangeMinMax(i0, i1);
      const [bMn, bMx] = bruteMinMax(data, i0, i1);
      expect(tMn).toBe(bMn);
      expect(tMx).toBe(bMx);
    }
  });

  it('works with small block size (deterministic)', () => {
    const data = makeData(100);
    const tree = new BlockMinMaxTree(data, 8);
    const rng = mulberry32(12345);

    for (let i = 0; i < 20; i++) {
      const i0 = Math.floor(rng() * 50);
      const i1 = i0 + Math.floor(rng() * 50);
      const [tMin, tMax] = tree.rangeMinMax(i0, i1);
      const [bMin, bMax] = bruteMinMax(data, i0, i1);
      expect(tMin).toBe(bMin);
      expect(tMax).toBe(bMax);
    }
  });

  describe('block boundary stress', () => {
    it('range starting exactly on a block boundary', () => {
      const data = makeData(200);
      const tree = new BlockMinMaxTree(data, 16);

      // Start at block boundary (16), end mid-block
      const [tMin, tMax] = tree.rangeMinMax(16, 30);
      const [bMin, bMax] = bruteMinMax(data, 16, 30);
      expect(tMin).toBe(bMin);
      expect(tMax).toBe(bMax);
    });

    it('range ending exactly on a block boundary', () => {
      const data = makeData(200);
      const tree = new BlockMinMaxTree(data, 16);

      // Start mid-block, end at block boundary - 1 (last element of block)
      const [tMin, tMax] = tree.rangeMinMax(5, 15);
      const [bMin, bMax] = bruteMinMax(data, 5, 15);
      expect(tMin).toBe(bMin);
      expect(tMax).toBe(bMax);
    });

    it('range spanning exactly two full blocks', () => {
      const data = makeData(200);
      const tree = new BlockMinMaxTree(data, 16);

      const [tMin, tMax] = tree.rangeMinMax(16, 47);
      const [bMin, bMax] = bruteMinMax(data, 16, 47);
      expect(tMin).toBe(bMin);
      expect(tMax).toBe(bMax);
    });

    it('single-element partial last block', () => {
      // 17 elements with blockSize=16 → block 0 is full, block 1 has 1 element
      const data = makeData(17);
      const tree = new BlockMinMaxTree(data, 16);

      const [tMin, tMax] = tree.rangeMinMax(16, 16);
      expect(tMin).toBe(data[16]);
      expect(tMax).toBe(data[16]);

      // Cross into partial block
      const [tMin2, tMax2] = tree.rangeMinMax(15, 16);
      const [bMin2, bMax2] = bruteMinMax(data, 15, 16);
      expect(tMin2).toBe(bMin2);
      expect(tMax2).toBe(bMax2);
    });

    it('min/max at the exact boundaries of the queried range', () => {
      const data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      data[2] = -999; // min at range start
      data[7] = 999;  // max at range end
      const tree = new BlockMinMaxTree(data, 4);

      const [tMin, tMax] = tree.rangeMinMax(2, 7);
      expect(tMin).toBe(-999);
      expect(tMax).toBe(999);
    });
  });

  describe('updateBlock', () => {
    it('reflects data changes after updateBlock', () => {
      // Multi-block data (3 blocks of 4)
      const data = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120];
      const tree = new BlockMinMaxTree(data, 4);

      // Cross-block query before mutation
      const [min1, max1] = tree.rangeMinMax(0, 11);
      expect(min1).toBe(10);
      expect(max1).toBe(120);

      // Mutate middle block (block 1)
      data[5] = -500;
      tree.updateBlock(1);

      // Cross-block query spanning the mutated block
      const [min2, max2] = tree.rangeMinMax(0, 11);
      expect(min2).toBe(-500);
      expect(max2).toBe(120);

      // Query just the mutated block
      const [min3, max3] = tree.rangeMinMax(4, 7);
      expect(min3).toBe(-500);
      expect(max3).toBe(80);
    });

    it('handles mutation that does not change min/max', () => {
      const data = [1, 5, 3, 9, 2, 8, 4, 7];
      const tree = new BlockMinMaxTree(data, 4);

      const before = tree.rangeMinMax(0, 3);
      expect(before).toEqual([1, 9]);

      // Change a mid-range value (not min or max)
      data[2] = 4; // was 3, still between 1 and 9
      tree.updateBlock(0);

      const after = tree.rangeMinMax(0, 3);
      expect(after).toEqual([1, 9]);
    });

    it('handles mutation that changes both min and max', () => {
      const data = [5, 5, 5, 5, 5, 5, 5, 5];
      const tree = new BlockMinMaxTree(data, 4);

      expect(tree.rangeMinMax(0, 7)).toEqual([5, 5]);

      data[1] = -10;
      data[2] = 10;
      tree.updateBlock(0);

      expect(tree.rangeMinMax(0, 3)).toEqual([-10, 10]);
      // Block 1 unchanged
      expect(tree.rangeMinMax(4, 7)).toEqual([5, 5]);
      // Cross-block
      expect(tree.rangeMinMax(0, 7)).toEqual([-10, 10]);
    });
  });

  describe('grow', () => {
    it('accommodates new data spanning multiple new blocks', () => {
      const data: (number | null)[] = [1, 2, 3, 4];
      const tree = new BlockMinMaxTree(data, 4);

      expect(tree.rangeMinMax(0, 3)).toEqual([1, 4]);

      // Append 12 more elements → 3 new blocks
      for (let i = 5; i <= 16; i++) data.push(i);
      tree.setData(data);
      tree.grow(data.length);

      const [tMin, tMax] = tree.rangeMinMax(0, data.length - 1);
      const [bMin, bMax] = bruteMinMax(data, 0, data.length - 1);
      expect(tMin).toBe(bMin);
      expect(tMax).toBe(bMax);
    });

    it('grows within the same last block (no new block needed)', () => {
      // 2 elements in a block of 4 → room for 2 more
      const data: (number | null)[] = [10, 20];
      const tree = new BlockMinMaxTree(data, 4);

      expect(tree.rangeMinMax(0, 1)).toEqual([10, 20]);

      data.push(5, 15);
      tree.setData(data);
      tree.grow(data.length);

      expect(tree.rangeMinMax(0, 3)).toEqual([5, 20]);
    });

    it('appends values within existing range (min/max unchanged)', () => {
      const data: (number | null)[] = [1, 100, 3, 4];
      const tree = new BlockMinMaxTree(data, 4);

      expect(tree.rangeMinMax(0, 3)).toEqual([1, 100]);

      // Append values that don't extend the range
      data.push(50, 60, 70);
      tree.setData(data);
      tree.grow(data.length);

      const [tMin, tMax] = tree.rangeMinMax(0, data.length - 1);
      expect(tMin).toBe(1);
      expect(tMax).toBe(100);
    });

    it('preserves old block data after grow', () => {
      const data: (number | null)[] = [10, 20, 30, 40];
      const tree = new BlockMinMaxTree(data, 4);

      data.push(1, 2);
      tree.setData(data);
      tree.grow(data.length);

      // Old block should be unchanged
      expect(tree.rangeMinMax(0, 3)).toEqual([10, 40]);
      // New block
      expect(tree.rangeMinMax(4, 5)).toEqual([1, 2]);
      // Cross-block
      expect(tree.rangeMinMax(0, 5)).toEqual([1, 40]);
    });
  });

  describe('correctness with large data', () => {
    it('matches brute-force on 100k points with deterministic ranges', () => {
      const data = makeData(100_000);
      const tree = new BlockMinMaxTree(data);
      const rng = mulberry32(98765);

      for (let i = 0; i < 50; i++) {
        const i0 = Math.floor(rng() * 90_000);
        const i1 = i0 + Math.floor(rng() * 10_000);
        const [tMin, tMax] = tree.rangeMinMax(i0, i1);
        const [bMin, bMax] = bruteMinMax(data, i0, i1);
        expect(tMin).toBe(bMin);
        expect(tMax).toBe(bMax);
      }
    });

    it('matches brute-force with nulls on large data', () => {
      const data = makeDataWithNulls(50_000);
      const tree = new BlockMinMaxTree(data);
      const rng = mulberry32(54321);

      for (let i = 0; i < 30; i++) {
        const i0 = Math.floor(rng() * 40_000);
        const i1 = i0 + Math.floor(rng() * 10_000);
        const [tMin, tMax] = tree.rangeMinMax(i0, i1);
        const [bMin, bMax] = bruteMinMax(data, i0, i1);
        expect(tMin).toBe(bMin);
        expect(tMax).toBe(bMax);
      }
    });
  });
});
