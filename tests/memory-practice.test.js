import { expect, test } from 'vitest';
import { hintsFor } from '../src/lib/memory-hints.js';
import { schedule, studyQueue, wordKey } from '../src/srs/local-review.js';

test('recognized hints come first, and an off language stays hidden', () => {
  const known = new Set(['id:madu']);
  expect(hintsFor(' MADU ', { sa: 'familiar', id: 'reference' }, known).map(hint => hint.lang))
    .toEqual(['id', 'sa']);
  expect(hintsFor('madu', { sa: 'familiar', id: 'off' }, known).map(hint => hint.lang))
    .toEqual(['sa']);
});

test('daily study puts due cards before new cards and skips future cards', () => {
  const now = Date.UTC(2026, 0, 1);
  const due = { ms: 'madu' };
  const future = { ms: 'kedai' };
  const fresh = { ms: 'kapal' };
  const words = [fresh, future, due];
  const reviews = {
    [wordKey(due)]: schedule(null, 'again', now - 600_000),
    [wordKey(future)]: schedule(null, 'easy', now),
  };
  expect(studyQueue(words, reviews, 'daily', now)).toEqual([due, fresh]);
  expect(studyQueue(words, reviews, 'due', now)).toEqual([due]);
  expect(studyQueue(words, reviews, 'all', now)).toEqual([due, fresh, future]);
});
