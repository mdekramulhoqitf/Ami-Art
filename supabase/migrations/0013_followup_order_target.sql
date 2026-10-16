-- Fix: follow_ups_has_target (from migration 0012) only allowed business_id
-- or customer_id as a valid target — order_id was never included, even
-- though the column has existed since 0012 and was always intended to
-- support order-scoped follow-ups. Confirmed via real testing: any order
-- with neither a linked business nor a linked customer (common for older
-- orders predating the customer system) currently CANNOT have a follow-up
-- scheduled — the insert violates this constraint and fails with a 500.
--
-- Additive/safe: drops and re-adds only this one check constraint, widening
-- it. No table, column, or row is touched. No existing data can violate the
-- new (looser) constraint, since anything that satisfied the old one still
-- satisfies this one.

alter table follow_ups drop constraint if exists follow_ups_has_target;
alter table follow_ups add constraint follow_ups_has_target check (
  business_id is not null or customer_id is not null or order_id is not null
);
