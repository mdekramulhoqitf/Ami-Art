import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Highlight } from "@/components/ui/Highlight";
import { HeroFallback } from "./HeroFallback";
import { HeroSlider } from "./HeroSlider";
import { OrderCtaButton } from "./OrderCtaButton";
import type { HeroSlide } from "@/lib/types";

export function Hero({
  slides,
  heading,
  body,
}: {
  slides: HeroSlide[];
  heading: string;
  body: string;
}) {
  return (
    <section className="relative isolate h-[560px] w-full overflow-hidden bg-dark sm:h-[620px] lg:h-[700px]">
      {slides.length > 0 ? <HeroSlider slides={slides} /> : <HeroFallback />}

      <Container className="relative z-10 flex h-full items-center">
        <div className="max-w-xl">
          <p className="mb-5 text-xs font-medium text-white">
            আপনার প্রয়োজন, আমাদের কাজ
          </p>
          <h1 className="text-4xl font-semibold text-white [text-shadow:0_1px_3px_rgba(0,0,0,.15)] sm:text-5xl lg:text-[3.25rem]">
            <Highlight text={heading} pick="বিশ্বস্ত" className="text-accent-500" />
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/85">{body}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <OrderCtaButton size="lg" label="অর্ডার শুরু করুন" />
            <Button
              href="/contact"
              variant="secondary"
              size="lg"
              className="border-white/30 bg-white/10 text-white hover:border-white hover:bg-white/20 hover:text-white"
            >
              আগে কথা বলুন
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
