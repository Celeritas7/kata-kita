import { html, raw } from '../lib/html.js';
import { getPref, setTheme } from '../lib/theme.js';
import { band } from '../components/band.js';
import { IC } from '../components/icons.js';
import { saveTheme } from '../api/profile.js';
import { getGuide, setGuide } from '../lib/guide.js';

const GUIDES = [['off', 'Tiada', 'None'], ['dev', 'देवनागरी', 'Devanagari']];

const THEMES = [
  ['system', 'Sistem', 'System'],
  ['light', 'Cerah', 'Light'],
  ['dark', 'Gelap', 'Dark'],
];

function account(state) {
  if (state.mode === 'demo') return ['Mod demo · Demo mode', 'Add Supabase keys to .env.local to connect a real account.'];
  if (!state.session) return ['Tiada sesi · Not connected', state.authError || 'The anonymous session could not start.'];
  if (state.session.user.is_anonymous) return ['Akaun tamu · Guest account', 'Progress is saved to a guest account on this device. Email, Apple and Google sign-in arrive in Phase 1.'];
  return [state.session.user.email, 'Signed in.'];
}

export default {
  render(_params, state) {
    const pref = getPref();
    const [who, note] = account(state);
    return html`${band({ title: 'Profil & tetapan', sub: 'Profile & settings.', back: '#/' })}
<section class="sheet">
  <div class="panel">
    <div class="eyebrow">Tema · Theme</div>
    <div class="segctl" role="group" aria-label="Tema · Theme">
      ${THEMES.map(([v, ms, en]) => html`<button type="button" data-theme-pref="${v}" aria-pressed="${String(v === pref)}">${ms}<small>${en}</small></button>`)}
    </div>
  </div>
  <div class="panel">
    <div class="eyebrow">Panduan sebutan · Pronunciation guide</div>
    <div class="segctl" role="group" aria-label="Panduan sebutan · Pronunciation guide">
      ${GUIDES.map(([v, label, en]) => html`<button type="button" data-guide="${v}" aria-pressed="${String(v === getGuide())}">${label}<small>${en}</small></button>`)}
    </div>
    <p class="muted">Shows how Malay sounds, written in Devanagari, under proverbs and cards.</p>
  </div>
  <div class="panel">
    <div class="eyebrow">Akaun · Account</div>
    <p><b>${who}</b></p>
    <p class="muted">${note}</p>
  </div>
  <a class="panel panel-link" href="#/check">
    <span><b>Pemeriksaan sistem</b><span>Phase 0 system check</span></span>
    ${raw(IC.next)}
  </a>
</section>`;
  },
  mount(root) {
    const ac = new AbortController();
    root.addEventListener('click', e => {
      const g = e.target.closest('[data-guide]');
      if (g) {
        setGuide(g.dataset.guide);
        root.querySelectorAll('[data-guide]').forEach(x => x.setAttribute('aria-pressed', String(x === g)));
        return;
      }
      const b = e.target.closest('[data-theme-pref]');
      if (!b) return;
      saveTheme(setTheme(b.dataset.themePref));
      root.querySelectorAll('[data-theme-pref]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    }, { signal: ac.signal });
    return () => ac.abort();
  },
};
