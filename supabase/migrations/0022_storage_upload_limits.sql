-- Ami Art — enforce upload limits at the Storage layer
--
-- Admin images and customer order files are now uploaded straight from the
-- browser to Storage (Vercel caps a Server Action request body at 4.5 MB), so
-- the app server never sees the bytes and can no longer enforce size/type.
-- These bucket limits mirror MAX_IMAGE_BYTES / ACCEPTED_IMAGE_TYPES and
-- MAX_ORDER_FILE_BYTES in src/lib/validation.ts.
--
-- Safe to run multiple times.

update storage.buckets
set
  file_size_limit = 5 * 1024 * 1024,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
where id in ('logos', 'hero-sliders', 'about', 'services', 'portfolio');

-- No MIME allow-list here: browsers often report .ai/.psd as
-- application/octet-stream, and the type check already runs client-side.
update storage.buckets
set file_size_limit = 15 * 1024 * 1024
where id = 'order-files';
