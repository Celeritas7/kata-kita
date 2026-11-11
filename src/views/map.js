import { band } from '../components/band.js';
import { IC } from '../components/icons.js';
import { html, raw } from '../lib/html.js';
import { listExerciseStops, listRoleplay, listUnits, listVocabulary } from '../api/content.js';
import { EXERCISES, getExerciseResults } from '../lib/course-exercises.js';

export default {
  async render() {
    const [units, { words }, foodDialogue, exercises] = await Promise.all([
      listUnits(), listVocabulary(), listRoleplay(3), listExerciseStops(),
    ]);
    const results = getExerciseResults();
    return html`${band({ title: 'Peta kursus', sub: 'Six stops across Malaysia.' })}
<section class="sheet">
  <ol class="stops" aria-label="Hentian · Stops">${units.map(unit => {
    const topic = words.find(word => word.unit_id === unit.id)?.topic_id;
    function exerciseLink(step) {
      if (!exercises.some(row => row.unit_id === unit.id && row.step === step)) return null;
      const result = results[`${unit.id}:${step}`];
      return html`<a class="practice-action" href="#/exercise/${unit.id}/${step}">
        ${EXERCISES[step].label}
        ${result && html`<small>Best ${result.correct}/${result.total}${result.transcripts > 0 ? ' · transcript used' : ''}</small>`}
      </a>`;
    }
    return html`<li class="panel course-stop">
      <div class="stop"><span class="n">${unit.sort}</span><span><b>${unit.town}</b><span>${unit.title_ms} · ${unit.title_en}</span></span></div>
      <div class="course-actions">
        ${exerciseLink('dengar')}
        ${topic && html`<a class="practice-action" href="#/learn?topic=${encodeURIComponent(topic)}">Study words</a>`}
        ${unit.id === 3 && foodDialogue.length && html`<a class="practice-action" href="#/roleplay">Practice ordering food</a>`}
        ${exerciseLink('cabaran')}
        ${unit.id === 5 && html`<a class="practice-action" href="#/workshop">Open word builder ${raw(IC.next)}</a>`}
      </div>
    </li>`;
  })}</ol>
</section>`;
  },
};
