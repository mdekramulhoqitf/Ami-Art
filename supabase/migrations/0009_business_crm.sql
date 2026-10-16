-- Phase 1 of the AMI ART Business Intelligence / CRM system.
--
-- Purely additive: no existing table is altered or dropped. New chain:
--   business -> business_contacts
--   business -> opportunity -> activity_log
--   opportunity -> quotation -> quotation_items
--   quotation --[accepted]--> orders (existing table) -> invoices (existing table)
--
-- Quotations are NOT a parallel order system. accept_quotation() below is the
-- single, atomic path from a quotation into the *existing* orders/invoices
-- tables, reusing next_invoice_number() and the same numbering convention as
-- next_order_number() (added here, mirroring next_invoice_number()).
--
-- RBAC foundation: admin_roles assigns a role per admin user. Enforcement
-- happens in the Next.js server-action layer (see src/lib/permissions.ts),
-- not via per-role RLS — every new table below keeps the same blanket
-- "any authenticated user" RLS shape already used by every existing table in
-- this project. A user with no admin_roles row is treated as 'owner' by the
-- application layer (fail-open to the current full-access behaviour so the
-- existing single admin account is never locked out by this migration).

-- ---------------------------------------------------------------------------
-- businesses
-- ---------------------------------------------------------------------------

create table businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  subcategory text,
  area text,
  address text,
  phone text,
  website text,
  facebook text,
  instagram text,
  google_maps_url text,

  -- provenance
  source text,
  source_url text,
  source_type text
    check (source_type is null or source_type in (
      'google_maps', 'facebook', 'instagram', 'website', 'local_directory',
      'offline_research', 'customer_referral', 'existing_customer', 'manual_entry'
    )),
  collected_date date default current_date,
  collected_by text,
  verification_status text not null default 'unverified'
    check (verification_status in ('verified', 'unverified', 'needs_review', 'outdated')),

  -- qualification
  business_status text not null default 'prospect'
    check (business_status in ('prospect', 'lead', 'customer', 'inactive')),
  estimated_size text,
  estimated_printing_need text,
  estimated_printing_frequency text,
  potential_value numeric,
  priority_level text default 'normal' check (priority_level in ('low', 'normal', 'high', 'urgent')),
  new_business_flag boolean not null default false,
  rebranding_flag boolean not null default false,
  promotional_activity_flag boolean not null default false,
  seasonal_demand text,
  existing_supplier_known boolean not null default false,

  tags text[] not null default '{}',
  notes text,

  owner_admin_id uuid references auth.users(id) on delete set null,
  last_contact_at timestamptz,
  next_followup_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index businesses_name_idx on businesses (name);
create index businesses_phone_idx on businesses (phone);
create index businesses_business_status_idx on businesses (business_status);
create index businesses_next_followup_idx on businesses (next_followup_at);

create table business_contacts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  role text,
  phone text,
  email text,
  is_primary boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

create index business_contacts_business_id_idx on business_contacts (business_id);

-- ---------------------------------------------------------------------------
-- opportunities (also the lead pipeline — one table, not two overlapping
-- concepts; a "lead" is simply an opportunity in an early stage)
-- ---------------------------------------------------------------------------

