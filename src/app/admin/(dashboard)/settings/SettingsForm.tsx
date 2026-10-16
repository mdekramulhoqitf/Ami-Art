"use client";

import { useActionState, useEffect } from "react";
import { FormField, Input, Textarea } from "@/components/ui/FormField";
import { RepeatableList } from "@/components/admin/RepeatableList";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { updateSiteSettings, type SiteSettingsFormState } from "./actions";
import type { SiteSettings } from "@/lib/types";

const initialState: SiteSettingsFormState = {};

export function SettingsForm({ siteSettings }: { siteSettings: SiteSettings }) {
  const [state, formAction, pending] = useActionState(updateSiteSettings, initialState);
  const { showToast } = useToast();

  useEffect(() => {
    if (state.message) {
      showToast(state.success ? "success" : "error", state.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="max-w-2xl space-y-10">
      <section className="space-y-5">
        <h2 className="text-base font-semibold text-ink">সাধারণ</h2>
        <FormField
          label="প্রতিষ্ঠানের নাম"
          name="business_name"
          required
          error={state.errors?.business_name?.[0]}
        >
          <Input id="business_name" name="business_name" defaultValue={siteSettings.business_name} required />
        </FormField>
        <FormField label="ট্যাগলাইন" name="tagline" required error={state.errors?.tagline?.[0]}>
          <Input id="tagline" name="tagline" defaultValue={siteSettings.tagline} required />
        </FormField>
      </section>

      <section className="space-y-5">
        <h2 className="text-base font-semibold text-ink">হোমপেজ পরিচিতি</h2>
        <FormField
          label="পরিচিতি শিরোনাম"
          name="intro_heading"
          required
          error={state.errors?.intro_heading?.[0]}
        >
          <Input id="intro_heading" name="intro_heading" defaultValue={siteSettings.intro_heading} required />
        </FormField>
        <FormField
          label="পরিচিতি বিবরণ"
          name="intro_body"
          required
          error={state.errors?.intro_body?.[0]}
        >
          <Textarea id="intro_body" name="intro_body" rows={3} defaultValue={siteSettings.intro_body} required />
        </FormField>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-ink">ট্রাস্ট ব্যাজ</h2>
        <p className="mb-3 text-sm text-ink-soft">হোমপেজের উপরের দিকে দেখানো সংক্ষিপ্ত হাইলাইট।</p>
        <RepeatableList name="trust_badges" initialItems={siteSettings.trust_badges} itemLabel="ব্যাজ" />
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-ink">আমাদের সক্ষমতা</h2>
        <p className="mb-3 text-sm text-ink-soft">
          হোমপেজের &quot;ডিজাইন থেকে প্রিন্ট—সবকিছু এক জায়গা থেকে&quot; সেকশনে দেখানো হয়।
        </p>
        <RepeatableList
          name="capability_highlights"
          initialItems={siteSettings.capability_highlights}
          itemLabel="আইটেম"
        />
      </section>

      <section className="space-y-5">
        <h2 className="text-base font-semibold text-ink">SEO</h2>
        <FormField
          label="মেটা টাইটেল"
          name="meta_title"
          required
          error={state.errors?.meta_title?.[0]}
        >
          <Input id="meta_title" name="meta_title" defaultValue={siteSettings.meta_title} required />
        </FormField>
        <FormField
          label="মেটা বিবরণ"
          name="meta_description"
          required
          error={state.errors?.meta_description?.[0]}
        >
          <Textarea
            id="meta_description"
            name="meta_description"
            rows={2}
            defaultValue={siteSettings.meta_description}
            required
          />
        </FormField>
      </section>

      <Button type="submit" disabled={pending}>
        {pending ? "সংরক্ষণ হচ্ছে…" : "সেটিংস সংরক্ষণ করুন"}
      </Button>
    </form>
  );
}
