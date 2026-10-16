-- Phase 1: Customer Referral + Reward Engine.
--
-- Additive only. Reuses existing customers/orders/reward_rules tables and
-- conventions exactly as established in 0009-0012 — no duplicate tables, no
-- existing column/row touched, submit_order()/link_customer_to_order() left
-- untouched (referral attribution hooks in alongside them, not inside them).
--
-- Scope (Phase 1 only): eligibility, code generation, link capture,
-- attribution, a configurable commission rule, PENDING/APPROVED lifecycle,
-- duplicate + self-referral protection. Redemption/payout/wallet/tiers are
-- explicitly deferred to a future phase.

-- ---------------------------------------------------------------------------
-- reward_rules — reuse the existing admin-configurable rule table (0011).
-- 3% is the seeded default, never hard-coded in application code.
-- ---------------------------------------------------------------------------

insert into reward_rules (rule_key, rate, is_active)
values ('referral_commission', 0.03, true)
on conflict (rule_key) do nothing;

-- ---------------------------------------------------------------------------
-- customers.referral_code — one code per customer, generated on demand.
-- Always stored uppercase; lookups always upper()/trim() the input, so a
-- plain unique constraint gives case-insensitive uniqueness without citext.
-- ---------------------------------------------------------------------------

alter table customers add column if not exists referral_code text unique;

-- ---------------------------------------------------------------------------
-- referrals — the smallest normalized relationship: one row per referred
-- order (not per click, not per customer-pair), which is also the natural
-- duplicate-protection boundary (one order can only ever earn one
-- commission). referred_customer_id is filled in once the referred order's
-- customer_id resolves (same phone-linking moment as link_customer_to_order),
-- which is also when self-referral becomes checkable.
-- ---------------------------------------------------------------------------

create table if not exists referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_customer_id uuid not null references customers(id) on delete cascade,
  referral_code text not null,
  referred_order_id uuid not null references orders(id) on delete cascade,
  referred_customer_id uuid references customers(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  commission_rate numeric,
  eligible_value numeric,
  commission_amount numeric,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint referrals_unique_order unique (referred_order_id),
  constraint referrals_no_self_referral check (
    referred_customer_id is null or referred_customer_id <> referrer_customer_id
  )
);

create index if not exists referrals_referrer_customer_id_idx on referrals (referrer_customer_id);
create index if not exists referrals_referred_customer_id_idx on referrals (referred_customer_id);
create index if not exists referrals_status_idx on referrals (status);

drop trigger if exists set_updated_at on referrals;
create trigger set_updated_at before update on referrals for each row execute function set_updated_at();

alter table referrals enable row level security;
create policy "authenticated manage referrals" on referrals for all to authenticated using (true) with check (true);

-- ---------------------------------------------------------------------------
-- generate_referral_code(customer_id) — idempotent: a customer who already
-- has a code just gets it back, so repeated "Generate" clicks never create
-- duplicates. Eligibility = at least one non-cancelled, non-archived order.
-- Excludes ambiguous glyphs (0/O, 1/I) from the random suffix.
-- ---------------------------------------------------------------------------

