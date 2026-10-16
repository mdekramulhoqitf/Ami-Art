"use client";

import { useRef, useState } from "react";
import { File as FileIcon, Paperclip, X } from "lucide-react";
import { validateOrderFileList } from "@/lib/validation";
import { formatBytes } from "@/lib/utils";

const ACCEPT =
  ".jpg,.jpeg,.png,.webp,.pdf,.svg,.ai,.psd,.doc,.docx,.zip,image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/zip";

export function FileUpload({
  files,
  onChange,
}: {
  files: File[];
  onChange: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  function handleAdd(newFiles: FileList | null) {
    if (!newFiles || newFiles.length === 0) return;
    const combined = [...files, ...Array.from(newFiles)];
    const validationError = validateOrderFileList(combined);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    onChange(combined);
  }

  function remove(index: number) {
    onChange(files.filter((_, i) => i !== index));
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted px-4 py-8 text-sm font-medium text-ink-soft transition-colors hover:border-primary-500 hover:text-primary-700"
      >
        <Paperclip className="h-4.5 w-4.5" />
        + ফাইল সংযুক্ত করুন
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT}
        className="sr-only"
        onChange={(e) => {
          handleAdd(e.target.files);
          e.target.value = "";
        }}
      />
      <p className="mt-1.5 text-xs text-ink-faint">
        JPG, PNG, WebP, PDF, SVG, AI, PSD, DOC, DOCX, ZIP — প্রতিটি ফাইল সর্বোচ্চ ১৫ MB
      </p>
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}

      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-border px-3.5 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <FileIcon className="h-4 w-4 shrink-0 text-ink-faint" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{file.name}</p>
                  <p className="text-xs text-ink-faint">{formatBytes(file.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label="ফাইলটি সরান"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-faint hover:bg-accent-50 hover:text-danger"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
