-- Expose eligible_value + commission_rate on the customer-facing reward
-- history, mirroring exactly what the admin referrals page already shows
-- (getAllReferrals -> "৳{eligibleValue} × {rate}%"). Both columns already
-- exist on referrals (set once by approve_referral_commission(), 0014) —
-- this only SELECTs them, no new calculation, no financial logic change.
--
-- Return signature changes, so the function must be dropped before
-- recreating (Postgres does not allow CREATE OR REPLACE to change a
-- function's return columns).

drop function if exists get_reward_history_by_token(text);

create function get_reward_history_by_token(p_token text)
returns table (
  out_order_number text,
  out_amount numeric,
  out_status text,
  out_created_at timestamptz,
  out_eligible_value numeric,
  out_commission_rate numeric
)
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
    r.created_at,
    r.eligible_value,
    r.commission_rate
  from referrals r
  join orders o on o.id = r.referred_order_id
  where r.referrer_customer_id = v_customer_id and r.status in ('pending', 'approved')
  order by r.created_at desc;
end;
$$;

grant execute on function get_reward_history_by_token(text) to anon, authenticated;
