-- ============================================================================
-- YARN initial schema.
-- Design rationale: docs/supabase-schema.md
-- Security review:  docs/security-review.md
--
-- Conventions:
-- - Extensions live in the `extensions` schema (Supabase default).
-- - Every SECURITY DEFINER function pins search_path.
-- - `language_variants` and `contributors` use stable text/fixed ids so the
--   app's reference data and editorial seed rows line up with the database.
-- ============================================================================

create schema if not exists extensions;
create extension if not exists pg_trgm with schema extensions;
create extension if not exists unaccent with schema extensions;
create extension if not exists moddatetime with schema extensions;

-- ── Enums ───────────────────────────────────────────────────────────────────

create type verification_status as enum (
  'verified', 'community', 'pending', 'disputed', 'ai_suggestion'
);

create type register as enum (
  'neutral', 'formal', 'respectful', 'casual', 'intimate'
);

create type verification_action as enum (
  'verify', 'reject', 'dispute', 'request_changes'
);

create type audio_speed as enum ('natural', 'slow');

create type contributor_kind as enum ('seed', 'native-speaker', 'learner', 'ai');

-- ── Reference tables ────────────────────────────────────────────────────────

create table languages (
  code text primary key check (code in ('en', 'ha', 'ig', 'yo')),
  name text not null,
  native_name text not null
);

-- Text slugs (e.g. 'ha-kano') instead of uuids: these are a small, stable
-- reference set that the frontend also ships as constants; shared natural
-- keys keep the two in lockstep.
create table language_variants (
  id text primary key,
  language_code text not null references languages (code),
  name text not null,
  is_standard boolean not null default false,
  region_note text,
  unique (language_code, name)
);

-- Exactly one standard variety per language.
create unique index one_standard_variant_per_language
  on language_variants (language_code) where is_standard;

-- ── Contributors ────────────────────────────────────────────────────────────

-- Decoupled from auth.users so editorial seed rows and AI-suggestion
-- accounts can exist without a login. user_id links real accounts.
create table contributors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users (id) on delete set null,
  display_name text not null,
  kind contributor_kind not null default 'learner',
  is_reviewer boolean not null default false,
  created_at timestamptz not null default now()
);

-- The contributor row belonging to the calling auth user, if any.
create or replace function public.current_contributor_id()
returns uuid
language sql stable
set search_path = public
as $$
  select id from contributors where user_id = auth.uid()
$$;

-- Auto-create a contributor profile for each new auth user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  insert into contributors (user_id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'contributor'
    )
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- is_reviewer may only be granted by an operator (service role or direct
-- SQL) — never by an API caller, including the row's owner.
create or replace function public.protect_reviewer_flag()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.is_reviewer is distinct from old.is_reviewer
     and coalesce(auth.role(), 'service_role') <> 'service_role' then
    raise exception 'is_reviewer can only be changed by an operator';
  end if;
  return new;
end $$;

create trigger contributors_protect_reviewer_flag
  before update on contributors
  for each row execute function public.protect_reviewer_flag();

-- ── Core content ────────────────────────────────────────────────────────────

-- array_to_string is only STABLE; this wrapper is safe to mark IMMUTABLE
-- for text[] and lets us use it in a generated column.
create or replace function public.immutable_array_to_string(text[], text)
returns text
language sql immutable strict parallel safe
set search_path = ''
as $$ select array_to_string($1, $2) $$;

create table concepts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  category text not null default 'general',
  search_terms text[] not null default '{}',
  position integer not null default 0,
  search_text tsvector generated always as (
    to_tsvector('english',
      coalesce(title, '') || ' ' ||
      coalesce(description, '') || ' ' ||
      public.immutable_array_to_string(search_terms, ' ')
    )
  ) stored,
  created_at timestamptz not null default now()
);

create index concepts_search_idx on concepts using gin (search_text);

create table expressions (
  id uuid primary key default gen_random_uuid(),
  concept_id uuid not null references concepts (id) on delete cascade,
  language_code text not null references languages (code),
  variant_id text not null references language_variants (id),
  -- Exact orthography with all diacritics and tone marks. Display code must
  -- never strip them; only search folding may.
  text text not null,
  -- NULL = no *verified* word-for-word gloss. Never fill with a guess.
  literal_meaning text,
  natural_meaning text not null,
  usage_note text,
  register register not null default 'neutral',
  pronunciation_note text,
  position integer not null default 0,
  contributor_id uuid not null references contributors (id),
  verification_status verification_status not null default 'pending',
  dispute_note text,
  votes_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dispute_note_only_when_disputed
    check (dispute_note is null or verification_status = 'disputed')
);

create index expressions_concept_idx on expressions (concept_id);
create index expressions_variant_idx on expressions (variant_id);

