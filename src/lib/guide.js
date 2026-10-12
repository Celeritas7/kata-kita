// Pronunciation guide under Malay text. 'off' | 'dev' (Devanagari, for Hindi/Marathi readers).
// Phase 1 mirrors this to profiles.pron_guide.
const KEY = 'kk.guide';
export const getGuide = () => { try { return localStorage.getItem(KEY) || 'off'; } catch { return 'off'; } };
export const setGuide = v => { try { localStorage.setItem(KEY, v); } catch { /* private mode */ } return v; };
