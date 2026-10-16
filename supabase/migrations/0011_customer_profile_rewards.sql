-- Phase: Smart Customer Profile + Progressive Order Experience.
--
-- Additive only. No existing table dropped, no existing column removed, no
-- existing row touched, submit_order() itself untouched.
--
-- New chain:
--   customer <- (upserted by phone, silently, from a public order) -> business (optional)
--   customer -> customer_rewards (points ledger)
--   customer -> orders.customer_id / activity_log.customer_id (timeline)
--   reward_rules -> admin-configurable point values, never hardcoded in app code
--
-- "customer" is intentionally a distinct concept from "businesses": businesses
-- models B2B prospects AMI ART is trying to win; a customer is anyone who has
-- ever placed an order (individual or business), optionally linked to a
-- businesses row when they represent one.

-- ---------------------------------------------------------------------------
-- customers
-- ---------------------------------------------------------------------------

create sequence if not exists customers_number_seq;

create or replace function next_customer_number()
returns text
language sql
as $$
  select 'AMI-C-' || lpad(nextval('customers_number_seq')::text, 6, '0');
$$;

create table customers (
  id uuid primary key default gen_random_uuid(),
  customer_number text not null unique,
  name text not null,
  phone text not null,
  email text,
  area text,
  business_id uuid references businesses(id) on delete set null,
  preferences jsonb not null default '{}',
  total_orders int not null default 0,
  last_order_at timestamptz,
  loyalty_level text not null default 'new' check (loyalty_level in ('new', 'returning', 'loyal', 'vip')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index customers_phone_idx on customers (phone);
create index customers_business_id_idx on customers (business_id);

drop trigger if exists set_updated_at on customers;
create trigger set_updated_at before update on customers for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- customer_rewards — append-only points ledger. Balance is always derived
-- (sum of points) at read time, never a separately-cached column, so it can
-- never drift out of sync.
-- ---------------------------------------------------------------------------

create table customer_rewards (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  points int not null,
  type text not null check (type in ('welcome', 'repeat', 'referral', 'milestone', 'campaign', 'redemption')),
  reason text,
  related_order_id uuid references orders(id) on delete set null,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index customer_rewards_customer_id_idx on customer_rewards (customer_id);

-- ---------------------------------------------------------------------------
-- reward_rules — admin-configurable financial policy. Only the two rules
-- with an actual stated value are seeded; repeat/referral/milestone/campaign
-- rules are intentionally left unseeded rather than guessing a formula.
-- ---------------------------------------------------------------------------

create table reward_rules (
  id uuid primary key default gen_random_uuid(),
  rule_key text not null unique,
  points int,
  rate numeric,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at on reward_rules;
create trigger set_updated_at before update on reward_rules for each row execute function set_updated_at();

insert into reward_rules (rule_key, points, is_active) values ('welcome_bonus', 50, true);
insert into reward_rules (rule_key, rate, is_active) values ('redemption_rate', 0.5, true); -- taka per point (2 points = ৳1)

-- ---------------------------------------------------------------------------
-- orders.customer_id — parallel to orders.business_id (Phase 2A): business_id
-- answers "which prospect business is this for", customer_id answers "which
-- end customer placed this order". Set for public and CRM-originated orders
-- alike.
-- ---------------------------------------------------------------------------

alter table orders add column if not exists customer_id uuid references customers(id) on delete set null;
create index if not exists orders_customer_id_idx on orders (customer_id);

-- ---------------------------------------------------------------------------
-- activity_log — extended to carry customer-timeline entries too, same
-- shared append-only table used by businesses/opportunities/orders already.
-- ---------------------------------------------------------------------------

alter table activity_log add column if not exists customer_id uuid references customers(id) on delete cascade;
create index if not exists activity_log_customer_id_idx on activity_log (customer_id);

alter table activity_log drop constraint if exists activity_log_has_target;
alter table activity_log add constraint activity_log_has_target check (
  business_id is not null or opportunity_id is not null or order_id is not null or customer_id is not null
);

alter table activity_log drop constraint if exists activity_log_type_check;
alter table activity_log add constraint activity_log_type_check check (type in (
  'created', 'researched', 'contacted', 'message_sent', 'call_made',
  'response_received', 'quotation_sent', 'followup', 'status_changed',
  'note_added', 'won', 'lost',
  'customer_created', 'order_placed', 'reward_earned', 'reward_redeemed'
));

-- ---------------------------------------------------------------------------
-- check_returning_customer() — the Step-2 "welcome back" lookup. Returns
-- only a name, never phone/business/order-history/reward data, matching the
-- "never expose private details before appropriately identified" rule: a
-- visitor typing a phone number sees only a first-name greeting, nothing
-- else, until they actively choose to reuse their saved info (which only
-- prefills the form, it is never displayed back as a data dump).
-- ---------------------------------------------------------------------------

create or replace function check_returning_customer(p_phone text)
returns table (out_name text)
language sql
security definer
set search_path = public
as $$
  select name from customers where phone = trim(p_phone) limit 1;
$$;

-- ---------------------------------------------------------------------------
-- link_customer_to_order() — called once immediately after submit_order()
-- succeeds (submit_order() itself is untouched). Silently upserts the
-- customer by phone, optionally links/creates a business, grants the
-- welcome reward on first order, and writes the order/reward timeline
-- entries. If this call fails for any reason, the order itself has already
-- been created successfully — same fault-tolerant pattern already used for
-- attachment uploads and notification email in submitOrder().
-- ---------------------------------------------------------------------------

create or replace function link_customer_to_order(
  p_order_id uuid,
  p_name text,
  p_phone text,
  p_email text,
  p_area text,
  p_business_name text
)
returns table (out_customer_id uuid, out_customer_number text, out_is_new boolean, out_welcome_points int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer customers%rowtype;
  v_is_new boolean := false;
  v_business_id uuid;
  v_welcome_points int := 0;
begin
  select * into v_customer from customers where phone = trim(p_phone) limit 1;

  if not found then
    v_is_new := true;
    insert into customers (customer_number, name, phone, email, area, total_orders, last_order_at)
    values (next_customer_number(), p_name, trim(p_phone), nullif(trim(coalesce(p_email, '')), ''), nullif(trim(coalesce(p_area, '')), ''), 1, now())
    returning * into v_customer;
  else
    update customers set
      email = coalesce(email, nullif(trim(coalesce(p_email, '')), '')),
      area = coalesce(area, nullif(trim(coalesce(p_area, '')), '')),
      total_orders = total_orders + 1,
      last_order_at = now()
    where id = v_customer.id
    returning * into v_customer;
  end if;

  if p_business_name is not null and trim(p_business_name) <> '' and v_customer.business_id is null then
    select id into v_business_id from businesses where name ilike trim(p_business_name) limit 1;
    if v_business_id is null then
      insert into businesses (name, area, source_type, business_status)
      values (trim(p_business_name), nullif(trim(coalesce(p_area, '')), ''), 'website', 'lead')
      returning id into v_business_id;
    end if;
    update customers set business_id = v_business_id where id = v_customer.id;
    insert into activity_log (business_id, customer_id, type, body)
    values (v_business_id, v_customer.id, 'customer_created', 'পাবলিক অর্ডার থেকে গ্রাহক সংযুক্ত হয়েছে: ' || v_customer.name);
  end if;

  update orders set customer_id = v_customer.id where id = p_order_id;

  if v_is_new then
    select points into v_welcome_points from reward_rules where rule_key = 'welcome_bonus' and is_active = true;
    v_welcome_points := coalesce(v_welcome_points, 0);
    if v_welcome_points > 0 then
      insert into customer_rewards (customer_id, points, type, reason, related_order_id)
      values (v_customer.id, v_welcome_points, 'welcome', 'স্বাগতম বোনাস', p_order_id);
      insert into activity_log (customer_id, order_id, type, body)
      values (v_customer.id, p_order_id, 'reward_earned', 'স্বাগতম বোনাস: ' || v_welcome_points || ' পয়েন্ট');
    end if;
  end if;

  insert into activity_log (customer_id, order_id, type, body)
  values (v_customer.id, p_order_id, 'order_placed', 'অর্ডার স্থাপন করা হয়েছে');

  return query select v_customer.id, v_customer.customer_number, v_is_new, v_welcome_points;
end;
$$;

grant execute on function next_customer_number() to authenticated;
grant execute on function check_returning_customer(text) to anon, authenticated;
grant execute on function link_customer_to_order(uuid, text, text, text, text, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security — same blanket "authenticated = full access" shape as
-- every existing CRM table. anon never reads/writes these tables directly;
-- the two functions above (SECURITY DEFINER) are its only access path,
-- exactly like submit_order()/accept_quotation() already work.
-- ---------------------------------------------------------------------------

alter table customers enable row level security;
alter table customer_rewards enable row level security;
alter table reward_rules enable row level security;

create policy "authenticated manage customers" on customers for all to authenticated using (true) with check (true);
create policy "authenticated manage customer_rewards" on customer_rewards for all to authenticated using (true) with check (true);
create policy "authenticated manage reward_rules" on reward_rules for all to authenticated using (true) with check (true);
