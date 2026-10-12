import { store } from './store.js';
import { renderDock } from './components/dock.js';

// Each view module: export default { render(params, state) → html (may be async), mount?(root, params) → cleanup? }
const ROUTES = [
  { path: '/', tab: 'home', load: () => import('./views/home.js') },
  { path: '/learn', tab: 'learn', load: () => import('./views/learn.js') },
  { path: '/garden', tab: 'garden', load: () => import('./views/garden.js') },
  { path: '/map', tab: 'map', load: () => import('./views/map.js') },
  { path: '/workshop', tab: 'workshop', load: () => import('./views/workshop.js') },
  { path: '/profile', load: () => import('./views/profile.js') },
  { path: '/check', load: () => import('./views/check.js') },
];
const NOT_FOUND = { load: () => import('./views/not-found.js') };

const compiled = ROUTES.map(r => {
  const keys = [];
  const re = new RegExp('^' + r.path.replace(/:(\w+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '/?$');
  return { ...r, re, keys };
});

function match(path) {
  for (const r of compiled) {
    const m = path.match(r.re);
    if (m) return { route: r, params: Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])])) };
  }
  return { route: NOT_FOUND, params: {} };
}

export const currentPath = () => location.hash.replace(/^#/, '') || '/';

let cleanup = null;
let seq = 0;
let first = true;

async function navigate() {
  const path = currentPath();
  const { route, params } = match(path);
  const id = ++seq;
  let out;
  let mod;
  try {
    mod = (await route.load()).default;
    out = await mod.render(params, store.get());
  } catch (err) {
    console.error(err);
    mod = (await import('./views/error.js')).default;
    out = mod.render({ message: err?.message || String(err) });
  }
  if (id !== seq) return; // a newer navigation won

  cleanup?.();
  const view = document.getElementById('view');
  view.innerHTML = String(out);
  cleanup = mod.mount?.(view, params) || null;
  renderDock(route.tab, route.dock !== false);
  store.set({ route: path });

  window.scrollTo(0, 0);
  if (!first) view.querySelector('h1')?.focus({ preventScroll: true });
  first = false;
}

export function startRouter() {
  addEventListener('hashchange', navigate);
  return navigate();
}

export const go = path => { location.hash = path; };
export const refresh = () => navigate();
