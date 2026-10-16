"use client";

import { Plus, Trash2 } from "lucide-react";
import { FormField, Input, Textarea } from "@/components/ui/FormField";
import type { ProductCategory } from "@/lib/types";

export type TshirtSizeRow = { size: string; quantity: string };

export type CustomFieldsValue = {
  width?: string;
  height?: string;
  text?: string;
  color?: string;
  sizes?: TshirtSizeRow[];
  special_instructions?: string;
  player_name?: string;
  player_number?: string;
  size?: string;
  sponsor_info?: string;
  business_name?: string;
  business_type?: string;
  sections_needed?: string;
  facebook_url?: string;
  whatsapp?: string;
  google_maps_url?: string;
  reference_website?: string;
};

const TSHIRT_SIZES = ["S", "M", "L", "XL", "XXL"];

export function OrderProductFields({
  category,
  value,
  onChange,
  errors,
}: {
  category: ProductCategory;
  value: CustomFieldsValue;
  onChange: (value: CustomFieldsValue) => void;
  errors?: Record<string, string>;
}) {
  function set<K extends keyof CustomFieldsValue>(key: K, v: CustomFieldsValue[K]) {
    onChange({ ...value, [key]: v });
  }

  if (category === "banner" || category === "signboard") {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="প্রস্থ" name="width" required error={errors?.width} hint="যেমন: ১২ ফুট">
          <Input value={value.width ?? ""} onChange={(e) => set("width", e.target.value)} />
        </FormField>
        <FormField label="উচ্চতা" name="height" required error={errors?.height} hint="যেমন: ৪ ফুট">
          <Input value={value.height ?? ""} onChange={(e) => set("height", e.target.value)} />
        </FormField>
      </div>
    );
  }

  if (category === "mug") {
    return (
      <FormField label="মগে যা লেখা থাকবে" name="text" hint="ঐচ্ছিক">
        <Input
          value={value.text ?? ""}
          onChange={(e) => set("text", e.target.value)}
          placeholder="নাম, বার্তা বা লেখা"
        />
      </FormField>
    );
  }

  if (category === "tshirt") {
    const sizes = value.sizes ?? [{ size: "M", quantity: "" }];
    return (
      <div className="space-y-4">
        <FormField label="টি-শার্টের রঙ" name="color" hint="ঐচ্ছিক">
          <Input value={value.color ?? ""} onChange={(e) => set("color", e.target.value)} />
        </FormField>

        <div>
          <p className="mb-2 text-sm font-medium text-ink">সাইজ ও পরিমাণ</p>
          <div className="space-y-2">
            {sizes.map((row, i) => (
              <div key={i} className="flex items-center gap-2">
                <select
                  value={row.size}
                  onChange={(e) => {
                    const next = [...sizes];
                    next[i] = { ...row, size: e.target.value };
                    set("sizes", next);
                  }}
                  className="rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                >
                  {TSHIRT_SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <Input
                  type="number"
                  min={0}
                  placeholder="পরিমাণ"
                  value={row.quantity}
                  onChange={(e) => {
                    const next = [...sizes];
                    next[i] = { ...row, quantity: e.target.value };
                    set("sizes", next);
                  }}
                />
                <button
                  type="button"
                  onClick={() => set("sizes", sizes.filter((_, idx) => idx !== i))}
                  aria-label="সরান"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-faint hover:bg-accent-50 hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => set("sizes", [...sizes, { size: "M", quantity: "" }])}
            className="mt-2 flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:underline"
          >
            <Plus className="h-4 w-4" />
            নতুন সাইজ যোগ করুন
          </button>
        </div>

        <FormField label="বিশেষ নির্দেশনা" name="special_instructions" hint="ঐচ্ছিক">
          <Textarea
            rows={2}
            value={value.special_instructions ?? ""}
            onChange={(e) => set("special_instructions", e.target.value)}
          />
        </FormField>
      </div>
    );
  }

  if (category === "jersey") {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="নাম" name="player_name" hint="ঐচ্ছিক">
          <Input value={value.player_name ?? ""} onChange={(e) => set("player_name", e.target.value)} />
        </FormField>
        <FormField label="নম্বর" name="player_number" hint="ঐচ্ছিক">
          <Input value={value.player_number ?? ""} onChange={(e) => set("player_number", e.target.value)} />
        </FormField>
        <FormField label="সাইজ" name="size" hint="ঐচ্ছিক">
          <Input value={value.size ?? ""} onChange={(e) => set("size", e.target.value)} />
        </FormField>
        <FormField label="স্পনসর তথ্য" name="sponsor_info" hint="ঐচ্ছিক">
          <Input value={value.sponsor_info ?? ""} onChange={(e) => set("sponsor_info", e.target.value)} />
        </FormField>
      </div>
    );
  }

  if (category === "website") {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label="ব্যবসার নাম" name="business_name" hint="ঐচ্ছিক">
            <Input value={value.business_name ?? ""} onChange={(e) => set("business_name", e.target.value)} />
          </FormField>
          <FormField label="ব্যবসার ধরন" name="business_type" hint="ঐচ্ছিক">
            <Input value={value.business_type ?? ""} onChange={(e) => set("business_type", e.target.value)} />
          </FormField>
        </div>
        <FormField label="কী কী সেকশন প্রয়োজন" name="sections_needed" hint="ঐচ্ছিক">
          <Textarea
            rows={2}
            placeholder="যেমন: হোম, সেবা, যোগাযোগ, গ্যালারি"
            value={value.sections_needed ?? ""}
            onChange={(e) => set("sections_needed", e.target.value)}
          />
        </FormField>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label="Facebook পেজ" name="facebook_url" hint="ঐচ্ছিক">
            <Input value={value.facebook_url ?? ""} onChange={(e) => set("facebook_url", e.target.value)} />
          </FormField>
          <FormField label="WhatsApp নম্বর" name="whatsapp" hint="ঐচ্ছিক">
            <Input value={value.whatsapp ?? ""} onChange={(e) => set("whatsapp", e.target.value)} />
          </FormField>
          <FormField label="Google Maps লিংক" name="google_maps_url" hint="ঐচ্ছিক">
            <Input value={value.google_maps_url ?? ""} onChange={(e) => set("google_maps_url", e.target.value)} />
          </FormField>
          <FormField label="রেফারেন্স ওয়েবসাইট" name="reference_website" hint="ঐচ্ছিক">
            <Input value={value.reference_website ?? ""} onChange={(e) => set("reference_website", e.target.value)} />
          </FormField>
        </div>
      </div>
    );
  }

  return null;
}
