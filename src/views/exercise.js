import { listAffixes, listExerciseQuestions, listUnits } from '../api/content.js';
import { band } from '../components/band.js';
import { toast } from '../components/toast.js';
import { answerLabel, exerciseChoices, EXERCISES, matchesAnswer, saveExerciseResult } from '../lib/course-exercises.js';
import { html } from '../lib/html.js';
import { preloadMalayAudio, speakMalay, stopMalayAudio } from '../lib/speak.js';

export default {
  async render({ unit, step }) {
    const unitId = Number(unit);
    const exercise = Object.hasOwn(EXERCISES, step) ? EXERCISES[step] : null;
    if (!Number.isSafeInteger(unitId) || unitId < 1 || !exercise) return unavailable();
    const [units, questions] = await Promise.all([listUnits(), listExerciseQuestions(unitId, step)]);
    const courseStop = units.find(stop => stop.id === unitId);
    if (!courseStop || !questions.length) return unavailable();

    const forms = questions.some(question => question.kind === 'affix') ? (await listAffixes()).forms : [];
    const entries = questions.map(question => ({ question, choices: exerciseChoices(question, forms) }))
      .filter(({ question, choices }) => question.kind === 'type' || choices.some(choice => choice.value === question.answer));
    if (!entries.length) return unavailable();

    return html`${band({ title: exercise.title, sub: exercise.sub, eyebrow: courseStop.town, back: '#/map' })}
<section class="sheet">
  <div class="panel" id="course-exercise">
    <div data-exercise-content></div>
    <template>${entries.map(({ question, choices }) => questionTemplate(question, choices))}</template>
  </div>
</section>`;
  },
  mount(root, { unit, step }) {
    const section = root.querySelector('#course-exercise');
    if (!section) return;
    const content = section.querySelector('[data-exercise-content]');
    const questions = [...section.querySelector('template').content.children];
    const events = new AbortController();
    preloadMalayAudio();
    let attempt = questions;
    let index = 0;
    let correct = 0;
    let missed = [];
    let transcripts = 0;
    let assisted = false;
    let answered = false;
    let retrying = false;

    function showQuestion(focus) {
      stopMalayAudio();
      assisted = false;
      answered = false;
      const question = attempt[index].cloneNode(true);
      const options = [...question.querySelectorAll('.exercise-option')];
      const check = question.querySelector('[type="submit"]');
      for (let remaining = options.length; remaining > 0; remaining--) {
        const chosen = Math.floor(Math.random() * remaining);
        const [option] = options.splice(chosen, 1);
        check.before(option);
      }
      content.replaceChildren(question);
      content.querySelector('[data-question-position]').textContent = `Question ${index + 1} of ${attempt.length}`;
      if (focus) content.querySelector('h2').focus();
    }

    function finish() {
      stopMalayAudio();
      let saved = false;
      if (!retrying) {
        try {
          saveExerciseResult(Number(unit), step, { correct, total: attempt.length, transcripts });
          saved = true;
        } catch { /* the result remains visible */ }
      }
      content.innerHTML = String(html`
        <h2 class="h2" tabindex="-1">${retrying ? 'Mistakes reviewed' : 'Exercise complete'}</h2>
        <p class="exercise-result"><strong>${correct} / ${attempt.length}</strong> correct</p>
        ${transcripts > 0 && html`<p class="muted">Used the transcript on ${transcripts} ${transcripts === 1 ? 'question' : 'questions'}.</p>`}
        ${!retrying && html`<p class="muted">${saved ? 'Your best result is saved in this browser.' : 'This browser could not save your result.'}</p>`}
        <div class="course-actions">
          ${missed.length > 0 && html`<button type="button" class="practice-action" data-exercise="mistakes">Practice mistakes</button>`}
          <button type="button" class="practice-action" data-exercise="restart">Start over</button>
          <a class="practice-action" href="#/map">Back to course</a>
        </div>`);
      content.querySelector('h2').focus();
    }

    function submit(value) {
      if (answered || !value.trim()) return;
      answered = true;
      const active = content.firstElementChild;
      const question = {
        kind: active.dataset.kind,
        answer: active.dataset.answer,
        alt_answers: JSON.parse(active.dataset.alternatives),
      };
      const ok = matchesAnswer(question, value);
      if (ok) correct++;
      else missed.push(attempt[index]);
      const feedback = active.querySelector('[data-exercise-feedback]');
      feedback.textContent = ok ? 'Correct.' : `Answer: ${active.dataset.answerLabel}`;
      feedback.hidden = false;
      const transcript = active.querySelector('[data-transcript]');
      if (transcript) {
        transcript.hidden = false;
        active.querySelector('[data-exercise="transcript"]').hidden = true;
      }
      active.querySelectorAll('fieldset').forEach(fieldset => { fieldset.disabled = true; });
      const next = active.querySelector('[data-exercise="next"]');
      next.textContent = index + 1 === attempt.length ? 'See result' : 'Next question';
      next.hidden = false;
      next.focus();
    }

    content.addEventListener('submit', event => {
      event.preventDefault();
      const data = new window.FormData(event.target);
      submit(String(data.get('answer') ?? ''));
    }, { signal: events.signal });

    content.addEventListener('click', async event => {
      const action = event.target.closest('[data-exercise]')?.dataset.exercise;
      if (!action) return;
      const transcript = content.querySelector('[data-transcript]');
      if (action === 'audio') {
        if (!await speakMalay(transcript.textContent)) toast('Malay audio is unavailable. You can reveal the transcript.');
      } else if (action === 'transcript') {
        if (!answered && !assisted) { transcripts++; assisted = true; }
        transcript.hidden = false;
        event.target.closest('button').hidden = true;
        transcript.focus();
      } else if (action === 'next' && answered) {
        index++;
        if (index < attempt.length) showQuestion(true);
        else finish();
      } else if (action === 'restart' || action === 'mistakes') {
        retrying = action === 'mistakes';
        attempt = retrying ? missed : questions;
        index = correct = transcripts = 0;
        missed = [];
        showQuestion(true);
      }
    }, { signal: events.signal });

    showQuestion(false);
    return () => { events.abort(); stopMalayAudio(); };
  },
};

