"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ConfirmDialog({
  action,
  title,
  description,
  confirmLabel = "মুছে ফেলুন",
  trigger,
}: {
  action: () => void | Promise<void>;
  title: string;
  description: string;
  confirmLabel?: string;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={title}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-accent-50 hover:text-danger"
      >
        {trigger ?? <Trash2 className="h-4 w-4" />}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/40 p-4 animate-fade-in"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold text-ink">{title}</h2>
            <p className="mt-2 text-sm text-ink-soft">{description}</p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
                বাতিল
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={async () => {
                  await action();
                  setOpen(false);
                }}
              >
                {confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
