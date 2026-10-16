-- Phase 2: Customer Reward Wallet + Safe Redemption.
--
-- Additive only. Builds on referrals (0014/0015) and reward_rules (0011) —
-- no duplicate tables, no existing column/row touched.
--
-- Deliberately does NOT reuse customer_rewards for this: that ledger's unit
-- is points (welcome_bonus=points, redemption_rate=taka-per-point) — an
-- unrelated currency from referral commissions, which are taka-denominated
-- from the start. Mixing the two into one summed column would corrupt the
-- existing "AMI Points" balance shown on the admin customer page. Instead,
-- referrals (the earn side, already built) gets one additive column tracking
-- how much of each row has been spent, and a new reward_redemptions table is
-- the spend-side ledger — a genuinely new concept, not a duplicate of
-- anything that existed before Phase 1.
--
-- No new payment system: redemption is a pure read-time credit against an
-- invoice's due_amount for display purposes. invoices.due_amount itself is
-- never written here — admin's existing payment tracking stays untouched.

-- ---------------------------------------------------------------------------
-- reward_rules — reuse. ৳300 is the seeded default minimum redemption,
-- never hard-coded in application code.
-- ---------------------------------------------------------------------------

insert into reward_rules (rule_key, rate, is_active)
values ('referral_min_redemption', 300, true)
on conflict (rule_key) do nothing;

-- ---------------------------------------------------------------------------
-- referrals.redeemed_amount — how much of this row's commission_amount has
-- been consumed so far. Enables partial redemption across/within rows
-- without ever needing to split or delete a row. Available for a row is
-- always (commission_amount - redeemed_amount).
-- ---------------------------------------------------------------------------

alter table referrals add column if not exists redeemed_amount numeric not null default 0;

-- ---------------------------------------------------------------------------
-- reward_redemptions — one row per redemption event, always exactly one per
-- order (the unique constraint below is the duplicate-protection mechanism:
-- double-click, refresh-resubmit, or a retried server action all collapse
-- into the same no-op). Never deleted; a cancelled order flips status to
-- 'reversed' instead (see reverse_redemption_on_cancel below), keeping the
-- financial history intact.
-- ---------------------------------------------------------------------------

