# Kata Kita

Malaysian Malay for English speakers. A PWA built from plain ES modules, Vite and Supabase.

## Phase 0: Foundations

```bash
npm install
npm run dev                 # runs in demo mode on local sample content; no keys needed
```

### Connect Supabase (local)

```bash
npx supabase start          # prints the API URL and anon key
cp .env.example .env.local  # paste them in
npx supabase db reset       # applies migrations 0001–0003, then seed/seed.sql
npm run dev                 # open http://<your-LAN-IP>:5173 on your phone
```

On a hosted project, run `npx supabase link`, then `npm run db:push`, and then paste `supabase/seed/seed.sql` into the SQL editor. **Turn on Auth → Anonymous sign-ins.**

### Exit check (on a real phone, in both themes)

Open **Hari ini → Pemeriksaan sistem** (`#/check`). Every row should be green:

- Supabase is live, a guest session exists, and the profile row was created by the trigger.
- RLS blocks a content write.
- Every content table count matches the seed.
- The theme sticks: toggle it, reload, and it's still applied. Set it on Profil and it syncs to `profiles.theme`.
- The dock moves between all five tabs.

### Scripts

- `npm run seed:build` regenerates `supabase/seed/seed.sql` from `supabase/seed/content.js`.
- `npm test` runs the tests for the stage boundaries, the lives refill maths, and the Bengkel form and seed integrity checks.
- `npm run lint` runs ESLint.

## Decisions made in Phase 0

- **Anonymous sessions.** Every visitor is signed in as a guest, which gives them the `authenticated` role, so content is readable through RLS from the first screen. This also makes flow A work: the first deck comes before any account exists. In Phase 1, sign-up upgrades the same user ID, so the garden carries over.
- **Seed is upsert-only.** It never truncates, so re-running it in production keeps user rows that reference the content.
- **Only `src/api/` talks to Supabase.** Views call the API layer, which falls back to the local sample when no keys are set.
- **Fonts still come from Google Fonts.** Self-hosting them is done in Phase 3, together with the service worker.

## Layout

```
src/
  main.js router.js store.js supabase.js
  api/         auth · profile · content (the only Supabase callers)
  lib/         html`` · theme · time · lives
  srs/         stage.js (FSRS is vendored in Phase 1)
  components/  band · dock · sheet (bottom sheet + confirm) · toast · segs · icons
  views/       home · learn · garden · map · workshop · profile · check (+ stub, not-found, error)
  styles/      tokens.css · base.css · components.css
supabase/
  migrations/  0001_schema · 0002_rls · 0003_functions
  seed/        content.js → rows.js → seed.sql
scripts/       build-seed.mjs · to-sql.js
tests/         stage · lives · forms
```
