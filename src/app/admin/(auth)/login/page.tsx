"use client";

import { useActionState } from "react";
import { Logo } from "@/components/site/Logo";
import { FormField, Input } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { signIn, type LoginState } from "@/lib/actions/auth";

const initialState: LoginState = {};

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState(signIn, initialState);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-page px-5">
      <div aria-hidden="true" className="dot-grid-bg absolute inset-0 opacity-[0.3]" />
      <div
        aria-hidden="true"
        className="brand-glow-red absolute -left-32 -top-32 h-96 w-96 rounded-full blur-3xl"
      />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo logoUrl={null} businessName="Ami Art" />
        </div>
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-lg">
          <h1 className="text-lg font-semibold text-ink">অ্যাডমিন লগইন</h1>
          <p className="mt-1 text-sm text-ink-soft">আপনার ওয়েবসাইট পরিচালনা করুন।</p>

          <form action={action} className="mt-6 space-y-5">
            <FormField label="ই-মেইল" name="email" required>
              <Input id="email" name="email" type="email" autoComplete="username" required />
            </FormField>
            <FormField label="পাসওয়ার্ড" name="password" required>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </FormField>

            {state.error && (
              <p role="alert" className="rounded-lg bg-accent-50 px-3.5 py-2.5 text-sm text-danger">
                {state.error}
              </p>
            )}

            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "লগইন হচ্ছে…" : "লগইন করুন"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
