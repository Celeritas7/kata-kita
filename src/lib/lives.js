// Client mirror of current_lives() in 0003_functions.sql, for the countdown. The server stays the authority.
export const MAX_LIVES = 5;
export const REFILL_MS = 4 * 60 * 60 * 1000;

export function livesNow(lives, updatedAt, now = Date.now()) {
  const elapsed = now - new Date(updatedAt).getTime();
  return Math.min(MAX_LIVES, lives + Math.max(0, Math.floor(elapsed / REFILL_MS)));
}

export function nextLifeAt(lives, updatedAt, now = Date.now()) {
  const n = livesNow(lives, updatedAt, now);
  if (n >= MAX_LIVES) return null;
  return new Date(new Date(updatedAt).getTime() + (n - lives + 1) * REFILL_MS);
}
