"use client";

import { useActionState, useEffect } from "react";
import { FormField, Input, Checkbox } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { updateDeliverySettings, type DeliverySettingsFormState } from "./actions";
import type { DeliverySettings } from "@/lib/types";

const initialState: DeliverySettingsFormState = {};

export function DeliverySettingsForm({ deliverySettings }: { deliverySettings: DeliverySettings }) {
  const [state, formAction, pending] = useActionState(updateDeliverySettings, initialState);
  const { showToast } = useToast();

  useEffect(() => {
    if (state.message) {
      showToast(state.success ? "success" : "error", state.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="max-w-2xl space-y-6 rounded-2xl border border-border bg-surface p-6">
      <div>
        <h2 className="text-base font-semibold text-ink">ডেলিভারি সেটিংস</h2>
        <p className="mt-1 text-sm text-ink-soft">
          কুরিয়ার ও স্থানীয় ডেলিভারি চার্জ নির্ধারণ করুন — ইনভয়েস তৈরির সময় এই মূল্য স্বয়ংক্রিয়ভাবে
          পূরণ হবে।
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="কুরিয়ার চার্জ (৳)" name="courier_fee" error={state.errors?.courier_fee?.[0]}>
          <Input
            type="number"
            min={0}
            id="courier_fee"
            name="courier_fee"
            defaultValue={deliverySettings.courier_fee}
          />
        </FormField>
        <FormField label="স্থানীয় ডেলিভারি চার্জ (৳)" name="local_delivery_fee">
          <Input
            type="number"
            min={0}
            id="local_delivery_fee"
            name="local_delivery_fee"
            defaultValue={deliverySettings.local_delivery_fee}
          />
        </FormField>
      </div>

      <FormField
        label="ফ্রি ডেলিভারি সীমা (৳)"
        name="free_delivery_threshold"
        hint="ঐচ্ছিক — এই পরিমাণের বেশি অর্ডারে ডেলিভারি ফ্রি"
      >
        <Input
          type="number"
          min={0}
          id="free_delivery_threshold"
          name="free_delivery_threshold"
          defaultValue={deliverySettings.free_delivery_threshold ?? ""}
        />
      </FormField>

      <Checkbox name="enabled" label="ডেলিভারি সুবিধা সক্রিয়" defaultChecked={deliverySettings.enabled} />

      <Button type="submit" disabled={pending}>
        {pending ? "সংরক্ষণ হচ্ছে…" : "ডেলিভারি সেটিংস সংরক্ষণ করুন"}
      </Button>
    </form>
  );
}
