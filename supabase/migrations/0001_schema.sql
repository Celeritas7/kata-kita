-- 0001_schema.sql · Kata Kita content + user tables

create type affix_kind as enum ('pre', 'root', 'suf');
create type step_kind  as enum ('dengar', 'kata', 'peranan', 'cabaran');
create type q_kind     as enum ('mcq', 'type', 'affix', 'listen');

-- ── Content (read-only to clients; edited via dashboard / service role) ──

create table topics (
  id      text primary key,              -- 'salam','makan','jalan','wang','pasar'
  name_ms text not null,
  name_en text,
  sort    int  not null default 0
);

create table units (                     -- one per Peta stop
  id       int  primary key,             -- 1..6
  town     text not null,                -- 'Pulau Pinang'
  title_ms text not null,                -- 'Di kedai mamak'
  title_en text not null,                -- 'Ordering food'
  map_x    int,
  map_y    int,                          -- position in the 360×620 map SVG
  sort     int  not null
);

create table unit_steps (
  id       serial primary key,
  unit_id  int not null references units on delete cascade,
  kind     step_kind not null,
  title_ms text,
  title_en text,
  sort     int not null,
  unique (unit_id, sort)
);

create table words (
  id          serial primary key,
  topic_id    text references topics,
  unit_id     int  references units,
  ms          text not null,             -- 'perjalanan'
  en          text not null,             -- 'journey'
  syllables   text,                      -- 'per·ja·la·nan'
  jawi        text,
  example_ms  text,
  example_en  text,
  register    text check (register in ('informal', 'slang')),
  note        text,                      -- 'lit. wrap', 'spoken: tak'
  audio_path  text                       -- Storage key; null → device TTS
);

create table word_parts (                -- only for affixed words
  word_id int not null references words on delete cascade,
  pos     smallint not null,
  text    text not null,                 -- 'per' | 'jalan' | 'an'
  kind    affix_kind not null,
  primary key (word_id, pos)
);

create table proverbs (
  id         serial primary key,
  ms         text not null,
  literal_en text not null,
  use_when   text,
  key_word   text                        -- 'bukit = hill'
);

create table affix_roots (
  root text primary key,
  en   text not null,
  sort int
);

create table affix_forms (               -- Bengkel: every valid prefix × root × suffix
  id         serial primary key,
  prefix     text not null default '',   -- 'meN' (N = nasal placeholder)
  root       text not null references affix_roots,
  suffix     text not null default '',
  parts      jsonb not null,             -- [["me","pre"],["nulis","root"]]
  meaning_en text not null,
  rule_en    text not null,
  unique (prefix, root, suffix)
);

create table roleplay_turns (
  id      serial primary key,
  unit_id int not null references units on delete cascade,
  sort    int not null,
  speaker text not null default 'Pelayan · waiter',
  line_ms text not null,
  line_en text not null
);

create table roleplay_replies (
  id          serial primary key,
  turn_id     int not null references roleplay_turns on delete cascade,
  text_ms     text not null,
  is_correct  boolean not null,
  feedback_en text not null
);

create table questions (                 -- Dengar + Cabaran
  id          serial primary key,
  unit_id     int not null references units on delete cascade,
  step        step_kind not null check (step in ('dengar', 'cabaran')),
  kind        q_kind not null,
  prompt_ms   text,
  prompt_en   text,
  audio_text  text,                      -- what TTS speaks for listen items
  options     jsonb,                     -- ["Nasi lemak satu", …]
  answer      text not null,             -- affix items: 'peN|beli|an'
  alt_answers text[] not null default '{}',
  affix_root  text references affix_roots,
  sort        int
);

create index words_topic_idx          on words (topic_id);
create index words_unit_idx           on words (unit_id);
create index questions_unit_idx       on questions (unit_id, step, sort);
create index roleplay_turns_unit_idx  on roleplay_turns (unit_id, sort);
create index roleplay_replies_turn_idx on roleplay_replies (turn_id);

-- ── User data (RLS: own rows only) ──

create table profiles (
  id               uuid primary key references auth.users on delete cascade,
  display_name     text,
  motivation       text check (motivation in ('travel', 'family', 'work', 'other')),
  level            text check (level in ('new', 'some', 'conversational')),
  daily_goal       int  not null default 10 check (daily_goal in (5, 10, 20)),
  card_front       text not null default 'ms' check (card_front in ('ms', 'en', 'jawi')),
  reminder_time    time,
  timezone         text not null default 'Asia/Kuala_Lumpur',
  theme            text not null default 'system' check (theme in ('system', 'light', 'dark')),
  lives            int  not null default 5 check (lives between 0 and 5),
  lives_updated_at timestamptz not null default now(),
  streak           int  not null default 0,
  last_active_date date,
  created_at       timestamptz not null default now()
);

create table user_words (                -- one FSRS card = one plant in the Kebun
  user_id     uuid not null references profiles on delete cascade,
  word_id     int  not null references words on delete cascade,
  state       smallint not null default 0,  -- 0 new · 1 learning · 2 review · 3 relearning
  stability   real,
  difficulty  real,
  due         timestamptz not null default now(),
  last_review timestamptz,
  reps        int not null default 0,
  lapses      int not null default 0,
  primary key (user_id, word_id)
);

create table review_log (
  id          bigserial primary key,
  client_id   uuid unique not null,      -- generated on device → idempotent offline replay
  user_id     uuid not null references profiles on delete cascade,
  word_id     int  not null references words,
  rating      smallint not null check (rating between 1 and 4),
  source      text not null check (source in ('deck', 'water', 'checkpoint')),
  reviewed_at timestamptz not null default now()
);

create table step_progress (
  user_id      uuid not null references profiles on delete cascade,
  step_id      int  not null references unit_steps on delete cascade,
  score        int,                      -- Cabaran: correct out of 5
  completed_at timestamptz not null default now(),
  primary key (user_id, step_id)
);

create table affix_found (
  user_id  uuid not null references profiles on delete cascade,
  form_id  int  not null references affix_forms on delete cascade,
  found_at timestamptz not null default now(),
  primary key (user_id, form_id)
);

create index user_words_due_idx  on user_words (user_id, due);
create index review_log_user_idx on review_log (user_id, reviewed_at desc);

-- Kebun: plant stage from FSRS stability (days). Keep in sync with src/srs/stage.js.
create view garden with (security_invoker = true) as
select uw.*, w.ms, w.en,
  case
    when uw.reps = 0        then 0      -- Benih · seed
    when uw.stability <  2  then 1      -- Tunas · sprout
    when uw.stability <  7  then 2      -- Daun · leaves
    when uw.stability < 21  then 3      -- Kudup · bud
    else                         4      -- Mekar · bloom
  end as stage,
  uw.due <= now() as thirsty
from user_words uw
join words w on w.id = uw.word_id;
