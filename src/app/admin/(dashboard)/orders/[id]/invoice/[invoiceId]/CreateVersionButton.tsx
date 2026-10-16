"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { createInvoiceVersion } from "../actions";

export function CreateVersionButton({ invoiceId, orderId }: { invoiceId: string; orderId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { showToast } = useToast();

  return (
    <Button
      type="button"
      variant="secondary"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const newId = await createInvoiceVersion(invoiceId, orderId);
          if (newId) {
            router.push(`/admin/orders/${orderId}/invoice/${newId}/edit`);
          } else {
            showToast("error", "নতুন সংস্করণ তৈরি করা যায়নি। আবার চেষ্টা করুন।");
          }
        })
      }
    >
      <Copy className="h-4 w-4" />
      {pending ? "তৈরি হচ্ছে…" : "নতুন সংস্করণ তৈরি করুন"}
    </Button>
  );
}
