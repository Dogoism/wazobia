# Proposed Supabase schema (not yet implemented)

Status: **proposal**. Per project instructions, the backend is not wired up
until this design is approved. The draft SQL lives in
`supabase/migrations/0001_initial_schema.sql`; nothing in the app reads from
Supabase yet — the typed mock data in `lib/` mirrors this schema field for
field.

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

- **Read**: `languages`, `language_variants`, `concepts`, `examples`,
  `sources`, `expression_sources` — public. `expressions` and `audio_assets`
  — public for every status *except nothing*: the product displays unverified
  content honestly labeled, so all rows are readable. ⚠️ If the team would
  rather hide `pending` rows from anonymous readers until first review, flip
  the one commented line in the policy — the minimum bar from the brief
  ("public users can read verified content") is met either way.
- **Insert**: authenticated users only; `contributor_id` must equal
  `auth.uid()`; `verification_status` is forced to `'pending'`
  (`'ai_suggestion'` may only be inserted by the service role, which is the
  only path AI-generated rows enter by).
- **Update/Delete**: contributors may edit their own still-`pending` rows;
  every status change goes through `verifications` (reviewers only, never on
  their own rows — enforced by trigger, not only by policy).
- **Votes**: authenticated; one row per (expression, voter); voters can
  remove their own vote.
- **Service-role key** stays server-side only (Route Handlers / Server
  Actions); the browser gets the anon key and RLS does the enforcement.
- Before the backend is called done: run a policy review pass — attempt every
  forbidden action (self-verification, status escalation on insert, editing
  another user's row, anonymous writes) against a staging project.
