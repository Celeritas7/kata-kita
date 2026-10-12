import { db } from '../supabase.js';
import { store } from '../store.js';

// Phase 0: every visitor gets an anonymous session (role `authenticated`), so RLS-protected
// content is readable before sign-up. This also covers flow A, where the first deck comes before the account.
// Phase 1 upgrades the same user via updateUser({ email }) / linkIdentity(), which keeps their rows.
export async function ensureSession() {
  if (!db) return null;
  let { data: { session } } = await db.auth.getSession();
  if (!session) {
    const { data, error } = await db.auth.signInAnonymously();
    if (error) throw error;
    session = data.session;
  }
  store.set({ session, authError: null });
  db.auth.onAuthStateChange((_event, s) => store.set({ session: s }));
  return session;
}

export async function signOut() {
  if (!db) return;
  await db.auth.signOut();
  store.set({ session: null, profile: null });
}
