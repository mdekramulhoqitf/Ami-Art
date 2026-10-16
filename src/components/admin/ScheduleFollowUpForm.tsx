"use client";

import { useId, useState, useTransition } from "react";
import { Select, Input } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import type { FollowUpReason } from "@/lib/types";
import { scheduleFollowUp } from "@/app/admin/(dashboard)/followups/actions";

const REASON_OPTIONS: { value: FollowUpReason; label: string }[] = [
  { value: "new_lead", label: "নতুন লিড" },
  { value: "interested_lead", label: "আগ্রহী লিড" },
  { value: "quotation_sent", label: "কোটেশন পাঠানো হয়েছে" },
  { value: "quotation_pending", label: "কোটেশন অপেক্ষমাণ" },
  { value: "negotiation", label: "আলোচনা চলছে" },
  { value: "order_confirmation", label: "অর্ডার নিশ্চিতকরণ" },
  { value: "production_update", label: "প্রোডাকশন আপডেট" },
  { value: "delivery", label: "ডেলিভারি" },
  { value: "post_order_checkin", label: "অর্ডার পরবর্তী খোঁজখবর" },
  { value: "repeat_opportunity", label: "পুনরায় অর্ডারের সুযোগ" },
  { value: "other", label: "অন্যান্য" },
];

export function ScheduleFollowUpForm({
  businessId,
  customerId,
  orderId,
  defaultReason = "interested_lead",
  defaultNotes,
  triggerLabel = "ফলো-আপ নির্ধারণ করুন",
  onScheduled,
}: {
  businessId?: string;
  customerId?: string;
  orderId?: string;
  /** Lets a specific context (e.g. a retention opportunity card) pre-select
      the right reason instead of always defaulting to "আগ্রহী লিড". */
  defaultReason?: FollowUpReason;
  defaultNotes?: string;
  triggerLabel?: string;
  onScheduled?: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [reason, setReason] = useState<FollowUpReason>(defaultReason);
  const [date, setDate] = useState("");
  const [open, setOpen] = useState(false);
  // Unique per instance — this form now renders multiple times on one page
  // (one per retention-opportunity row), so a hardcoded id would duplicate
  // across instances and break label association for every row after the
  // first.
  const reasonId = useId();
  const dateId = useId();

  if (!open) {
    return (
      <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
        {triggerLabel}
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-end gap-2 rounded-lg border border-border p-3">
      <div>
        <label htmlFor={reasonId} className="mb-1 block text-xs text-ink-soft">
          কারণ
        </label>
        <Select
          id={reasonId}
          value={reason}
          onChange={(e) => setReason(e.target.value as FollowUpReason)}
          className="w-auto"
        >
          {REASON_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <label htmlFor={dateId} className="mb-1 block text-xs text-ink-soft">
          তারিখ
        </label>
        <Input
          id={dateId}
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-auto"
        />
      </div>
      <Button
        size="sm"
        disabled={pending || !date}
        onClick={() =>
          startTransition(async () => {
            await scheduleFollowUp({
              businessId,
              customerId,
              orderId,
              reason,
              scheduledAt: new Date(date).toISOString(),
              notes: defaultNotes,
            });
            setOpen(false);
            setDate("");
            onScheduled?.();
          })
        }
      >
        সংরক্ষণ
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
        বাতিল
      </Button>
    </div>
  );
}
