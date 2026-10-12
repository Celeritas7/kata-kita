import { html, raw } from '../lib/html.js';
import { greeting } from '../lib/time.js';
import { band } from '../components/band.js';
import { IC } from '../components/icons.js';
import { proverbOfDay } from '../api/content.js';

export default {
  async render(_params, state) {
    const [ms, en] = greeting();
    const p = await proverbOfDay(state.profile?.timezone);
    return html`${band({ title: ms, sub: `${en}.` })}
<section class="sheet">
  ${p && html`<article class="peri">
    <div class="eyebrow">Peribahasa hari ini · Proverb of the day</div>
    <p class="ms">${p.ms}</p>
    <p class="lit">${p.literal_en}</p>
    <p class="use"><b>${p.key_word}</b> · ${p.use_when}</p>
    <span class="peri-mark" aria-hidden="true">ڤريبهاس</span>
  </article>`}
  <a class="panel panel-link" href="#/check">
    <span><b>Pemeriksaan sistem</b><span>Phase 0 system check</span></span>
    ${raw(IC.next)}
  </a>
</section>`;
  },
};
