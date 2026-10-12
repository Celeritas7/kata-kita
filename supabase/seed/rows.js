// Prototype constants → table rows (exact column names of 0001_schema.sql).
// Used by scripts/build-seed.mjs and by the app's demo mode.

const KIND = { p: 'pre', r: 'root', s: 'suf', pre: 'pre', root: 'root', suf: 'suf' };
const TOPIC_EN = { salam: 'Greetings', makan: 'Food', jalan: 'Getting around', wang: 'Money', pasar: 'Street talk' };
const TOPIC_UNIT = { salam: 1, wang: 2, makan: 3, jalan: 4, pasar: 6 };
const STEP_KINDS = ['dengar', 'kata', 'peranan', 'cabaran'];
const GENERIC_STEPS = [['Dengar', 'Listen'], ['Kata', 'Words · swipe deck'], ['Main peranan', 'Role-play'], ['Cabaran', 'Checkpoint: 5 questions']];
const REGISTERS = new Set(['informal', 'slang']);

export const TABLE_ORDER = [
  'topics', 'units', 'unit_steps', 'words', 'word_parts', 'proverbs',
  'affix_roots', 'affix_forms', 'roleplay_turns', 'roleplay_replies', 'questions',
];

export function toRows(C) {
  const topics = C.TOPICS.filter(t => t.id !== 'all').map((t, i) => ({
    id: t.id, name_ms: t.name, name_en: TOPIC_EN[t.id] ?? null, sort: i + 1,
  }));

  const units = C.STOPS.map(s => ({
    id: s.n, town: s.town, title_ms: s.unit, title_en: s.en, map_x: s.x, map_y: s.y, sort: s.n,
  }));

  const unit_steps = units.flatMap(u => STEP_KINDS.map((kind, i) => {
    const [title_ms, title_en] = u.id === 3 ? C.STOP_STEPS[i] : GENERIC_STEPS[i];
    return { id: (u.id - 1) * 4 + i + 1, unit_id: u.id, kind, title_ms, title_en, sort: i + 1 };
  }));

  const words = C.WORDS.map(w => ({
    id: w.id, topic_id: w.t, unit_id: TOPIC_UNIT[w.t] ?? null, ms: w.ms, en: w.en,
    syllables: w.syl ?? null, jawi: w.jawi ?? null, example_ms: w.ex ?? null, example_en: w.exEn ?? null,
    register: REGISTERS.has(w.tag) ? w.tag : null,
    note: w.tag && !REGISTERS.has(w.tag) ? w.tag : null,
    audio_path: null,
  }));

  const word_parts = C.WORDS.flatMap(w => (w.parts || []).map(([text, k], pos) => ({
    word_id: w.id, pos, text, kind: KIND[k],
  })));

  const proverbs = C.PERIBAHASA.map((p, i) => ({
    id: i + 1, ms: p.ms, literal_en: p.lit, use_when: p.use ?? null, key_word: p.key ?? null,
  }));

  const affix_roots = Object.entries(C.ROOTS).map(([root, en], i) => ({ root, en, sort: i + 1 }));

  const affix_forms = Object.entries(C.FORMS).map(([key, [parts, meaning_en, rule_en]], i) => {
    const [prefix, root, suffix] = key.split('|');
    return { id: i + 1, prefix, root, suffix, parts: parts.map(([t, k]) => [t, KIND[k]]), meaning_en, rule_en };
  });

  const roleplay_turns = [];
  const roleplay_replies = [];
  C.MAMAK.forEach((turn, i) => {
    const id = i + 1;
    roleplay_turns.push({ id, unit_id: 3, sort: id, speaker: 'Pelayan · waiter', line_ms: turn.them, line_en: turn.them_en });
    turn.replies.forEach(([text_ms, is_correct, feedback_en]) => {
      roleplay_replies.push({ id: roleplay_replies.length + 1, turn_id: id, text_ms, is_correct, feedback_en });
    });
  });

  const sortIn = {};
  const questions = C.QUESTIONS.map((q, i) => {
    const k = `${q.unit}|${q.step}`;
    sortIn[k] = (sortIn[k] || 0) + 1;
    return {
      id: i + 1, unit_id: q.unit, step: q.step, kind: q.kind,
      prompt_ms: q.prompt_ms ?? null, prompt_en: q.prompt_en ?? null, audio_text: q.audio_text ?? null,
      options: q.options ?? null, answer: q.answer, alt_answers: q.alt ?? [],
      affix_root: q.affix_root ?? null, sort: sortIn[k],
    };
  });

  return { topics, units, unit_steps, words, word_parts, proverbs, affix_roots, affix_forms, roleplay_turns, roleplay_replies, questions };
}
