"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "../actions";
import { ORDER_STATUS_LABELS, ORDER_STATUSES } from "@/lib/order-status";
import type { OrderStatus } from "@/lib/types";

export function StatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as OrderStatus;
        startTransition(() => updateOrderStatus(orderId, next));
      }}
      className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm font-medium focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 disabled:opacity-60"
    >
      {ORDER_STATUSES.map((s) => (
        <option key={s} value={s}>
          {ORDER_STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}
