"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FormField, Input, Textarea, Checkbox } from "@/components/ui/FormField";
import { UploadField } from "@/components/admin/UploadField";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import type { HeroSlide } from "@/lib/types";
import { removeHeroSlideMobileImage, type HeroSlideFormState } from "./actions";

const initialState: HeroSlideFormState = {};

export function HeroSlideForm({
  slide,
  action,
}: {
  slide?: HeroSlide;
  action: (state: HeroSlideFormState, formData: FormData) => Promise<HeroSlideFormState>;
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
    <form action={formAction} className="space-y-6">
      <UploadField
        name="image"
        bucket="hero-sliders"
        label="ডেস্কটপ ব্যানার"
        existingUrl={slide?.image_url}
        required={!slide}
        aspect="aspect-[16/7]"
        specKey="homepageHero"
      />

      <div>
        <UploadField
          name="mobile_image"
          bucket="hero-sliders"
          label="মোবাইল ব্যানার"
          existingUrl={slide?.mobile_image_url}
          aspect="aspect-[4/5]"
          specKey="homepageHeroMobile"
        />
        <p className="mt-1.5 text-xs text-ink-faint">
          ফোনের জন্য আলাদা ব্যানার আপলোড করুন। এই ছবিটি মোবাইল স্ক্রিনে ব্যবহার হবে — না দিলে
          ডেস্কটপ ব্যানারই ক্রপ হয়ে দেখাবে।
        </p>
        {slide?.mobile_image_url && (
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-xs text-ink-soft">এই মোবাইল ব্যানারটি সরাতে চাইলে</span>
            <ConfirmDialog
              action={removeHeroSlideMobileImage.bind(null, slide.id)}
              title="মোবাইল ব্যানার মুছে ফেলুন"
              description="আপনি কি এই মোবাইল ব্যানারটি মুছে ফেলতে চান? ডেস্কটপ ব্যানারটি অপরিবর্তিত থাকবে।"
              confirmLabel="মুছে ফেলুন"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="শিরোনাম" name="title" error={state.errors?.title?.[0]}>
          <Input id="title" name="title" defaultValue={slide?.title ?? ""} />
        </FormField>
        <FormField label="ছবির বিকল্প লেখা (Alt Text)" name="alt_text" hint="শিরোনাম না থাকলে এটি ব্যবহৃত হবে">
          <Input id="alt_text" name="alt_text" defaultValue={slide?.alt_text ?? ""} />
        </FormField>
      </div>

      <FormField label="সাবটাইটেল" name="subtitle" error={state.errors?.subtitle?.[0]}>
        <Textarea
          id="subtitle"
          name="subtitle"
          rows={2}
          defaultValue={slide?.subtitle ?? ""}
        />
      </FormField>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="CTA লেবেল" name="cta_label" error={state.errors?.cta_label?.[0]}>
          <Input
            id="cta_label"
            name="cta_label"
            placeholder="যেমন: যোগাযোগ করুন"
            defaultValue={slide?.cta_label ?? ""}
          />
        </FormField>
        <FormField label="CTA URL" name="cta_url" error={state.errors?.cta_url?.[0]}>
          <Input
            id="cta_url"
            name="cta_url"
            placeholder="/contact"
            defaultValue={slide?.cta_url ?? ""}
          />
        </FormField>
      </div>

      <div className="flex items-center gap-8">
        <FormField label="ক্রম" name="display_order" hint="ছোট সংখ্যা আগে দেখাবে">
          <Input
            id="display_order"
            name="display_order"
            type="number"
            className="w-28"
            defaultValue={slide?.display_order ?? 0}
          />
        </FormField>
        <div className="pt-6">
          <Checkbox
            name="is_active"
            label="সক্রিয়"
            defaultChecked={slide?.is_active ?? true}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "সংরক্ষণ হচ্ছে…" : slide ? "সংরক্ষণ করুন" : "ব্যানার যোগ করুন"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/slider")}>
          বাতিল
        </Button>
      </div>
    </form>
  );
}
