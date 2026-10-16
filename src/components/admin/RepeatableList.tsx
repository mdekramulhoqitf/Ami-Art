"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Input } from "@/components/ui/FormField";

type Item = { title: string; description: string };

export function RepeatableList({
  name,
  initialItems,
  itemLabel = "আইটেম",
}: {
  name: string;
  initialItems: Item[];
  itemLabel?: string;
}) {
  const [items, setItems] = useState<Item[]>(
    initialItems.length > 0 ? initialItems : [{ title: "", description: "" }]
  );

  function update(index: number, patch: Partial<Item>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function remove(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function add() {
    setItems((prev) => [...prev, { title: "", description: "" }]);
  }

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-3 rounded-xl border border-border p-4">
            <GripVertical className="mt-2.5 h-4 w-4 shrink-0 text-ink-faint" />
            <div className="min-w-0 flex-1 space-y-2">
              <Input
                placeholder={`${itemLabel} শিরোনাম`}
                value={item.title}
                onChange={(e) => update(i, { title: e.target.value })}
              />
              <Input
                placeholder={`${itemLabel} বিবরণ`}
                value={item.description}
                onChange={(e) => update(i, { description: e.target.value })}
              />
            </div>
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label={`${itemLabel} সরান`}
              className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-faint hover:bg-accent-50 hover:text-danger"
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
        {itemLabel} যোগ করুন
      </button>
    </div>
  );
}
