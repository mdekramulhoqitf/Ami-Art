# Ami Art — Website & Admin CMS

Bangla-first public website and admin CMS for Ami Art, a digital sign, printing, and graphic
design studio in Barguna, Bangladesh. Includes a full customer order system ("ঘরে বসে অর্ডার
করুন") with product-aware order fields (banner/mug/t-shirt/jersey/website), file uploads,
courier/local delivery, a two-way message thread, and an integrated quotation/invoice system
with versioning, PDF/print output, and secure token-based customer access. Built with Next.js
(App Router), TypeScript, Tailwind CSS, and Supabase (Postgres, Auth, Storage, Realtime).

### Quotation / Invoice system

Admin builds an itemized invoice from any order (`/admin/orders/[id]/invoice/new`) with a live
split-screen preview, sends it as a card inside the same conversation thread, and the customer
views it at a token-gated URL (`/order/[token]/invoice/[invoiceToken]`) — never a guessable ID.
Editing a `draft` invoice updates in place; editing anything already sent creates a new
**version** instead of overwriting what the customer saw (old versions stay visible, tagged with
their version number). "PDF ডাউনলোড করুন" and "প্রিন্ট করুন" both open the browser's native print
dialog against a dedicated `@page`-sized A4 layout — a real vector/text PDF via "Save as PDF",
not a rasterized screenshot, with no extra dependencies. Courier/local-delivery fees configured
in **সেটিংস → ডেলিভারি সেটিংস** pre-fill (editable) into new invoices when the order requested
that delivery method.

## Project Structure

```
src/
  app/
    (site)/          Public pages: home, about, services (+ /services/[id] detail),
                       portfolio, contact, order (ঘরে বসে অর্ডার করুন), order/status/[token]
    admin/
      (auth)/login    Admin login (public)
      (dashboard)/    Protected admin panel — dashboard, orders (অর্ডার ইনবক্স), slider, logo,
                       services, about, portfolio, contact, settings
    sitemap.ts, robots.ts, icon.tsx
  components/
    ui/               Shared primitives (Button, Container, FormField, Toast, …)
    site/             Public-site components (Navbar, HeroSlider, ServiceImage, …)
    admin/             Admin components (AdminSidebar, UploadField, ConfirmDialog,
                       OrderRealtimeNotifier, …)
  lib/
    supabase/         Browser/server Supabase clients + proxy session helper + order-file storage
    queries/          Typed server-side data fetchers (one file per resource, incl. orders.ts)
    validation.ts      Zod schemas (Bengali error messages)
    order-status.ts    Bengali status labels shared by public + admin order views
    email.ts           Order notification email (nodemailer, no-op if unconfigured)
    actions/auth.ts    Sign in / sign out server actions
  proxy.ts            Gates /admin/* routes (Next.js 16's middleware replacement)
supabase/
  migrations/0001_init.sql   Full schema, RLS policies, storage buckets, and the
                              submit_order / get_order_by_token / add_customer_reply
                              SECURITY DEFINER functions the order system relies on
  seed.sql                    Starter content in Bengali (real contact info, a 13-item
                               services list grounded in the letterhead; hero slides and
                               portfolio left empty for you to fill in)
scripts/create-admin.mjs      Creates the first admin login (local use only)
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional — new-order email notifications to amiart54@gmail.com
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
SMTP_FROM="Ami Art <no-reply@amiart.example.com>"
```

`SUPABASE_SERVICE_ROLE_KEY` is only ever used locally by `scripts/create-admin.mjs` — the
running app never imports it. SMTP is entirely optional: if unset, order emails are skipped
(logged) and the in-dashboard Realtime notification still works.

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run `supabase/migrations/0001_init.sql`, then `supabase/seed.sql`. This
   creates every table (including `orders`, `order_attachments`, `order_messages`), RLS
   policies, the five public storage buckets (`logos`, `hero-sliders`, `about`, `services`,
   `portfolio`) plus the private `order-files` bucket, the order RPC functions, and enables
   Realtime on `orders`. It also seeds Bengali starter content — real phone/email/address, a
   13-service catalog grounded in the letterhead (with categories and image aspect ratios),
   and About page copy. Hero slides and portfolio items are left empty on purpose; the site
   shows a polished fallback/empty state for each until you add real photos via `/admin`.
3. Copy your Project URL and both API keys (Project Settings → API) into `.env.local`.
4. Create your admin login:
   ```bash
   npm install
   node --env-file=.env.local scripts/create-admin.mjs you@example.com "a-strong-password"
   ```
5. Sign in at `/admin/login`.

## Running Locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint      # ESLint
```

Without Supabase configured, the public site still renders in Bengali — using safe fallback
content for business info/contact/about, and empty states for hero slides, services, and
portfolio. The `/order` form and `/services/[id]` detail pages degrade to a friendly "not
found" rather than crashing. The admin panel requires Supabase and shows a setup message until
it's configured.

## Deploying

Any Next.js host works (e.g. Vercel). Set the environment variables above in your host's
dashboard — `SUPABASE_SERVICE_ROLE_KEY` is optional in production since it's only used by the
local admin-creation script, not the running app.

```bash
vercel deploy
```

## Content Management

Everything editable lives in the database, not the code — the admin panel (fully in Bengali)
controls:

- **অর্ডার ইনবক্স** (`/admin/orders`) — every customer order: status, attachments (signed-URL
  downloads), and a message thread; live Realtime notification + unread badge on new orders
- **হিরো ব্যানার** (`/admin/slider`) — homepage banner rotation
- **লোগো ও ব্র্যান্ডিং** (`/admin/logo`) — primary/light/dark logo, favicon
- **আমাদের সেবা** (`/admin/services`) — title, description, category, price, and a per-service
  image with a selectable aspect ratio (landscape/wide/square/portrait/vertical/custom)
- **আমাদের সম্পর্কে** (`/admin/about`) — story, mission, vision, why-choose-us, process steps
- **আমাদের কাজ** (`/admin/portfolio`) — with a featured flag for the homepage
- **যোগাযোগের তথ্য** (`/admin/contact`) — phone/email/address/map/socials, plus the general
  contact-form inbox (separate from the order inbox)
- **ওয়েবসাইট সেটিংস** (`/admin/settings`) — business name, tagline, homepage highlights, SEO meta

Changes take effect immediately — no rebuild or redeploy required.

## Order System Notes

- Customers order at `/order` (a 4-step Bengali wizard) without creating an account. Each
  order gets a high-entropy `access_token`; the confirmation screen shows a human-friendly
  `AMI-YYYY-NNNNN` order number but never the token or internal ID.
- Order files upload to a **private** Storage bucket. Only the authenticated admin can read
  them (via short-lived signed URLs); anonymous visitors can only insert, never list or read.
- The customer's own follow-up page (`/order/status/[token]`) is intentionally not linked from
  anywhere in the UI yet — wire it into your confirmation-email/SMS flow if you add one; it's
  fully functional (status, message thread, replies) as soon as you have the token.
- Scope note: the customer status page lets customers view status and reply with new messages,
  but does not currently offer re-downloading their own originally-submitted files (they still
  have their own copies) — a deliberate scope trim, easy to extend later.
