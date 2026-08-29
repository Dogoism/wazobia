<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# YARN — agent instructions

YARN is a cross-cultural phrase dictionary for **English, Hausa, Igbo, and
Yorùbá**. Every task in this repository must follow the rules below. They are
product constraints, not suggestions.

## Product principles

1. **The concept is the canonical object.** YARN maps a shared conversational
   intent (e.g. "greeting someone you haven't seen in a while") to the natural
   expression people actually use in each language. It is NOT
   English-sentence → word-for-word translation. Never model the English
   phrase as the parent record.
2. The primary result screen shows **English | Hausa | Igbo | Yorùbá side by
   side** on desktop; horizontally swipeable cards on mobile.
3. Each non-English language card has its **own regional/dialect selector**.
   Regional varieties (Hausa: Standard, Kano colloquial, Sokoto, Ghana
   Hausa/Gaananci; Igbo: Standard, Enuani, Ika, Ukwuani, Onitsha; Yorùbá:
   Standard, Ọ̀yọ́, Ìjẹ̀bú, Èkìtì, Ondo) are varieties of one language — never
   treat them as separate languages.
4. **Literal meaning and natural meaning are separate fields, always.** The UI
   must keep the distinction visible.
5. Multiple natural expressions may map to one concept. Register matters: a
   respectful form and a casual form are **separate records** (see the Yorùbá
   "Ẹ ṣé" vs "O ṣé" seed entries).

## Language-data rules (critical)

- **Never hallucinate translations, glosses, or dialect forms.** If you cannot
  verify a phrase, do not add it.
- If a dialect-specific phrase is unverified, the UI shows
  *"«Variant» version pending native-speaker verification"* — it must NOT be
  silently filled with a standard-language equivalent presented as regional.
  (A clearly labelled "standard form for reference" disclosure is allowed.)
- **Preserve Yorùbá and Igbo diacritics and tone marks everywhere.** Never
  strip them for display. Diacritic folding is allowed only inside search
  matching (`lib/search.ts` → `foldForSearch`).
- A `literalMeaning` of `null` means "no verified gloss" and is rendered as a
  pending notice for non-English entries. Do not invent a gloss to fill it.
- Verification statuses: `verified`, `community`, `pending`, `disputed`,
  `ai_suggestion`. **AI-generated language content must never be marked
  `verified`**, and a contributor must never be able to verify their own
  submission.
- Sources: cite real, checkable sources. When none is at hand, use an honest
  placeholder (`isPlaceholder: true`, "Seed data — primary citation pending"),
  and keep the entry out of `verified` unless a real source plus reviewer
  confirmation exists.
- Seed data in `lib/data/concepts.ts` exercises the UI; every entry —
  including seed rows currently marked `verified` — must be re-verified by
  native speakers before any production launch.

## Stack

- Next.js (App Router) + TypeScript, Tailwind CSS v4 — deployed on Vercel.
- Planned backend: Supabase (Postgres, Auth, RLS, Storage). The proposed
  schema lives in `docs/supabase-schema.md` and
  `supabase/migrations/0001_initial_schema.sql` (draft — not applied yet).
  The typed mock data in `lib/` mirrors that schema; keep them in sync.
- Audio is modeled as provider-agnostic `storageKey`s so storage can move from
  Supabase Storage to Cloudflare R2 without changing the product model.
- Do not add dependencies without clear need. No component libraries; the
  editorial design is hand-rolled Tailwind.

## Security (when the backend lands)

- Supabase Row Level Security on every table; anonymous users read only
  verified/public content; authenticated contributors create `pending`
  submissions; only reviewers/admins change verification status.
- Never expose the service-role key to the client. Review all RLS policies
  before calling backend work complete.

## Commands

```sh
npm run dev      # dev server
npm run lint     # eslint (run `npx eslint .` to be explicit)
npx tsc --noEmit # typecheck (run `npx next typegen` first on a fresh clone)
npm run build    # production build — must pass before any commit
```

## Definition of done

Code is not complete because it compiles. Before finishing any task:

1. `npm run build`, `npx eslint .`, and `npx tsc --noEmit` all pass.
2. Run the app and inspect it in a browser at desktop (≥1280px) and mobile
   (~390px) widths; check the browser console for errors.
3. Verify diacritics render correctly (e.g. "Ẹ kú ọjọ́ mẹ́ta", "Ụtụtụ ọma",
   "Ìjẹ̀bú") and `lang` attributes are present on non-English text.
4. Re-read your diff for: hallucinated language data, literal-vs-natural
   confusion, dialect handling errors, accessibility regressions,
   client/server boundary mistakes, and RLS/security gaps.
