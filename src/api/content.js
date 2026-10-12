import { db } from '../supabase.js';
import { dayIndex } from '../lib/time.js';

export const CONTENT_TABLES = [
  'topics', 'units', 'unit_steps', 'words', 'word_parts', 'proverbs',
  'affix_roots', 'affix_forms', 'roleplay_turns', 'roleplay_replies', 'questions',
];

// Demo mode (no keys): the same rows the seed inserts, built from the prototype constants.
let local;
async function sample() {
  if (!local) {
    const [{ default: content }, { toRows }] = await Promise.all([
      import('../../supabase/seed/content.js'),
      import('../../supabase/seed/rows.js'),
    ]);
    local = toRows(content);
  }
  return local;
}

function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}

export async function proverbOfDay(tz) {
  const list = db
    ? unwrap(await db.from('proverbs').select('id, ms, literal_en, use_when, key_word').order('id'))
    : (await sample()).proverbs;
  return list.length ? list[dayIndex(list.length, tz)] : null;
}

export async function listUnits() {
  if (!db) return [...(await sample()).units].sort((a, b) => a.sort - b.sort);
  return unwrap(await db.from('units').select('id, town, title_ms, title_en, sort').order('sort'));
}

// ── Phase 0 exit check helpers ──
export async function expectedCounts() {
  const rows = await sample();
  return Object.fromEntries(CONTENT_TABLES.map(t => [t, rows[t].length]));
}

export async function contentCounts() {
  if (!db) {
    const rows = await sample();
    return CONTENT_TABLES.map(t => [t, rows[t].length, null]);
  }
  return Promise.all(CONTENT_TABLES.map(async t => {
    const { count, error } = await db.from(t).select('*', { count: 'exact', head: true });
    return [t, error ? null : count, error?.message ?? null];
  }));
}

// true = RLS refused a write to content (correct). null = not checked (demo mode).
export async function contentWriteBlocked() {
  if (!db) return null;
  const { data, error } = await db.from('proverbs').insert({ ms: '__rls_probe__', literal_en: '__rls_probe__' }).select('id');
  if (error) return true;
  if (data?.[0]) await db.from('proverbs').delete().eq('id', data[0].id);
  return false;
}
