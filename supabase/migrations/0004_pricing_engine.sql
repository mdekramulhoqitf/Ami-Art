-- Ami Art — dynamic pricing engine: per-service pricing config + order price
-- snapshot. Additive only. No column dropped, no existing data touched,
-- safe to run multiple times (all guarded with if not exists).
-- NOT executed automatically — run in Supabase SQL Editor same as 0001-0003.

alter table services
  add column if not exists pricing_model text not null default 'CUSTOM'
    check (pricing_model in (
      'PER_SQFT', 'PER_PIECE', 'FIXED', 'PER_PACKAGE', 'DESIGN_ONLY',
      'PER_SQFT_PLUS_DESIGN', 'PER_PIECE_PLUS_DESIGN', 'CUSTOM'
    )),
  add column if not exists rate numeric,
  add column if not exists design_fee numeric not null default 0,
  add column if not exists source_file_fee numeric not null default 0,
  add column if not exists minimum_charge numeric,
  add column if not exists minimum_quantity int;

-- Immutable price breakdown captured at order-submission time, so a later
-- admin rate change never alters what an existing customer was quoted.
alter table orders
  add column if not exists pricing_snapshot jsonb;

-- submit_order() gets one new trailing, defaulted parameter. Postgres treats
-- an added parameter as a distinct overload even with a default (it matches
-- on argument *types*, not names) — so a plain CREATE OR REPLACE here would
-- leave two versions coexisting and risk "function is not unique" if a
-- caller ever supplies only the original 14 named args. Drop the old
-- signature first so exactly one version exists.
drop function if exists submit_order(text, text, text, text, uuid, text, text, text, date, text, boolean, text, text, jsonb);

create function submit_order(
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
  p_custom_fields jsonb default '{}',
  p_pricing_snapshot jsonb default null
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
    delivery_method, custom_fields, pricing_snapshot
  )
  values (
    v_order_number, p_customer_name, p_phone, p_email, p_address, p_service_id, p_service_label,
    p_description, p_quantity, p_required_date, p_budget, p_delivery_required, p_delivery_address,
    p_delivery_method, coalesce(p_custom_fields, '{}'::jsonb), p_pricing_snapshot
  )
  returning orders.id, orders.order_number, orders.access_token;
end;
$$;

grant execute on function submit_order(text, text, text, text, uuid, text, text, text, date, text, boolean, text, text, jsonb, jsonb) to anon, authenticated;
