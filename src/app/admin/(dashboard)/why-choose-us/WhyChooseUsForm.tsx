"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FormField, Input, Textarea, Select, Checkbox } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { WHY_CHOOSE_US_ICONS } from "@/components/site/why-choose-us-icons";
import type { WhyChooseUsItem } from "@/lib/types";
import type { WhyChooseUsFormState } from "./actions";

const initialState: WhyChooseUsFormState = {};

export function WhyChooseUsForm({
  item,
  action,
}: {
  item?: WhyChooseUsItem;
  action: (state: WhyChooseUsFormState, formData: FormData) => Promise<WhyChooseUsFormState>;
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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="শিরোনাম" name="title" required error={state.errors?.title?.[0]}>
          <Input
            id="title"
            name="title"
            defaultValue={item?.title ?? ""}
            placeholder="যেমন: প্রয়োজন বুঝে গাইড করা"
            required
          />
        </FormField>
        <FormField label="আইকন" name="icon" hint="তালিকায় ছোট আইকন হিসেবে দেখাবে">
          <Select id="icon" name="icon" defaultValue={item?.icon ?? ""}>
            <option value="">ডিফল্ট</option>
            {Object.keys(WHY_CHOOSE_US_ICONS).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField label="বিবরণ" name="description" required error={state.errors?.description?.[0]}>
        <Textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={item?.description ?? ""}
          placeholder="সংক্ষিপ্ত, স্পষ্ট বিবরণ — এক-দুই লাইন যথেষ্ট"
          required
        />
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
        <div className="pt-6">
          <Checkbox name="is_active" label="সক্রিয় (ওয়েবসাইটে দেখাবে)" defaultChecked={item?.is_active ?? true} />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "সংরক্ষণ হচ্ছে…" : item ? "সংরক্ষণ করুন" : "সুবিধা যোগ করুন"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/why-choose-us")}>
          বাতিল
        </Button>
      </div>
    </form>
  );
}
