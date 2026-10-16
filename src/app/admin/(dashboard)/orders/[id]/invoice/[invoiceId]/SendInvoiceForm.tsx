"use client";

import { useActionState, useEffect, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/FormField";
import { useToast } from "@/components/ui/Toast";
import { sendInvoiceMessage, type SendInvoiceState } from "../actions";

const initialState: SendInvoiceState = { success: false };

export function SendInvoiceForm({ invoiceId, orderId }: { invoiceId: string; orderId: string }) {
  const [open, setOpen] = useState(false);
  const action = sendInvoiceMessage.bind(null, invoiceId, orderId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const { showToast } = useToast();

  const [lastHandledState, setLastHandledState] = useState(state);
  if (state !== lastHandledState) {
    setLastHandledState(state);
    if (state.success) setOpen(false);
  }

  useEffect(() => {
    if (state.success) {
      showToast("success", "ইনভয়েস পাঠানো হয়েছে।");
    } else if (state.message) {
      showToast("error", state.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        <Send className="h-4 w-4" />
        গ্রাহকের কাছে পাঠান
      </Button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/40 p-4 animate-fade-in"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold text-ink">
              আপনি কি এই ইনভয়েসটি গ্রাহকের কাছে পাঠাতে চান?
            </h2>
            <form action={formAction} className="mt-4">
              <Textarea
                name="message"
                rows={3}
                placeholder="ঐচ্ছিক মেসেজ যুক্ত করুন…"
              />
              <div className="mt-4 flex justify-end gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(false)}>
                  বাতিল
                </Button>
                <Button type="submit" size="sm" disabled={pending}>
                  {pending ? "পাঠানো হচ্ছে…" : "ইনভয়েস পাঠান"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
