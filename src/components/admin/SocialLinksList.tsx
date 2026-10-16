"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/FormField";
import type { SocialLink } from "@/lib/types";

export function SocialLinksList({
  name,
  initialItems,
}: {
  name: string;
  initialItems: SocialLink[];
}) {
  const [items, setItems] = useState<SocialLink[]>(initialItems);

  function update(index: number, patch: Partial<SocialLink>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function remove(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function add() {
    setItems((prev) => [...prev, { platform: "", url: "" }]);
  }

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <Input
              placeholder="প্ল্যাটফর্ম (যেমন: Facebook)"
              value={item.platform}
              onChange={(e) => update(i, { platform: e.target.value })}
              className="w-40 shrink-0"
            />
            <Input
              placeholder="https://…"
              value={item.url}
              onChange={(e) => update(i, { url: e.target.value })}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label="লিংক সরান"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-faint hover:bg-accent-50 hover:text-danger"
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
        সোশ্যাল লিংক যোগ করুন
      </button>
    </div>
  );
}
