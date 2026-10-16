-- Fix: attribute_referral() ran AFTER link_customer_to_order() had already
-- set orders.customer_id (confirmed via real end-to-end testing: a real
-- referred order's referrals row had referred_customer_id stuck at null).
-- The sync_referral_customer trigger only fires on a future UPDATE of
-- orders.customer_id — by the time the referrals row is inserted, that
-- update has already happened, so the trigger has nothing left to catch.
-- Practical consequence: self-referral was never actually being detected.
--
-- Fix: attribute_referral() now reads the order's current customer_id
-- itself and resolves referred_customer_id immediately at insert time,
-- checking self-referral right there before any row is created — instead
-- of inserting a row and marking it rejected after the fact (which would
-- itself violate the referrals_no_self_referral check constraint, since
-- that constraint requires referred_customer_id <> referrer_customer_id
-- unconditionally). The sync_referral_customer trigger from 0014 is left
-- in place as a defensive fallback for a future call ordering where
-- customer_id isn't resolved yet at attribution time; it does no harm here.

create or replace function attribute_referral(p_order_id uuid, p_referral_code text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_referrer_id uuid;
  v_order_customer_id uuid;
begin
  if p_referral_code is null or trim(p_referral_code) = '' then
    return;
  end if;

  select id into v_referrer_id from customers where referral_code = upper(trim(p_referral_code));
  if v_referrer_id is null then
    return;
  end if;

  select customer_id into v_order_customer_id from orders where id = p_order_id;

  if v_order_customer_id is not null and v_order_customer_id = v_referrer_id then
    return; -- self-referral: reject attribution outright, no row created
  end if;

  insert into referrals (referrer_customer_id, referral_code, referred_order_id, referred_customer_id)
  values (v_referrer_id, upper(trim(p_referral_code)), p_order_id, v_order_customer_id)
  on conflict (referred_order_id) do nothing;
end;
$$;
