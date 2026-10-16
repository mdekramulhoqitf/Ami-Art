import type { InvoiceStatus } from "@/lib/types";

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "খসড়া",
  sent: "পাঠানো হয়েছে",
  pending: "গ্রহণযোগ্য / অপেক্ষমাণ",
  paid: "পরিশোধিত",
  partial: "আংশিক পরিশোধিত",
  cancelled: "বাতিল",
};

export const INVOICE_STATUS_TONE: Record<InvoiceStatus, "primary" | "accent" | "neutral" | "success" | "danger"> = {
  draft: "neutral",
  sent: "primary",
  pending: "accent",
  paid: "success",
  partial: "accent",
  cancelled: "danger",
};

export const INVOICE_STATUSES: InvoiceStatus[] = ["draft", "sent", "pending", "paid", "partial", "cancelled"];

export type PaymentBadge = "paid" | "partial" | "due";

/** Payment state is always derived from paid_amount vs total — never stored,
    never out of sync. `redeemedAmount` (an actually-applied reward
    redemption, if any) is folded in only for this derivation — it never
    redefines paid_amount itself, which stays exactly what was received in
    cash. Without this, a fully reward-settled invoice (paid_amount still 0)
    would misleadingly read "বাকি" even though nothing is actually owed. */
export function getPaymentBadge(total: number, paidAmount: number, redeemedAmount = 0): PaymentBadge {
  const settled = paidAmount + redeemedAmount;
  if (settled >= total && total > 0) return "paid";
  if (settled > 0) return "partial";
  return "due";
}

export const PAYMENT_BADGE_LABELS: Record<PaymentBadge, string> = {
  paid: "পরিশোধিত",
  partial: "আংশিক পরিশোধিত",
  due: "বাকি",
};

export const PAYMENT_BADGE_TONE: Record<PaymentBadge, "success" | "accent" | "danger"> = {
  paid: "success",
  partial: "accent",
  due: "danger",
};

export const DELIVERY_METHOD_LABELS: Record<string, string> = {
  pickup: "দোকান থেকে সংগ্রহ",
  courier: "কুরিয়ার ডেলিভারি",
  local_delivery: "স্থানীয় ডেলিভারি",
  other: "অন্যান্য",
};
