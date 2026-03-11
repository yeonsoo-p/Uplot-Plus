/**
 * Block Min-Max Tree for O(n/blockSize) range min/max queries.
 *
 * Divides a data array into fixed-size blocks and pre-computes
 * min/max for each block. Range queries decompose into:
 *   partial-left-block + full-middle-blocks + partial-right-block
 *
 * Build: O(n)  |  Query: O(n/blockSize + blockSize)  |  Update: O(blockSize)
 */

const DEFAULT_BLOCK_SIZE = 1024;

export class BlockMinMaxTree {
  /** Flat array of [min, max] pairs per block */
  private blocks: Float64Array;
  /** Number of blocks */
  private nBlocks: number;
  /** Block size */
  private blockSize: number;
  /** Reference to underlying data */
  private data: ArrayLike<number | null>;
  /** Total data length */
  private len: number;

  constructor(data: ArrayLike<number | null>, blockSize = DEFAULT_BLOCK_SIZE) {
    this.data = data;
    this.len = data.length;
    this.blockSize = blockSize;
    this.nBlocks = Math.ceil(data.length / blockSize);
    this.blocks = new Float64Array(this.nBlocks * 2);
    this.buildAll();
  }

  /** Build min/max for all blocks */
  private buildAll(): void {
    const { data, blockSize, nBlocks, blocks, len } = this;

    for (let b = 0; b < nBlocks; b++) {
      const start = b * blockSize;
      const end = Math.min(start + blockSize, len);
      let bMin = Infinity;
      let bMax = -Infinity;

      for (let i = start; i < end; i++) {
        const v = data[i];
        if (v != null) {
          if (v < bMin) bMin = v;
          if (v > bMax) bMax = v;
        }
      }

      blocks[b * 2] = bMin;
      blocks[b * 2 + 1] = bMax;
    }
  }

  /**
   * Query min/max over index range [i0, i1] (inclusive).
   * Returns [Infinity, -Infinity] if no valid data in range.
   */
  rangeMinMax(i0: number, i1: number): [number, number] {
    const { data, blockSize, blocks } = this;

    let rMin = Infinity;
    let rMax = -Infinity;

    // Block index of i0 and i1
    const b0 = Math.floor(i0 / blockSize);
    const b1 = Math.floor(i1 / blockSize);

    if (b0 === b1) {
      // Same block — scan directly
      for (let i = i0; i <= i1; i++) {
        const v = data[i];
        if (v != null) {
          if (v < rMin) rMin = v;
          if (v > rMax) rMax = v;
        }
      }
      return [rMin, rMax];
    }

    // Partial left block: i0 to end of block b0
    const leftEnd = (b0 + 1) * blockSize - 1;
    for (let i = i0; i <= leftEnd; i++) {
      const v = data[i];
      if (v != null) {
        if (v < rMin) rMin = v;
        if (v > rMax) rMax = v;
      }
    }

    // Full middle blocks
    for (let b = b0 + 1; b < b1; b++) {
      const bMin = blocks[b * 2] ?? Infinity;
      const bMax = blocks[b * 2 + 1] ?? -Infinity;
      if (bMin < rMin) rMin = bMin;
      if (bMax > rMax) rMax = bMax;
    }

    // Partial right block: start of block b1 to i1
    const rightStart = b1 * blockSize;
    for (let i = rightStart; i <= i1; i++) {
      const v = data[i];
      if (v != null) {
        if (v < rMin) rMin = v;
        if (v > rMax) rMax = v;
      }
    }

    return [rMin, rMax];
  }

  /**
   * Rebuild a single block (for incremental append).
   * @param blockIdx - index of the block to rebuild
   */
  updateBlock(blockIdx: number): void {
    const { data, blockSize, blocks, len } = this;

    if (blockIdx >= this.nBlocks) return;

    const start = blockIdx * blockSize;
    const end = Math.min(start + blockSize, len);
    let bMin = Infinity;
    let bMax = -Infinity;

    for (let i = start; i < end; i++) {
      const v = data[i];
      if (v != null) {
        if (v < bMin) bMin = v;
        if (v > bMax) bMax = v;
      }
    }

    blocks[blockIdx * 2] = bMin;
    blocks[blockIdx * 2 + 1] = bMax;
  }

  /**
   * Grow the tree to accommodate new data length.
   * Only rebuilds newly added blocks.
   */
  grow(newLen: number): void {
    const oldNBlocks = this.nBlocks;
    this.len = newLen;
    this.nBlocks = Math.ceil(newLen / this.blockSize);

    if (this.nBlocks > oldNBlocks) {
      const newBlocks = new Float64Array(this.nBlocks * 2);
      newBlocks.set(this.blocks);
      this.blocks = newBlocks;
    }

    // Rebuild the last old block (may have grown) and any new blocks
    const firstDirty = Math.max(0, oldNBlocks - 1);
    for (let b = firstDirty; b < this.nBlocks; b++) {
      this.updateBlock(b);
    }
  }

  /** Update data reference (for when the backing array changes, e.g. append with realloc) */
  setData(data: ArrayLike<number | null>): void {
    this.data = data;
  }
}
