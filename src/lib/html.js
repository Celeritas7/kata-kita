// html`` escapes every interpolation unless it is itself html`` / raw().
// null, undefined, true and false render nothing, so `${cond && html`…`}` works.
// Booleans that must print (aria-pressed) need String(x).
const MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => MAP[c]);

class Raw {
  constructor(s) { this.s = s; }
  toString() { return this.s; }
}
export const raw = s => new Raw(String(s ?? ''));

const fmt = v =>
  v == null || typeof v === 'boolean' ? ''
  : v instanceof Raw ? v.s
  : Array.isArray(v) ? v.map(fmt).join('')
  : esc(v);

export function html(strings, ...vals) {
  let out = strings[0];
  vals.forEach((v, i) => { out += fmt(v) + strings[i + 1]; });
  return new Raw(out);
}
