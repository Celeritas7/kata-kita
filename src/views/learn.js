import { listVocabulary } from '../api/content.js';
import { band } from '../components/band.js';
import { memoryHints, onHintChange } from '../components/memory-hints.js';
import { toast } from '../components/toast.js';
import { html } from '../lib/html.js';
import { hintsFor } from '../lib/memory-hints.js';
import { pron } from '../lib/pron.js';
import { speakMalay } from '../lib/speak.js';
import { loadReviews, RATINGS, recordReview, studyQueue } from '../srs/local-review.js';

const MODES = [
  ['daily', 'Daily study · due + new'],
  ['due', 'Review due words'],
  ['all', 'Practice all words'],
  ['hints', 'Words with memory hints'],
];

export default {
  render() {
    return html`${band({ title: 'Belajar', sub: 'Recall the word, then rate how well you knew it.' })}
<section class="sheet" aria-label="Flashcard practice">
  <div id="study-session" class="panel">Loading vocabulary…</div>
  <a href="#/profile">Set your memory-hint languages</a>
</section>`;
  },
  mount(root) {
    const host = root.querySelector('#study-session');
    const events = new AbortController();
    const params = new URLSearchParams(location.hash.split('?')[1]);
    let topic = params.get('topic') ?? 'all';
    let mode = params.get('mode') === 'due' ? 'due' : 'daily';
    let direction = 'ms';
    let words = [];
    let topics = [];
    let queue = [];
    let index = 0;
    let revealed = false;

    function selectedWords() {
      return words.filter(word => topic === 'all' || word.topic_id === topic);
    }

    function queueFor(reviews, selected) {
      if (mode === 'hints') return studyQueue(selected.filter(word => hintsFor(word.ms).length), reviews, 'all');
      return studyQueue(selected, reviews, mode);
    }

    function setup(message) {
      const reviews = loadReviews();
      const selected = selectedWords();
      const due = studyQueue(selected, reviews, 'due').length;
      const available = queueFor(reviews, selected).length;
      host.innerHTML = String(html`
        <h2 class="h2">Choose your practice</h2>
        ${message && html`<p role="status">${message}</p>`}
        <p class="muted">${selected.length} words in this topic · ${due} due for review</p>
        <label class="practice-field">Topic
          <select name="topic"><option value="all">All topics</option>
            ${topics.map(t => html`<option value="${t.id}">${t.name_en || t.name_ms}</option>`)}
          </select>
        </label>
        <label class="practice-field">Mode
          <select name="mode">${MODES.map(([id, label]) => html`<option value="${id}">${label}</option>`)}</select>
        </label>
        <label class="practice-field">Card direction
          <select name="direction">
            <option value="ms">Malay → English</option><option value="en">English → Malay</option>
          </select>
        </label>
        ${!available && html`<p class="muted">No cards in this queue. Try Practice all words to revisit a word early.</p>`}
        <button class="practice-action primary" type="button" data-study="start">Start practice</button>`);
      host.querySelector('[name="topic"]').value = topic;
      host.querySelector('[name="mode"]').value = mode;
      host.querySelector('[name="direction"]').value = direction;
      host.querySelector('[data-study="start"]').disabled = !available;
    }

    function card(focus) {
      const word = queue[index];
      const prompt = word[direction];
      const answer = word[direction === 'ms' ? 'en' : 'ms'];
      host.innerHTML = String(html`
        <div class="practice-toolbar">
          <span class="eyebrow">Card ${index + 1} / ${queue.length}</span>
          <button class="practice-action" type="button" data-study="end">End session</button>
        </div>
        <div class="practice-word">
          <h2 class="h2" lang="${direction}" tabindex="-1">${prompt}</h2>
          ${(direction === 'ms' || revealed) && html`
            <button class="practice-action" type="button" data-study="speak">Hear Malay</button>`}
        </div>
        ${revealed ? html`
          <div class="practice-answer">
            <strong>${answer}</strong>
            ${word.syllables && html`<p class="muted">${word.syllables}</p>`}
            ${word.jawi && html`<p class="jawi" lang="ms-Arab">${word.jawi}</p>`}
            <p class="dev" lang="hi" data-pron hidden></p>
            ${(word.register || word.note) && html`<p class="muted">${word.register || word.note}</p>`}
            ${word.example_ms && html`<p><b lang="ms">${word.example_ms}</b><br>${word.example_en}</p>`}
          </div>
          ${memoryHints(word)}
          <p class="eyebrow">How well did you know it?</p>
          <div class="practice-ratings">${RATINGS.map(([rating, label]) => html`
            <button class="practice-action" type="button" data-rating="${rating}">${label}</button>`)}</div>`
          : html`${memoryHints(word, { expandable: true })}
            <button class="practice-action primary" type="button" data-study="flip">Show answer</button>`}
      `);
      if (focus) host.querySelector('h2').focus();
      const guide = host.querySelector('[data-pron]');
      if (guide) pron(word.ms).then(text => {
        if (!text || !guide.isConnected) return;
        guide.textContent = text;
        guide.hidden = false;
      });
    }

    host.addEventListener('change', event => {
      onHintChange(event);
      const { name, value } = event.target;
      if (!name) return;
      if (name === 'topic') topic = value;
      if (name === 'mode') mode = value;
      if (name === 'direction') direction = value;
      setup();
      host.querySelector(`[name="${name}"]`)?.focus();
    }, { signal: events.signal });
    host.addEventListener('click', event => {
      const button = event.target.closest('[data-study], [data-rating]');
      if (!button) return;
      const { study, rating } = button.dataset;
      if (study === 'start') {
        queue = queueFor(loadReviews(), selectedWords()).slice(0, 10);
        if (!queue.length) { setup(); return; }
        index = 0;
        revealed = false;
        card(true);
      } else if (study === 'flip') {
        revealed = true;
        card(true);
      } else if (study === 'speak') {
        if (!speakMalay(queue[index].ms)) toast('This device has no Malay voice available.');
      } else if (study === 'end') {
        setup(`${index} cards rated.`);
        host.querySelector('select').focus();
      } else if (rating && revealed) {
        try { recordReview(queue[index], rating); }
        catch { toast('Could not save this review on this device.'); return; }
        index++;
        revealed = false;
        if (index < queue.length) card(true);
        else {
          setup(`Session complete. ${index} cards rated and saved on this device.`);
          host.querySelector('select').focus();
        }
      }
    }, { signal: events.signal });

    listVocabulary().then(data => {
      if (events.signal.aborted) return;
      ({ words, topics } = data);
      if (!topics.some(t => t.id === topic)) topic = 'all';
      setup();
    }).catch(() => {
      if (!events.signal.aborted) host.textContent = 'Could not load vocabulary. Check your connection and reopen this tab.';
    });
    return () => { events.abort(); window.speechSynthesis?.cancel(); };
  },
};
