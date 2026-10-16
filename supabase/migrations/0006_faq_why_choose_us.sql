-- FAQ ("সচরাচর জিজ্ঞাসা") + Why Choose Us ("কেন Ami Art থেকে নেবেন?") collections.
-- Additive only. Run once against the live project (SQL Editor).
--
-- why_choose_us_items replaces the old site_settings.home_highlights
-- ("কেন আমি আর্ট") homepage section with a real per-item collection (icon,
-- individual active toggle, dedicated admin list). The seed step below
-- copies whatever is currently in home_highlights into the new table so
-- existing content isn't lost; the home_highlights column itself is left
-- in place untouched (unused going forward, but not dropped — no data loss
-- risk if this migration needs to be reviewed before the old column is
-- ever cleaned up).

create table if not exists faq_items (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  is_active boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists why_choose_us_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  icon text,
  is_active boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists faq_items_display_order_idx on faq_items (display_order);
create index if not exists why_choose_us_items_display_order_idx on why_choose_us_items (display_order);

drop trigger if exists set_updated_at on faq_items;
create trigger set_updated_at before update on faq_items for each row execute function set_updated_at();

drop trigger if exists set_updated_at on why_choose_us_items;
create trigger set_updated_at before update on why_choose_us_items for each row execute function set_updated_at();

alter table faq_items enable row level security;
alter table why_choose_us_items enable row level security;

create policy "public read active" on faq_items for select to anon using (is_active = true);
create policy "authenticated read all" on faq_items for select to authenticated using (true);
create policy "authenticated write" on faq_items for insert to authenticated with check (true);
create policy "authenticated update" on faq_items for update to authenticated using (true) with check (true);
create policy "authenticated delete" on faq_items for delete to authenticated using (true);

create policy "public read active" on why_choose_us_items for select to anon using (is_active = true);
create policy "authenticated read all" on why_choose_us_items for select to authenticated using (true);
create policy "authenticated write" on why_choose_us_items for insert to authenticated with check (true);
create policy "authenticated update" on why_choose_us_items for update to authenticated using (true) with check (true);
create policy "authenticated delete" on why_choose_us_items for delete to authenticated using (true);

-- One-time seed: carry over whatever is currently in home_highlights so the
-- new section doesn't start empty. Safe to run even if home_highlights is
-- empty (inserts nothing) or if this migration is re-run on an empty table
-- (guarded by "insert only if why_choose_us_items is still empty").
-- WITH ORDINALITY without explicit column aliases makes the SRF's alias
-- refer to the whole (value, ordinality) row, not just the jsonb value —
-- that's why a plain `item ->> 'title'` fails with "operator does not
-- exist: record ->> unknown". Naming both output columns via `t(elem, ord)`
-- gives `elem` its real jsonb type back.
insert into why_choose_us_items (title, description, display_order)
select
  elem ->> 'title',
  elem ->> 'description',
  (ord - 1)::int
from site_settings,
     jsonb_array_elements(site_settings.home_highlights) with ordinality as t(elem, ord)
where site_settings.id = 1
  and not exists (select 1 from why_choose_us_items)
  and coalesce(elem ->> 'title', '') <> '';
