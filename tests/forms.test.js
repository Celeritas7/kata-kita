import { describe, it, expect } from 'vitest';
import content from '../supabase/seed/content.js';
import { toRows } from '../supabase/seed/rows.js';

const rows = toRows(content);
const roots = new Set(rows.affix_roots.map(r => r.root));

describe('Bengkel forms', () => {
  it.each(rows.affix_forms.map(f => [`${f.prefix}|${f.root}|${f.suffix}`, f]))('%s has valid parts', (_k, f) => {
    expect(roots.has(f.root)).toBe(true);
    expect(f.parts.length).toBeGreaterThan(0);
    f.parts.forEach(([text, kind]) => {
      expect(text).toBeTruthy();
      expect(['pre', 'root', 'suf']).toContain(kind);
    });
    expect(f.parts.filter(([, k]) => k === 'root')).toHaveLength(1);
    expect(Boolean(f.prefix)).toBe(f.parts.some(([, k]) => k === 'pre'));
    expect(Boolean(f.suffix)).toBe(f.parts.some(([, k]) => k === 'suf'));
  });

  it('meN- + tulis drops the t', () => {
    const f = rows.affix_forms.find(x => x.prefix === 'meN' && x.root === 'tulis' && !x.suffix);
    expect(f.parts.map(([t]) => t).join('')).toBe('menulis');
  });
});

describe('seed content', () => {
  it('word parts spell the word', () => {
    const byWord = rows.word_parts.reduce((m, p) => ((m[p.word_id] ??= []).push(p), m), {});
    for (const [id, parts] of Object.entries(byWord)) {
      const w = rows.words.find(x => x.id === Number(id));
      expect(parts.sort((a, b) => a.pos - b.pos).map(p => p.text).join('')).toBe(w.ms);
    }
  });

  it('affix questions point at a real form', () => {
    rows.questions.filter(q => q.kind === 'affix').forEach(q => {
      const [prefix, root, suffix] = q.answer.split('|');
      expect(rows.affix_forms.some(f => f.prefix === prefix && f.root === root && f.suffix === suffix)).toBe(true);
    });
  });

  it('choice questions include their answer', () => {
    rows.questions.filter(q => q.options).forEach(q => expect(q.options).toContain(q.answer));
  });

  it('every role-play turn has exactly one correct reply', () => {
    rows.roleplay_turns.forEach(t => {
      expect(rows.roleplay_replies.filter(r => r.turn_id === t.id && r.is_correct)).toHaveLength(1);
    });
  });
});
