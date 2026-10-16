"use client";

import { useRef } from "react";
import { Textarea } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { addCustomerNote } from "../actions";

export function NoteForm({ customerId }: { customerId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const action = addCustomerNote.bind(null, customerId);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await action(formData);
        formRef.current?.reset();
      }}
      className="flex gap-2"
    >
      <Textarea name="body" rows={2} placeholder="একটি নোট যোগ করুন..." className="flex-1" />
      <Button type="submit" size="sm">
        যোগ করুন
      </Button>
    </form>
  );
}
