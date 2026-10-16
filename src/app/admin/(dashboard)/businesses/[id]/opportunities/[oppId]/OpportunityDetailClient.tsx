"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { InvoiceItemsEditor, type InvoiceItemDraft } from "@/components/admin/InvoiceItemsEditor";
import { FormField, Input, Select, Textarea } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { OpportunityStage, Quotation, QuotationStatus } from "@/lib/types";
import {
  updateOpportunityStage,
  saveQuotation,
  markQuotationSent,
  markQuotationNegotiating,
  markQuotationAccepted,
  markQuotationExpired,
  rejectQuotation,
  acceptQuotation,
  type QuotationFormState,
} from "../../../actions";

const STAGES: OpportunityStage[] = [
  "new",
  "researching",
  "qualified",
  "contacted",
  "interested",
  "quotation_sent",
  "negotiation",
  "won",
  "lost",
  "follow_up",
];

const STAGE_LABELS: Record<OpportunityStage, string> = {
  new: "নতুন",
  researching: "রিসার্চ চলছে",
  qualified: "যোগ্য বিবেচিত",
  contacted: "যোগাযোগ হয়েছে",
  interested: "আগ্রহী",
  quotation_sent: "কোটেশন পাঠানো হয়েছে",
  negotiation: "আলোচনা চলছে",
  won: "সফল",
  lost: "ব্যর্থ",
  follow_up: "ফলো-আপ",
};

export function StageSelect({
  opportunityId,
  businessId,
  currentStage,
}: {
  opportunityId: string;
  businessId: string;
  currentStage: OpportunityStage;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Select
      defaultValue={currentStage}
      disabled={pending}
      className="w-auto"
      onChange={(e) =>
        startTransition(() => {
          updateOpportunityStage(opportunityId, businessId, e.target.value as OpportunityStage);
        })
      }
    >
      {STAGES.map((s) => (
        <option key={s} value={s}>
          {STAGE_LABELS[s]}
        </option>
      ))}
    </Select>
  );
}

const emptyQuotationState: QuotationFormState = {};

export function QuotationForm({
  opportunityId,
  businessId,
  defaultCustomerName,
  defaultCustomerPhone,
}: {
  opportunityId: string;
  businessId: string;
  defaultCustomerName: string;
  defaultCustomerPhone: string;
}) {
  const [items, setItems] = useState<InvoiceItemDraft[]>([{ service_name: "", quantity: "1", unit_price: "" }]);
  const boundAction = saveQuotation.bind(null, opportunityId, businessId, items);
  const [state, formAction, pending] = useActionState(boundAction, emptyQuotationState);

  const subtotal = items.reduce((sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.unit_price) || 0), 0);

  return (
    <form action={formAction} className="space-y-5 rounded-xl border border-border p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField label="গ্রাহকের নাম" name="customer_name" required error={state.errors?.customer_name?.[0]}>
          <Input name="customer_name" defaultValue={defaultCustomerName} required />
        </FormField>
        <FormField label="ফোন" name="customer_phone" required error={state.errors?.customer_phone?.[0]}>
          <Input name="customer_phone" defaultValue={defaultCustomerPhone} required />
        </FormField>
        <FormField label="ইমেইল" name="customer_email">
          <Input name="customer_email" />
        </FormField>
        <FormField label="ঠিকানা" name="customer_address">
          <Input name="customer_address" />
        </FormField>
      </div>

      <InvoiceItemsEditor items={items} onChange={setItems} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField label="ছাড় (৳)" name="discount">
          <Input name="discount" type="number" min={0} defaultValue={0} />
        </FormField>
        <FormField label="ডেলিভারি চার্জ (৳)" name="delivery_charge">
          <Input name="delivery_charge" type="number" min={0} defaultValue={0} />
        </FormField>
        <FormField label="ডেলিভারি পদ্ধতি" name="delivery_method">
          <Select name="delivery_method" defaultValue="">
            <option value="">নির্বাচন করুন</option>
            <option value="pickup">দোকান থেকে সংগ্রহ</option>
            <option value="courier">কুরিয়ার</option>
            <option value="local_delivery">স্থানীয় ডেলিভারি</option>
            <option value="other">অন্যান্য</option>
          </Select>
        </FormField>
        <FormField label="ডেলিভারি ঠিকানা" name="delivery_address">
          <Input name="delivery_address" />
        </FormField>
      </div>

      <FormField label="নোট" name="notes">
        <Textarea name="notes" rows={2} />
      </FormField>

      <p className="text-sm font-medium text-ink">উপমোট: ৳ {subtotal.toLocaleString("en-BD")}</p>

      {state.message && <p className="text-sm text-danger">{state.message}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "সংরক্ষণ হচ্ছে…" : "কোটেশন তৈরি করুন"}
      </Button>
    </form>
  );
}