create table opportunities (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  contact_id uuid references business_contacts(id) on delete set null,
  title text not null,
  service_category text,
  stage text not null default 'new'
    check (stage in (
      'new', 'researching', 'qualified', 'contacted', 'interested',
      'quotation_sent', 'negotiation', 'won', 'lost', 'follow_up'
    )),
  estimated_value numeric,
  lead_score int not null default 0 check (lead_score between 0 and 100),
  lead_score_breakdown jsonb not null default '[]',
  assigned_admin_id uuid references auth.users(id) on delete set null,
  won_lost_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index opportunities_business_id_idx on opportunities (business_id);
create index opportunities_stage_idx on opportunities (stage);

-- ---------------------------------------------------------------------------
-- activity_log — single append-only timeline shared by businesses,
-- opportunities and (once a quotation converts) orders.
-- ---------------------------------------------------------------------------

create table activity_log (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  opportunity_id uuid references opportunities(id) on delete cascade,
  order_id uuid references orders(id) on delete cascade,
  type text not null check (type in (
    'created', 'researched', 'contacted', 'message_sent', 'call_made',
    'response_received', 'quotation_sent', 'followup', 'status_changed',
    'note_added', 'won', 'lost'
  )),
  body text,
  admin_id uuid references auth.users(id) on delete set null,
  occurred_at timestamptz not null default now(),

  constraint activity_log_has_target check (
    business_id is not null or opportunity_id is not null or order_id is not null
  )
);

create index activity_log_business_id_idx on activity_log (business_id);
create index activity_log_opportunity_id_idx on activity_log (opportunity_id);
create index activity_log_occurred_at_idx on activity_log (occurred_at desc);

-- ---------------------------------------------------------------------------
-- quotations — pre-order. Converts into the existing orders/invoices tables
-- via accept_quotation() below; never itself becomes a revenue ledger.
-- ---------------------------------------------------------------------------

create sequence if not exists quotations_number_seq;

create table quotations (
  id uuid primary key default gen_random_uuid(),
  quotation_number text not null unique,
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  business_id uuid not null references businesses(id) on delete cascade,

  -- snapshot of customer/business info at quotation time, same pattern the
  -- existing invoices table already uses (invoices.customer_name etc. are
  -- also a point-in-time snapshot, not a live foreign key)
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  customer_address text,

  subtotal numeric not null default 0,
  discount numeric not null default 0,
  delivery_charge numeric not null default 0,
  total numeric not null default 0,

  delivery_method text check (delivery_method in ('pickup', 'courier', 'local_delivery', 'other')),
  delivery_address text,

  status text not null default 'draft'
    check (status in ('draft', 'sent', 'viewed', 'negotiating', 'accepted', 'rejected', 'expired')),

  sent_at timestamptz,
  viewed_at timestamptz,
  accepted_at timestamptz,
  rejected_at timestamptz,
  follow_up_at timestamptz,

  -- set once accepted and converted — see accept_quotation()
  order_id uuid references orders(id) on delete set null,

  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index quotations_opportunity_id_idx on quotations (opportunity_id);
create index quotations_business_id_idx on quotations (business_id);
create index quotations_status_idx on quotations (status);

create table quotation_items (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references quotations(id) on delete cascade,
  service_name text not null,
  quantity numeric not null default 1,
  unit_price numeric not null default 0,
  total numeric not null default 0,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create index quotation_items_quotation_id_idx on quotation_items (quotation_id);

-- ---------------------------------------------------------------------------
-- admin_roles — RBAC foundation
-- ---------------------------------------------------------------------------

create table admin_roles (
  admin_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'staff', 'marketing', 'sales')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at triggers (reuses the set_updated_at() function from 0001)
-- ---------------------------------------------------------------------------

do $$
declare
  t text;
begin
  foreach t in array array['businesses', 'opportunities', 'quotations']
  loop
    execute format(
      'drop trigger if exists set_updated_at on %I; create trigger set_updated_at before update on %I for each row execute function set_updated_at();',
      t, t
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- order/quotation numbering + the quotation -> order conversion
-- ---------------------------------------------------------------------------

create or replace function next_order_number()
returns text
language sql
as $$
  select 'AMI-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('orders_number_seq')::text, 5, '0');
$$;

create or replace function next_quotation_number()
returns text
language sql
as $$
  select 'AMI-Q-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('quotations_number_seq')::text, 5, '0');
$$;

-- Atomic: preserves the quotation (never deleted/overwritten), creates one
-- order + one invoice (+ its line items copied from quotation_items) in the
-- *existing* tables, links the quotation to the new order, and writes one
-- activity_log row. Raises if the quotation was already converted.
create or replace function accept_quotation(p_quotation_id uuid)
returns table (out_order_id uuid, out_order_number text, out_invoice_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_quotation quotations%rowtype;
  v_order_id uuid;
  v_order_number text;
  v_invoice_id uuid;
begin
  select * into v_quotation from quotations where id = p_quotation_id for update;
  if not found then
    raise exception 'quotation not found';
  end if;
  if v_quotation.order_id is not null then
    raise exception 'quotation already converted to an order';
  end if;

  v_order_number := next_order_number();

  insert into orders (
    order_number, customer_name, phone, email, address,
    service_label, description, quantity, status,
    delivery_required, delivery_method, delivery_address
  ) values (
    v_order_number, v_quotation.customer_name, v_quotation.customer_phone,
    v_quotation.customer_email, v_quotation.customer_address,
    'কোটেশন থেকে অর্ডার', 'কোটেশন ' || v_quotation.quotation_number || ' গ্রহণ করে তৈরি অর্ডার',
    '1', 'new',
    v_quotation.delivery_method is not null, v_quotation.delivery_method, v_quotation.delivery_address
  )
  returning id into v_order_id;

  insert into invoices (
    order_id, invoice_number, customer_name, customer_phone, customer_email, customer_address,
    subtotal, discount, delivery_charge, total, due_amount, status,
    delivery_method, delivery_address
  ) values (
    v_order_id, next_invoice_number(), v_quotation.customer_name, v_quotation.customer_phone,
    v_quotation.customer_email, v_quotation.customer_address,
    v_quotation.subtotal, v_quotation.discount, v_quotation.delivery_charge, v_quotation.total,
    v_quotation.total, 'sent',
    v_quotation.delivery_method, v_quotation.delivery_address
  )
  returning id into v_invoice_id;

  insert into invoice_items (invoice_id, service_name, quantity, unit_price, total, display_order)
  select v_invoice_id, service_name, quantity, unit_price, total, display_order
  from quotation_items
  where quotation_id = p_quotation_id
  order by display_order;

  update quotations
  set status = 'accepted', accepted_at = now(), order_id = v_order_id
  where id = p_quotation_id;

  insert into activity_log (business_id, opportunity_id, order_id, type, body)
  values (
    v_quotation.business_id, v_quotation.opportunity_id, v_order_id, 'won',
    'কোটেশন ' || v_quotation.quotation_number || ' গৃহীত হয়েছে, অর্ডার ' || v_order_number || ' তৈরি হয়েছে'
  );

  update opportunities set stage = 'won' where id = v_quotation.opportunity_id;

  return query select v_order_id, v_order_number, v_invoice_id;
end;
$$;

grant execute on function next_order_number() to authenticated;
grant execute on function next_quotation_number() to authenticated;
grant execute on function accept_quotation(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security — same blanket "authenticated = full access" shape as
-- every existing table; per-role restriction is enforced application-side
-- (src/lib/permissions.ts), matching this project's existing security model.
-- ---------------------------------------------------------------------------

alter table businesses enable row level security;
alter table business_contacts enable row level security;
alter table opportunities enable row level security;
alter table activity_log enable row level security;
alter table quotations enable row level security;
alter table quotation_items enable row level security;
alter table admin_roles enable row level security;

create policy "authenticated manage businesses" on businesses for all to authenticated using (true) with check (true);
create policy "authenticated manage business_contacts" on business_contacts for all to authenticated using (true) with check (true);
create policy "authenticated manage opportunities" on opportunities for all to authenticated using (true) with check (true);
create policy "authenticated manage activity_log" on activity_log for all to authenticated using (true) with check (true);
create policy "authenticated manage quotations" on quotations for all to authenticated using (true) with check (true);
create policy "authenticated manage quotation_items" on quotation_items for all to authenticated using (true) with check (true);

-- admin_roles: any authenticated user may read (needed to resolve their own
-- role), but only an existing owner (or a user with no role row yet, i.e.
-- the fail-open default) may write — prevents a 'staff' account from
-- promoting itself.
create policy "authenticated read admin_roles" on admin_roles for select to authenticated using (true);
create policy "owner manage admin_roles" on admin_roles for insert to authenticated
  with check (
    not exists (select 1 from admin_roles where admin_id = auth.uid())
    or exists (select 1 from admin_roles where admin_id = auth.uid() and role = 'owner')
  );
create policy "owner update admin_roles" on admin_roles for update to authenticated
  using (exists (select 1 from admin_roles where admin_id = auth.uid() and role = 'owner'))
  with check (true);
create policy "owner delete admin_roles" on admin_roles for delete to authenticated
  using (exists (select 1 from admin_roles where admin_id = auth.uid() and role = 'owner'));
