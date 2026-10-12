import { describe, it, expect } from 'vitest';
import { stageFor } from '../src/srs/stage.js';

describe('stageFor', () => {
  it('an unreviewed card is a seed', () => {
    expect(stageFor({ reps: 0, stability: 50 })).toBe(0);
  });
  it.each([
    [0.5, 1], [1.99, 1], [2, 2], [6.99, 2], [7, 3], [20.99, 3], [21, 4], [365, 4],
  ])('stability %f → stage %i', (stability, stage) => {
    expect(stageFor({ reps: 1, stability })).toBe(stage);
  });
});
