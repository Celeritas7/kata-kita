import { IC } from './icons.js';

export const TABS = [
  ['home', '/', 'Hari ini', 'home'],
  ['learn', '/learn', 'Belajar', 'learn'],
  ['garden', '/garden', 'Kebun', 'garden'],
  ['map', '/map', 'Peta', 'map'],
  ['workshop', '/workshop', 'Bengkel', 'shop'],
];

export function renderDock(active, visible = true) {
  const el = document.getElementById('dock');
  el.hidden = !visible;
  el.innerHTML = TABS.map(([id, path, label, icon]) =>
    `<a href="#${path}"${id === active ? ' class="on" aria-current="page"' : ''}>${IC[icon]}<span>${label}</span></a>`,
  ).join('');
}
