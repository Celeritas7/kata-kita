// Tiny app store: one state object, shallow merges, synchronous subscribers.
const state = {
  mode: 'demo',          // 'live' once Supabase keys are present
  session: null,
  profile: null,
  authError: null,
  online: navigator.onLine,
  route: '/',
};
const subs = new Set();

export const store = {
  get: () => state,
  set(patch) {
    Object.assign(state, typeof patch === 'function' ? patch(state) : patch);
    subs.forEach(fn => fn(state));
  },
  subscribe(fn) {
    subs.add(fn);
    return () => subs.delete(fn);
  },
};
