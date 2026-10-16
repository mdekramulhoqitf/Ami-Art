"use client";

import { useState, useTransition } from "react";
import { Select, Input } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { INVOICE_STATUSES, INVOICE_STATUS_LABELS } from "@/lib/invoice-status";
import { updateInvoicePaymentStatus } from "../actions";
import type { InvoiceStatus } from "@/lib/types";

export function PaymentPanel({
  invoiceId,
  orderId,
  initialStatus,
  initialPaidAmount,
  total,
}: {
  invoiceId: string;
  orderId: string;
  initialStatus: InvoiceStatus;
  initialPaidAmount: number;
  total: number;
}) {
  const [status, setStatus] = useState<InvoiceStatus>(initialStatus);
  // Kept as a string while editing — a controlled number-typed input can't
  // hold "020" style raw keystrokes or a temporarily-blank field.
  const [paidAmount, setPaidAmount] = useState(String(initialPaidAmount));
  const [pending, startTransition] = useTransition();
  const { showToast } = useToast();
  const paidAmountValue = Number(paidAmount) || 0;

  function save() {
    startTransition(async () => {
      await updateInvoicePaymentStatus(invoiceId, orderId, status, paidAmountValue);
      showToast("success", "পেমেন্ট তথ্য হালনাগাদ হয়েছে।");
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="mb-3 text-sm font-semibold text-ink">অর্ডারের অবস্থা ও পেমেন্ট</h2>
      <div className="space-y-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink-soft">ইনভয়েসের অবস্থা</label>
          <Select value={status} onChange={(e) => setStatus(e.target.value as InvoiceStatus)}>
            {INVOICE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {INVOICE_STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink-soft">পরিশোধিত টাকা</label>
          <Input
            type="number"
            min={0}
            max={total}
            value={paidAmount}
            onChange={(e) => setPaidAmount(e.target.value)}
          />
          <p className="mt-1 text-xs text-ink-faint">
            বাকি: ৳ {Math.max(total - paidAmountValue, 0).toLocaleString("en-BD")}
          </p>
        </div>
        <Button type="button" size="sm" disabled={pending} onClick={save}>
          {pending ? "হালনাগাদ হচ্ছে…" : "হালনাগাদ করুন"}
        </Button>
      </div>
    </div>
  );
}
