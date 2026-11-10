import { html } from '../lib/html.js';
import { HINT_LANGUAGES, hintsFor, setKnownHintWord } from '../lib/memory-hints.js';

import { toast } from './toast.js';

export function memoryHints(word, { expandable = false } = {}) {
  const hints = hintsFor(word.ms);
  if (!hints.length) return null;
  const list = html`<ul class="memory-list">${hints.map(hint => {
    const language = HINT_LANGUAGES.find(language => language.id === hint.lang);
    return html`<li>
      <span class="eyebrow">${language.name} · ${hint.known ? 'Known word' : hint.mode === 'familiar' ? 'Familiar' : 'Reference'}</span>
      <p><b lang="${hint.lang}">${hint.word}</b>${hint.roman && html` <span>${hint.roman}</span>`}</p>
      <small>${hint.kind} · ${hint.note}${hint.source && html` <a href="${hint.source}" target="_blank" rel="noopener noreferrer">Source</a>`}</small>
      ${!expandable && html`<label class="known-hint">
        ${hint.known ? html`<input type="checkbox" data-known-hint="${hint.key}" checked>`
          : html`<input type="checkbox" data-known-hint="${hint.key}">`}
        I know this ${language.name} word
      </label>`}
    </li>`;
  })}</ul>`;
  return expandable
    ? html`<details class="memory-hints"><summary>Need a memory hint?</summary>${list}</details>`
    : html`<div class="memory-hints"><h3 class="eyebrow">Memory connections</h3>${list}</div>`;
}

export function onHintChange(event) {
  const input = event.target.closest('[data-known-hint]');
  if (!input) return;
  try { setKnownHintWord(input.dataset.knownHint, input.checked); }
  catch {
    input.checked = !input.checked;
    toast('Could not save this hint on this device.');
  }
}
