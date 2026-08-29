-- YARN RLS / trigger / search functional tests against the local cluster.
-- Every block prints PASS or raises 'TEST FAIL'.
\set ON_ERROR_STOP on
\connect yarn

-- ── Supabase-style grants for API roles ─────────────────────────────────────
grant usage on schema public, extensions, auth, storage to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on storage.objects, storage.buckets to anon, authenticated;
grant execute on all functions in schema public, extensions, auth, storage to anon, authenticated;

-- ── Fixture users ───────────────────────────────────────────────────────────
insert into auth.users (id, email) values
  ('aaaaaaaa-0000-4000-8000-000000000001', 'amina@example.com'),
  ('bbbbbbbb-0000-4000-8000-000000000002', 'chidi@example.com');

do $$ begin
  if (select count(*) from contributors where user_id is not null) <> 2 then
    raise exception 'TEST FAIL: handle_new_user did not create 2 contributor profiles';
  end if;
  if (select display_name from contributors
      where user_id = 'aaaaaaaa-0000-4000-8000-000000000001') <> 'amina' then
    raise exception 'TEST FAIL: display_name not derived from email';
  end if;
  raise notice 'PASS: contributor profiles auto-created';
end $$;

-- Operator (direct SQL, no JWT) may grant the reviewer flag.
update contributors set is_reviewer = true
where user_id = 'bbbbbbbb-0000-4000-8000-000000000002';

select id as amina_cid from contributors
  where user_id = 'aaaaaaaa-0000-4000-8000-000000000001' \gset
select id as chidi_cid from contributors
  where user_id = 'bbbbbbbb-0000-4000-8000-000000000002' \gset
select id as concept_longtime from concepts where slug = 'long-time-no-see' \gset
select id as expr_kwana from expressions where text = 'Kwana biyu' \gset

-- ── Anonymous access ────────────────────────────────────────────────────────
set test.uid = '';
set test.role = 'anon';
set role anon;

do $$ begin
  if (select count(*) from expressions) < 29 then
    raise exception 'TEST FAIL: anon cannot read expressions';
  end if;
  raise notice 'PASS: anon reads all labeled content (% rows)',
    (select count(*) from expressions);
end $$;

do $$ begin
  begin
    insert into expressions (concept_id, language_code, variant_id, text,
      natural_meaning, contributor_id)
    values ('11111111-2222-4333-8444-555555555555', 'ha', 'ha-standard',
      'x', 'x', '11111111-1111-4111-8111-111111111111');
    raise exception 'TEST FAIL: anon insert into expressions was allowed';
  exception when others then
    if sqlerrm like 'TEST FAIL%' then raise; end if;
    raise notice 'PASS: anon insert rejected (%)', sqlstate;
  end;
end $$;

-- ── Search (as anon) ────────────────────────────────────────────────────────
do $$
declare r record;
begin
  select * into r from search_yarn('kwana biyu') limit 1;
  if r.slug is distinct from 'long-time-no-see' or r.score <> 100 then
    raise exception 'TEST FAIL: search kwana biyu → % (score %)', r.slug, r.score;
  end if;
  raise notice 'PASS: search "kwana biyu" → % (score %, matched %)', r.slug, r.score, r.matched_text;

  select * into r from search_yarn('e kaaro') limit 1;
  if r.slug is distinct from 'good-morning' then
    raise exception 'TEST FAIL: diacritic-folded search → %', r.slug;
  end if;
  raise notice 'PASS: search "e kaaro" folds diacritics → % (matched %)', r.slug, r.matched_text;

  select * into r from search_yarn('greet someone you haven''t seen') limit 1;
  if r.slug is distinct from 'long-time-no-see' then
    raise exception 'TEST FAIL: intent paraphrase search → %', r.slug;
  end if;
  raise notice 'PASS: intent paraphrase resolves → %', r.slug;

  select * into r from search_yarn('it''s been a while') limit 1;
  if r.slug is distinct from 'long-time-no-see' then
    raise exception 'TEST FAIL: meaning search → %', r.slug;
  end if;
  raise notice 'PASS: meaning phrase resolves → %', r.slug;

  if (select count(*) from search_yarn('')) <> 0
     or (select count(*) from search_yarn('zzzz qqqq vvvv')) <> 0 then
    raise exception 'TEST FAIL: empty/garbage query returned rows';
  end if;
  raise notice 'PASS: empty and garbage queries return nothing';
end $$;

reset role;

