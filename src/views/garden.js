import { listVocabulary } from '../api/content.js';
import { band } from '../components/band.js';
import { memoryHints, onHintChange } from '../components/memory-hints.js';
import { html } from '../lib/html.js';
import { loadReviews, studyQueue, wordKey } from '../srs/local-review.js';

export default {
  async render() {
    const { words } = await listVocabulary();
    const reviews = loadReviews();
    const due = studyQueue(words, reviews, 'due').length;
    const studied = words.filter(word => reviews[wordKey(word)]).length;
    const now = Date.now();

    return html`${band({ title: 'Kebun kata', sub: 'Your word garden and review queue.' })}
<section class="sheet">
  <div class="panel">
    <p><b>${studied} / ${words.length}</b> studied · <b>${due}</b> due</p>
    <p class="muted">Reviews are stored in this browser on this device.</p>
    <a class="practice-action primary" href="#/learn?mode=due">Review due words</a>
  </div>
  <label class="practice-field">Search Malay or English
    <input id="garden-search" type="search" autocomplete="off" placeholder="Try madu or honey">
  </label>
  <p id="garden-empty" class="muted" role="status" hidden>No matching words.</p>
  <div class="word-bank">${words.map(word => {
    const review = reviews[wordKey(word)];
    const status = !review ? 'New' : review.due <= now ? 'Due now' : 'Scheduled';
    return html`<details class="panel" data-word-search="${word.ms} ${word.en}">
      <summary><b lang="ms">${word.ms}</b> · ${word.en}<small>${status}</small></summary>
      ${word.example_ms && html`<p><b lang="ms">${word.example_ms}</b><br>${word.example_en}</p>`}
      ${memoryHints(word)}
    </details>`;
  })}</div>
</section>`;
  },
  mount(root) {
    const bank = root.querySelector('.word-bank');
    bank.addEventListener('change', onHintChange);
    const search = root.querySelector('#garden-search');
    const rows = [...root.querySelectorAll('[data-word-search]')];
    const empty = root.querySelector('#garden-empty');
    search.addEventListener('input', () => {
      const term = search.value.trim().toLowerCase();
      rows.forEach(row => { row.hidden = !row.dataset.wordSearch.toLowerCase().includes(term); });
      empty.hidden = rows.some(row => !row.hidden);
    });
  },
};
