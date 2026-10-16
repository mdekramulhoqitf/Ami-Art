-- Ami Art — homepage owner/founder section. Reuses the existing
-- about_content singleton table rather than creating a new one. Additive
-- only, all nullable/defaulted, existing about content untouched.
-- NOT executed automatically — run in Supabase SQL Editor same as 0001-0004.

alter table about_content
  add column if not exists owner_image_url text,
  add column if not exists owner_name text,
  add column if not exists owner_designation text,
  add column if not exists owner_short_bio text,
  add column if not exists owner_bio text,
  add column if not exists owner_experience text,
  add column if not exists owner_location text,
  add column if not exists owner_phone text,
  add column if not exists owner_email text,
  add column if not exists owner_cta_text text,
  add column if not exists owner_cta_link text,
  add column if not exists owner_show boolean not null default false;
