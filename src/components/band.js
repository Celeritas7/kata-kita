import { html, raw } from '../lib/html.js';
import { store } from '../store.js';
import { IC } from './icons.js';

// Songket header band. Pair with <section class="sheet"> right after it.
export function band({ title, sub, eyebrow, back } = {}) {
  const initial = store.get().profile?.display_name?.trim()?.[0]?.toUpperCase();
  return html`<header class="band">
  <div class="band-top">
    ${back
      ? html`<a class="band-btn" href="${back}" aria-label="Kembali · Back">${raw(IC.back)}</a><span class="band-spacer"></span>`
      : html`<div class="brand">Kata Kita<span class="jawi" lang="ms-Arab">کات کيت</span></div>`}
    <a class="band-btn" href="#/profile" aria-label="Profil · Profile">${initial || raw(IC.user)}</a>
    <button class="band-btn" type="button" data-act="theme" aria-label="Tukar tema · Switch theme">${raw(IC.theme)}</button>
  </div>
  ${eyebrow && html`<div class="band-eyebrow">${eyebrow}</div>`}
  <h1 tabindex="-1">${title}</h1>
  ${sub && html`<p class="sub">${sub}</p>`}
</header>`;
}
