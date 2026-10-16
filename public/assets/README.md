# Asset folders

Reference/local static images only. Real uploaded content (hero slides, service images, portfolio, logo) lives in Supabase Storage — admin panel handles that upload path, not this folder.

Use this tree for anything checked into the repo directly (design references, seed placeholders):

- `brand/` — logo, logo mark
- `hero/` — homepage hero source images
- `banners/` — section banners
- `services/` — service cover / wide banner sources
- `products/` — product showcase/detail sources
- `portfolio/` — portfolio work sources
- `gallery/` — multi-image gallery sources
- `about/` — about page image
- `contact/` — location/map image
- `social/` — OG image, social square/portrait
- `icons/`, `placeholders/` — misc

Naming: `{area}-{name}-{index}.webp`, e.g. `service-signboard-01.webp`, `portfolio-nazrul-store-02.webp`. No `IMG_1234.jpg` / `Screenshot...png`.

See `src/config/media-specs.ts` for exact dimensions per slot.