const QUOTATION_STATUS_LABELS: Record<QuotationStatus, string> = {
  draft: "খসড়া",
  sent: "পাঠানো হয়েছে",
  viewed: "দেখা হয়েছে",
  negotiating: "আলোচনা চলছে",
  accepted: "গৃহীত",
  rejected: "প্রত্যাখ্যাত",
  expired: "মেয়াদোত্তীর্ণ",
};

export function QuotationCard({
  quotation,
  businessId,
  opportunityId,
}: {
  quotation: Quotation;
  businessId: string;
  opportunityId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium text-ink">{quotation.quotation_number}</p>
        <Badge tone={quotation.status === "accepted" ? "success" : quotation.status === "rejected" ? "danger" : "primary"}>
          {QUOTATION_STATUS_LABELS[quotation.status]}
        </Badge>
      </div>
      <p className="mt-1 text-sm text-ink-soft">
        {quotation.customer_name} · {quotation.customer_phone}
      </p>
      <p className="mt-1 text-sm font-medium text-ink">৳ {quotation.total.toLocaleString("en-BD")}</p>

      {quotation.order_id ? (
        <p className="mt-3 text-sm text-success">✓ অর্ডারে রূপান্তরিত হয়েছে</p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {quotation.status === "draft" && (
            <Button
              size="sm"
              variant="secondary"
              disabled={pending}
              onClick={() => startTransition(() => markQuotationSent(quotation.id, businessId, opportunityId))}
            >
              পাঠানো হয়েছে চিহ্নিত করুন
            </Button>
          )}
          {(quotation.status === "sent" || quotation.status === "viewed" || quotation.status === "negotiating") && (
            <>
              {quotation.status !== "negotiating" && (
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={pending}
                  onClick={() =>
                    startTransition(() => markQuotationNegotiating(quotation.id, businessId, opportunityId))
                  }
                >
                  আলোচনা শুরু হয়েছে
                </Button>
              )}
              <Button
                size="sm"
                disabled={pending}
                onClick={() =>
                  startTransition(() => markQuotationAccepted(quotation.id, businessId, opportunityId))
                }
              >
                গৃহীত হিসেবে চিহ্নিত করুন
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={pending}
                onClick={() => startTransition(() => rejectQuotation(quotation.id, businessId, opportunityId))}
              >
                প্রত্যাখ্যান
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={pending}
                onClick={() => startTransition(() => markQuotationExpired(quotation.id, businessId, opportunityId))}
              >
                মেয়াদোত্তীর্ণ
              </Button>
            </>
          )}
          {quotation.status === "accepted" && (
            <>
              <Button
                size="sm"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const res = await acceptQuotation(quotation.id, businessId, opportunityId);
                    setResult(res.message);
                    if (res.success) router.refresh();
                  })
                }
              >
                অর্ডারে রূপান্তর করুন
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={pending}
                onClick={() => startTransition(() => rejectQuotation(quotation.id, businessId, opportunityId))}
              >
                প্রত্যাখ্যান
              </Button>
            </>
          )}
        </div>
      )}
      {result && <p className="mt-2 text-sm text-ink-soft">{result}</p>}
    </div>
  );
}
