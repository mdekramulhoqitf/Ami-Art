import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Highlight } from "@/components/ui/Highlight";
import { OrderCtaButton } from "./OrderCtaButton";

export function CTASection({ phone }: { phone: string }) {
  return (
    <section className="relative overflow-hidden bg-dark">
      <div
        aria-hidden="true"
        className="brand-glow-red absolute -left-24 top-0 h-72 w-72 rounded-full blur-3xl"
      />
      <Container className="relative flex flex-col items-center gap-6 py-20 text-center sm:py-24">
        <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          <Highlight text="আপনার কাজটি নিয়ে ভাবছেন?" pick="ভাবছেন?" className="text-accent-300" />
        </h2>
        <p className="max-w-md text-base text-border">
          একটি ব্যানার থেকে শুরু করে পুরো দোকানের সাইনবোর্ড — আপনার কাজটি আমাদের সাথে শুরু করুন।
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <OrderCtaButton size="lg" />
          <Button
            href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
            variant="secondary"
            size="lg"
            className="border-white/20 bg-transparent text-white hover:border-accent-500 hover:bg-accent-500 hover:text-white"
          >
            কল করুন {phone}
          </Button>
        </div>
      </Container>
    </section>
  );
}
