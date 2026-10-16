"use client";

import { useActionState, useRef, useEffect } from "react";
import { FormField, Input, Textarea, Checkbox } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import {
  addBusinessContact,
  createOpportunity,
  addActivityNote,
  type BusinessFormState,
} from "../actions";

const empty: BusinessFormState = {};

export function ContactQuickAdd({ businessId }: { businessId: string }) {
  const [state, formAction, pending] = useActionState(addBusinessContact.bind(null, businessId), empty);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message && !state.errors) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3 rounded-xl border border-border p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField label="নাম" name="name" required error={state.errors?.name?.[0]}>
          <Input id="contact-name" name="name" required />
        </FormField>
        <FormField label="পদবি" name="role">
          <Input id="contact-role" name="role" />
        </FormField>
        <FormField label="ফোন" name="phone">
          <Input id="contact-phone" name="phone" />
        </FormField>
        <FormField label="ইমেইল" name="email">
          <Input id="contact-email" name="email" />
        </FormField>
      </div>
      <Checkbox name="is_primary" label="প্রধান যোগাযোগ" />
      {state.message && <p className="text-xs text-ink-soft">{state.message}</p>}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "যোগ হচ্ছে…" : "কন্ট্যাক্ট যোগ করুন"}
      </Button>
    </form>
  );
}

export function OpportunityQuickAdd({ businessId }: { businessId: string }) {
  const [state, formAction, pending] = useActionState(createOpportunity.bind(null, businessId), empty);

  return (
    <form action={formAction} className="space-y-3 rounded-xl border border-border p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField label="সুযোগের নাম" name="title" required error={state.errors?.title?.[0]}>
          <Input id="opp-title" name="title" placeholder="যেমন: সাইনবোর্ড" required />
        </FormField>
        <FormField label="সেবার ধরন" name="service_category">
          <Input id="opp-service" name="service_category" />
        </FormField>
        <FormField label="আনুমানিক মূল্য (৳)" name="estimated_value">
          <Input id="opp-value" name="estimated_value" type="number" min={0} />
        </FormField>
      </div>
      {state.message && <p className="text-xs text-danger">{state.message}</p>}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "যোগ হচ্ছে…" : "সুযোগ যোগ করুন"}
      </Button>
    </form>
  );
}

export function NoteQuickAdd({
  businessId,
  opportunityId,
}: {
  businessId: string;
  opportunityId: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    addActivityNote.bind(null, businessId, opportunityId),
    empty
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message && !state.errors) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex gap-2">
      <Textarea name="body" placeholder="একটি নোট লিখুন..." rows={2} className="flex-1" />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "…" : "যোগ করুন"}
      </Button>
    </form>
  );
}
