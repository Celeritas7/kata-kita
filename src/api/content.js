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

export async function listVocabulary() {
  if (!db) {
    const { words, topics } = await sample();
    return { words, topics };
  }
  const topics = unwrap(await db.from('topics').select('id, name_ms, name_en').order('sort'));
  const words = [];
  const pageSize = 500;
  for (let offset = 0; ; offset += pageSize) {
    const page = unwrap(await db.from('words')
      .select('id, topic_id, unit_id, ms, en, syllables, jawi, example_ms, example_en, register, note')
      .order('id').range(offset, offset + pageSize - 1));
    words.push(...page);
    if (page.length < pageSize) break;
  }
  return { words, topics };
}

export async function listAffixes() {
  if (!db) {
    const { affix_roots: roots, affix_forms: forms } = await sample();
    return { roots, forms };
  }
  const [roots, forms] = await Promise.all([
    db.from('affix_roots').select('root, en').order('sort'),
    db.from('affix_forms').select('prefix, root, suffix, parts, meaning_en, rule_en').order('id'),
  ]);
  return { roots: unwrap(roots), forms: unwrap(forms) };
}

export async function listRoleplay(unitId) {
  let turns;
  let replies;
  if (db) {
    turns = unwrap(await db.from('roleplay_turns').select('id, speaker, line_ms, line_en')
      .eq('unit_id', unitId).order('sort'));
    if (!turns.length) return [];
    replies = unwrap(await db.from('roleplay_replies').select('id, turn_id, text_ms, is_correct, feedback_en')
      .in('turn_id', turns.map(turn => turn.id)).order('id'));
  } else {
    const sampleRows = await sample();
    turns = sampleRows.roleplay_turns.filter(turn => turn.unit_id === unitId);
    replies = sampleRows.roleplay_replies;
  }
  return turns.map(turn => ({ ...turn, replies: replies.filter(reply => reply.turn_id === turn.id) }));
}

export async function listExerciseStops() {
  if (!db) return (await sample()).questions;
  return unwrap(await db.from('questions').select('unit_id, step'));
}

export async function listExerciseQuestions(unitId, step) {
  if (!db) {
    const { questions } = await sample();
    return questions.filter(question => question.unit_id === unitId && question.step === step);
  }
  return unwrap(await db.from('questions')
    .select('id, kind, prompt_ms, prompt_en, audio_text, options, answer, alt_answers, affix_root')
    .eq('unit_id', unitId).eq('step', step).order('sort').order('id'));
}
