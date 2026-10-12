// Creates the client only when keys exist. Only src/api/* may import `db`.
const env = import.meta.env || {};
const URL = env.VITE_SUPABASE_URL;
const KEY = env.VITE_SUPABASE_ANON_KEY;

export let db = null;

export async function initSupabase() {
  if (!URL || !KEY) return null;
  const { createClient } = await import('@supabase/supabase-js');
  db = createClient(URL, KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' },
  });
  return db;
}
