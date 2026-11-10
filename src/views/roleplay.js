import { listRoleplay } from '../api/content.js';
import { band } from '../components/band.js';
import { toast } from '../components/toast.js';
import { html } from '../lib/html.js';
import { speakMalay } from '../lib/speak.js';

export default {
  render() {
    return html`${band({ title: 'Di kedai mamak', sub: 'Practice ordering food in Malaysian Malay.', back: '#/map' })}
<section class="sheet">
  <div class="panel" id="roleplay">Loading conversation…</div>
</section>`;
  },
  mount(root) {
    const host = root.querySelector('#roleplay');
    const events = new AbortController();
    let turns = [];
    let index = 0;
    let completed = false;

    function prompt(focus) {
      const turn = turns[index];
      host.innerHTML = String(turn ? html`
        <p class="eyebrow">${turn.speaker} · Turn ${index + 1} / ${turns.length}</p>
        <div class="practice-word"><h2 class="h2" lang="ms" tabindex="-1">${turn.line_ms}</h2></div>
        <button class="practice-action" type="button" data-roleplay="speak">Hear Malay</button>
        <details class="memory-hints"><summary>Show English</summary><p>${turn.line_en}</p></details>
        <div class="practice-replies">${turn.replies.map((reply, i) => html`
          <button class="practice-action" type="button" lang="ms" data-reply="${i}">${reply.text_ms}</button>`)}</div>
        <p class="practice-feedback" role="status"></p>
        <button class="practice-action primary" type="button" data-roleplay="next" hidden>${index + 1 === turns.length ? 'Finish' : 'Next turn'}</button>`
        : html`<h2 class="h2" tabindex="-1">Order complete</h2>
          <button class="practice-action primary" type="button" data-roleplay="restart">Practice again</button>`);
      if (focus) host.querySelector('h2').focus();
    }

    host.addEventListener('click', event => {
      const button = event.target.closest('[data-roleplay], [data-reply]');
      if (!button) return;
      const action = button.dataset.roleplay;
      if (action === 'speak') {
        if (!speakMalay(turns[index].line_ms)) toast('This device has no Malay voice available.');
      } else if (action === 'next' && completed) {
        index++;
        completed = false;
        prompt(true);
      } else if (action === 'restart') {
        index = 0;
        prompt(true);
      } else if (button.dataset.reply != null && !completed) {
        const reply = turns[index].replies[Number(button.dataset.reply)];
        host.querySelector('.practice-feedback').textContent = reply.feedback_en;
        if (reply.is_correct) {
          completed = true;
          host.querySelectorAll('[data-reply]').forEach(option => { option.disabled = true; });
          const next = host.querySelector('[data-roleplay="next"]');
          next.hidden = false;
          next.focus();
        }
      }
    }, { signal: events.signal });

    listRoleplay(3).then(data => {
      if (events.signal.aborted) return;
      turns = data.filter(turn => turn.replies.length);
      if (turns.length) prompt(false);
      else host.textContent = 'There is no conversation available for this stop.';
    }).catch(() => {
      if (!events.signal.aborted) host.textContent = 'Could not load the conversation. Check your connection and reopen this page.';
    });
    return () => { events.abort(); window.speechSynthesis?.cancel(); };
  },
};
