"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FormField, Input, Textarea, Checkbox } from "@/components/ui/FormField";
import { UploadField } from "@/components/admin/UploadField";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import type { PortfolioItem } from "@/lib/types";
import type { PortfolioFormState } from "./actions";

const initialState: PortfolioFormState = {};

export function PortfolioForm({
  item,
  action,
}: {
  item?: PortfolioItem;
  action: (state: PortfolioFormState, formData: FormData) => Promise<PortfolioFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (state.message && !state.errors) {
      showToast("error", state.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <UploadField
        name="image"
        label="প্রকল্পের ছবি"
        existingUrl={item?.image_url}
        required={!item}
        aspect="aspect-[4/3]"
        specKey="portfolioWork"
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="শিরোনাম" name="title" required error={state.errors?.title?.[0]}>
          <Input id="title" name="title" defaultValue={item?.title ?? ""} required />
        </FormField>
        <FormField label="ক্যাটাগরি" name="category" hint="যেমন: সাইনবোর্ড, ব্যানার, ব্র্যান্ডিং">
          <Input id="category" name="category" defaultValue={item?.category ?? ""} />
        </FormField>
      </div>

      <FormField label="বিবরণ" name="description">
        <Textarea id="description" name="description" rows={3} defaultValue={item?.description ?? ""} />
      </FormField>

      <FormField label="ছবির বিকল্প লেখা (Alt Text)" name="alt_text" hint="শিরোনাম না থাকলে এটি ব্যবহৃত হবে">
        <Input id="alt_text" name="alt_text" defaultValue={item?.alt_text ?? ""} />
      </FormField>

      <div className="flex flex-wrap items-center gap-8">
        <FormField label="ক্রম" name="display_order" hint="ছোট সংখ্যা আগে দেখাবে">
          <Input
            id="display_order"
            name="display_order"
            type="number"
            className="w-28"
            defaultValue={item?.display_order ?? 0}
          />
        </FormField>
        <div className="flex gap-6 pt-6">
          <Checkbox name="is_active" label="সক্রিয়" defaultChecked={item?.is_active ?? true} />
          <Checkbox
            name="is_featured"
            label="হোমপেজে ফিচার করুন"
            defaultChecked={item?.is_featured ?? false}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "সংরক্ষণ হচ্ছে…" : item ? "সংরক্ষণ করুন" : "প্রকল্প যোগ করুন"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/portfolio")}>
          বাতিল
        </Button>
      </div>
    </form>
  );
}
