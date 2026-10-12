import { html } from '../lib/html.js';
import { band } from '../components/band.js';

export default {
  render() {
    return html`${band({ title: 'Tak jumpa', sub: 'That page doesn’t exist.', back: '#/' })}
<section class="sheet">
  <a class="btn btn-ink" href="#/">Ke Hari ini · Go to Today</a>
</section>`;
  },
};
