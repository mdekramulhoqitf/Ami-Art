"use client";

import { useActionState, useEffect, useTransition } from "react";
import { UploadField } from "@/components/admin/UploadField";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { updateLogos, removeLogoAsset, type LogoFormState } from "./actions";
import type { Logos } from "@/lib/types";

const initialState: LogoFormState = {};

const FIELD_CONFIG = [
  {
    name: "primary_logo",
    column: "primary_logo_url",
    label: "প্রধান লোগো",
    hint: "নেভবার ও ফুটারে ব্যবহৃত হয় — চওড়া ওয়ার্ডমার্ক, স্কয়ার নয়।",
    aspect: "aspect-[2000/440]",
    specKey: "logo",
  },
  {
    name: "light_logo",
    column: "light_logo_url",
    label: "লাইট লোগো",
    hint: "গাঢ় ব্যাকগ্রাউন্ডে ব্যবহারের জন্য।",
    aspect: "aspect-[2000/440]",
    specKey: "logo",
  },
  {
    name: "dark_logo",
    column: "dark_logo_url",
    label: "ডার্ক লোগো",
    hint: "হালকা ব্যাকগ্রাউন্ডে ব্যবহারের জন্য।",
    aspect: "aspect-[2000/440]",
    specKey: "logo",
  },
  {
    name: "favicon",
    column: "favicon_url",
    label: "ফেভিকন",
    hint: "ব্রাউজার ট্যাবে দেখা যাবে।",
    aspect: "aspect-square",
    specKey: "logoMark",
  },
] as const;

export function LogoForm({ logos }: { logos: Logos }) {
  const [state, formAction, pending] = useActionState(updateLogos, initialState);
  const { showToast } = useToast();
  const [removing, startRemoving] = useTransition();

  useEffect(() => {
    if (state.message) {
      showToast(state.success ? "success" : "error", state.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  function handleRemove(column: (typeof FIELD_CONFIG)[number]["column"]) {
    startRemoving(async () => {
      await removeLogoAsset(column);
      showToast("success", "ছবিটি মুছে ফেলা হয়েছে।");
    });
  }

  return (
    <form action={formAction} className="max-w-3xl space-y-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {FIELD_CONFIG.map((field) => (
          <div key={field.name}>
            <UploadField
              name={field.name}
              bucket="logos"
              label={field.label}
              existingUrl={logos[field.column]}
              aspect={field.aspect}
              specKey={field.specKey}
            />
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-ink-faint">{field.hint}</p>
              {logos[field.column] && (
                // A <form> here (as before) would nest inside the outer form
                // above — invalid HTML that produced a real hydration-mismatch
                // warning and made the outer/inner submit targets ambiguous
                // in some browsers. removeLogoAsset takes no FormData, so it
                // doesn't need form semantics at all — call it directly.
                <button
                  type="button"
                  disabled={removing}
                  onClick={() => handleRemove(field.column)}
                  className="text-xs font-medium text-danger hover:underline disabled:opacity-50"
                >
                  মুছে ফেলুন
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "সংরক্ষণ হচ্ছে…" : "ব্র্যান্ডিং সংরক্ষণ করুন"}
      </Button>
    </form>
  );
}
