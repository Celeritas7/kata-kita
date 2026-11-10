const KEY = 'kk.reviews.v1';
const DAY = 86_400_000;

export const RATINGS = [
  ['again', 'Again'],
  ['hard', 'Hard'],
  ['good', 'Good'],
  ['easy', 'Easy'],
];

export function wordKey(word) {
  return `ms:${word.ms.trim().toLowerCase()}`;
}

export function loadReviews() {
  try { return JSON.parse(localStorage.getItem(KEY)) ?? {}; } catch { return {}; }
}

export function recordReview(word, rating, now = Date.now()) {
  const reviews = loadReviews();
  const key = wordKey(word);
  reviews[key] = schedule(reviews[key], rating, now);
  localStorage.setItem(KEY, JSON.stringify(reviews));
}

export function schedule(previous, rating, now) {
  const days = previous?.days ?? 0;
  const interval = {
    again: 10 / 1440,
    hard: Math.max(1, Math.round(days * 1.2)),
    good: Math.max(2, Math.round(days * 2)),
    easy: Math.max(4, Math.round(days * 3)),
  }[rating];
  return {
    days: Math.min(interval, 365),
    due: now + Math.min(interval, 365) * DAY,
    rating,
    reviewedAt: now,
  };
}

export function studyQueue(words, reviews, mode, now = Date.now()) {
  const due = words.filter(word => reviews[wordKey(word)]?.due <= now);
  due.sort((a, b) => reviews[wordKey(a)].due - reviews[wordKey(b)].due);
  if (mode === 'due') return due;
  const fresh = words.filter(word => !reviews[wordKey(word)]);
  if (mode === 'all') {
    const later = words.filter(word => reviews[wordKey(word)]?.due > now);
    later.sort((a, b) => (reviews[wordKey(a)].reviewedAt ?? 0) - (reviews[wordKey(b)].reviewedAt ?? 0));
    return [...due, ...fresh, ...later];
  }
  return [...due, ...fresh];
}