-- ── Authenticated contributor (amina) ───────────────────────────────────────
set test.uid = 'aaaaaaaa-0000-4000-8000-000000000001';
set test.role = 'authenticated';
set role authenticated;

insert into expressions (id, concept_id, language_code, variant_id, text,
  natural_meaning, contributor_id)
values ('99999999-0000-4000-8000-000000000001', :'concept_longtime', 'ig',
  'ig-standard', 'test submission — unverified', 'test', :'amina_cid');

do $$ begin
  if (select verification_status from expressions
      where id = '99999999-0000-4000-8000-000000000001') <> 'pending' then
    raise exception 'TEST FAIL: submission not pending';
  end if;
  raise notice 'PASS: contributor submits own pending expression';
end $$;

do $$ begin
  begin
    insert into expressions (concept_id, language_code, variant_id, text,
      natural_meaning, contributor_id, verification_status)
    values ((select id from concepts where slug='long-time-no-see'), 'ig',
      'ig-standard', 'x', 'x',
      (select id from contributors
       where user_id = 'aaaaaaaa-0000-4000-8000-000000000001'), 'verified');
    raise exception 'TEST FAIL: verified-status insert was allowed';
  exception when insufficient_privilege then
    raise notice 'PASS: cannot insert with verified status (%)', sqlstate;
  end;
end $$;

do $$ begin
  begin
    insert into expressions (concept_id, language_code, variant_id, text,
      natural_meaning, contributor_id, verification_status)
    values ((select id from concepts where slug='long-time-no-see'), 'ig',
      'ig-standard', 'x', 'x',
      (select id from contributors where user_id is null limit 1), 'pending');
    raise exception 'TEST FAIL: impersonating another contributor was allowed';
  exception when others then
    if sqlerrm like 'TEST FAIL%' then raise; end if;
    raise notice 'PASS: cannot attribute to another contributor (%)', sqlstate;
  end;
end $$;

do $$ begin
  begin
    insert into expressions (concept_id, language_code, variant_id, text,
      natural_meaning, contributor_id)
    values ((select id from concepts where slug='long-time-no-see'), 'ig',
      'ha-standard', 'x', 'x',
      (select id from contributors
       where user_id = 'aaaaaaaa-0000-4000-8000-000000000001'));
    raise exception 'TEST FAIL: variant/language mismatch was allowed';
  exception when others then
    if sqlerrm like 'TEST FAIL%' then raise; end if;
    raise notice 'PASS: variant must belong to language (%)', sqlstate;
  end;
end $$;

-- Editing own pending row is allowed; flipping its status is not.
update expressions set usage_note = 'edited by owner'
where id = '99999999-0000-4000-8000-000000000001';

do $$ begin
  if (select usage_note from expressions
      where id = '99999999-0000-4000-8000-000000000001') <> 'edited by owner' then
    raise exception 'TEST FAIL: owner edit of pending row did not apply';
  end if;
  raise notice 'PASS: owner edits own pending row';
end $$;

do $$ begin
  begin
    update expressions set verification_status = 'verified'
    where id = '99999999-0000-4000-8000-000000000001';
    raise exception 'TEST FAIL: owner set own row to verified';
  exception when others then
    if sqlerrm like 'TEST FAIL%' then raise; end if;
    raise notice 'PASS: owner cannot change verification status (%)', sqlstate;
  end;
end $$;

-- Editing someone else's row silently matches zero rows.
do $$
declare n int;
begin
  update expressions set usage_note = 'hijacked'
  where text = 'Kwana biyu';
  get diagnostics n = row_count;
  if n <> 0 then
    raise exception 'TEST FAIL: edited another contributor''s row';
  end if;
  raise notice 'PASS: cannot edit another contributor''s row (0 rows matched)';
end $$;

-- Non-reviewer cannot record verifications.
do $$ begin
  begin
    insert into verifications (expression_id, reviewer_id, action)
    values ((select id from expressions where text = 'Kwana biyu'),
            (select id from contributors
             where user_id = 'aaaaaaaa-0000-4000-8000-000000000001'),
            'verify');
    raise exception 'TEST FAIL: non-reviewer recorded a verification';
  exception when others then
    if sqlerrm like 'TEST FAIL%' then raise; end if;
    raise notice 'PASS: non-reviewer cannot verify (%)', sqlstate;
  end;
end $$;

