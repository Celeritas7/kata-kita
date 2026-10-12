// npm run seed:build → supabase/seed/seed.sql
import { writeFile } from 'node:fs/promises';
import content from '../supabase/seed/content.js';
import { toRows } from '../supabase/seed/rows.js';
import { toSql } from './to-sql.js';

const rows = toRows(content);
await writeFile(new URL('../supabase/seed/seed.sql', import.meta.url), toSql(rows));
console.log('seed.sql written:', Object.entries(rows).map(([t, r]) => `${t} ${r.length}`).join(', '));
