-- Ami Art — per-section optional cover/banner image system.
-- Additive only. Reuses the existing "about" storage bucket (already public,
-- already has authenticated upload/update/delete + public read policies) —
-- no new bucket, no new storage policies needed.
--
-- One row per known page-header section (fixed, known slugs — not a
-- free-form collection). Each section has its OWN image; there is no
-- shared/global image field. A missing or hidden banner means the public
-- page falls back to its existing default look, unchanged.

create table if not exists section_banners (
  slug text primary key,
  title text,
  short_description text,
  detailed_description text,
  image_url text,
  image_path text,
  alt_text text,
  image_position text not null default 'center'
    check (image_position in ('center', 'top', 'bottom', 'left', 'right')),
  overlay_enabled boolean not null default false,
  overlay_style text not null default 'dark' check (overlay_style in ('dark', 'light')),
  is_visible boolean not null default true,
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at on section_banners;
create trigger set_updated_at before update on section_banners for each row execute function set_updated_at();

alter table section_banners enable row level security;

drop policy if exists "public read visible" on section_banners;
create policy "public read visible" on section_banners for select to anon using (is_visible = true);
drop policy if exists "authenticated read all" on section_banners;
create policy "authenticated read all" on section_banners for select to authenticated using (true);
drop policy if exists "authenticated write" on section_banners;
create policy "authenticated write" on section_banners for insert to authenticated with check (true);
drop policy if exists "authenticated update" on section_banners;
create policy "authenticated update" on section_banners for update to authenticated using (true) with check (true);
drop policy if exists "authenticated delete" on section_banners;
create policy "authenticated delete" on section_banners for delete to authenticated using (true);

-- Seed one row per fixed section slug so admin always has something to
-- open and edit, with no image set (fully optional) until uploaded.
insert into section_banners (slug, title, is_visible)
values
  ('about', 'আমাদের সম্পর্কে', true),
  ('services', 'আমাদের সেবাসমূহ', true),
  ('portfolio', 'আমাদের কাজ', true),
  ('why_choose_us', 'কেন আমাদের বেছে নেবেন', true),
  ('contact', 'যোগাযোগ', true)
on conflict (slug) do nothing;