create trigger expressions_set_updated_at
  before update on expressions
  for each row execute function extensions.moddatetime (updated_at);

-- unaccent() isn't immutable by default; wrap it for use in indexes and
-- generated search folding. Used ONLY for matching — displayed text always
-- keeps full diacritics.
create or replace function public.immutable_unaccent(text)
returns text
language sql immutable strict parallel safe
set search_path = ''
as $$
  select extensions.unaccent('extensions.unaccent'::regdictionary, $1)
$$;

-- Full search folding: case, diacritics, apostrophes/punctuation (the data
-- uses typographic ’ while keyboards type '), collapsed whitespace. Used
-- ONLY for matching — never applied to stored or displayed text.
create or replace function public.search_fold(text)
returns text
language sql immutable strict parallel safe
set search_path = ''
as $$
  select btrim(regexp_replace(
    regexp_replace(
      lower(public.immutable_unaccent($1)),
      '[''’‘"“”.,!?;:()]', '', 'g'
    ),
    '\s+', ' ', 'g'
  ))
$$;

-- Trigram indexes over raw and folded text so "e kaaro" matches
-- "Ẹ káàárọ̀" without a stripped form ever being stored.
create index expressions_text_trgm_idx
  on expressions using gin (text extensions.gin_trgm_ops);
create index expressions_text_fold_trgm_idx
  on expressions using gin (public.search_fold(text) extensions.gin_trgm_ops);

-- Variant must belong to the expression's language (dialects are varieties,
-- not languages — keep the denormalized language_code honest).
create or replace function public.check_variant_language()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if (select language_code from language_variants where id = new.variant_id)
     is distinct from new.language_code then
    raise exception 'variant % does not belong to language %',
      new.variant_id, new.language_code;
  end if;
  return new;
end $$;

create trigger expressions_variant_language
  before insert or update on expressions
  for each row execute function public.check_variant_language();

create table examples (
  id uuid primary key default gen_random_uuid(),
  expression_id uuid not null references expressions (id) on delete cascade,
  text text not null,
  translation text not null,
  contributor_id uuid references contributors (id),
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index examples_expression_idx on examples (expression_id);

create table sources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text,
  is_placeholder boolean not null default false,
  created_at timestamptz not null default now()
);

create table expression_sources (
  expression_id uuid not null references expressions (id) on delete cascade,
  source_id uuid not null references sources (id) on delete cascade,
  note text,
  primary key (expression_id, source_id)
);

-- ── Moderation ──────────────────────────────────────────────────────────────

-- Append-only review log. expressions.verification_status is a denormalized
-- copy maintained by trigger from this table; API callers cannot write the
-- status column directly (see policies below).
create table verifications (
  id uuid primary key default gen_random_uuid(),
  expression_id uuid not null references expressions (id) on delete cascade,
  reviewer_id uuid not null references contributors (id),
  action verification_action not null,
  note text,
  created_at timestamptz not null default now()
);

create index verifications_expression_idx on verifications (expression_id);

create or replace function public.apply_verification()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  expr expressions%rowtype;
  is_rev boolean;
begin
  select * into expr from expressions where id = new.expression_id;
  select is_reviewer into is_rev from contributors where id = new.reviewer_id;

  if not coalesce(is_rev, false) then
    raise exception 'only reviewers can record verifications';
  end if;
  -- No one verifies their own contribution — including AI-backed accounts.
  if new.action = 'verify' and expr.contributor_id = new.reviewer_id then
    raise exception 'contributors cannot verify their own submissions';
  end if;

  update expressions set
    verification_status = case new.action
      when 'verify' then 'verified'::verification_status
      when 'reject' then 'pending'::verification_status
      when 'dispute' then 'disputed'::verification_status
      when 'request_changes' then 'pending'::verification_status
    end,
    dispute_note = case when new.action = 'dispute' then new.note
                        else null end
  where id = new.expression_id;

  return new;
end $$;

create trigger verifications_apply
  after insert on verifications
  for each row execute function public.apply_verification();

-- ── Votes ───────────────────────────────────────────────────────────────────

