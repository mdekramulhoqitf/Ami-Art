-- Ami Art — initial schema, RLS policies, and storage buckets
-- Run this once against a fresh Supabase project (SQL Editor, or `supabase db push`).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists site_settings (
  id smallint primary key default 1 check (id = 1),
  business_name text not null default 'Ami Art',
  tagline text not null default '',
  intro_heading text not null default '',
  intro_body text not null default '',
  trust_badges jsonb not null default '[]',
  home_highlights jsonb not null default '[]',
  capability_highlights jsonb not null default '[]',
  delivery_settings jsonb not null default '{"courier_fee":0,"local_delivery_fee":0,"free_delivery_threshold":null,"enabled":true}',
  meta_title text not null default 'Ami Art',
  meta_description text not null default '',
  og_image_url text,
  updated_at timestamptz not null default now()
);

create table if not exists logos (
  id smallint primary key default 1 check (id = 1),
  primary_logo_url text,
  light_logo_url text,
  dark_logo_url text,
  favicon_url text,
  updated_at timestamptz not null default now()
);

create table if not exists hero_slides (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  alt_text text,
  title text,
  subtitle text,
  cta_label text,
  cta_url text,
  is_active boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  title text not null unique,
  description text,
  icon text,
  price text,
  category text,
  image_url text,
  image_path text,
  image_alt text,
  aspect_ratio text not null default 'standard-4-3'
    check (aspect_ratio in ('landscape-16-9', 'wide-3-1', 'standard-4-3', 'square-1-1', 'portrait-4-5', 'vertical-9-16', 'custom')),
  custom_width int,
  custom_height int,
  service_type text not null default 'physical' check (service_type in ('digital', 'physical')),
  product_category text not null default 'print_other'
    check (product_category in ('banner', 'signboard', 'mug', 'tshirt', 'jersey', 'website', 'print_other')),
  requires_delivery boolean not null default true,
  is_active boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists about_content (
  id smallint primary key default 1 check (id = 1),
  heading text not null default '',
  story text not null default '',
  mission text not null default '',
  vision text not null default '',
  why_choose_us jsonb not null default '[]',
  process_steps jsonb not null default '[]',
  image_url text,
  updated_at timestamptz not null default now()
);

create table if not exists portfolio_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  description text,
  image_url text not null,
  alt_text text,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists contact_settings (
  id smallint primary key default 1 check (id = 1),
  phone text not null default '',
  email text not null default '',
  address text not null default '',
  map_embed_url text,
  social_links jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text not null,
  service text,
  message text not null,
  created_at timestamptz not null default now(),
  is_read boolean not null default false
);

-- ---------------------------------------------------------------------------
-- Orders ("ঘরে বসে অর্ডার করুন")
-- ---------------------------------------------------------------------------

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  access_token text not null unique default encode(gen_random_bytes(24), 'hex'),
  customer_name text not null,
  phone text not null,
  email text,
  address text,
  service_id uuid references services(id) on delete set null,
  service_label text not null,
  description text not null,
  quantity text,
  required_date date,
  budget text,
  delivery_required boolean not null default false,
  delivery_method text check (delivery_method in ('pickup', 'courier', 'local_delivery', 'other')),
  delivery_address text,
  custom_fields jsonb not null default '{}',
  status text not null default 'new'
    check (status in ('new', 'viewed', 'contacted', 'in_progress', 'completed', 'cancelled')),
  is_read boolean not null default false,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create sequence if not exists orders_number_seq;

create table if not exists order_attachments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_url text not null,
  file_type text not null,
  file_size bigint not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Quotations / Invoices
-- ---------------------------------------------------------------------------

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  invoice_number text not null,
  version int not null default 1,
  is_latest boolean not null default true,
  access_token text not null unique default encode(gen_random_bytes(24), 'hex'),
  invoice_date date not null default current_date,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  customer_address text,
  subtotal numeric not null default 0,
  design_charge numeric not null default 0,
  delivery_charge numeric not null default 0,
  courier_charge numeric not null default 0,
  other_charge numeric not null default 0,
  discount numeric not null default 0,
  total numeric not null default 0,
  paid_amount numeric not null default 0,
  due_amount numeric not null default 0,
  estimated_completion text,
  delivery_method text check (delivery_method in ('pickup', 'courier', 'local_delivery', 'other')),
  delivery_address text,
  notes text,
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'pending', 'paid', 'partial', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create sequence if not exists invoices_number_seq;

create table if not exists invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  service_name text not null,
  quantity numeric not null default 1,
  unit_price numeric not null default 0,
  total numeric not null default 0,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists order_messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  sender_type text not null check (sender_type in ('customer', 'admin')),
  message_type text not null default 'text' check (message_type in ('text', 'invoice')),
  invoice_id uuid references invoices(id) on delete set null,
  message text not null,
  attachment_path text,
  attachment_name text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists hero_slides_display_order_idx on hero_slides (display_order);
create index if not exists services_display_order_idx on services (display_order);
create index if not exists portfolio_items_display_order_idx on portfolio_items (display_order);
create index if not exists contact_messages_is_read_idx on contact_messages (is_read);
create index if not exists orders_status_idx on orders (status);
create index if not exists orders_created_at_idx on orders (created_at desc);
create index if not exists order_attachments_order_id_idx on order_attachments (order_id);
create index if not exists order_messages_order_id_idx on order_messages (order_id);
create index if not exists invoices_order_id_idx on invoices (order_id);
create index if not exists invoices_invoice_number_idx on invoices (invoice_number);
create index if not exists invoice_items_invoice_id_idx on invoice_items (invoice_id);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare
  t text;
begin
  foreach t in array array['site_settings', 'logos', 'hero_slides', 'services', 'about_content', 'portfolio_items', 'contact_settings', 'orders', 'invoices']
  loop
    execute format(
      'drop trigger if exists set_updated_at on %I; create trigger set_updated_at before update on %I for each row execute function set_updated_at();',
      t, t
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table site_settings enable row level security;
alter table logos enable row level security;
alter table hero_slides enable row level security;
alter table services enable row level security;
alter table about_content enable row level security;
alter table portfolio_items enable row level security;
alter table contact_settings enable row level security;
alter table contact_messages enable row level security;
alter table orders enable row level security;
alter table order_attachments enable row level security;
alter table order_messages enable row level security;
alter table invoices enable row level security;
alter table invoice_items enable row level security;

-- Singleton content tables: public read, authenticated write.
create policy "public read" on site_settings for select to anon, authenticated using (true);
create policy "authenticated write" on site_settings for all to authenticated using (true) with check (true);

create policy "public read" on logos for select to anon, authenticated using (true);
create policy "authenticated write" on logos for all to authenticated using (true) with check (true);

create policy "public read" on about_content for select to anon, authenticated using (true);
create policy "authenticated write" on about_content for all to authenticated using (true) with check (true);

create policy "public read" on contact_settings for select to anon, authenticated using (true);
create policy "authenticated write" on contact_settings for all to authenticated using (true) with check (true);

-- Collection tables: anon sees only active rows, authenticated (admin) sees everything.
create policy "public read active" on hero_slides for select to anon using (is_active = true);
create policy "authenticated read all" on hero_slides for select to authenticated using (true);
create policy "authenticated write" on hero_slides for insert to authenticated with check (true);
create policy "authenticated update" on hero_slides for update to authenticated using (true) with check (true);
create policy "authenticated delete" on hero_slides for delete to authenticated using (true);

create policy "public read active" on services for select to anon using (is_active = true);
create policy "authenticated read all" on services for select to authenticated using (true);
create policy "authenticated write" on services for insert to authenticated with check (true);
create policy "authenticated update" on services for update to authenticated using (true) with check (true);
create policy "authenticated delete" on services for delete to authenticated using (true);

create policy "public read active" on portfolio_items for select to anon using (is_active = true);
create policy "authenticated read all" on portfolio_items for select to authenticated using (true);
create policy "authenticated write" on portfolio_items for insert to authenticated with check (true);
create policy "authenticated update" on portfolio_items for update to authenticated using (true) with check (true);
create policy "authenticated delete" on portfolio_items for delete to authenticated using (true);

-- Contact messages: anyone can submit, only authenticated (admin) can read/manage.
create policy "public insert" on contact_messages for insert to anon, authenticated with check (true);
create policy "authenticated read" on contact_messages for select to authenticated using (true);
create policy "authenticated update" on contact_messages for update to authenticated using (true) with check (true);
create policy "authenticated delete" on contact_messages for delete to authenticated using (true);

-- Orders / conversation: no direct anon access at all. Submission happens through the
-- submit_order() RPC below; all customer-side reads/replies happen through token-verified
-- RPCs (get_order_by_token, add_customer_reply). Only authenticated (admin) touches these
-- tables directly.
create policy "authenticated manage orders" on orders for all to authenticated using (true) with check (true);
create policy "authenticated manage order_attachments" on order_attachments for all to authenticated using (true) with check (true);
create policy "authenticated manage order_messages" on order_messages for all to authenticated using (true) with check (true);

-- Invoices: same pattern — no direct anon access, customer reads go through
-- get_invoice_by_tokens() below.
create policy "authenticated manage invoices" on invoices for all to authenticated using (true) with check (true);
create policy "authenticated manage invoice_items" on invoice_items for all to authenticated using (true) with check (true);

-- ---------------------------------------------------------------------------
-- Order RPC functions (SECURITY DEFINER — the token itself is the access control)
-- ---------------------------------------------------------------------------

create or replace function submit_order(
  p_customer_name text,
  p_phone text,
  p_email text,
  p_address text,
  p_service_id uuid,
  p_service_label text,
  p_description text,
  p_quantity text,
  p_required_date date,
  p_budget text,
  p_delivery_required boolean,
  p_delivery_address text,
  p_delivery_method text default null,
  p_custom_fields jsonb default '{}'
)
returns table (id uuid, order_number text, access_token text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_number text;
begin
  v_order_number := 'AMI-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('orders_number_seq')::text, 5, '0');

  return query
  insert into orders (
    order_number, customer_name, phone, email, address, service_id, service_label,
    description, quantity, required_date, budget, delivery_required, delivery_address,
    delivery_method, custom_fields
  )
  values (
    v_order_number, p_customer_name, p_phone, p_email, p_address, p_service_id, p_service_label,
    p_description, p_quantity, p_required_date, p_budget, p_delivery_required, p_delivery_address,
    p_delivery_method, coalesce(p_custom_fields, '{}'::jsonb)
  )
  returning orders.id, orders.order_number, orders.access_token;
end;
$$;

create or replace function add_order_attachment(
  p_order_id uuid,
  p_file_name text,
  p_file_path text,
  p_file_url text,
  p_file_type text,
  p_file_size bigint
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into order_attachments (order_id, file_name, file_path, file_url, file_type, file_size)
  values (p_order_id, p_file_name, p_file_path, p_file_url, p_file_type, p_file_size);
end;
$$;

create or replace function get_order_by_token(p_token text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  result json;
begin
  select json_build_object(
    'order_number', o.order_number,
    'status', o.status,
    'customer_name', o.customer_name,
    'service_label', o.service_label,
    'description', o.description,
    'created_at', o.created_at,
    'messages', (
      select coalesce(json_agg(
        json_build_object(
          'sender_type', m.sender_type,
          'message_type', m.message_type,
          'message', m.message,
          'created_at', m.created_at,
          'invoice', case when m.invoice_id is not null then (
            select json_build_object(
              'invoice_number', i.invoice_number,
              'access_token', i.access_token,
              'total', i.total,
              'paid_amount', i.paid_amount,
              'due_amount', i.due_amount,
              'status', i.status,
              'estimated_completion', i.estimated_completion
            )
            from invoices i where i.id = m.invoice_id
          ) else null end
        ) order by m.created_at asc
      ), '[]'::json)
      from order_messages m
      where m.order_id = o.id
    )
  )
  into result
  from orders o
  where o.access_token = p_token;

  return result;
end;
$$;

create or replace function get_invoice_by_tokens(p_order_token text, p_invoice_token text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  result json;
begin
  select json_build_object(
    'invoice_number', i.invoice_number,
    'version', i.version,
    'is_latest', i.is_latest,
    'invoice_date', i.invoice_date,
    'customer_name', i.customer_name,
    'customer_phone', i.customer_phone,
    'customer_email', i.customer_email,
    'customer_address', i.customer_address,
    'subtotal', i.subtotal,
    'design_charge', i.design_charge,
    'delivery_charge', i.delivery_charge,
    'courier_charge', i.courier_charge,
    'other_charge', i.other_charge,
    'discount', i.discount,
    'total', i.total,
    'paid_amount', i.paid_amount,
    'due_amount', i.due_amount,
    'estimated_completion', i.estimated_completion,
    'delivery_method', i.delivery_method,
    'delivery_address', i.delivery_address,
    'notes', i.notes,
    'status', i.status,
    'order_number', o.order_number,
    'items', (
      select coalesce(json_agg(
        json_build_object(
          'service_name', it.service_name,
          'quantity', it.quantity,
          'unit_price', it.unit_price,
          'total', it.total
        ) order by it.display_order asc
      ), '[]'::json)
      from invoice_items it
      where it.invoice_id = i.id
    )
  )
  into result
  from invoices i
  join orders o on o.id = i.order_id
  where i.access_token = p_invoice_token
    and o.access_token = p_order_token
    and i.order_id = o.id;

  return result;
end;
$$;

create or replace function add_customer_reply(p_token text, p_message text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
begin
  select id into v_order_id from orders where access_token = p_token;

  if v_order_id is null then
    return false;
  end if;

  insert into order_messages (order_id, sender_type, message)
  values (v_order_id, 'customer', p_message);

  update orders set updated_at = now() where id = v_order_id;

  return true;
end;
$$;

-- Admin-only: generates the next human-friendly invoice number. Not SECURITY
-- DEFINER — runs as the calling (authenticated) role, matching every other
-- admin write in this file.
create or replace function next_invoice_number()
returns text
language sql
as $$
  select 'AMI-INV-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('invoices_number_seq')::text, 5, '0');
$$;

grant execute on function submit_order(text, text, text, text, uuid, text, text, text, date, text, boolean, text, text, jsonb) to anon, authenticated;
grant execute on function add_order_attachment(uuid, text, text, text, text, bigint) to anon, authenticated;
grant execute on function get_order_by_token(text) to anon, authenticated;
grant execute on function add_customer_reply(text, text) to anon, authenticated;
grant execute on function next_invoice_number() to authenticated;
grant execute on function get_invoice_by_tokens(text, text) to anon, authenticated;

-- Let the admin dashboard receive live INSERT events on new orders (RLS above still applies:
-- only `authenticated` satisfies the orders SELECT policy, so only admin sessions receive them).
alter publication supabase_realtime add table orders;

-- ---------------------------------------------------------------------------
-- Storage buckets
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values
  ('logos', 'logos', true),
  ('hero-sliders', 'hero-sliders', true),
  ('about', 'about', true),
  ('services', 'services', true),
  ('portfolio', 'portfolio', true),
  ('order-files', 'order-files', false)
on conflict (id) do nothing;

create policy "public read ami art buckets" on storage.objects
  for select to anon, authenticated
  using (bucket_id in ('logos', 'hero-sliders', 'about', 'services', 'portfolio'));

create policy "authenticated upload ami art buckets" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('logos', 'hero-sliders', 'about', 'services', 'portfolio'));

create policy "authenticated update ami art buckets" on storage.objects
  for update to authenticated
  using (bucket_id in ('logos', 'hero-sliders', 'about', 'services', 'portfolio'))
  with check (bucket_id in ('logos', 'hero-sliders', 'about', 'services', 'portfolio'));

create policy "authenticated delete ami art buckets" on storage.objects
  for delete to authenticated
  using (bucket_id in ('logos', 'hero-sliders', 'about', 'services', 'portfolio'));

-- order-files: private bucket. Anyone can upload (order submission / customer reply
-- attachments) but only authenticated admin sessions can read, list, or delete.
create policy "anon upload order files" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'order-files');

create policy "authenticated read order files" on storage.objects
  for select to authenticated
  using (bucket_id = 'order-files');

create policy "authenticated delete order files" on storage.objects
  for delete to authenticated
  using (bucket_id = 'order-files');
