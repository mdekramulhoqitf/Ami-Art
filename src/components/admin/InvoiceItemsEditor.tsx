"use client";

import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/FormField";

// Quantity/unit price are kept as the raw string the admin is typing (not
// number) so a controlled input never fights their keystrokes — see
// InvoiceForm.tsx for why. Coerced to numbers only where calculation or
// submission actually needs a number.
export type InvoiceItemDraft = {
  service_name: string;
  quantity: string;
  unit_price: string;
};

export function InvoiceItemsEditor({
  items,
  onChange,
}: {
  items: InvoiceItemDraft[];
  onChange: (items: InvoiceItemDraft[]) => void;
}) {
  function update(index: number, patch: Partial<InvoiceItemDraft>) {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function add() {
    onChange([...items, { service_name: "", quantity: "1", unit_price: "" }]);
  }

  return (
    <div>
      <div className="hidden grid-cols-[1fr_90px_120px_120px_36px] gap-2 px-1 pb-1.5 text-xs font-medium text-ink-faint sm:grid">
        <span>সেবার নাম</span>
        <span>পরিমাণ</span>
        <span>একক মূল্য</span>
        <span>মোট</span>
        <span />
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="grid grid-cols-2 gap-2 rounded-lg border border-border p-3 sm:grid-cols-[1fr_90px_120px_120px_36px] sm:items-center sm:border-0 sm:p-0"
          >
            <Input
              className="col-span-2 sm:col-span-1"
              placeholder="সেবার নাম"
              value={item.service_name}
              onChange={(e) => update(i, { service_name: e.target.value })}
            />
            <Input
              type="number"
              min={0}
              placeholder="পরিমাণ"
              value={item.quantity}
              onChange={(e) => update(i, { quantity: e.target.value })}
            />
            <Input
              type="number"
              min={0}
              placeholder="একক মূল্য"
              value={item.unit_price}
              onChange={(e) => update(i, { unit_price: e.target.value })}
            />
            <div className="flex items-center text-sm font-medium text-ink">
              ৳ {((Number(item.quantity) || 0) * (Number(item.unit_price) || 0)).toLocaleString("en-BD")}
            </div>
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label="সেবাটি সরান"
              className="flex h-10 w-10 items-center justify-center justify-self-end rounded-lg text-ink-faint hover:bg-accent-50 hover:text-danger sm:justify-self-auto"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="mt-3 flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:underline"
      >
        <Plus className="h-4 w-4" />
        নতুন সেবা যোগ করুন
      </button>
    </div>
  );
}