create table votes (
  expression_id uuid not null references expressions (id) on delete cascade,
  voter_id uuid not null references contributors (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (expression_id, voter_id)
);

create or replace function public.sync_votes_count()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  update expressions e set votes_count = (
    select count(*) from votes v
    where v.expression_id = coalesce(new.expression_id, old.expression_id)
  )
  where e.id = coalesce(new.expression_id, old.expression_id);
  return null;
end $$;

create trigger votes_sync
  after insert or delete on votes
  for each row execute function public.sync_votes_count();

-- ── Audio ───────────────────────────────────────────────────────────────────

create table audio_assets (
  id uuid primary key default gen_random_uuid(),
  expression_id uuid not null references expressions (id) on delete cascade,
  -- Provider-agnostic: moving Supabase Storage → Cloudflare R2 is a resolver
  -- change, not a schema change.
  storage_provider text not null default 'supabase',
  storage_key text not null,
  speed audio_speed not null default 'natural',
  speaker_name text,
  speaker_gender text, -- voluntary
  variant_id text references language_variants (id),
  contributor_id uuid references contributors (id),
  verification_status verification_status not null default 'pending',
  created_at timestamptz not null default now()
);

create index audio_assets_expression_idx on audio_assets (expression_id);

-- ── Search ──────────────────────────────────────────────────────────────────

-- Resolves free text — an English phrase, a paraphrased intent, or an
-- existing Hausa/Igbo/Yorùbá expression — to concepts. Matching folds case
-- and diacritics; returned text keeps full diacritics.
create or replace function public.search_yarn(q text)
returns table (
  slug text,
  title text,
  score integer,
  matched_text text,
  matched_language text
)
language sql stable
set search_path = public, extensions
as $$
  with query as (
    select trim(q) as raw, public.search_fold(q) as folded
  ),
  concept_hits as (
    select c.slug, c.title,
           40 + (ts_rank(c.search_text,
                 websearch_to_tsquery('english', (select raw from query))) * 100
                )::integer as score,
           null::text as matched_text,
           null::text as matched_language
    from concepts c
    where (select raw from query) <> ''
      and c.search_text @@ websearch_to_tsquery('english', (select raw from query))
  ),
  -- Folded substring match over the concept's search terms catches
  -- stopword-heavy paraphrases FTS drops (e.g. "it's been a while").
  search_term_hits as (
    select c.slug, c.title, 60 as score,
           null::text as matched_text,
           null::text as matched_language
    from concepts c
    where (select folded from query) <> ''
      and public.search_fold(public.immutable_array_to_string(c.search_terms, ' | '))
          like '%' || (select folded from query) || '%'
  ),
  expression_hits as (
    select c.slug, c.title,
           case
             when public.search_fold(e.text) = (select folded from query)
               then 100
             when public.search_fold(e.text)
                  like (select folded from query) || '%' then 70
             when public.search_fold(e.text)
                  like '%' || (select folded from query) || '%' then 55
             else (similarity(public.search_fold(e.text),
                              (select folded from query)) * 50)::integer
           end as score,
           e.text as matched_text,
           e.language_code as matched_language
    from expressions e
    join concepts c on c.id = e.concept_id
    where (select folded from query) <> ''
      and (
        public.search_fold(e.text) % (select folded from query)
        or public.search_fold(e.text)
           like '%' || (select folded from query) || '%'
      )
  ),
  meaning_hits as (
    select c.slug, c.title, 45 as score,
           e.text as matched_text,
           e.language_code as matched_language
    from expressions e
    join concepts c on c.id = e.concept_id
    where (select folded from query) <> ''
      and public.search_fold(e.natural_meaning)
          like '%' || (select folded from query) || '%'
  ),
  all_hits as (
    select * from concept_hits
    union all
    select * from search_term_hits
    union all
    select * from expression_hits
    union all
    select * from meaning_hits
  ),
  best as (
    select distinct on (slug)
           slug, title, score, matched_text, matched_language
    from all_hits
    where score > 10
    order by slug, score desc
  )
  select * from best order by score desc limit 8
$$;

-- ── Row Level Security ──────────────────────────────────────────────────────

alter table languages enable row level security;
alter table language_variants enable row level security;
alter table concepts enable row level security;
alter table contributors enable row level security;
alter table expressions enable row level security;
alter table examples enable row level security;
alter table sources enable row level security;
alter table expression_sources enable row level security;
alter table verifications enable row level security;
alter table votes enable row level security;
alter table audio_assets enable row level security;

-- Public read of reference + content tables. The product shows unverified
-- content honestly labeled, so all statuses are readable.
-- To hide un-reviewed rows from anonymous readers instead, replace the
-- expressions policy's `true` with:
--   (verification_status <> 'pending' or auth.role() = 'authenticated')
create policy "public read languages" on languages
  for select using (true);
create policy "public read variants" on language_variants
  for select using (true);
create policy "public read concepts" on concepts
  for select using (true);
create policy "public read contributors" on contributors
  for select using (true);
create policy "public read expressions" on expressions
  for select using (true);
create policy "public read examples" on examples
  for select using (true);
create policy "public read sources" on sources
  for select using (true);
create policy "public read expression_sources" on expression_sources
  for select using (true);
create policy "public read verifications" on verifications
  for select using (true);
create policy "public read audio" on audio_assets
  for select using (true);

-- Contributors may edit their own display name; the reviewer flag is
-- guarded by the protect_reviewer_flag trigger above. Profile rows are
-- created by the on_auth_user_created trigger, not by API inserts.
create policy "own profile update" on contributors
  for update
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Submissions: authenticated users insert rows attributed to their own
-- contributor profile, always pending. 'ai_suggestion' rows enter only via
-- the service role (which bypasses RLS).
create policy "insert own pending expression" on expressions
  for insert
  with check (
    contributor_id = (select public.current_contributor_id())
    and verification_status = 'pending'
  );

-- Contributors may edit their own not-yet-reviewed rows; the status can't
-- move off 'pending' here (status changes only flow through verifications).
create policy "edit own pending expression" on expressions
  for update
  using (
    contributor_id = (select public.current_contributor_id())
    and verification_status = 'pending'
  )
  with check (
    contributor_id = (select public.current_contributor_id())
    and verification_status = 'pending'
  );

-- Examples ride on an expression and have no review status of their own
-- yet, so only the expression's owner may add them while it is pending.
create policy "insert example on own pending expression" on examples
  for insert
  with check (
    contributor_id = (select public.current_contributor_id())
    and exists (
      select 1 from expressions e
      where e.id = expression_id
        and e.contributor_id = (select public.current_contributor_id())
        and e.verification_status = 'pending'
    )
  );

create policy "authenticated insert sources" on sources
  for insert
  with check ((select auth.role()) = 'authenticated');

create policy "link sources to own pending expression" on expression_sources
  for insert
  with check (exists (
    select 1 from expressions e
    where e.id = expression_id
      and e.contributor_id = (select public.current_contributor_id())
      and e.verification_status = 'pending'
  ));

-- Reviewers write to the verification log; the apply_verification trigger
-- re-checks the reviewer flag and the no-self-verification rule.
create policy "reviewers insert verifications" on verifications
  for insert
  with check (
    reviewer_id = (select public.current_contributor_id())
    and exists (
      select 1 from contributors c
      where c.id = (select public.current_contributor_id()) and c.is_reviewer
    )
  );

-- One vote per contributor, removable by its owner. Individual vote rows
-- are visible only to their owner (the public sees the aggregate
-- votes_count on expressions); this SELECT policy is also required for the
-- owner's DELETE to see its target rows.
create policy "read own votes" on votes
  for select
  using (voter_id = (select public.current_contributor_id()));
create policy "insert own vote" on votes
  for insert
  with check (voter_id = (select public.current_contributor_id()));
create policy "delete own vote" on votes
  for delete
  using (voter_id = (select public.current_contributor_id()));

-- Audio: contributors upload against any expression; pending by default.
create policy "insert own audio" on audio_assets
  for insert
  with check (
    contributor_id = (select public.current_contributor_id())
    and verification_status = 'pending'
  );

-- ── Storage: audio bucket ───────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('audio', 'audio', true)
on conflict (id) do nothing;

create policy "public read audio objects" on storage.objects
  for select using (bucket_id = 'audio');

-- Authenticated users upload only into their own auth-uid-named folder.
create policy "contributors upload audio objects" on storage.objects
  for insert
  with check (
    bucket_id = 'audio'
    and (select auth.role()) = 'authenticated'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- ── Seed reference data ─────────────────────────────────────────────────────

insert into languages (code, name, native_name) values
  ('en', 'English', 'English'),
  ('ha', 'Hausa', 'Harshen Hausa'),
  ('ig', 'Igbo', 'Asụsụ Igbo'),
  ('yo', 'Yorùbá', 'Èdè Yorùbá');

insert into language_variants (id, language_code, name, is_standard, region_note) values
  ('en-standard', 'en', 'English', true, null),
  ('ha-standard', 'ha', 'Standard Hausa', true, null),
  ('ha-kano', 'ha', 'Kano colloquial', false, 'Kano'),
  ('ha-sokoto', 'ha', 'Sokoto', false, 'Sokoto'),
  ('ha-ghana', 'ha', 'Ghana Hausa (Gaananci)', false, 'Ghana'),
  ('ig-standard', 'ig', 'Standard Igbo', true, null),
  ('ig-enuani', 'ig', 'Enuani', false, 'Delta State'),
  ('ig-ika', 'ig', 'Ika', false, 'Delta/Edo'),
  ('ig-ukwuani', 'ig', 'Ukwuani', false, 'Delta State'),
  ('ig-onitsha', 'ig', 'Onitsha', false, 'Anambra State'),
  ('yo-standard', 'yo', 'Standard Yorùbá', true, null),
  ('yo-oyo', 'yo', 'Ọ̀yọ́', false, 'Ọ̀yọ́ State'),
  ('yo-ijebu', 'yo', 'Ìjẹ̀bú', false, 'Ogun State'),
  ('yo-ekiti', 'yo', 'Èkìtì', false, 'Èkìtì State'),
  ('yo-ondo', 'yo', 'Ondo', false, 'Ondo State');
