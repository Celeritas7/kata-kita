import { html } from '../lib/html.js';
import { band } from '../components/band.js';

// Placeholder for screens built in later phases. `extra` may add live content above the note.
export const stub = ({ title, sub, phase, ms, en, extra }) => ({
  async render() {
    return html`${band({ title, sub })}
<section class="sheet">
  ${extra ? await extra() : ''}
  <div class="stub">
    <div class="eyebrow">Fasa ${phase} · Phase ${phase}</div>
    <p class="h">${ms}</p>
    <p class="muted">${en}</p>
  </div>
</section>`;
  },
});