create or replace function generate_referral_code(p_customer_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing text;
  v_eligible boolean;
  v_code text;
  v_chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_attempt int := 0;
begin
  select referral_code into v_existing from customers where id = p_customer_id;
  if v_existing is not null then
    return v_existing;
  end if;

  select exists (
    select 1 from orders
    where customer_id = p_customer_id and status <> 'cancelled' and is_archived = false
  ) into v_eligible;

  if not v_eligible then
    raise exception 'not_eligible';
  end if;

  loop
    v_attempt := v_attempt + 1;
    v_code := 'AMI' || (
      select string_agg(substr(v_chars, (floor(random() * length(v_chars)) + 1)::int, 1), '')
      from generate_series(1, 4)
    );
    begin
      update customers set referral_code = v_code where id = p_customer_id and referral_code is null;
      if found then
        return v_code;
      end if;
    exception when unique_violation then
      null; -- collision, retry
    end;
    exit when v_attempt > 20;
  end loop;

  select referral_code into v_existing from customers where id = p_customer_id;
  if v_existing is not null then
    return v_existing;
  end if;

  raise exception 'code_generation_failed';
end;
$$;

-- ---------------------------------------------------------------------------
-- Token-gated wrappers — the public order-status page has no customer login
-- (same as get_order_by_token/check_returning_customer in 0001/0011), so
-- every anon-facing referral call proves identity via the order's own
-- access_token rather than accepting a bare customer_id from the client.
-- ---------------------------------------------------------------------------

create or replace function get_referral_info_by_token(p_token text)
returns table (out_eligible boolean, out_referral_code text, out_commission_rate numeric)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_id uuid;
begin
  select customer_id into v_customer_id from orders where access_token = p_token;

  if v_customer_id is null then
    return query select
      false,
      null::text,
      (select rate from reward_rules where rule_key = 'referral_commission' and is_active = true limit 1);
    return;
  end if;

  return query select
    exists(select 1 from orders where customer_id = v_customer_id and status <> 'cancelled' and is_archived = false),
    (select referral_code from customers where id = v_customer_id),
    (select rate from reward_rules where rule_key = 'referral_commission' and is_active = true limit 1);
end;
$$;

create or replace function generate_referral_code_by_token(p_token text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_id uuid;
begin
  select customer_id into v_customer_id from orders where access_token = p_token;
  if v_customer_id is null then
    raise exception 'not_found';
  end if;
  return generate_referral_code(v_customer_id);
end;
$$;

-- ---------------------------------------------------------------------------
-- attribute_referral(order_id, code) — called once, right after a public
-- order is created (same fault-tolerant call site as add_order_attachment:
-- never blocks or fails the order itself). Unknown/invalid codes are
-- silently ignored. Duplicate protection is the referrals_unique_order
-- constraint itself, not app-side logic.
-- ---------------------------------------------------------------------------

create or replace function attribute_referral(p_order_id uuid, p_referral_code text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_referrer_id uuid;
begin
  if p_referral_code is null or trim(p_referral_code) = '' then
    return;
  end if;

  select id into v_referrer_id from customers where referral_code = upper(trim(p_referral_code));
  if v_referrer_id is null then
    return;
  end if;

  insert into referrals (referrer_customer_id, referral_code, referred_order_id)
  values (v_referrer_id, upper(trim(p_referral_code)), p_order_id)
  on conflict (referred_order_id) do nothing;
end;
$$;

-- ---------------------------------------------------------------------------
-- sync_referral_customer() — once the referred order's customer_id resolves
-- (link_customer_to_order's own UPDATE, untouched by this migration), copy
-- it onto the referral row and reject on self-referral.
-- ---------------------------------------------------------------------------

create or replace function sync_referral_customer()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.customer_id is not null and old.customer_id is distinct from new.customer_id then
    update referrals
    set referred_customer_id = new.customer_id,
        status = case when referrer_customer_id = new.customer_id then 'rejected' else status end
    where referred_order_id = new.id and referred_customer_id is null;
  end if;
  return new;
end;
$$;

drop trigger if exists sync_referral_customer_trigger on orders;
create trigger sync_referral_customer_trigger
after update of customer_id on orders
for each row execute function sync_referral_customer();

-- ---------------------------------------------------------------------------
-- approve_referral_commission() — fires when the order's latest invoice
-- carries real numbers. Net eligible value = subtotal - discount (delivery/
-- courier/other charges excluded, matching the business rule). Server-only:
-- the client never supplies a commission amount.
-- ---------------------------------------------------------------------------

create or replace function approve_referral_commission()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_status text;
  v_rate numeric;
  v_eligible numeric;
begin
  if new.is_latest is distinct from true then
    return new;
  end if;

  select status into v_order_status from orders where id = new.order_id;
  if v_order_status is null or v_order_status = 'cancelled' then
    return new;
  end if;

  select rate into v_rate from reward_rules where rule_key = 'referral_commission' and is_active = true limit 1;
  v_eligible := greatest(coalesce(new.subtotal, 0) - coalesce(new.discount, 0), 0);

  update referrals
  set eligible_value = v_eligible,
      commission_rate = v_rate,
      commission_amount = v_eligible * coalesce(v_rate, 0),
      status = 'approved',
      approved_at = now()
  where referred_order_id = new.order_id and status = 'pending';

  return new;
end;
$$;

drop trigger if exists approve_referral_commission_trigger on invoices;
create trigger approve_referral_commission_trigger
after insert or update of subtotal, discount, is_latest on invoices
for each row execute function approve_referral_commission();

-- ---------------------------------------------------------------------------
-- reject_referral_on_cancel() — cancelled orders must never leave an
-- approved (or still-pending) commission behind. Never deletes the row —
-- the financial history stays append-only/auditable, just marked rejected.
-- ---------------------------------------------------------------------------

create or replace function reject_referral_on_cancel()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'cancelled' and old.status is distinct from new.status then
    update referrals set status = 'rejected' where referred_order_id = new.id and status in ('pending', 'approved');
  end if;
  return new;
end;
$$;

drop trigger if exists reject_referral_on_cancel_trigger on orders;
create trigger reject_referral_on_cancel_trigger
after update of status on orders
for each row execute function reject_referral_on_cancel();

-- ---------------------------------------------------------------------------
-- Grants — anon reaches referral data only through the token-gated/order-id
-- functions above (same trust model as get_order_by_token / add_order_attachment).
-- ---------------------------------------------------------------------------

grant execute on function generate_referral_code(uuid) to authenticated;
grant execute on function get_referral_info_by_token(text) to anon, authenticated;
grant execute on function generate_referral_code_by_token(text) to anon, authenticated;
grant execute on function attribute_referral(uuid, text) to anon, authenticated;
