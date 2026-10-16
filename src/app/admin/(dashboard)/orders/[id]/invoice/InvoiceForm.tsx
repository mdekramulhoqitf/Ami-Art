"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FormField, Input, Select, Textarea } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { InvoiceItemsEditor, type InvoiceItemDraft } from "@/components/admin/InvoiceItemsEditor";
import { InvoicePreview, type InvoicePreviewData } from "@/components/site/InvoicePreview";
import { computeInvoiceTotals } from "@/lib/pricing";
import { DELIVERY_METHODS, ESTIMATED_COMPLETION_PRESETS } from "@/lib/validation";
import { DELIVERY_METHOD_LABELS } from "@/lib/invoice-status";
import type { DeliveryMethod, Invoice, InvoiceItem } from "@/lib/types";
import type { InvoiceFormState } from "./actions";

type FormState = {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  customer_address: string;
  invoice_date: string;
  items: InvoiceItemDraft[];
  // Kept as strings (not number) while editing — see InvoiceItemsEditor.tsx
  // for why a controlled numeric input can't hold the user's raw keystrokes.
  design_charge: string;
  delivery_charge: string;
  courier_charge: string;
  other_charge: string;
  discount: string;
  paid_amount: string;
  estimated_completion: string;
  delivery_method: DeliveryMethod | "";
  delivery_address: string;
  notes: string;
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function InvoiceForm({
  invoice,
  items: existingItems,
  orderId,
  orderNumber,
  defaults,
  logoUrl,
  businessName,
  businessAddress,
  businessPhone,
  businessEmail,
  action,
}: {
  invoice?: Invoice;
  items?: InvoiceItem[];
  orderId: string;
  orderNumber: string;
  defaults?: {
    customer_name: string;
    customer_phone: string;
    customer_email?: string | null;
    customer_address?: string | null;
    delivery_method?: DeliveryMethod | null;
    delivery_address?: string | null;
    delivery_charge?: number;
    courier_charge?: number;
    service_label?: string;
  };
  logoUrl: string | null;
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  action: (state: InvoiceFormState, formData: FormData) => Promise<InvoiceFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, {} as InvoiceFormState);
  const { showToast } = useToast();
  const router = useRouter();

  const [form, setForm] = useState<FormState>(() => ({
    customer_name: invoice?.customer_name ?? defaults?.customer_name ?? "",
    customer_phone: invoice?.customer_phone ?? defaults?.customer_phone ?? "",
    customer_email: invoice?.customer_email ?? defaults?.customer_email ?? "",
    customer_address: invoice?.customer_address ?? defaults?.customer_address ?? "",
    invoice_date: invoice?.invoice_date ?? todayISO(),
    items:
      existingItems && existingItems.length > 0
        ? existingItems.map((i) => ({
            service_name: i.service_name,
            quantity: String(i.quantity),
            unit_price: String(i.unit_price),
          }))
        : [
            {
              service_name: defaults?.service_label ?? "",
              quantity: "1",
              unit_price: "",
            },
          ],
    design_charge: invoice ? String(invoice.design_charge) : "0",
    delivery_charge: invoice ? String(invoice.delivery_charge) : String(defaults?.delivery_charge ?? 0),
    courier_charge: invoice ? String(invoice.courier_charge) : String(defaults?.courier_charge ?? 0),
    other_charge: invoice ? String(invoice.other_charge) : "0",
    discount: invoice ? String(invoice.discount) : "0",
    paid_amount: invoice ? String(invoice.paid_amount) : "0",
    estimated_completion: invoice?.estimated_completion ?? "",
    delivery_method: invoice?.delivery_method ?? defaults?.delivery_method ?? "",
    delivery_address: invoice?.delivery_address ?? defaults?.delivery_address ?? "",
    notes: invoice?.notes ?? "",
  }));

  useEffect(() => {
    if (state.message && !state.errors) {
      showToast("error", state.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // Normalize to numbers only here, at the calculation boundary — the form
  // state itself stays string-typed so typing never fights a controlled
  // numeric input (see FormState above).
  const totals = useMemo(
    () =>
      computeInvoiceTotals(
        form.items.map((item) => ({
          service_name: item.service_name,
          quantity: Number(item.quantity) || 0,
          unit_price: Number(item.unit_price) || 0,
        })),
        {
          design_charge: Number(form.design_charge) || 0,
          delivery_charge: Number(form.delivery_charge) || 0,
          courier_charge: Number(form.courier_charge) || 0,
          other_charge: Number(form.other_charge) || 0,
          discount: Number(form.discount) || 0,
          paid_amount: Number(form.paid_amount) || 0,
        }
      ),
    [form]
  );

  const previewData: InvoicePreviewData = {
    invoiceNumber: invoice?.invoice_number ?? "খসড়া",
    version: invoice?.version,
    orderNumber,
    invoiceDate: form.invoice_date,
    status: invoice?.status ?? "draft",
    customerName: form.customer_name || "—",
    customerPhone: form.customer_phone || "—",
    customerEmail: form.customer_email,
    customerAddress: form.customer_address,
    items: totals.items,
    subtotal: totals.subtotal,
    designCharge: Number(form.design_charge) || 0,
    deliveryCharge: Number(form.delivery_charge) || 0,
    courierCharge: Number(form.courier_charge) || 0,
    otherCharge: Number(form.other_charge) || 0,
    discount: Number(form.discount) || 0,
    total: totals.total,
    paidAmount: Number(form.paid_amount) || 0,
    dueAmount: totals.due_amount,
    estimatedCompletion: form.estimated_completion || null,
    deliveryMethod: form.delivery_method || null,
    deliveryAddress: form.delivery_address || null,
    notes: form.notes || null,
    orderServiceLabel: defaults?.service_label,
  };

  return (
    <form
      action={formAction}
      className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start"
    >
      {/* Hidden fields carrying computed/JSON state */}
      <input type="hidden" name="items" value={JSON.stringify(form.items)} />

      <div className="space-y-6 rounded-2xl border border-border bg-surface p-6">
        <div className="rounded-lg bg-muted p-4 text-sm text-ink-soft">
          অর্ডার: <span className="font-medium text-ink">{orderNumber}</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="গ্রাহকের নাম" name="customer_name" required error={state.errors?.customer_name?.[0]}>
            <Input
              name="customer_name"
              value={form.customer_name}
              onChange={(e) => update("customer_name", e.target.value)}
              required
            />
          </FormField>
          <FormField label="মোবাইল নম্বর" name="customer_phone" required error={state.errors?.customer_phone?.[0]}>
            <Input
              name="customer_phone"
              value={form.customer_phone}
              onChange={(e) => update("customer_phone", e.target.value)}
              required
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="ই-মেইল" name="customer_email" hint="ঐচ্ছিক">
            <Input
              name="customer_email"
              value={form.customer_email}
              onChange={(e) => update("customer_email", e.target.value)}
            />
          </FormField>
          <FormField label="ইনভয়েসের তারিখ" name="invoice_date" required>
            {/* Deliberately uncontrolled: echoing value back into a date
                input on every keystroke fights the browser's date-segment
                editor and can corrupt the typed year (e.g. "0296"). */}
            <Input
              type="date"
              name="invoice_date"
              defaultValue={form.invoice_date}
              onChange={(e) => update("invoice_date", e.target.value)}
              required
            />
          </FormField>
        </div>

        <FormField label="ঠিকানা" name="customer_address" hint="ঐচ্ছিক">
          <Input
            name="customer_address"
            value={form.customer_address}
            onChange={(e) => update("customer_address", e.target.value)}
          />
        </FormField>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-ink">সেবা ও মূল্য</h3>
          <InvoiceItemsEditor items={form.items} onChange={(items) => update("items", items)} />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <FormField label="ডিজাইন চার্জ" name="design_charge">
            <Input
              type="number"
              min={0}
              name="design_charge"
              value={form.design_charge}
              onChange={(e) => update("design_charge", e.target.value)}
            />
          </FormField>
          <FormField label="ডেলিভারি চার্জ" name="delivery_charge">
            <Input
              type="number"
              min={0}
              name="delivery_charge"
              value={form.delivery_charge}
              onChange={(e) => update("delivery_charge", e.target.value)}
            />
          </FormField>
          <FormField label="কুরিয়ার চার্জ" name="courier_charge">
            <Input
              type="number"
              min={0}
              name="courier_charge"
              value={form.courier_charge}
              onChange={(e) => update("courier_charge", e.target.value)}
            />
          </FormField>
          <FormField label="অন্যান্য চার্জ" name="other_charge">
            <Input
              type="number"
              min={0}
              name="other_charge"
              value={form.other_charge}
              onChange={(e) => update("other_charge", e.target.value)}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="ছাড়" name="discount">
            <Input
              type="number"
              min={0}
              name="discount"
              value={form.discount}
              onChange={(e) => update("discount", e.target.value)}
            />
          </FormField>
          <FormField label="পরিশোধিত টাকা" name="paid_amount">
            <Input
              type="number"
              min={0}
              name="paid_amount"
              value={form.paid_amount}
              onChange={(e) => update("paid_amount", e.target.value)}
            />
          </FormField>
        </div>

        <FormField
          label="সম্ভাব্য কাজ শেষ হওয়ার সময়"
          name="estimated_completion"
          hint="একটি অপশন বেছে নিন, অথবা নিচে নিজের মতো লিখুন"
        >
          <div className="flex flex-wrap gap-2">
            {ESTIMATED_COMPLETION_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => update("estimated_completion", preset)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  form.estimated_completion === preset
                    ? "border-primary-600 bg-primary-600 text-white"
                    : "border-border text-ink-soft hover:border-primary-500"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
          <Input
            className="mt-2.5"
            name="estimated_completion"
            placeholder="কাস্টম, যেমন: ৩–৫ কর্মদিবস"
            value={form.estimated_completion}
            onChange={(e) => update("estimated_completion", e.target.value)}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="ডেলিভারি পদ্ধতি" name="delivery_method">
            <Select
              name="delivery_method"
              value={form.delivery_method}
              onChange={(e) => update("delivery_method", e.target.value as DeliveryMethod)}
            >
              <option value="">নির্বাচন করুন</option>
              {DELIVERY_METHODS.map((m) => (
                <option key={m} value={m}>
                  {DELIVERY_METHOD_LABELS[m]}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="ডেলিভারি ঠিকানা" name="delivery_address" hint="ঐচ্ছিক">
            <Input
              name="delivery_address"
              value={form.delivery_address}
              onChange={(e) => update("delivery_address", e.target.value)}
            />
          </FormField>
        </div>

        <FormField label="অতিরিক্ত নোট" name="notes" hint="ঐচ্ছিক">
          <Textarea
            name="notes"
            rows={3}
            placeholder="যেমন: ডিজাইন অনুমোদনের পর প্রিন্টিং শুরু হবে।"
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
          />
        </FormField>

        <div className="flex gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "সংরক্ষণ হচ্ছে…" : "সংরক্ষণ করুন"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push(`/admin/orders/${orderId}`)}
          >
            বাতিল
          </Button>
        </div>
      </div>

      <div className="lg:sticky lg:top-6">
        <p className="mb-3 text-sm font-semibold text-ink">লাইভ প্রিভিউ</p>
        <div className="max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl border border-border bg-muted p-4">
          <InvoicePreview
            data={previewData}
            logoUrl={logoUrl}
            businessName={businessName}
            businessAddress={businessAddress}
            businessPhone={businessPhone}
            businessEmail={businessEmail}
          />
        </div>
      </div>
    </form>
  );
}
