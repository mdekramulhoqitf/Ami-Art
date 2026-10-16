"use client";

import { useActionState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { sendAdminReply, type AdminReplyState } from "../actions";

const initialState: AdminReplyState = { success: false };

export function AdminReplyForm({ orderId }: { orderId: string }) {
  const action = sendAdminReply.bind(null, orderId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="mt-4">
      <Textarea name="message" rows={3} placeholder="মেসেজ লিখুন" required className="w-full" />
      {state.message && !state.success && (
        <p className="mt-1.5 text-xs text-danger">{state.message}</p>
      )}
      <div className="mt-3 flex justify-end">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "পাঠানো হচ্ছে..." : "পাঠান"}
        </Button>
      </div>
    </form>
  );
}
