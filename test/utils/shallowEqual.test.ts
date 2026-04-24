import { describe, it, expect } from 'vitest';
import { shallowEqual } from '@/utils/shallowEqual';

describe('shallowEqual', () => {
  it('returns false for null vs object', () => {
    expect(shallowEqual(null, { a: 1 })).toBe(false);
  });

  it('returns true for identical references', () => {
    const obj = { a: 1, b: 'hello' };
    expect(shallowEqual(obj, obj)).toBe(true);
  });

  it('returns true for flat objects with same values', () => {
    expect(shallowEqual({ a: 1, b: 'x' }, { a: 1, b: 'x' })).toBe(true);
  });

  it('returns false for different flat values', () => {
    expect(shallowEqual({ a: 1 }, { a: 2 })).toBe(false);
  });

  it('returns false for different key counts', () => {
    expect(shallowEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
  });

  // Nested object support (config nesting pattern)
  it('returns true for inline nested objects with same values', () => {
    const a = { scaleId: 'x', grid: { show: true, stroke: '#ccc', width: 1 } };
    const b = { scaleId: 'x', grid: { show: true, stroke: '#ccc', width: 1 } };
    expect(shallowEqual(a, b)).toBe(true);
  });

  it('returns false for nested objects with different values', () => {
    const a = { scaleId: 'x', grid: { show: true, stroke: '#ccc' } };
    const b = { scaleId: 'x', grid: { show: false, stroke: '#ccc' } };
    expect(shallowEqual(a, b)).toBe(false);
  });

  it('returns false for nested objects with different key counts', () => {
    const a = { grid: { show: true } };
    const b = { grid: { show: true, stroke: '#ccc' } };
    expect(shallowEqual(a, b)).toBe(false);
  });

  it('returns true with multiple nested sub-objects', () => {
    const a = { grid: { show: true }, ticks: { size: 5 }, border: { width: 1 } };
    const b = { grid: { show: true }, ticks: { size: 5 }, border: { width: 1 } };
    expect(shallowEqual(a, b)).toBe(true);
  });

  it('does not recurse deeper than one level', () => {
    const inner = { pad: 0.1 };
    const a = { range: { min: inner } };
    const b = { range: { min: { pad: 0.1 } } };
    // inner !== { pad: 0.1 } by reference, and shallowEqualFlat uses ===
    expect(shallowEqual(a, b)).toBe(false);
  });

  it('handles arrays as non-plain-objects (reference equality)', () => {
    const arr = [1, 2, 3];
    expect(shallowEqual({ data: arr }, { data: arr })).toBe(true);
    expect(shallowEqual({ data: [1, 2] }, { data: [1, 2] })).toBe(false);
  });

  it('handles functions by reference', () => {
    const fn = () => 42;
    expect(shallowEqual({ cb: fn }, { cb: fn })).toBe(true);
    expect(shallowEqual({ cb: () => 42 }, { cb: () => 42 })).toBe(false);
  });
});
