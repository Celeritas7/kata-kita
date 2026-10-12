-- 0003_functions.sql · lives, streak, profile bootstrap, reset
-- Lives and streak only change here (security definer); clients have no column grant for them.

-- +1 life every 4 h, capped at 5. Mirrored in src/lib/lives.js for the countdown.
create or replace function current_lives(p profiles) returns int
language sql stable as $$
  select least(5, p.lives + floor(extract(epoch from now() - p.lives_updated_at) / 14400)::int)
$$;

create or replace function get_lives(out lives int, out next_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
declare p profiles;
begin
  select * into p from profiles where id = auth.uid();
  if not found then raise exception 'no_profile'; end if;
  lives := current_lives(p);
  next_at := case when lives < 5
    then p.lives_updated_at + make_interval(secs => 14400 * (lives - p.lives + 1)) end;
end $$;

create or replace function lose_life() returns int
language plpgsql security definer set search_path = public as $$
declare p profiles; n int;
begin
  select * into p from profiles where id = auth.uid() for update;
  if not found then raise exception 'no_profile'; end if;
  n := current_lives(p);
  if n <= 0 then raise exception 'no_lives'; end if;
  update profiles set
    lives = n - 1,
    lives_updated_at = case
      when n = 5 then now()                                                   -- refill clock starts now
      else lives_updated_at + make_interval(secs => 14400 * (n - p.lives))   -- keep the partial interval
    end
  where id = p.id;
  return n - 1;
end $$;

-- New auth user (anonymous or real) → profile row with defaults.
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, display_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'name', ''))
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- A day counts when it has ≥1 review, in the user's timezone.
-- Late offline replays (older reviewed_at) never move the streak backwards.
-- Clients should show 0 when last_active_date < today − 1 (the row only updates on activity).
create or replace function touch_streak() returns trigger
language plpgsql security definer set search_path = public as $$
declare tz text; last date; today date;
begin
  select timezone, last_active_date into tz, last from profiles where id = new.user_id for update;
  begin
    today := (new.reviewed_at at time zone tz)::date;
  exception when others then
    today := (new.reviewed_at at time zone 'Asia/Kuala_Lumpur')::date;
  end;
  if last is null or today > last then
    update profiles set
      streak = case when last = today - 1 then streak + 1 else 1 end,
      last_active_date = today
    where id = new.user_id;
  end if;
  return new;
end $$;

create trigger review_touches_streak
  after insert on review_log
  for each row execute function touch_streak();

create or replace function reset_progress() returns void
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  delete from review_log    where user_id = uid;
  delete from user_words    where user_id = uid;
  delete from step_progress where user_id = uid;
  delete from affix_found   where user_id = uid;
  update profiles set streak = 0, last_active_date = null, lives = 5, lives_updated_at = now() where id = uid;
end $$;

revoke execute on function current_lives(profiles), get_lives(), lose_life(), reset_progress(),
  handle_new_user(), touch_streak() from public, anon;
grant execute on function current_lives(profiles), get_lives(), lose_life(), reset_progress() to authenticated;

-- delete_account(): Edge Function with the service role → auth.admin.deleteUser (Phase 1, supabase/functions/delete-account).
