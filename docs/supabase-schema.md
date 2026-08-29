# Supabase schema

Status: **implemented and locally validated**. The schema lives in
`supabase/migrations/0001_initial_schema.sql`, the generated content seed in
`0002_seed_content.sql` (regenerate with `npm run seed:generate`), and the
functional RLS/trigger test suite in `supabase/tests/` — see
`docs/security-review.md` for the review results. The app reads Supabase
whenever `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` are
set (see `lib/data/provider.ts`) and falls back to the typed mock data
otherwise, so local development needs no Supabase project.

## Deploying the schema

```sh
npx supabase init                 # once; creates supabase/config.toml
npx supabase link --project-ref <your-project-ref>
npx supabase db push              # applies 0001 + 0002 in order
```

Then set the two env vars (locally in `.env.local`, and in Vercel project
settings). Reviewer accounts are granted by an operator:
`update contributors set is_reviewer = true where user_id = '<auth uuid>';`
via the SQL editor — API callers can never set this flag.

## Changes made while implementing the approved proposal

- `language_variants.id` is a **text slug** (`'ha-kano'`), not a uuid — the
  frontend ships the same reference data as constants, and shared natural
  keys keep them in lockstep.
- `contributors` is **decoupled from `auth.users`** (`user_id` nullable
  unique FK) so editorial seed rows and labeled AI-suggestion accounts can
  exist without logins; `current_contributor_id()` bridges JWT → profile,
  and `handle_new_user` auto-creates profiles.
- Added `search_fold()` (case + diacritics + punctuation folding, matching
  only) and the `search_yarn(q)` RPC; added `position` columns for curated
  display order; votes are readable only by their owner.
- Seeded `votes_count` is 0 — the mock numbers are illustrative and would
  be dishonest as real agreement counts.

## Design decisions

1. **`concepts` is the canonical table.** The English phrase is not the
   parent of anything — English is just one more language with rows in
   `expressions`. A concept can exist with zero English expressions.

2. **`language_variants` hang off `languages`.** Dialects are varieties, not
   languages. Every expression references both its language (denormalized for
   cheap filtering) and its exact variant. A CHECK-by-trigger keeps
   `expressions.language_code` consistent with the variant's language.

3. **Literal and natural meaning are columns on `expressions`, not a joined
   `expression_meanings` table.** They are 1:1 with an expression and always
   displayed together; a join table would be modeling ceremony with no query
   we'd ever run. (`examples` stays a separate 1:N table because one
   expression can accumulate many examples.) `literal_meaning` is nullable
   and null means "no verified gloss" — the UI renders a pending notice, it
   never fabricates one.

4. **Register-distinct forms are separate rows.** "Ẹ ṣé" (respectful) and
   "O ṣé" (casual) are two `expressions` rows on the same concept.

5. **Verification is an event log, not just a flag.** `expressions` carries a
   current `verification_status` for cheap reads, but every transition is
   recorded in `verifications` (who, what action, why). Triggers keep the
   denormalized status in sync and enforce that **no one verifies their own
   contribution** at the database layer, not just the UI.

6. **AI content can never become verified silently.** `ai_suggestion` rows
   can only transition status through a human reviewer's `verifications` row;
   the trigger refuses `verify` actions where the acting reviewer equals the
   contributor, and refuses any status write that doesn't come via the
   verification trigger path.

7. **Audio is provider-agnostic.** `audio_assets.storage_provider` +
   `storage_key` (an opaque object key) let files move from Supabase Storage
   to Cloudflare R2 by re-pointing a resolver, with no schema change. Speaker
   gender is voluntary and nullable.

8. **Search**: v1 ships Postgres full-text + trigram. `concepts.search_text`
   is a generated tsvector over title/description/search_terms;
   `expressions.text` gets a `pg_trgm` GIN index with an `unaccent`-folded
   expression index so "e kaaro" matches "Ẹ káàárọ̀" without ever storing a
   stripped form. Semantic/embedding search can be added later behind the
   same "query → concepts" contract.

9. **Submissions vs expressions.** A contributor submission IS a row in
   `expressions` with `verification_status = 'pending'` — no shadow
   `submissions` table for v1. Edits-as-proposals (a `proposed_changes`
   JSONB queue) are deferred until moderation volume needs them. This is the
   biggest deliberate simplification; it keeps one source of truth.

## Tables

| Table | Purpose |
| --- | --- |
| `languages` | `en`, `ha`, `ig`, `yo` — code, name, native name |
| `language_variants` | Standard + regional varieties per language |
| `concepts` | Canonical intents: slug, title, description, category, search terms |
| `expressions` | One natural expression in one variety, with literal + natural meaning, register, usage note, status, dispute note |
| `examples` | 1:N example sentences with translations |
| `sources` | Citable references (or honest placeholders) |
| `expression_sources` | M:N join expressions ↔ sources |
| `contributors` | Profile per auth user; `is_reviewer` flag; `kind` includes `ai` |
| `verifications` | Append-only review log: verify / reject / dispute / request_changes |
| `votes` | One agreement vote per user per expression |
| `audio_assets` | Pronunciation recordings; provider-agnostic storage key; own verification status |

## Row Level Security (summary)

- **Read**: reference and content tables are public — the product displays
  unverified content honestly labeled, so all statuses are readable. ⚠️ To
  hide `pending` rows from anonymous readers instead, flip the commented
  line on the expressions policy — the minimum bar from the brief ("public
  users can read verified content") is met either way. Individual `votes`
  rows are visible only to their owner.
- **Insert**: authenticated users only; `contributor_id` must be the
  caller's own contributor profile; `verification_status` is forced to
  `'pending'` (`'ai_suggestion'` rows enter only via the service role).
- **Update/Delete**: contributors may edit their own still-`pending` rows;
  every status change goes through `verifications` (reviewers only, never
  on their own rows — enforced by trigger, not only by policy).
- **Votes**: one row per (expression, voter); voters read/remove their own.
- **Service-role key** is not used by the app at all; the browser gets the
  anon key and RLS does the enforcement.
- The full review — method, per-property results, issues found and fixed,
  and deliberate decisions — is in `docs/security-review.md`. Re-run
  `supabase/tests/policy-tests.sql` against a staging project before
  production launch.
