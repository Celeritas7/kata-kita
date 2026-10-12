const KEY = 'kk.theme';
const BAND = { light: '#1B2140', dark: '#0A0C1C' };
const dark = () => matchMedia('(prefers-color-scheme: dark)');

export const getPref = () => {
  try { return localStorage.getItem(KEY) || 'system'; } catch { return 'system'; }
};
export const hasLocalPref = () => {
  try { return localStorage.getItem(KEY) != null; } catch { return false; }
};
export const resolved = (pref = getPref()) => (pref === 'system' ? (dark().matches ? 'dark' : 'light') : pref);

export function applyTheme(pref = getPref()) {
  const root = document.documentElement;
  if (pref === 'system') delete root.dataset.theme;
  else root.dataset.theme = pref;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', BAND[resolved(pref)]);
}

export function setTheme(pref) {
  try { localStorage.setItem(KEY, pref); } catch { /* private mode */ }
  applyTheme(pref);
  return pref;
}

export const toggleTheme = () => setTheme(resolved() === 'dark' ? 'light' : 'dark');

export function watchSystemTheme() {
  dark().addEventListener('change', () => { if (getPref() === 'system') applyTheme('system'); });
}
