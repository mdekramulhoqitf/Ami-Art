-- Ami Art — storage buckets + policies (idempotent recovery migration)
--
-- The storage section at the tail of 0001_init.sql (buckets + storage.objects
-- policies) did not take effect in production, even though every table, RLS
-- policy, and RPC function earlier in that same file did. Root cause unknown
-- (Supabase SQL Editor backend intermittently failed on large multi-statement
-- pastes throughout this session) — this migration exists to safely re-apply
-- just the storage layer without touching anything already verified working.
--
-- Every statement here is written to be safe to run multiple times, including
-- against a database where some (but not all) of it already landed:
--   - bucket inserts use `on conflict (id) do nothing`
--   - every policy is dropped-if-exists immediately before being recreated,
--     since `create policy` has no `if not exists` guard in Postgres and
--     would otherwise error on a second run
--
-- Bucket names and policy definitions are copied verbatim from 0001_init.sql
-- lines 544-587 — nothing renamed, nothing reordered, nothing added beyond
-- what that file already specified.

insert into storage.buckets (id, name, public)
values
  ('logos', 'logos', true),
  ('hero-sliders', 'hero-sliders', true),
  ('about', 'about', true),
  ('services', 'services', true),
  ('portfolio', 'portfolio', true),
  ('order-files', 'order-files', false)
on conflict (id) do nothing;

drop policy if exists "public read ami art buckets" on storage.objects;
create policy "public read ami art buckets" on storage.objects
  for select to anon, authenticated
  using (bucket_id in ('logos', 'hero-sliders', 'about', 'services', 'portfolio'));

drop policy if exists "authenticated upload ami art buckets" on storage.objects;
create policy "authenticated upload ami art buckets" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('logos', 'hero-sliders', 'about', 'services', 'portfolio'));

drop policy if exists "authenticated update ami art buckets" on storage.objects;
create policy "authenticated update ami art buckets" on storage.objects
  for update to authenticated
  using (bucket_id in ('logos', 'hero-sliders', 'about', 'services', 'portfolio'))
  with check (bucket_id in ('logos', 'hero-sliders', 'about', 'services', 'portfolio'));

drop policy if exists "authenticated delete ami art buckets" on storage.objects;
create policy "authenticated delete ami art buckets" on storage.objects
  for delete to authenticated
  using (bucket_id in ('logos', 'hero-sliders', 'about', 'services', 'portfolio'));

-- order-files: private bucket. Anyone can upload (order submission / customer reply
-- attachments) but only authenticated admin sessions can read, list, or delete.
drop policy if exists "anon upload order files" on storage.objects;
create policy "anon upload order files" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'order-files');

drop policy if exists "authenticated read order files" on storage.objects;
create policy "authenticated read order files" on storage.objects
  for select to authenticated
  using (bucket_id = 'order-files');

drop policy if exists "authenticated delete order files" on storage.objects;
create policy "authenticated delete order files" on storage.objects
  for delete to authenticated
  using (bucket_id = 'order-files');
