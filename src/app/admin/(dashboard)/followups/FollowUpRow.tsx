"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/FormField";
import type { FollowUpReason } from "@/lib/types";
import type { FollowUpWithTarget } from "@/lib/queries/followups";
import { markContacted, completeFollowUp, skipFollowUp, postponeFollowUp, addFollowUpNote } from "./actions";

const REASON_LABELS: Record<FollowUpReason, string> = {
  new_lead: "নতুন লিড",
  interested_lead: "আগ্রহী লিড",
  quotation_sent: "কোটেশন পাঠানো হয়েছে",
  quotation_pending: "কোটেশন অপেক্ষমাণ",
  negotiation: "আলোচনা চলছে",
  order_confirmation: "অর্ডার নিশ্চিতকরণ",
  production_update: "প্রোডাকশন আপডেট",
  delivery: "ডেলিভারি",
  post_order_checkin: "অর্ডার পরবর্তী খোঁজখবর",
  repeat_opportunity: "পুনরায় অর্ডারের সুযোগ",
  other: "অন্যান্য",
};

export function FollowUpRow({ item, tone }: { item: FollowUpWithTarget; tone: "danger" | "primary" | "neutral" }) {
  const [pending, startTransition] = useTransition();
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState("");

  const targetHref = item.business_id
    ? `/admin/businesses/${item.business_id}`
    : item.customer_id
      ? `/admin/customers/${item.customer_id}`
      : null;
  const targetName = item.business_name ?? item.customer_name ?? "—";

  return (
    <li className="rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          {targetHref ? (
            <Link href={targetHref} className="text-sm font-semibold text-ink hover:text-primary-700">
              {targetName}
            </Link>
          ) : (
            <p className="text-sm font-semibold text-ink">{targetName}</p>
          )}
          <p className="mt-0.5 text-xs text-ink-faint">
            {REASON_LABELS[item.reason]} ·{" "}
            {new Date(item.scheduled_at).toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
        <Badge tone={tone}>
          {tone === "danger" ? "বকেয়া" : tone === "primary" ? "আজ" : "আসন্ন"}
        </Badge>
      </div>

      {item.notes && <p className="mt-2 whitespace-pre-wrap text-xs text-ink-soft">{item.notes}</p>}
      {item.next_action && (
        <p className="mt-1 text-xs text-ink-faint">পরবর্তী পদক্ষেপ: {item.next_action}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="cta"
          disabled={pending}
          onClick={() => startTransition(() => markContacted(item.id))}
        >
          যোগাযোগ হয়েছে
        </Button>
        <Button
          size="sm"
          variant="cta"
          disabled={pending}
          onClick={() => startTransition(() => completeFollowUp(item.id))}
        >
          সম্পন্ন
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={pending}
          onClick={() => {
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 3);
            startTransition(() => postponeFollowUp(item.id, nextWeek.toISOString()));
          }}
        >
          ৩ দিন পরে করবো
        </Button>
        <Button size="sm" variant="ghost" disabled={pending} onClick={() => setShowNote((s) => !s)}>
          নোট যোগ করুন
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={() => startTransition(() => skipFollowUp(item.id))}
        >
          বাদ দিন
        </Button>
      </div>

      {showNote && (
        <div className="mt-3 flex gap-2">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="একটি নোট লিখুন..."
            aria-label="ফলো-আপ নোট"
            className="flex-1"
          />
          <Button
            size="sm"
            disabled={pending || !note.trim()}
            onClick={() =>
              startTransition(async () => {
                await addFollowUpNote(item.id, note);
                setNote("");
                setShowNote(false);
              })
            }
          >
            সংরক্ষণ
          </Button>
        </div>
      )}
    </li>
  );
}
