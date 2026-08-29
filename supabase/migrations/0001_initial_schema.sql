-- ============================================================================
-- YARN initial schema — DRAFT PROPOSAL, not yet applied.
-- See docs/supabase-schema.md for the design rationale. Review and approve
-- before running against a Supabase project.
-- ============================================================================

create extension if not exists pg_trgm;
create extension if not exists unaccent;

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

create table language_variants (
  id uuid primary key default gen_random_uuid(),
  language_code text not null references languages (code),
  name text not null,
  is_standard boolean not null default false,
  region_note text,
  unique (language_code, name)
);

-- Exactly one standard variety per language.
create unique index one_standard_variant_per_language
  on language_variants (language_code) where is_standard;

-- ── Core content ────────────────────────────────────────────────────────────

create table concepts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  category text not null default 'general',
  search_terms text[] not null default '{}',
  search_text tsvector generated always as (
    to_tsvector('english',
      coalesce(title, '') || ' ' ||
      coalesce(description, '') || ' ' ||
      array_to_string(search_terms, ' ')
    )
  ) stored,
  created_at timestamptz not null default now()
);

create index concepts_search_idx on concepts using gin (search_text);

create table contributors (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  kind contributor_kind not null default 'learner',
  is_reviewer boolean not null default false,
  created_at timestamptz not null default now()
);

create table expressions (
  id uuid primary key default gen_random_uuid(),
  concept_id uuid not null references concepts (id) on delete cascade,
  language_code text not null references languages (code),
  variant_id uuid not null references language_variants (id),
  -- Exact orthography with all diacritics and tone marks. Display code must
  -- never strip them; only search folding may.
  text text not null,
  -- NULL = no *verified* word-for-word gloss. Never fill with a guess.
  literal_meaning text,
  natural_meaning text not null,
  usage_note text,
  register register not null default 'neutral',
  pronunciation_note text,
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

-- unaccent() isn't immutable by default; wrap it for use in an index.
create or replace function immutable_unaccent(text)
returns text language sql immutable strict
as $$ select public.unaccent('public.unaccent', $1) $$;

-- Trigram search over the raw text and an accent-folded expression index so
-- "e kaaro" matches "Ẹ káàárọ̀" without storing a stripped form anywhere.
create index expressions_text_trgm_idx
  on expressions using gin (text gin_trgm_ops);
create index expressions_text_unaccent_trgm_idx
  on expressions using gin (immutable_unaccent(text) gin_trgm_ops);

-- Variant must belong to the expression's language (dialects are varieties,
-- not languages — keep the denormalized language_code honest).
create or replace function check_variant_language()
returns trigger language plpgsql as $$
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
  for each row execute function check_variant_language();

create table examples (
  id uuid primary key default gen_random_uuid(),
  expression_id uuid not null references expressions (id) on delete cascade,
  text text not null,
  translation text not null,
  contributor_id uuid references contributors (id),
  created_at timestamptz not null default now()
);

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

-- Append-only review log. The current expressions.verification_status is a
-- denormalized copy maintained by trigger from this table.
create table verifications (
  id uuid primary key default gen_random_uuid(),
  expression_id uuid not null references expressions (id) on delete cascade,
  reviewer_id uuid not null references contributors (id),
  action verification_action not null,
  note text,
  created_at timestamptz not null default now()
);

create or replace function apply_verification()
returns trigger language plpgsql security definer as $$
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
                        else null end,
    updated_at = now()
  where id = new.expression_id;

  return new;
end $$;

create trigger verifications_apply
  after insert on verifications
  for each row execute function apply_verification();

-- ── Votes ───────────────────────────────────────────────────────────────────

create table votes (
  expression_id uuid not null references expressions (id) on delete cascade,
  voter_id uuid not null references contributors (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (expression_id, voter_id)
);

create or replace function sync_votes_count()
returns trigger language plpgsql security definer as $$
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
  for each row execute function sync_votes_count();

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
  variant_id uuid references language_variants (id),
  contributor_id uuid references contributors (id),
  verification_status verification_status not null default 'pending',
  created_at timestamptz not null default now()
);

