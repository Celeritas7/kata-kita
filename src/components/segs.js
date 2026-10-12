import { html } from '../lib/html.js';

// parts: [[text, 'pre' | 'root' | 'suf'], …] → gold prefix, pandan root, sambal suffix
export const segs = parts => html`<span class="morph">${parts.map(([text, kind]) => html`<span class="seg ${kind}">${text}</span>`)}</span>`;
