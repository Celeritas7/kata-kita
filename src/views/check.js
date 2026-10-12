import { html, raw } from '../lib/html.js';
import { getPref, resolved } from '../lib/theme.js';
import { band } from '../components/band.js';
import { segs } from '../components/segs.js';
import { toast } from '../components/toast.js';
import { openSheet, confirmDialog } from '../components/sheet.js';
import { IC } from '../components/icons.js';
import { contentCounts, expectedCounts, contentWriteBlocked } from '../api/content.js';

// Phase 0 exit check: shell on a phone, theme sticks, seeded content readable through RLS.
const MARK = { ok: IC.check, bad: IC.cross, skip: IC.dash };
const row = (state, label, val) => html`<li class="check ${state}"><span class="mark" aria-hidden="true">${raw(MARK[state])}</span><span>${label}</span><span class="val">${val}</span></li>`;

export default {
  async render(_params, s) {
    const live = s.mode === 'live';
    const [counts, expected, blocked] = await Promise.all([contentCounts(), expectedCounts(), contentWriteBlocked()]);
    const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

    const contentOk = counts.every(([t, n]) => n === expected[t]);
    const connOk = !live || (s.session && s.profile && blocked === true);
    const allOk = contentOk && connOk;
    const user = s.session?.user;

    return html`${band({ eyebrow: 'Fasa 0 · Phase 0', title: 'Pemeriksaan', sub: 'System check: shell, theme and seeded content.', back: '#/' })}
<section class="sheet">
  <div class="panel summary ${allOk ? 'ok' : 'bad'}">
    <span class="mark" aria-hidden="true">${raw(allOk ? IC.check : IC.cross)}</span>
    <div>${allOk ? (live ? 'Semua lulus · All checks pass' : 'Demo lulus · Demo checks pass') : 'Ada masalah · Something failed'}
      <span>${live ? 'Connected to Supabase.' : 'No Supabase keys, so this reads the local seed content. Add .env.local for the real check.'}</span></div>
  </div>

  <div class="panel">
    <div class="eyebrow">Sambungan · Connection</div>
    <ul class="checks">
      ${row(live ? 'ok' : 'skip', 'Supabase', live ? 'Live' : 'Demo')}
      ${live && row(user ? 'ok' : 'bad', 'Sesi · Session', user ? (user.is_anonymous ? `Tamu · guest ${user.id.slice(0, 8)}` : user.email) : (s.authError || 'none'))}
      ${live && row(s.profile ? 'ok' : 'bad', 'Profil · Profile row', s.profile ? `${s.profile.lives} lives · streak ${s.profile.streak}` : 'missing')}
      ${row(blocked === null ? 'skip' : blocked ? 'ok' : 'bad', 'RLS: content is read-only', blocked === null ? 'not checked' : blocked ? 'insert refused' : 'insert allowed!')}
    </ul>
  </div>

  <div class="panel">
    <div class="eyebrow">Kandungan · Seeded content</div>
    <ul class="checks">
      ${counts.map(([t, n, err]) => row(n === expected[t] ? 'ok' : 'bad', html`<code>${t}</code>`, err || `${n ?? '–'} / ${expected[t]}`))}
    </ul>
  </div>

  <div class="panel">
    <div class="eyebrow">Peranti · Device</div>
    <ul class="checks">
      ${row('ok', 'Tema · Theme', `${getPref()} → ${resolved()}`)}
      ${row(standalone ? 'ok' : 'skip', 'Dipasang · Installed', standalone ? 'standalone' : 'in browser')}
      ${row('ok', 'Skrin · Viewport', `${innerWidth} × ${innerHeight}`)}
      ${row(s.online ? 'ok' : 'skip', 'Rangkaian · Network', s.online ? 'online' : 'offline')}
    </ul>
  </div>

  <div class="panel">
    <div class="eyebrow">Komponen · Components</div>
    <div class="btn-row">
      <button type="button" class="btn btn-ink" data-demo="toast">Toast</button>
      <button type="button" class="btn btn-line" data-demo="sheet">Bottom sheet</button>
      <button type="button" class="btn btn-gold" data-demo="confirm">Confirm</button>
      <button type="button" class="btn btn-danger" data-demo="danger">Type to confirm</button>
    </div>
    <div class="chips" role="group" aria-label="Topik · Topics">
      ${['Semua · All', 'Salam', 'Makan', 'Jalan', 'Wang'].map((t, i) => html`<button type="button" class="chip" data-demo="chip" aria-pressed="${String(i === 0)}">${t}</button>`)}
    </div>
    <div class="segctl" role="group" aria-label="Muka kad · Card front">
      ${[['Melayu', 'Malay'], ['English', 'English'], ['Jawi', 'Jawi']].map(([ms, en], i) => html`<button type="button" data-demo="seg" aria-pressed="${String(i === 0)}">${ms}${ms !== en && html`<small>${en}</small>`}</button>`)}
    </div>
    <div>${segs([['per', 'pre'], ['jalan', 'root'], ['an', 'suf']])}</div>
  </div>
</section>`;
  },

  mount(root) {
    const ac = new AbortController();
    root.addEventListener('click', async e => {
      const b = e.target.closest('[data-demo]');
      if (!b) return;
      const kind = b.dataset.demo;
      if (kind === 'chip' || kind === 'seg') {
        b.parentElement.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      } else if (kind === 'toast') {
        toast('Bagus! · Nice one!');
      } else if (kind === 'sheet') {
        const v = await openSheet({
          eyebrow: 'Bunga habis · Out of flowers',
          title: 'Rehat sekejap',
          body: 'Take a short break. Your next flower grows back in 3:59:12, and watering the garden costs none.',
          actions: [
            { label: 'Siram kebun · Water the garden', value: 'water', kind: 'ink' },
            { label: 'Kembali ke peta · Back to map', value: 'map', kind: 'line' },
          ],
        });
        toast(v ? `Pilihan · Chose: ${v}` : 'Ditutup · Dismissed');
      } else if (kind === 'confirm') {
        const ok = await confirmDialog({ title: 'Set semula kemajuan?', body: 'Reset progress? Your garden and course progress will be cleared.', confirmLabel: 'Set semula · Reset' });
        toast(ok ? 'Disahkan · Confirmed' : 'Dibatalkan · Cancelled');
      } else if (kind === 'danger') {
        const ok = await confirmDialog({
          eyebrow: 'Zon bahaya · Danger zone', title: 'Padam akaun?',
          body: 'Delete your account? This removes your garden and progress for good.',
          typeToConfirm: 'PADAM', confirmLabel: 'Padam akaun · Delete account', danger: true,
        });
        toast(ok ? 'Disahkan · Confirmed' : 'Dibatalkan · Cancelled');
      }
    }, { signal: ac.signal });
    return () => ac.abort();
  },
};
