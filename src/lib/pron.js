// The only place the app touches the shared pronunciation engine (Celeritas7/language-utils).
// Every screen that shows Malay calls pron(); swapping or upgrading the engine is one line here.
// Pin @main to a tag or commit sha before release so engine changes can't surprise the app.
import { getGuide } from './guide.js';

const ENGINES = {
  dev: 'https://cdn.jsdelivr.net/gh/Celeritas7/language-utils@main/malay.js',
};

const loaded = {};
function load(kind) {
  loaded[kind] ??= import(/* @vite-ignore */ ENGINES[kind]).catch(err => {
    console.warn('pronunciation engine unavailable', err);
    delete loaded[kind]; // retry next time (e.g. back online)
    return null;
  });
  return loaded[kind];
}

// Returns the guide text for `text`, or null when the guide is off or the engine can't load.
export async function pron(text) {
  const kind = getGuide();
  if (!text || !ENGINES[kind]) return null;
  const m = await load(kind);
  try { return m?.toDev ? m.toDev(text) : null; } catch { return null; }
}
