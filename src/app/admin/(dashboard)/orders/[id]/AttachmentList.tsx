"use client";

import { useState } from "react";
import { File as FileIcon, Download, Loader2 } from "lucide-react";
import { getFileDownloadUrl } from "../actions";
import { useToast } from "@/components/ui/Toast";
import { formatBytes } from "@/lib/utils";
import type { OrderAttachment } from "@/lib/types";

export function AttachmentList({ attachments }: { attachments: OrderAttachment[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { showToast } = useToast();

  async function handleDownload(attachment: OrderAttachment) {
    setLoadingId(attachment.id);
    try {
      const url = await getFileDownloadUrl(attachment.file_path);
      if (!url) {
        showToast("error", "ফাইলটি ডাউনলোড করা যায়নি।");
        return;
      }
      window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setLoadingId(null);
    }
  }

  if (attachments.length === 0) {
    return <p className="text-sm text-ink-faint">কোনো ফাইল সংযুক্ত করা হয়নি।</p>;
  }

  return (
    <ul className="space-y-2">
      {attachments.map((attachment) => (
        <li
          key={attachment.id}
          className="flex items-center justify-between gap-3 rounded-lg border border-border px-3.5 py-2.5"
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <FileIcon className="h-4 w-4 shrink-0 text-ink-faint" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{attachment.file_name}</p>
              <p className="text-xs text-ink-faint">{formatBytes(attachment.file_size)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleDownload(attachment)}
            disabled={loadingId === attachment.id}
            aria-label="ডাউনলোড"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-ink-soft hover:bg-muted hover:text-ink disabled:opacity-50"
          >
            {loadingId === attachment.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}
