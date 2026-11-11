export const EXERCISES = {
  dengar: { title: 'Dengar', label: 'Listening', sub: 'Listen to everyday Malaysian Malay.' },
  cabaran: { title: 'Cabaran', label: 'Checkpoint', sub: 'Recall phrases, meanings, and word forms.' },
};

const KEY = 'kk.courseExercises.v1';

export function getExerciseResults() {
  try { return JSON.parse(localStorage.getItem(KEY)) ?? {}; } catch { return {}; }
}

export function saveExerciseResult(unitId, step, { correct, total, transcripts }) {
  const results = getExerciseResults();
  const key = `${unitId}:${step}`;
  const previous = results[key];
  // Compare equivalent sets and keep the stronger result, preferring fewer transcript reveals.
  if (previous?.total === total && (previous.correct > correct ||
    (previous.correct === correct && previous.transcripts <= transcripts))) return;
  results[key] = { correct, total, transcripts };
  localStorage.setItem(KEY, JSON.stringify(results));
}

function normalizeAnswer(value) {
  return value.normalize('NFKC').toLowerCase()
    .replace(/[.,!?;:…]+$/u, '').trim().replace(/\s+/gu, ' ');
}

export function matchesAnswer(question, submitted) {
  if (question.kind !== 'type') return submitted === question.answer;
  const answer = normalizeAnswer(submitted.trim());
  return Boolean(answer) && [question.answer, ...(question.alt_answers ?? [])]
    .some(valid => normalizeAnswer(valid.trim()) === answer);
}

export function exerciseChoices(question, forms) {
  if (question.kind !== 'affix') {
    return (question.options ?? []).map(option => ({ value: option, label: option }));
  }
  return forms.filter(form => form.root === question.affix_root).map(form => ({
    value: [form.prefix, form.root, form.suffix].join('|'),
    label: form.parts.map(([part]) => part).join(''),
  }));
}

export function answerLabel(question, choices) {
  return choices.find(choice => choice.value === question.answer)?.label ?? question.answer;
}
