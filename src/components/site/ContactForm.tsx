"use client";

import { useActionState, useEffect, useRef } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { submitContactForm, type ContactFormState } from "@/app/(site)/contact/actions";
import { FormField, Input, Select, Textarea } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import type { Service } from "@/lib/types";

const initialState: ContactFormState = { success: false };

export function ContactForm({ services }: { services: Service[] }) {
  const [state, action, pending] = useActionState(submitContactForm, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-5">
      <FormField label="নাম" name="name" required error={state.errors?.name?.[0]}>
        <Input id="name" name="name" placeholder="আপনার নাম" required />
      </FormField>

      <FormField
        label="মোবাইল নম্বর বা ই-মেইল"
        name="contact"
        required
        error={state.errors?.contact?.[0]}
      >
        <Input id="contact" name="contact" placeholder="01xxxxxxxxx অথবা you@example.com" required />
      </FormField>

      <FormField label="সেবা" name="service" hint="ঐচ্ছিক">
        <Select id="service" name="service" defaultValue="">
          <option value="">একটি সেবা নির্বাচন করুন (ঐচ্ছিক)</option>
          {services.map((s) => (
            <option key={s.id} value={s.title}>
              {s.title}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField
        label="আপনার প্রয়োজনটা লিখুন"
        name="message"
        required
        error={state.errors?.message?.[0]}
        hint="যতটা জানেন লিখুন, বাকিটা আমরা প্রয়োজনে জিজ্ঞাসা করব।"
      >
        <Textarea
          id="message"
          name="message"
          rows={5}
          placeholder="যেমন: দোকানের জন্য একটা সাইনবোর্ড দরকার, কী লেখা থাকবে জানি..."
          required
        />
      </FormField>

      {state.message && (
        <div
          className={`flex items-start gap-2.5 rounded-lg px-4 py-3 text-sm ${
            state.success ? "bg-primary-50 text-success" : "bg-accent-50 text-danger"
          }`}
          role="status"
        >
          {state.success ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          {state.message}
        </div>
      )}

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "পাঠানো হচ্ছে…" : "প্রয়োজন জানান"}
      </Button>
    </form>
  );
}
