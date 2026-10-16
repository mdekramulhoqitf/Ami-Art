-- Customer Hub: the smallest safe extension of the existing per-order-token
-- identity model to show a customer their OWN order history across all
-- their orders, not just the single order matching the current token.
--
-- Additive only — no table/column changes, no RLS change. anon has no
-- direct SELECT on orders/customers, so (as with every other customer-
-- facing read this project uses) a SECURITY DEFINER function proves
-- identity via the order's own access_token, then reads by the resolved
-- customer_id — never accepting a bare customer_id from the client.
--
-- customers.total_orders is already a maintained counter (link_customer_to_order,
-- 0011) — reused directly rather than recomputed. Active/completed counts and
-- the recent-orders list are computed fresh from real, non-archived orders.

create or replace function get_customer_hub_by_token(p_token text)
returns table (
  out_customer_id uuid,
  out_customer_number text,
  out_customer_name text,
  out_business_name text,
  out_phone text,
  out_total_orders int,
  out_active_orders int,
  out_completed_orders int
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
    c.id,
    c.customer_number,
    c.name,
    b.name,
    c.phone,
    c.total_orders,
    (select count(*)::int from orders where customer_id = v_customer_id and is_archived = false
      and status in ('new', 'viewed', 'contacted', 'in_progress')),
    (select count(*)::int from orders where customer_id = v_customer_id and is_archived = false
      and status = 'completed')
  from customers c
  left join businesses b on b.id = c.business_id
  where c.id = v_customer_id;
end;
$$;

-- Recent orders across the whole customer, most recent first — each row
-- carries that order's OWN access_token so the customer can navigate to it
-- (their own data only; never another customer's).
create or replace function get_customer_recent_orders_by_token(p_token text, p_limit int default 5)
returns table (
  out_order_number text,
  out_access_token text,
  out_service_label text,
  out_status text,
  out_created_at timestamptz,
  out_invoice_total numeric,
  out_invoice_due numeric
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
    o.access_token,
    o.service_label,
    o.status::text,
    o.created_at,
    (select i.total from invoices i where i.order_id = o.id and i.is_latest = true limit 1),
    (select i.due_amount from invoices i where i.order_id = o.id and i.is_latest = true limit 1)
  from orders o
  where o.customer_id = v_customer_id and o.is_archived = false
  order by o.created_at desc
  limit greatest(p_limit, 1);
end;
$$;

grant execute on function get_customer_hub_by_token(text) to anon, authenticated;
grant execute on function get_customer_recent_orders_by_token(text, int) to anon, authenticated;
