# Supabase security review

Reviewed: the full RLS policy set, triggers, and functions in
`supabase/migrations/0001_initial_schema.sql`.

Method: the migrations were executed against a real PostgreSQL 16 cluster
with a faithful stand-in for the Supabase-managed schemas
(`supabase/tests/local-harness.sql`: `auth.users`, claim functions,
`storage.objects`, PostgREST-style `anon`/`authenticated` roles and
grants). The functional suite in `supabase/tests/policy-tests.sql` then
impersonated anonymous users, two authenticated contributors, and a
reviewer. **All 24 checks pass.** Re-run locally with:

```sh
initdb + pg_ctl start                          # any scratch Postgres 16
psql -U postgres -f supabase/tests/local-harness.sql
psql -U postgres -d yarn -f supabase/migrations/0001_initial_schema.sql
psql -U postgres -d yarn -f supabase/migrations/0002_seed_content.sql
psql -U postgres -f supabase/tests/policy-tests.sql
```

## What was verified

| Property | Result |
| --- | --- |
| Anonymous users read all labeled content; every write is rejected | PASS |
| Authenticated contributor can insert only their own expression, only as `pending` | PASS |
| Inserting with `verified`/other statuses is rejected by policy | PASS |
| Attributing a submission to another contributor is rejected | PASS |
| Owner can edit their own row only while `pending`; cannot touch the status column | PASS |
| Editing another contributor's row matches zero rows | PASS |
| Non-reviewers cannot write to `verifications` | PASS |
| Reviewer verification/dispute flips the denormalized status via trigger | PASS |
| **No self-verification**: a reviewer verifying their own row is refused at the trigger (defense in depth below the UI) | PASS |
| Self-promotion to reviewer is refused (trigger; only service role / operator SQL may set `is_reviewer`) | PASS |
| One vote per contributor; vote insert/delete keeps `votes_count` in sync; vote rows visible only to their owner | PASS |
| Variant must belong to the expression's language (trigger) | PASS |
| Storage: uploads land only in the caller's own `auth.uid()` folder | PASS |
| `handle_new_user` creates a contributor profile per auth user | PASS |
| Search RPC runs as invoker with read-only reach | PASS |

## Issues found and fixed during the review

1. **`votes` had no SELECT policy**, which silently broke the owner's
   DELETE (Postgres requires target rows to be SELECT-visible when the
   WHERE clause reads columns). Fixed with an owner-scoped read policy —
   deliberately not public, so who-voted-for-what stays private while the
   aggregate `votes_count` remains public.
2. **`is_reviewer` was guarded by a self-referential policy subquery** in
   the draft; replaced with a trigger, which is airtight and keeps
   operator SQL (no JWT) working.
3. **Search normalization**: queries with keyboard apostrophes failed
   against data using typographic ’ and stopword-heavy phrases fell out of
   FTS. Fixed with `search_fold()` (case + diacritics + punctuation) used
   only for matching, never for storage or display.

## Deliberate decisions (revisit before scale)

- **All verification statuses are publicly readable.** The product shows
  unverified content honestly labeled, so hiding `pending` rows would
  contradict the UI. The brief's minimum ("public reads verified content")
  is exceeded, not violated. A one-line policy change (commented in the
  migration) restricts `pending` to authenticated readers if wanted.
- **`contributors` is publicly readable including `user_id`.** Auth UUIDs
  are opaque and unprivileged, but if that linkage ever feels too chatty,
  move public reads to a view without `user_id`.
- **`sources` accepts inserts from any authenticated user** (needed for
  the contributor flow); rows are inert until linked to an expression the
  caller owns. Rate limiting/moderation can come later.
- **`examples` have no verification status of their own**; inserts are
  therefore restricted to the owner of a still-pending expression. If
  examples should be community-editable later, give them their own status
  column and review flow.
- **AI suggestions enter only via the service role** (RLS forces API
  inserts to `pending`). The `apply_verification` trigger is the only path
  that can ever mark anything `verified`, and it refuses self-review; the
  UI additionally never renders `ai_suggestion` rows as verified.

## Standing rules

- The service-role key is not used by the app at all and must never ship
  to the client or be committed (`.env.example` documents this).
- The browser only ever holds the anon key; every privilege beyond
  public-read comes from a user JWT evaluated by these policies.
- Before production launch, re-run `policy-tests.sql` against a staging
  Supabase project (real PostgREST, real JWTs) — the local harness is a
  faithful but simplified stand-in.