-- Self-promotion to reviewer is blocked by trigger.
do $$ begin
  begin
    update contributors set is_reviewer = true
    where user_id = 'aaaaaaaa-0000-4000-8000-000000000001';
    raise exception 'TEST FAIL: self-promotion to reviewer succeeded';
  exception when others then
    if sqlerrm like 'TEST FAIL%' then raise; end if;
    raise notice 'PASS: cannot self-promote to reviewer (%)', sqlstate;
  end;
end $$;

-- Votes: insert syncs count, duplicate blocked, delete re-syncs.
insert into votes (expression_id, voter_id)
values (:'expr_kwana', :'amina_cid');

do $$ begin
  if (select votes_count from expressions where text = 'Kwana biyu') <> 1 then
    raise exception 'TEST FAIL: votes_count not synced on insert';
  end if;
  raise notice 'PASS: vote insert syncs votes_count to 1';
  begin
    insert into votes (expression_id, voter_id)
    values ((select id from expressions where text = 'Kwana biyu'),
            (select id from contributors
             where user_id = 'aaaaaaaa-0000-4000-8000-000000000001'));
    raise exception 'TEST FAIL: duplicate vote allowed';
  exception when others then
    if sqlerrm like 'TEST FAIL%' then raise; end if;
    raise notice 'PASS: duplicate vote rejected (%)', sqlstate;
  end;
end $$;

delete from votes where expression_id = :'expr_kwana' and voter_id = :'amina_cid';

do $$ begin
  if (select votes_count from expressions where text = 'Kwana biyu') <> 0 then
    raise exception 'TEST FAIL: votes_count not synced on delete';
  end if;
  raise notice 'PASS: vote delete re-syncs votes_count to 0';
end $$;

-- Storage: upload into own folder only.
insert into storage.objects (bucket_id, name)
values ('audio', 'aaaaaaaa-0000-4000-8000-000000000001/take1.webm');

do $$ begin
  begin
    insert into storage.objects (bucket_id, name)
    values ('audio', 'bbbbbbbb-0000-4000-8000-000000000002/sneaky.webm');
    raise exception 'TEST FAIL: upload into another user''s folder allowed';
  exception when others then
    if sqlerrm like 'TEST FAIL%' then raise; end if;
    raise notice 'PASS: cannot upload into another user''s folder (%)', sqlstate;
  end;
end $$;

reset role;

-- ── Reviewer (chidi) ────────────────────────────────────────────────────────
set test.uid = 'bbbbbbbb-0000-4000-8000-000000000002';
set test.role = 'authenticated';
set role authenticated;

-- Reviewer verifies amina's submission → status flips via trigger.
insert into verifications (expression_id, reviewer_id, action, note)
values ('99999999-0000-4000-8000-000000000001', :'chidi_cid', 'verify',
        'checked against native usage');

do $$ begin
  if (select verification_status from expressions
      where id = '99999999-0000-4000-8000-000000000001') <> 'verified' then
    raise exception 'TEST FAIL: verification did not flip status';
  end if;
  raise notice 'PASS: reviewer verification flips status to verified';
end $$;

-- Reviewer disputes it → status disputed with note.
insert into verifications (expression_id, reviewer_id, action, note)
values ('99999999-0000-4000-8000-000000000001', :'chidi_cid', 'dispute',
        'usage contested in region X');

do $$ begin
  if (select verification_status from expressions
      where id = '99999999-0000-4000-8000-000000000001') <> 'disputed'
     or (select dispute_note from expressions
      where id = '99999999-0000-4000-8000-000000000001') is null then
    raise exception 'TEST FAIL: dispute did not set status+note';
  end if;
  raise notice 'PASS: dispute sets status and dispute note';
end $$;

-- Reviewer submits their own expression, then tries to self-verify.
insert into expressions (id, concept_id, language_code, variant_id, text,
  natural_meaning, contributor_id)
values ('99999999-0000-4000-8000-000000000002', :'concept_longtime', 'yo',
  'yo-standard', 'reviewer own submission', 'test', :'chidi_cid');

do $$ begin
  begin
    insert into verifications (expression_id, reviewer_id, action)
    values ('99999999-0000-4000-8000-000000000002',
            (select id from contributors
             where user_id = 'bbbbbbbb-0000-4000-8000-000000000002'),
            'verify');
    raise exception 'TEST FAIL: reviewer verified their own submission';
  exception when others then
    if sqlerrm like 'TEST FAIL%' then raise; end if;
    raise notice 'PASS: reviewer cannot verify own submission (%)', sqlstate;
  end;
end $$;

reset role;
\echo ALL POLICY TESTS PASSED
