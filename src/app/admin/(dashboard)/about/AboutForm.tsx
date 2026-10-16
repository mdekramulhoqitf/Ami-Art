"use client";

import { useActionState, useEffect } from "react";
import { FormField, Input, Textarea, Checkbox } from "@/components/ui/FormField";
import { UploadField } from "@/components/admin/UploadField";
import { RepeatableList } from "@/components/admin/RepeatableList";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { updateAboutContent, type AboutFormState } from "./actions";
import type { AboutContent } from "@/lib/types";

const initialState: AboutFormState = {};

export function AboutForm({ about }: { about: AboutContent }) {
  const [state, formAction, pending] = useActionState(updateAboutContent, initialState);
  const { showToast } = useToast();

  useEffect(() => {
    if (state.message) {
      showToast(state.success ? "success" : "error", state.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="max-w-2xl space-y-8">
      <FormField label="শিরোনাম" name="heading" required error={state.errors?.heading?.[0]}>
        <Input id="heading" name="heading" defaultValue={about.heading} required />
      </FormField>

      <FormField label="আমাদের গল্প" name="story" required error={state.errors?.story?.[0]}>
        <Textarea id="story" name="story" rows={5} defaultValue={about.story} required />
      </FormField>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="লক্ষ্য" name="mission" required error={state.errors?.mission?.[0]}>
          <Textarea id="mission" name="mission" rows={3} defaultValue={about.mission} required />
        </FormField>
        <FormField label="ভবিষ্যৎ পরিকল্পনা" name="vision" required error={state.errors?.vision?.[0]}>
          <Textarea id="vision" name="vision" rows={3} defaultValue={about.vision} required />
        </FormField>
      </div>

      <UploadField name="image" label="About পাতার ছবি" existingUrl={about.image_url} aspect="aspect-video" specKey="aboutImage" />

      <div>
        <h3 className="mb-2 text-sm font-medium text-ink">কেন আমাদের বেছে নেবেন</h3>
        <RepeatableList name="why_choose_us" initialItems={about.why_choose_us} itemLabel="কারণ" />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-ink">কাজের ধাপ</h3>
        <RepeatableList name="process_steps" initialItems={about.process_steps} itemLabel="ধাপ" />
      </div>

      <div className="rounded-2xl border border-border bg-muted p-5">
        <h3 className="mb-1 text-sm font-semibold text-ink">হোমপেজ মালিক সেকশন</h3>
        <p className="mb-4 text-xs text-ink-soft">
          হোমপেজে &ldquo;দোকানের স্বত্বাধিকারী&rdquo; সেকশন হিসেবে দেখানো হবে। খালি রাখা ফিল্ড হোমপেজে দেখানো হবে
          না — আলাদা কোনো পাতা তৈরি হয় না।
        </p>

        <UploadField
          name="owner_image"
          label="মালিকের ছবি"
          existingUrl={about.owner_image_url}
          aspect="aspect-[4/5]"
          specKey="ownerPhoto"
        />

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="নাম" name="owner_name" error={state.errors?.owner_name?.[0]}>
            <Input id="owner_name" name="owner_name" defaultValue={about.owner_name ?? ""} placeholder="যেমন: মনোজ হাওলাদার" />
          </FormField>
          <FormField label="পদবি" name="owner_designation">
            <Input
              id="owner_designation"
              name="owner_designation"
              defaultValue={about.owner_designation ?? ""}
              placeholder="স্বত্বাধিকারী, Ami Art"
            />
          </FormField>
        </div>

        <FormField label="সংক্ষিপ্ত পরিচিতি" name="owner_short_bio" hint="১-২ লাইন, হোমপেজে দেখা যাবে">
          <Textarea
            id="owner_short_bio"
            name="owner_short_bio"
            rows={2}
            defaultValue={about.owner_short_bio ?? ""}
            className="mt-1.5"
          />
        </FormField>

        <FormField label="বিস্তারিত পরিচিতি" name="owner_bio" hint="ঐচ্ছিক — আরও বিস্তারিত হলে এখানে লিখুন">
          <Textarea id="owner_bio" name="owner_bio" rows={4} defaultValue={about.owner_bio ?? ""} className="mt-1.5" />
        </FormField>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="অভিজ্ঞতা" name="owner_experience" hint="ঐচ্ছিক">
            <Input id="owner_experience" name="owner_experience" defaultValue={about.owner_experience ?? ""} placeholder="১০+ বছর" />
          </FormField>
          <FormField label="অবস্থান" name="owner_location" hint="ঐচ্ছিক">
            <Input id="owner_location" name="owner_location" defaultValue={about.owner_location ?? ""} placeholder="বরগুনা" />
          </FormField>
          <FormField label="ফোন" name="owner_phone" hint="ঐচ্ছিক" error={state.errors?.owner_phone?.[0]}>
            <Input id="owner_phone" name="owner_phone" defaultValue={about.owner_phone ?? ""} />
          </FormField>
          <FormField label="ই-মেইল" name="owner_email" hint="ঐচ্ছিক" error={state.errors?.owner_email?.[0]}>
            <Input id="owner_email" name="owner_email" type="email" defaultValue={about.owner_email ?? ""} />
          </FormField>
          <FormField label="CTA লেখা" name="owner_cta_text" hint="ঐচ্ছিক">
            <Input id="owner_cta_text" name="owner_cta_text" defaultValue={about.owner_cta_text ?? ""} placeholder="যোগাযোগ করুন" />
          </FormField>
          <FormField label="CTA লিংক" name="owner_cta_link" hint="ঐচ্ছিক" error={state.errors?.owner_cta_link?.[0]}>
            <Input id="owner_cta_link" name="owner_cta_link" defaultValue={about.owner_cta_link ?? ""} placeholder="/contact" />
          </FormField>
        </div>

        <div className="mt-4">
          <Checkbox name="owner_show" label="হোমপেজে দেখান" defaultChecked={about.owner_show ?? false} />
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "সংরক্ষণ হচ্ছে…" : "সংরক্ষণ করুন"}
      </Button>
    </form>
  );
}
