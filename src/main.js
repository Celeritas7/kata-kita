import { applyTheme, hasLocalPref, setTheme, toggleTheme, watchSystemTheme } from './lib/theme.js';
import { initSupabase } from './supabase.js';
import { ensureSession } from './api/auth.js';
import { getProfile, saveTheme } from './api/profile.js';
import { store } from './store.js';
import { startRouter, refresh } from './router.js';
import { toast } from './components/toast.js';

applyTheme();
watchSystemTheme();

addEventListener('online', () => store.set({ online: true }));
addEventListener('offline', () => store.set({ online: false }));

// The band's theme button is on every screen, so handle it once here.
document.addEventListener('click', e => {
  if (!e.target.closest('[data-act="theme"]')) return;
  saveTheme(toggleTheme());
  if (store.get().route === '/profile') refresh();
});

async function boot() {
  const db = await initSupabase().catch(err => { console.error(err); return null; });
  store.set({ mode: db ? 'live' : 'demo' });

  if (db) {
    try {
      await ensureSession();
      const profile = await getProfile();
      store.set({ profile });
      // A new device picks up the theme saved on the account.
      if (!hasLocalPref() && profile?.theme && profile.theme !== 'system') setTheme(profile.theme);
    } catch (err) {
      console.error(err);
      store.set({ authError: err?.message || String(err) });
      toast('Tak dapat sambung · Couldn’t connect');
    }
  }

  await startRouter();
}

boot();
