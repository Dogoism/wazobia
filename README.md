# YARN (wazobia)

**Say it the way it's actually said.**

YARN is a cross-cultural phrase dictionary for English, Hausa, Igbo, and
Yorùbá. It maps a shared **concept or conversational intent** to the natural
expression people actually use in each language — not a word-for-word
translation.

> **Intent:** greeting someone you haven't seen in a while
> **English:** "Long time no see" · **Hausa:** "Kwana biyu" (*literally* "two
> days") · **Yorùbá:** "Ẹ kú ọjọ́ mẹ́ta" (*literally* "greetings on three
> days") · **Igbo:** pending native-speaker verification — YARN never fills a
> gap with a guess.

## Status

Frontend MVP plus a validated Supabase backend. Without configuration the
app runs on typed mock data; with `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY` set (see `.env.example`), all reads come
from Supabase through the same provider contract (`lib/data/provider.ts`).
Schema, seed, and RLS test suite live in `supabase/`; deployment steps in
`docs/supabase-schema.md`, security review in `docs/security-review.md`.

- Side-by-side comparison screen (English | Hausa | Igbo | Yorùbá), swipeable
  cards on mobile
- Independent regional/dialect selector per language card (unverified
  varieties show an honest "pending native-speaker verification" state)
- Literal meaning vs natural meaning kept visually and structurally separate
- Verification statuses: Verified · Community · Pending · Disputed ·
  AI suggestion (AI content is never shown as verified)
- Diacritic-insensitive search that resolves English phrases, paraphrased
  intents, or existing Hausa/Igbo/Yorùbá expressions to concepts (Postgres
  FTS + trigram via the `search_yarn` RPC when Supabase is configured)
- Row Level Security enforcing: public read, pending-only contributor
  submissions, reviewer-only verification, no self-verification — all
  covered by an executable test suite (`supabase/tests/`)

## Development

```sh
npm install
npm run dev        # http://localhost:3000
npm run lint
npx tsc --noEmit   # run `npx next typegen` first on a fresh clone
npm run build
```

## Contributing language data

Read `AGENTS.md` first — it carries the product principles and the
non-negotiable language-data rules (no hallucinated forms, preserve
diacritics, literal and natural meaning stored separately, register-distinct
records).
