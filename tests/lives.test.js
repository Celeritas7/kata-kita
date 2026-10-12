import { describe, it, expect } from 'vitest';
import { livesNow, nextLifeAt, REFILL_MS } from '../src/lib/lives.js';

const T0 = Date.parse('2026-10-12T00:00:00Z');

describe('lives refill', () => {
  it('no refill before 4 h', () => {
    expect(livesNow(0, T0, T0 + REFILL_MS - 1)).toBe(0);
  });
  it('+1 at exactly 4 h', () => {
    expect(livesNow(0, T0, T0 + REFILL_MS)).toBe(1);
  });
  it('caps at 5', () => {
    expect(livesNow(2, T0, T0 + 30 * 3600e3)).toBe(5);
  });
  it('next life counts from the partial interval', () => {
    expect(nextLifeAt(3, T0, T0 + REFILL_MS + 60e3).getTime()).toBe(T0 + 2 * REFILL_MS);
  });
  it('no next life when full', () => {
    expect(nextLifeAt(5, T0, T0)).toBeNull();
  });
});
