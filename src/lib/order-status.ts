import type { OrderStatus } from "@/lib/types";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: "নতুন",
  viewed: "দেখা হয়েছে",
  contacted: "যোগাযোগ করা হয়েছে",
  in_progress: "কাজ চলছে",
  completed: "সম্পন্ন",
  cancelled: "বাতিল",
};

export const ORDER_STATUS_TONE: Record<OrderStatus, "primary" | "accent" | "neutral" | "success" | "danger"> = {
  new: "accent",
  viewed: "neutral",
  contacted: "primary",
  in_progress: "primary",
  completed: "success",
  cancelled: "danger",
};

export const ORDER_STATUSES: OrderStatus[] = [
  "new",
  "viewed",
  "contacted",
  "in_progress",
  "completed",
  "cancelled",
];