create table if not exists reward_redemptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  order_id uuid not null references orders(id) on delete cascade,
  amount numeric not null check (amount > 0),
  status text not null default 'applied' check (status in ('applied', 'reversed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reward_redemptions_unique_order unique (order_id)
);

create index if not exists reward_redemptions_customer_id_idx on reward_redemptions (customer_id);
create index if not exists reward_redemptions_order_id_idx on reward_redemptions (order_id);

drop trigger if exists set_updated_at on reward_redemptions;
create trigger set_updated_at before update on reward_redemptions for each row execute function set_updated_at();

alter table reward_redemptions enable row level security;
create policy "authenticated manage reward_redemptions" on reward_redemptions for all to authenticated using (true) with check (true);

-- ---------------------------------------------------------------------------
-- get_reward_wallet_by_token() / get_reward_history_by_token() — token-gated
-- exactly like every other customer-facing referral function (0014): the
-- order's own access_token proves identity, no customer login exists.
--
-- total_earned = available + pending + redeemed is an invariant that holds
-- both before and after any redemption (redeeming moves value from
-- available to redeemed, it never disappears from the lifetime total).
-- ---------------------------------------------------------------------------

create or replace function get_reward_wallet_by_token(p_token text)
returns table (
  out_available numeric,
  out_pending numeric,
  out_total_earned numeric,
  out_redeemed numeric,
  out_referral_count int,
  out_min_redemption numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_id uuid;
  v_available numeric;
  v_pending numeric;
  v_redeemed numeric;
  v_count int;
begin
  select customer_id into v_customer_id from orders where access_token = p_token;

  if v_customer_id is null then
    return query select
      0::numeric, 0::numeric, 0::numeric, 0::numeric, 0,
      (select rate from reward_rules where rule_key = 'referral_min_redemption' and is_active = true limit 1);
    return;
  end if;

  select coalesce(sum(commission_amount - redeemed_amount), 0) into v_available
  from referrals where referrer_customer_id = v_customer_id and status = 'approved';

  select coalesce(sum(commission_amount), 0) into v_pending
  from referrals where referrer_customer_id = v_customer_id and status = 'pending';

  select coalesce(sum(amount), 0) into v_redeemed
  from reward_redemptions where customer_id = v_customer_id and status = 'applied';

  select count(*) into v_count
  from referrals where referrer_customer_id = v_customer_id and status = 'approved';

  return query select
    v_available,
    v_pending,
    v_available + v_pending + v_redeemed,
    v_redeemed,
    v_count,
    (select rate from reward_rules where rule_key = 'referral_min_redemption' and is_active = true limit 1);
end;
$$;

create or replace function get_reward_history_by_token(p_token text)
returns table (out_order_number text, out_amount numeric, out_status text, out_created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_id uuid;
begin
  select customer_id into v_customer_id from orders where access_token = p_token;
  if v_customer_id is null then
    return;
  end if;

  return query
  select
    o.order_number,
    r.commission_amount,
    case
      when r.status = 'approved' and r.redeemed_amount >= r.commission_amount then 'redeemed'
      when r.status = 'approved' then 'available'
      else 'pending'
    end,
    r.created_at
  from referrals r
  join orders o on o.id = r.referred_order_id
  where r.referrer_customer_id = v_customer_id and r.status in ('pending', 'approved')
  order by r.created_at desc;
end;
$$;

-- ---------------------------------------------------------------------------
-- get_order_redemption_by_token() — lets the customer invoice page show a
-- persisted "Reward applied: ৳X" state after reload, without needing direct
-- (RLS-blocked) anon access to reward_redemptions.
-- ---------------------------------------------------------------------------

create or replace function get_order_redemption_by_token(p_token text)
returns table (out_amount numeric, out_status text)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select rr.amount, rr.status::text
  from reward_redemptions rr
  join orders o on o.id = rr.order_id
  where o.access_token = p_token and rr.status = 'applied';
end;
$$;

-- ---------------------------------------------------------------------------
-- redeem_reward_by_token() — the only way a redemption is ever created.
-- Takes no client-supplied amount at all: the server decides the amount
-- (min of available balance and the order's own due_amount), so there is
-- nothing for a tampered request to override. Atomic: the whole function
-- body is one transaction; `for update` on the order row serializes any
-- concurrent double-click/retry for the same order, and the redemption
-- insert happens BEFORE any referral row is touched, so a conflict (already
-- redeemed) aborts cleanly with zero side effects.
-- ---------------------------------------------------------------------------

create or replace function redeem_reward_by_token(p_token text)
returns table (out_success boolean, out_amount numeric, out_new_available numeric, out_message text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order orders%rowtype;
  v_invoice invoices%rowtype;
  v_customer_id uuid;
  v_available numeric;
  v_amount numeric;
  v_redemption_id uuid;
  v_remaining numeric;
  v_take numeric;
  v_ref record;
begin
  select * into v_order from orders where access_token = p_token for update;
  if v_order.id is null then
    return query select false, 0::numeric, 0::numeric, 'order_not_found';
    return;
  end if;

  if v_order.status = 'cancelled' then
    return query select false, 0::numeric, 0::numeric, 'order_cancelled';
    return;
  end if;

  v_customer_id := v_order.customer_id;
  if v_customer_id is null then
    return query select false, 0::numeric, 0::numeric, 'no_customer';
    return;
  end if;

  select * into v_invoice from invoices where order_id = v_order.id and is_latest = true;
  if v_invoice.id is null or v_invoice.due_amount <= 0 then
    return query select false, 0::numeric, 0::numeric, 'no_due_amount';
    return;
  end if;

  select coalesce(sum(commission_amount - redeemed_amount), 0) into v_available
  from referrals where referrer_customer_id = v_customer_id and status = 'approved';

  if v_available <= 0 then
    return query select false, 0::numeric, 0::numeric, 'no_balance';
    return;
  end if;

  v_amount := least(v_available, v_invoice.due_amount);

  insert into reward_redemptions (customer_id, order_id, amount, status)
  values (v_customer_id, v_order.id, v_amount, 'applied')
  on conflict (order_id) do nothing
  returning id into v_redemption_id;

  if v_redemption_id is null then
    return query select false, 0::numeric, v_available, 'already_redeemed';
    return;
  end if;

  v_remaining := v_amount;
  for v_ref in
    select id, commission_amount, redeemed_amount from referrals
    where referrer_customer_id = v_customer_id and status = 'approved' and redeemed_amount < commission_amount
    order by created_at asc
    for update
  loop
    exit when v_remaining <= 0;
    v_take := least(v_ref.commission_amount - v_ref.redeemed_amount, v_remaining);
    update referrals set redeemed_amount = redeemed_amount + v_take where id = v_ref.id;
    v_remaining := v_remaining - v_take;
  end loop;

  return query select true, v_amount, (v_available - v_amount), 'ok';
end;
$$;

-- ---------------------------------------------------------------------------
-- reverse_redemption_on_cancel() — if the order a reward was applied to gets
-- cancelled afterward, the redemption is marked 'reversed' (never deleted)
-- and the spent amount is credited back to the referral rows it came from,
-- most-recently-consumed first — the exact inverse of the FIFO consumption
-- above.
-- ---------------------------------------------------------------------------

create or replace function reverse_redemption_on_cancel()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_redemption reward_redemptions%rowtype;
  v_remaining numeric;
  v_take numeric;
  v_ref record;
begin
  if new.status = 'cancelled' and old.status is distinct from new.status then
    select * into v_redemption from reward_redemptions where order_id = new.id and status = 'applied';
    if v_redemption.id is not null then
      update reward_redemptions set status = 'reversed' where id = v_redemption.id;

      v_remaining := v_redemption.amount;
      for v_ref in
        select id, redeemed_amount from referrals
        where referrer_customer_id = v_redemption.customer_id and redeemed_amount > 0
        order by updated_at desc
        for update
      loop
        exit when v_remaining <= 0;
        v_take := least(v_ref.redeemed_amount, v_remaining);
        update referrals set redeemed_amount = redeemed_amount - v_take where id = v_ref.id;
        v_remaining := v_remaining - v_take;
      end loop;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists reverse_redemption_on_cancel_trigger on orders;
create trigger reverse_redemption_on_cancel_trigger
after update of status on orders
for each row execute function reverse_redemption_on_cancel();

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

grant execute on function get_reward_wallet_by_token(text) to anon, authenticated;
grant execute on function get_reward_history_by_token(text) to anon, authenticated;
grant execute on function get_order_redemption_by_token(text) to anon, authenticated;
grant execute on function redeem_reward_by_token(text) to anon, authenticated;
