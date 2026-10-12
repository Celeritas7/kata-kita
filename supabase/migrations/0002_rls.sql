-- 0002_rls.sql · row-level security
-- Content: readable by any signed-in user (anonymous sessions count), never writable by clients.
-- User tables: each user reaches only their own rows.

do $$
declare t text;
begin
  foreach t in array array[
    'topics', 'units', 'unit_steps', 'words', 'word_parts', 'proverbs',
    'affix_roots', 'affix_forms', 'roleplay_turns', 'roleplay_replies', 'questions'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy read on %I for select to authenticated using (true)', t);
    execute format('revoke insert, update, delete, truncate on %I from anon, authenticated', t);
  end loop;

  foreach t in array array['user_words', 'step_progress', 'affix_found'] loop
    execute format('alter table %I enable row level security', t);
    execute format(
      'create policy own on %I for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
    execute format('revoke all on %I from anon', t);
  end loop;
end $$;

-- review_log is append-only from the client.
alter table review_log enable row level security;
create policy own_read on review_log for select to authenticated using (user_id = (select auth.uid()));
create policy own_insert on review_log for insert to authenticated with check (user_id = (select auth.uid()));
revoke update, delete, truncate on review_log from anon, authenticated;
revoke all on review_log from anon;

-- profiles: rows are created by the auth trigger; clients may edit settings, never lives or streak.
alter table profiles enable row level security;
create policy own_read on profiles for select to authenticated using (id = (select auth.uid()));
create policy own_update on profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
revoke all on profiles from anon;
revoke insert, update, delete, truncate on profiles from authenticated;
grant update (display_name, motivation, level, daily_goal, card_front, reminder_time, timezone, theme)
  on profiles to authenticated;

-- garden is security_invoker, so user_words RLS applies through it.
revoke all on garden from anon;
grant select on garden to authenticated;
