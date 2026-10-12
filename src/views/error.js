import { html } from '../lib/html.js';
import { band } from '../components/band.js';

export default {
  render({ message }) {
    return html`${band({ title: 'Alamak!', sub: 'Something went wrong loading this screen.', back: '#/' })}
<section class="sheet">
  <div class="panel"><div class="eyebrow">Ralat · Error</div><p class="muted"><code>${message}</code></p></div>
  <button type="button" class="btn btn-ink" onclick="location.reload()">Cuba lagi · Try again</button>
</section>`;
  },
};