function unavailable() {
  return html`${band({ title: 'Latihan', sub: 'Course exercise', back: '#/map' })}
<section class="sheet"><div class="panel">There is no exercise at this stop.</div></section>`;
}

function questionTemplate(question, choices) {
  const multipleChoice = question.kind !== 'type';
  const headings = { type: 'Write the Malay phrase', affix: 'Choose the correct word form', mcq: 'Choose the meaning', listen: 'Listen and choose' };
  const prompt = question.prompt_ms || question.prompt_en;
  return html`<article class="exercise-question" data-kind="${question.kind}" data-answer="${question.answer}"
    data-alternatives="${JSON.stringify(question.alt_answers ?? [])}" data-answer-label="${answerLabel(question, choices)}">
    <p class="eyebrow" data-question-position></p>
    <h2 class="h2" tabindex="-1" lang="${question.prompt_ms ? 'ms' : 'en'}">${prompt}</h2>
    ${question.kind === 'listen' && question.prompt_ms && question.prompt_en && html`<p class="muted">${question.prompt_en}</p>`}
    ${question.audio_text && html`<div class="course-actions">
      <button type="button" class="practice-action" data-exercise="audio">Play Malay audio</button>
      <button type="button" class="practice-action" data-exercise="transcript">Show transcript</button>
    </div>
    <p class="practice-answer" lang="ms" data-transcript tabindex="-1" hidden>${question.audio_text}</p>`}
    <form>
      <fieldset class="exercise-options">
        <legend>${headings[question.kind]}</legend>
        ${multipleChoice
          ? choices.map(choice => html`<label class="exercise-option">
            <input type="radio" name="answer" value="${choice.value}" required>
            <span>${choice.label}</span>
          </label>`)
          : html`<label class="practice-field"><span class="sr-only">Your answer in Malay</span>
            <input type="text" name="answer" lang="ms" autocomplete="off" autocapitalize="off" spellcheck="false" required>
          </label>`}
        <button type="submit" class="practice-action primary">Check answer</button>
      </fieldset>
    </form>
    <p class="practice-feedback" role="status" data-exercise-feedback hidden></p>
    <button type="button" class="practice-action primary" data-exercise="next" hidden></button>
  </article>`;
}
