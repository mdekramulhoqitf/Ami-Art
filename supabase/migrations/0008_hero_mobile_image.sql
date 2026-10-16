-- Adds an optional dedicated mobile hero image per slide. Additive only —
-- existing slides keep working unchanged, falling back to image_url
-- (the desktop banner) on mobile until an admin uploads one.
alter table hero_slides
  add column if not exists mobile_image_url text;
