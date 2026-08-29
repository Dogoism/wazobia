-- Minimal stand-ins for the Supabase-managed schemas, sufficient to run and
-- functionally test YARN's migrations on vanilla Postgres.

create database yarn;
\connect yarn

-- auth schema: users table + claim functions backed by test GUCs so tests
-- can impersonate anon / authenticated users / service role.
create schema auth;

create table auth.users (
  id uuid primary key default gen_random_uuid(),
  email text,
  raw_user_meta_data jsonb not null default '{}'::jsonb
);

create function auth.uid() returns uuid
language sql stable as
$$ select nullif(current_setting('test.uid', true), '')::uuid $$;

create function auth.role() returns text
language sql stable as
$$ select nullif(current_setting('test.role', true), '') $$;

-- storage schema: buckets/objects tables + foldername helper.
create schema storage;

create table storage.buckets (
  id text primary key,
  name text not null,
  public boolean not null default false
);

create table storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets (id),
  name text not null,
  owner uuid
);

alter table storage.objects enable row level security;

create function storage.foldername(name text) returns text[]
language sql immutable as
$$ select (string_to_array(name, '/'))[1 : array_length(string_to_array(name, '/'), 1) - 1] $$;

-- PostgREST-style API roles (Supabase grants these automatically).
create role anon nologin;
create role authenticated nologin;
