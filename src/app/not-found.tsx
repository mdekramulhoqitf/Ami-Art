import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">404</p>
      <h1 className="mt-3 text-2xl font-semibold text-ink">পাতাটি খুঁজে পাওয়া যায়নি</h1>
      <p className="mt-3 max-w-md text-sm text-ink-soft">
        আপনি যে পাতাটি খুঁজছেন তা নেই অথবা সরিয়ে ফেলা হয়েছে।
      </p>
      <div className="mt-8 flex gap-3">
        <Button href="/">হোমে ফিরে যান</Button>
        <Button href="/contact" variant="secondary">
          যোগাযোগ করুন
        </Button>
      </div>
    </Container>
  );
}
