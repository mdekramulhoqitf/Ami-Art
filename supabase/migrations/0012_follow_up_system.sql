-- Follow-up system.
--
-- Additive only. No existing table/column dropped or altered destructively.
-- Reuses existing canonical records — a follow-up always points at a real
-- business and/or customer (at least one required), optionally an
-- opportunity/quotation/order for context. No parallel customer/business
-- system, no duplicate concepts.
--
-- businesses.next_followup_at (Phase 1) is kept as-is and NOT dropped —
-- every follow_ups write below also recomputes it (min scheduled_at among
-- that business's pending follow-ups), so the already-verified dashboard
-- tiles in getCrmSummary() keep working unchanged, reading a table this
-- migration never touches.

create table follow_ups (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  customer_id uuid references customers(id) on delete cascade,
  opportunity_id uuid references opportunities(id) on delete cascade,
  quotation_id uuid references quotations(id) on delete cascade,
  order_id uuid references orders(id) on delete cascade,

  reason text not null check (reason in (
    'new_lead', 'interested_lead', 'quotation_sent', 'quotation_pending',
    'negotiation', 'order_confirmation', 'production_update', 'delivery',
    'post_order_checkin', 'repeat_opportunity', 'other'
  )),
  scheduled_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'skipped')),
  notes text,
  next_action text,

  assigned_admin_id uuid references auth.users(id) on delete set null,
  completed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint follow_ups_has_target check (business_id is not null or customer_id is not null)
);

create index follow_ups_business_id_idx on follow_ups (business_id);
create index follow_ups_customer_id_idx on follow_ups (customer_id);
create index follow_ups_scheduled_at_idx on follow_ups (scheduled_at);
create index follow_ups_status_idx on follow_ups (status);

drop trigger if exists set_updated_at on follow_ups;
create trigger set_updated_at before update on follow_ups for each row execute function set_updated_at();

alter table follow_ups enable row level security;
create policy "authenticated manage follow_ups" on follow_ups for all to authenticated using (true) with check (true);
