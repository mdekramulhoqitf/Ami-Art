"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin]", error);
  }, [error]);

  const looksLikeMissingConfig =
    !error.message || /NEXT_PUBLIC_SUPABASE|supabaseUrl|supabaseKey/i.test(error.message);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted px-5 text-center">
      <h1 className="text-xl font-semibold text-ink">অ্যাডমিন প্যানেল লোড করা যায়নি</h1>

      {error.message && (
        <p className="mt-3 max-w-md rounded-lg bg-muted-dark px-4 py-2.5 text-left text-xs text-ink-soft">
          <span className="font-medium text-ink">বিস্তারিত:</span> {error.message}
        </p>
      )}

      {looksLikeMissingConfig && (
        <p className="mt-3 max-w-sm text-sm text-ink-soft">
          এটি Supabase কনফিগারেশন সংক্রান্ত সমস্যা হতে পারে। নিশ্চিত করুন যে{" "}
          <code className="rounded bg-muted-dark px-1.5 py-0.5 text-xs">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
          এবং <code className="rounded bg-muted-dark px-1.5 py-0.5 text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
          <code className="rounded bg-muted-dark px-1.5 py-0.5 text-xs">.env.local</code>-এ সেট করা আছে এবং dev
          সার্ভার রিস্টার্ট করা হয়েছে।
        </p>
      )}

      {error.digest && (
        <p className="mt-2 text-xs text-ink-faint">Error ID: {error.digest}</p>
      )}

      <div className="mt-7 flex gap-3">
        <Button onClick={reset}>আবার চেষ্টা করুন</Button>
        <Button href="/" variant="secondary">
          ওয়েবসাইটে ফিরে যান
        </Button>
      </div>
    </div>
  );
}
