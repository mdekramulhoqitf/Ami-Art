-- Reorder prefill: a customer viewing their own order (proven via that
-- order's own access_token, same identity model as get_order_by_token /
-- get_reward_wallet_by_token) can start a new order pre-filled from it.
--
-- Additive only — no table/column changes, no RLS change. anon has no
-- direct SELECT on orders (or businesses), so a dedicated SECURITY DEFINER
-- function is required, exactly like every other token-gated read this
-- project already uses. get_order_by_token() itself is left untouched
-- (it's already consumed elsewhere) rather than widening its return shape.
--
-- Deliberately excludes: required_date, budget, delivery_required,
-- delivery_method, delivery_address, status, pricing_snapshot — a reorder
-- must never blindly carry over old logistics/pricing, only reusable
-- identity + work-content fields.

create or replace function get_reorder_data_by_token(p_token text)
returns table (
  out_order_number text,
  out_customer_name text,
  out_phone text,
  out_email text,
  out_address text,
  out_business_name text,
  out_service_id uuid,
  out_service_label text,
  out_description text,
  out_quantity text,
  out_custom_fields jsonb
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    o.order_number,
    o.customer_name,
    o.phone,
    o.email,
    o.address,
    b.name,
    o.service_id,
    o.service_label,
    o.description,
    o.quantity,
    o.custom_fields
  from orders o
  left join businesses b on b.id = o.business_id
  where o.access_token = p_token;
end;
$$;

grant execute on function get_reorder_data_by_token(text) to anon, authenticated;
