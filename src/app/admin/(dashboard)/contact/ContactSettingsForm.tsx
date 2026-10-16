"use client";

import { useActionState, useEffect } from "react";
import { FormField, Input, Textarea } from "@/components/ui/FormField";
import { SocialLinksList } from "@/components/admin/SocialLinksList";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { updateContactSettings, type ContactSettingsFormState } from "./actions";
import type { ContactSettings } from "@/lib/types";

const initialState: ContactSettingsFormState = {};

export function ContactSettingsForm({ contactSettings }: { contactSettings: ContactSettings }) {
  const [state, formAction, pending] = useActionState(updateContactSettings, initialState);
  const { showToast } = useToast();

  useEffect(() => {
    if (state.message) {
      showToast(state.success ? "success" : "error", state.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="মোবাইল নম্বর" name="phone" required error={state.errors?.phone?.[0]}>
          <Input id="phone" name="phone" defaultValue={contactSettings.phone} required />
        </FormField>
        <FormField label="ই-মেইল" name="email" required error={state.errors?.email?.[0]}>
          <Input id="email" name="email" type="email" defaultValue={contactSettings.email} required />
        </FormField>
      </div>

      <FormField label="ঠিকানা" name="address" required error={state.errors?.address?.[0]}>
        <Textarea id="address" name="address" rows={2} defaultValue={contactSettings.address} required />
      </FormField>

      <FormField
        label="ম্যাপ এমবেড URL"
        name="map_embed_url"
        hint="Google Maps এমবেড লিংক"
        error={state.errors?.map_embed_url?.[0]}
      >
        <Input
          id="map_embed_url"
          name="map_embed_url"
          defaultValue={contactSettings.map_embed_url ?? ""}
        />
      </FormField>

      <div>
        <h3 className="mb-2 text-sm font-medium text-ink">সোশ্যাল লিংক</h3>
        <SocialLinksList name="social_links" initialItems={contactSettings.social_links} />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "সংরক্ষণ হচ্ছে…" : "সংরক্ষণ করুন"}
      </Button>
    </form>
  );
}
