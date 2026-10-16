"use client";

import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <h1 className="text-2xl font-semibold text-ink">কিছু একটা সমস্যা হয়েছে</h1>
      <p className="mt-3 max-w-md text-sm text-ink-soft">
        এই পাতাটি লোড করতে গিয়ে একটি অপ্রত্যাশিত সমস্যা হয়েছে। আবার চেষ্টা করুন, অথবা সমস্যা থেকে
        গেলে সরাসরি আমাদের সাথে যোগাযোগ করুন।
      </p>
      <div className="mt-8 flex gap-3">
        <Button onClick={reset}>আবার চেষ্টা করুন</Button>
        <Button href="/" variant="secondary">
          হোমে ফিরে যান
        </Button>
      </div>
    </Container>
  );
}
