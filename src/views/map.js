import { band } from '../components/band.js';
import { IC } from '../components/icons.js';
import { html, raw } from '../lib/html.js';
import { listRoleplay, listUnits, listVocabulary } from '../api/content.js';

export default {
  async render() {
    const [units, { words }, foodDialogue] = await Promise.all([listUnits(), listVocabulary(), listRoleplay(3)]);
    return html`${band({ title: 'Peta kursus', sub: 'Six stops across Malaysia.' })}
<section class="sheet">
  <ol class="stops" aria-label="Hentian · Stops">${units.map(unit => {
    const topic = words.find(word => word.unit_id === unit.id)?.topic_id;
    return html`<li class="panel course-stop">
      <div class="stop"><span class="n">${unit.sort}</span><span><b>${unit.town}</b><span>${unit.title_ms} · ${unit.title_en}</span></span></div>
      <div class="course-actions">
        ${topic && html`<a class="practice-action" href="#/learn?topic=${encodeURIComponent(topic)}">Study words</a>`}
        ${unit.id === 3 && foodDialogue.length && html`<a class="practice-action" href="#/roleplay">Practice ordering food</a>`}
        ${unit.id === 5 && html`<a class="practice-action" href="#/workshop">Open word builder ${raw(IC.next)}</a>`}
      </div>
    </li>`;
  })}</ol>
</section>`;
  },
};
