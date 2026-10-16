"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Upload } from "lucide-react";
import { ACCEPTED_IMAGE_TYPES, validateImageFile } from "@/lib/validation";
import { createClient } from "@/lib/supabase/client";
import { deleteImage, uploadImage, type Bucket } from "@/lib/supabase/storage";
import { cn } from "@/lib/utils";
import { getMediaSpec, type MediaSpecKey } from "@/config/media-specs";
import { ImageSizeHint } from "./ImageSizeGuide";

function closestRatioLabel(w: number, h: number): string {
  return (w / h).toFixed(2);
}

export function UploadField({
  name,
  bucket,
  label,
  existingUrl,
  required,
  aspect = "aspect-video",
  specKey,
}: {
  name: string;
  /** Storage bucket the image is uploaded to straight from the browser. */
  bucket: Bucket;
  label: string;
  existingUrl?: string | null;
  required?: boolean;
  aspect?: string;
  /** Media slot key from src/config/media-specs.ts — shows recommended size + soft ratio check. */
  specKey?: MediaSpecKey;
}) {
  const [preview, setPreview] = useState<string | null>(existingUrl ?? null);
  const [error, setError] = useState<string | null>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Uploads straight to Storage so the file never rides in the Server Action
  // body (capped at 4.5 MB on Vercel) — the form only submits the URL.
  async function handleFile(file: File | undefined) {
    if (!file || uploading) return;
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    const url = URL.createObjectURL(file);
    setPreview(url);

    const img = new window.Image();
    img.onload = () => setDims({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = url;

    setUploading(true);
    const supabase = createClient();
    try {
      const publicUrl = await uploadImage(supabase, bucket, file);
      // A replaced-before-save upload would otherwise be orphaned.
      if (uploadedUrl) void deleteImage(supabase, bucket, uploadedUrl);
      setUploadedUrl(publicUrl);
    } catch {
      setError("ছবিটি আপলোড করা যায়নি। আবার চেষ্টা করুন।");
      setPreview(uploadedUrl ?? existingUrl ?? null);
      setDims(null);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">
        {label}
        {required && <span className="ml-0.5 text-accent-500">*</span>}
      </label>
      {specKey && <ImageSizeHint specKey={specKey} />}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void handleFile(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "relative flex w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted transition-colors hover:border-primary-500",
          aspect
        )}
      >
        {preview ? (
          <Image src={preview} alt="প্রিভিউ" fill className="object-contain p-2" unoptimized />
        ) : (
          <div className="flex flex-col items-center gap-2 py-8 text-ink-faint">
            <ImagePlus className="h-7 w-7" strokeWidth={1.5} />
            <span className="text-sm">ছবি আপলোড করতে ক্লিক করুন অথবা টেনে আনুন</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/40 text-sm font-medium text-white">
            আপলোড হচ্ছে...
          </div>
        )}
        {preview && !uploading && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-ink/70 px-3 py-1.5 text-xs font-medium text-white">
            <Upload className="h-3.5 w-3.5" />
            পরিবর্তন করুন
          </div>
        )}
      </button>
      <input type="hidden" name={name} value={uploadedUrl ?? ""} />
      {uploading && (
        // Blocks form submit until the upload finishes, so the URL isn't lost.
        <input
          required
          tabIndex={-1}
          aria-hidden
          value=""
          onChange={() => {}}
          ref={(el) => el?.setCustomValidity("ছবি আপলোড শেষ হওয়া পর্যন্ত অপেক্ষা করুন।")}
          className="sr-only"
        />
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="sr-only"
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <p className="mt-1.5 text-xs text-ink-faint">JPG, PNG, WebP অথবা SVG — সর্বোচ্চ ৫ MB।</p>
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
      {specKey && dims && (() => {
        const spec = getMediaSpec(specKey);
        const uploadedRatio = closestRatioLabel(dims.w, dims.h);
        const recommendedRatio = (spec.width / spec.height).toFixed(2);
        const ratioClose = Math.abs(Number(uploadedRatio) - Number(recommendedRatio)) < 0.15;
        const lowRes = dims.w < spec.width * 0.6;
        return (
          <p className="mt-1.5 text-xs text-ink-soft">
            আপলোড: {dims.w}×{dims.h} ({uploadedRatio}:1) —{" "}
            {ratioClose ? (
              <span className="text-success">✓ অনুপাত ভালো</span>
            ) : (
              <span className="text-danger">⚠ অনুপাত ভিন্ন (প্রস্তাবিত {recommendedRatio}:1)</span>
            )}
            {lowRes && <span className="text-danger"> · ⚠ রেজোলিউশন কম</span>}
          </p>
        );
      })()}
    </div>
  );
}
