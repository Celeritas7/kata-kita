import { db } from '../supabase.js';
import { store } from '../store.js';

// Columns the client may write (mirrors the column grant in 0002_rls.sql).
const EDITABLE = ['display_name', 'motivation', 'level', 'daily_goal', 'card_front', 'reminder_time', 'timezone', 'theme'];

export async function getProfile() {
  if (!db) return null;
  const { data, error } = await db.from('profiles').select('*').maybeSingle();
  if (error) throw error;
  return data;
}

// Fire-and-forget theme sync; localStorage stays the source of truth on this device.
export function saveTheme(pref) {
  if (store.get().profile) updateProfile({ theme: pref }).catch(err => console.warn('theme not synced', err));
}

export async function updateProfile(patch) {
  if (!db || !store.get().session) return null;
  const clean = Object.fromEntries(Object.entries(patch).filter(([k]) => EDITABLE.includes(k)));
  const id = store.get().session.user.id;
  const { data, error } = await db.from('profiles').update(clean).eq('id', id).select().single();
  if (error) throw error;
  store.set({ profile: data });
  return data;
}
