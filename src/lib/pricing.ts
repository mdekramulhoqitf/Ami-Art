export type InvoiceLineItemInput = {
  service_name: string;
  quantity: number;
  unit_price: number;
};

export type InvoiceChargesInput = {
  design_charge: number;
  delivery_charge: number;
  courier_charge: number;
  other_charge: number;
  discount: number;
  paid_amount: number;
};

export type InvoiceTotals = {
  items: (InvoiceLineItemInput & { total: number })[];
  subtotal: number;
  total: number;
  due_amount: number;
};

/**
 * Single source of truth for invoice math, imported by both the client-side
 * live preview and the server action that persists the invoice — so the
 * numbers shown to the admin while editing can never disagree with what
 * actually gets saved.
 */
export function computeInvoiceTotals(
  items: InvoiceLineItemInput[],
  charges: InvoiceChargesInput
): InvoiceTotals {
  const itemsWithTotals = items.map((item) => ({
    ...item,
    total: round2(item.quantity * item.unit_price),
  }));

  const subtotal = round2(itemsWithTotals.reduce((sum, item) => sum + item.total, 0));

  const total = round2(
    subtotal +
      charges.design_charge +
      charges.delivery_charge +
      charges.courier_charge +
      charges.other_charge -
      charges.discount
  );

  const due_amount = round2(Math.max(total - charges.paid_amount, 0));

  return { items: itemsWithTotals, subtotal, total, due_amount };
}

function round2(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