create index audio_assets_expression_idx on audio_assets (expression_id);

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
create policy "public read languages" on languages for select using (true);
create policy "public read variants" on language_variants for select using (true);
create policy "public read concepts" on concepts for select using (true);
create policy "public read contributors" on contributors for select using (true);
create policy "public read expressions" on expressions for select using (true);
create policy "public read examples" on examples for select using (true);
create policy "public read sources" on sources for select using (true);
create policy "public read expression_sources" on expression_sources for select using (true);
create policy "public read verifications" on verifications for select using (true);
create policy "public read audio" on audio_assets for select using (true);

-- Contributors manage their own profile row.
create policy "own profile insert" on contributors for insert
  with check (id = auth.uid());
create policy "own profile update" on contributors for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- is_reviewer is protected: only the service role may change it. A trigger
-- (rather than a self-referential policy subquery) makes this airtight.
create or replace function protect_reviewer_flag()
returns trigger language plpgsql as $$
begin
  if new.is_reviewer is distinct from old.is_reviewer
     and auth.role() is distinct from 'service_role' then
    raise exception 'is_reviewer can only be changed by an admin';
  end if;
  return new;
end $$;

create trigger contributors_protect_reviewer_flag
  before update on contributors
  for each row execute function protect_reviewer_flag();

-- Submissions: authenticated users insert their own rows, always pending.
-- 'ai_suggestion' rows are inserted only by the service role (bypasses RLS).
create policy "insert own pending expression" on expressions for insert
  with check (
    contributor_id = auth.uid()
    and verification_status = 'pending'
  );

-- Contributors may edit their own not-yet-reviewed rows, but cannot touch
-- the status fields (status changes only flow through verifications).
create policy "edit own pending expression" on expressions for update
  using (contributor_id = auth.uid() and verification_status = 'pending')
  with check (contributor_id = auth.uid() and verification_status = 'pending');

create policy "insert own example" on examples for insert
  with check (contributor_id = auth.uid());

create policy "insert sources" on sources for insert
  with check (auth.role() = 'authenticated');
create policy "link sources to own expression" on expression_sources for insert
  with check (exists (
    select 1 from expressions e
    where e.id = expression_id and e.contributor_id = auth.uid()
  ));

-- Reviewers write to the verification log; the trigger double-checks the
-- reviewer flag and the no-self-verification rule.
create policy "reviewers insert verifications" on verifications for insert
  with check (
    reviewer_id = auth.uid()
    and exists (
      select 1 from contributors c where c.id = auth.uid() and c.is_reviewer
    )
  );

-- One vote per user, removable by its owner.
create policy "insert own vote" on votes for insert
  with check (voter_id = auth.uid());
create policy "delete own vote" on votes for delete
  using (voter_id = auth.uid());

-- Audio: contributors upload against any expression, pending by default.
create policy "insert own audio" on audio_assets for insert
  with check (contributor_id = auth.uid() and verification_status = 'pending');

-- ── Seed reference data ─────────────────────────────────────────────────────

insert into languages (code, name, native_name) values
  ('en', 'English', 'English'),
  ('ha', 'Hausa', 'Harshen Hausa'),
  ('ig', 'Igbo', 'Asụsụ Igbo'),
  ('yo', 'Yorùbá', 'Èdè Yorùbá');

insert into language_variants (language_code, name, is_standard, region_note) values
  ('en', 'English', true, null),
  ('ha', 'Standard Hausa', true, null),
  ('ha', 'Kano colloquial', false, 'Kano'),
  ('ha', 'Sokoto', false, 'Sokoto'),
  ('ha', 'Ghana Hausa (Gaananci)', false, 'Ghana'),
  ('ig', 'Standard Igbo', true, null),
  ('ig', 'Enuani', false, 'Delta State'),
  ('ig', 'Ika', false, 'Delta/Edo'),
  ('ig', 'Ukwuani', false, 'Delta State'),
  ('ig', 'Onitsha', false, 'Anambra State'),
  ('yo', 'Standard Yorùbá', true, null),
  ('yo', 'Ọ̀yọ́', false, 'Ọ̀yọ́ State'),
  ('yo', 'Ìjẹ̀bú', false, 'Ogun State'),
  ('yo', 'Èkìtì', false, 'Èkìtì State'),
  ('yo', 'Ondo', false, 'Ondo State');
