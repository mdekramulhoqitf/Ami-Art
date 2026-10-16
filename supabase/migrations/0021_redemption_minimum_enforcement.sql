-- Enforce the referral reward minimum-redemption threshold server-side.
--
-- Previously reward_rules.referral_min_redemption (300) was only ever READ
-- for display (get_reward_wallet_by_token's out_min_redemption, used by the
-- wallet page's "আর ৳X জমলে..." hint) — redeem_reward_by_token() never
-- checked it, so a customer with any balance > 0 could actually redeem
-- against a real invoice. This migration closes that gap at the one
-- authoritative place redemptions are created; nothing else changes.
--
-- The threshold stays sourced from reward_rules (not hardcoded here or
-- anywhere else) so /admin/reward-rules remains the single place it's
-- configured. Return signature gains one column (the resolved threshold),
-- so the function must be dropped and recreated.

drop function if exists redeem_reward_by_token(text);

create function redeem_reward_by_token(p_token text)
returns table (
  out_success boolean,
  out_amount numeric,
  out_new_available numeric,
  out_message text,
  out_min_redemption numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order orders%rowtype;
  v_invoice invoices%rowtype;
  v_customer_id uuid;
  v_available numeric;
  v_min_redemption numeric;
  v_amount numeric;
  v_redemption_id uuid;
  v_remaining numeric;
  v_take numeric;
  v_ref record;
begin
  select coalesce(
    (select rate from reward_rules where rule_key = 'referral_min_redemption' and is_active = true limit 1),
    0
  ) into v_min_redemption;

  select * into v_order from orders where access_token = p_token for update;
  if v_order.id is null then
    return query select false, 0::numeric, 0::numeric, 'order_not_found', v_min_redemption;
    return;
  end if;

  if v_order.status = 'cancelled' then
    return query select false, 0::numeric, 0::numeric, 'order_cancelled', v_min_redemption;
    return;
  end if;

  v_customer_id := v_order.customer_id;
  if v_customer_id is null then
    return query select false, 0::numeric, 0::numeric, 'no_customer', v_min_redemption;
    return;
  end if;

  select * into v_invoice from invoices where order_id = v_order.id and is_latest = true;
  if v_invoice.id is null or v_invoice.due_amount <= 0 then
    return query select false, 0::numeric, 0::numeric, 'no_due_amount', v_min_redemption;
    return;
  end if;

  select coalesce(sum(commission_amount - redeemed_amount), 0) into v_available
  from referrals where referrer_customer_id = v_customer_id and status = 'approved';

  if v_available <= 0 then
    return query select false, 0::numeric, v_available, 'no_balance', v_min_redemption;
    return;
  end if;

  -- The threshold check: below the configured minimum, redemption is
  -- refused before any row is touched — no reward_redemptions insert, no
  -- referrals.redeemed_amount change, balance stays exactly as it was.
  if v_available < v_min_redemption then
    return query select false, 0::numeric, v_available, 'below_minimum', v_min_redemption;
    return;
  end if;

  v_amount := least(v_available, v_invoice.due_amount);

  insert into reward_redemptions (customer_id, order_id, amount, status)
  values (v_customer_id, v_order.id, v_amount, 'applied')
  on conflict (order_id) do nothing
  returning id into v_redemption_id;

  if v_redemption_id is null then
    return query select false, 0::numeric, v_available, 'already_redeemed', v_min_redemption;
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

  return query select true, v_amount, (v_available - v_amount), 'ok', v_min_redemption;
end;
$$;

grant execute on function redeem_reward_by_token(text) to anon, authenticated;
