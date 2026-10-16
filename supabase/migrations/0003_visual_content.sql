-- Ami Art — visual content system: gallery images + extra portfolio fields.
-- Additive only. No column dropped, no existing data touched, safe to run
-- multiple times (all guarded with if not exists / do blocks).
-- NOT executed automatically — run in Supabase SQL Editor same as 0001/0002.

alter table services
  add column if not exists gallery_images jsonb not null default '[]';

alter table portfolio_items
  add column if not exists gallery_images jsonb not null default '[]',
  add column if not exists client_name text,
  add column if not exists project_year int,
  add column if not exists dimensions_label text;
