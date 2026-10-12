import { html } from '../lib/html.js';
import { listUnits } from '../api/content.js';
import { stub } from './stub.js';

export default stub({
  title: 'Peta kursus',
  sub: 'Six stops across Malaysia.',
  phase: 2,
  ms: 'Peta laluan dilukis dalam Fasa 2.',
  en: 'The route map comes in Phase 2. The stops above are read from the units table.',
  extra: async () => {
    const units = await listUnits();
    return html`<ol class="stops" aria-label="Hentian · Stops">${units.map(u => html`<li class="stop">
  <span class="n">${u.id}</span>
  <span><b>${u.town}</b><span>${u.title_ms} · ${u.title_en}</span></span>
</li>`)}</ol>`;
  },
});
