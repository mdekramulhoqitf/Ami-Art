import { Container } from "@/components/ui/Container";

export default function SiteSectionLoading() {
  return (
    <div className="animate-pulse py-16 sm:py-20" role="status" aria-label="লোড হচ্ছে…">
      <Container>
        <div className="mx-auto h-8 w-64 max-w-full rounded-lg bg-muted" />
        <div className="mx-auto mt-4 h-4 w-full max-w-xl rounded bg-muted" />
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="h-64 rounded-2xl border border-border bg-surface" />
          <div className="h-64 rounded-2xl border border-border bg-surface" />
          <div className="h-64 rounded-2xl border border-border bg-surface" />
        </div>
      </Container>
    </div>
  );
}
