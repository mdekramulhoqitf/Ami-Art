"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FormField, Input, Textarea, Select, Checkbox } from "@/components/ui/FormField";
import { UploadField } from "@/components/admin/UploadField";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { SECTION_BANNER_POSITIONS, SECTION_BANNER_OVERLAY_STYLES } from "@/lib/validation";
import type { SectionBanner } from "@/lib/types";
import { updateSectionBanner, removeSectionBannerImage, type SectionBannerFormState } from "./actions";

const POSITION_LABELS: Record<string, string> = {
  center: "মাঝখানে",
  top: "উপরে",
  bottom: "নিচে",
  left: "বামে",
  right: "ডানে",
};

const initialState: SectionBannerFormState = {};

export function SectionBannerForm({ banner, label }: { banner: SectionBanner; label: string }) {
  const action = updateSectionBanner.bind(null, banner.slug);
  const [state, formAction, pending] = useActionState(action, initialState);
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (state.message) {
      showToast(state.success ? "success" : "error", state.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <div>
        <UploadField
          name="image"
          bucket="about"
          label="কভার ছবি আপলোড করুন"
          existingUrl={banner.image_url}
          aspect="aspect-[21/9]"
          specKey="sectionBanner"
        />
        {banner.image_url && (
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-xs text-ink-soft">এই ছবিটি সরাতে চাইলে</span>
            <ConfirmDialog
              action={removeSectionBannerImage.bind(null, banner.slug)}
              title="এই কভার ছবিটি মুছে ফেলুন"
              description="আপনি কি এই কভার ছবিটি মুছে ফেলতে চান?"
              confirmLabel="মুছে ফেলুন"
            />
          </div>
        )}
      </div>

      <FormField label="শিরোনাম" name="title" hint={`ঐচ্ছিক — শুধু এডমিনে চেনার জন্য (যেমন: "${label}")`}>
        <Input id="title" name="title" defaultValue={banner.title ?? ""} placeholder={label} />
      </FormField>

      <FormField label="সংক্ষিপ্ত বিবরণ" name="short_description" hint="ঐচ্ছিক নোট">
        <Textarea
          id="short_description"
          name="short_description"
          rows={2}
          defaultValue={banner.short_description ?? ""}
        />
      </FormField>

      <FormField label="বিস্তারিত বিবরণ" name="detailed_description" hint="ঐচ্ছিক নোট">
        <Textarea
          id="detailed_description"
          name="detailed_description"
          rows={3}
          defaultValue={banner.detailed_description ?? ""}
        />
      </FormField>

      <FormField label="ছবির বিকল্প লেখা (Alt Text)" name="alt_text" hint="স্ক্রিন রিডার ও SEO-র জন্য">
        <Input id="alt_text" name="alt_text" defaultValue={banner.alt_text ?? ""} placeholder={label} />
      </FormField>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="ছবির অবস্থান" name="image_position" hint="ছবির কোন অংশ কেন্দ্রে দেখাবে">
          <Select id="image_position" name="image_position" defaultValue={banner.image_position}>
            {SECTION_BANNER_POSITIONS.map((p) => (
              <option key={p} value={p}>
                {POSITION_LABELS[p]}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="ওভারলে স্টাইল" name="overlay_style" hint="ওভারলে চালু থাকলে প্রযোজ্য">
          <Select id="overlay_style" name="overlay_style" defaultValue={banner.overlay_style}>
            {SECTION_BANNER_OVERLAY_STYLES.map((s) => (
              <option key={s} value={s}>
                {s === "dark" ? "গাঢ়" : "হালকা"}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <div className="flex flex-wrap gap-8">
        <Checkbox name="overlay_enabled" label="ছবির উপর ওভারলে টিন্ট দেখান" defaultChecked={banner.overlay_enabled} />
        <Checkbox name="is_visible" label="ওয়েবসাইটে দেখান" defaultChecked={banner.is_visible} />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "সংরক্ষণ হচ্ছে…" : "সংরক্ষণ করুন"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/section-banners")}>
          বাতিল
        </Button>
      </div>
    </form>
  );
}
