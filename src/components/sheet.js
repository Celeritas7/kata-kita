import { html } from '../lib/html.js';

// Bottom sheet and confirm dialog. Both resolve with the chosen action's value, or null on dismiss.
// actions: [{ label, value, kind: 'ink' | 'line' | 'gold' | 'danger', gated }]
// gated actions stay disabled until the typed text matches typeToConfirm.

export const openSheet = opts => present('sheet', opts);

export const confirmDialog = ({ confirmLabel = 'Ya · Yes', cancelLabel = 'Batal · Cancel', danger = false, ...opts }) =>
  present('dialog', {
    ...opts,
    actions: [
      { label: confirmLabel, value: 'ok', kind: danger ? 'danger' : 'ink', gated: true },
      { label: cancelLabel, value: 'cancel', kind: 'line' },
    ],
  }).then(v => v === 'ok');

function present(kind, { eyebrow, title, body = '', actions = [], typeToConfirm, dismissable = true }) {
  const root = document.getElementById('overlay');
  const prevFocus = document.activeElement;
  const prevOverflow = document.body.style.overflow;

  root.innerHTML = String(html`<div class="scrim${kind === 'dialog' ? ' center' : ''}">
  <div class="${kind === 'sheet' ? 'bsheet' : 'dialog'}" role="dialog" aria-modal="true" aria-labelledby="ov-title">
    <span class="strip" aria-hidden="true"></span>
    ${kind === 'sheet' && html`<span class="grab" aria-hidden="true"></span>`}
    ${eyebrow && html`<div class="eyebrow">${eyebrow}</div>`}
    <h2 class="h2" id="ov-title">${title}</h2>
    ${body && html`<div class="ov-body">${body}</div>`}
    ${typeToConfirm && html`<label class="field">
      <span>Taip <b>${typeToConfirm}</b> untuk sahkan · Type it to confirm</span>
      <input data-confirm autocomplete="off" autocapitalize="characters" spellcheck="false">
    </label>`}
    <div class="ov-actions">${actions.map(a => html`<button type="button" class="btn btn-${a.kind || 'line'}" data-val="${a.value}"${a.gated && typeToConfirm ? html` data-gated disabled` : ''}>${a.label}</button>`)}</div>
  </div>
</div>`);

  document.body.style.overflow = 'hidden';
  const scrim = root.firstElementChild;
  const box = scrim.firstElementChild;
  const input = box.querySelector('[data-confirm]');

  return new Promise(resolve => {
    const done = value => {
      document.removeEventListener('keydown', onKey, true);
      root.innerHTML = '';
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus?.({ preventScroll: true });
      resolve(value);
    };
    const onKey = e => {
      if (e.key === 'Escape' && dismissable) { e.preventDefault(); done(null); }
      if (e.key !== 'Tab') return;
      const f = [...box.querySelectorAll('button:not([disabled]), input, a[href]')];
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey, true);
    scrim.addEventListener('click', e => {
      if (e.target === scrim && dismissable) return done(null);
      const b = e.target.closest('[data-val]');
      if (b && !b.disabled) done(b.dataset.val);
    });
    input?.addEventListener('input', () => {
      const ok = input.value.trim().toUpperCase() === String(typeToConfirm).toUpperCase();
      box.querySelectorAll('[data-gated]').forEach(b => { b.disabled = !ok; });
    });
    (input || box.querySelector('button:not([disabled])'))?.focus({ preventScroll: true });
  });
}
