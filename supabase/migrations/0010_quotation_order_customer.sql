-- Phase 2A: Quotation -> Order -> Customer lifecycle.
--
-- Additive only. No existing table dropped, no existing column removed, no
-- existing row touched. Two changes:
--
--   1. orders.business_id — lets a CRM-originated order be traced straight
--      back to its business without joining through quotations. Nullable:
--      public self-serve orders (from the website's own /order form) keep
--      business_id = null, exactly as today. Nothing about the public order
--      flow changes.
--
--   2. accept_quotation() replaced (same signature, same atomicity) to:
--        - require the quotation to already be status = 'accepted' before it
--          can be converted (Phase 2A separates "customer accepted the
--          quote" from "we created the order record" into two explicit
--          steps, per the approved quotation status flow)
--        - stamp the new order's business_id
--        - copy the quotation's notes onto the invoice (previously dropped)
--        - promote businesses.business_status from prospect/lead to
--          'customer' once a real order exists for it (never overwrites an
--          explicit 'inactive'/'customer' status)
--      Duplicate-conversion prevention is unchanged (still raises if
--      quotation.order_id is already set), still one atomic transaction.

alter table orders add column if not exists business_id uuid references businesses(id) on delete set null;
create index if not exists orders_business_id_idx on orders (business_id);

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
  if v_quotation.status <> 'accepted' then
    raise exception 'quotation must be marked accepted before it can be converted to an order';
  end if;

  v_order_number := next_order_number();

  insert into orders (
    order_number, business_id, customer_name, phone, email, address,
    service_label, description, quantity, status,
    delivery_required, delivery_method, delivery_address
  ) values (
    v_order_number, v_quotation.business_id, v_quotation.customer_name, v_quotation.customer_phone,
    v_quotation.customer_email, v_quotation.customer_address,
    'কোটেশন থেকে অর্ডার', 'কোটেশন ' || v_quotation.quotation_number || ' গ্রহণ করে তৈরি অর্ডার',
    '1', 'new',
    v_quotation.delivery_method is not null, v_quotation.delivery_method, v_quotation.delivery_address
  )
  returning id into v_order_id;

  insert into invoices (
    order_id, invoice_number, customer_name, customer_phone, customer_email, customer_address,
    subtotal, discount, delivery_charge, total, due_amount, status,
    delivery_method, delivery_address, notes
  ) values (
    v_order_id, next_invoice_number(), v_quotation.customer_name, v_quotation.customer_phone,
    v_quotation.customer_email, v_quotation.customer_address,
    v_quotation.subtotal, v_quotation.discount, v_quotation.delivery_charge, v_quotation.total,
    v_quotation.total, 'sent',
    v_quotation.delivery_method, v_quotation.delivery_address, v_quotation.notes
  )
  returning id into v_invoice_id;

  insert into invoice_items (invoice_id, service_name, quantity, unit_price, total, display_order)
  select v_invoice_id, service_name, quantity, unit_price, total, display_order
  from quotation_items
  where quotation_id = p_quotation_id
  order by display_order;

  update quotations
  set order_id = v_order_id
  where id = p_quotation_id;

  update businesses
  set business_status = 'customer'
  where id = v_quotation.business_id and business_status in ('prospect', 'lead');

  insert into activity_log (business_id, opportunity_id, order_id, type, body)
  values (
    v_quotation.business_id, v_quotation.opportunity_id, v_order_id, 'won',
    'কোটেশন ' || v_quotation.quotation_number || ' গৃহীত হয়েছে, অর্ডার ' || v_order_number || ' তৈরি হয়েছে'
  );

  update opportunities set stage = 'won' where id = v_quotation.opportunity_id;

  return query select v_order_id, v_order_number, v_invoice_id;
end;
$$;
