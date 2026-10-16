"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FormField, Input, Textarea, Checkbox } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import type { FaqItem } from "@/lib/types";
import type { FaqFormState } from "./actions";

const initialState: FaqFormState = {};

export function FaqForm({
  item,
  action,
}: {
  item?: FaqItem;
  action: (state: FaqFormState, formData: FormData) => Promise<FaqFormState>;
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
      <FormField label="প্রশ্ন" name="question" required error={state.errors?.question?.[0]}>
        <Input
          id="question"
          name="question"
          defaultValue={item?.question ?? ""}
          placeholder="যেমন: কীভাবে অনলাইনে অর্ডার করব?"
          required
        />
      </FormField>

      <FormField label="উত্তর" name="answer" required error={state.errors?.answer?.[0]}>
        <Textarea
          id="answer"
          name="answer"
          rows={4}
          defaultValue={item?.answer ?? ""}
          placeholder="সহজ ভাষায় উত্তর লিখুন — গ্রাহক যেন ডিজাইন/প্রিন্টিং না বুঝেও বুঝতে পারেন।"
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
          {pending ? "সংরক্ষণ হচ্ছে…" : item ? "সংরক্ষণ করুন" : "প্রশ্ন যোগ করুন"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/faq")}>
          বাতিল
        </Button>
      </div>
    </form>
  );
}
