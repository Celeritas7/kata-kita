import { listAffixes } from '../api/content.js';
import { band } from '../components/band.js';
import { html } from '../lib/html.js';

const affixLabel = (value, position) => {
  if (!value) return 'None';
  return position === 'prefix' ? `${value}-` : `-${value}`;
};

export default {
  async render() {
    const { roots, forms } = await listAffixes();
    const choices = (position, label) => html`<label class="practice-field">${label}
      <select name="${position}">
        ${[...new Set(['', ...forms.map(form => form[position])])].map(value =>
          html`<option value="${value}">${affixLabel(value, position)}</option>`)}
      </select></label>`;
    return html`${band({ title: 'Bengkel imbuhan', sub: 'Build Malay words from roots and affixes.' })}
<section class="sheet">
  <div class="panel" id="affix-builder">
    <h2 class="h2">Word builder</h2>
    ${choices('prefix', 'Prefix')}
    <label class="practice-field">Root<select name="root">
      ${roots.map(({ root, en }) => html`<option value="${root}">${root} · ${en}</option>`)}
    </select></label>
    ${choices('suffix', 'Suffix')}
    <div class="practice-answer" id="affix-result" aria-live="polite"></div>
    <template>${forms.map(form => html`<div data-affix="${[form.prefix, form.root, form.suffix].join('|')}">
      <p class="h2" lang="ms">${form.parts.map(([part]) => part).join('')}</p>
      <p><b>${form.meaning_en}</b></p>
      <p>${form.rule_en}</p>
    </div>`)}</template>
  </div>
</section>`;
  },
  mount(root) {
    const builder = root.querySelector('#affix-builder');
    const result = builder.querySelector('#affix-result');
    const forms = new Map([...builder.querySelector('template').content.children].map(form => [form.dataset.affix, form]));
    function update() {
      const key = [...builder.querySelectorAll('select')].map(input => input.value).join('|');
      const form = forms.get(key);
      if (form) result.replaceChildren(form.cloneNode(true));
      else result.textContent = 'This combination is outside the starter workshop. Try another affix or root.';
    }
    builder.addEventListener('change', update);
    update();
  },
};
