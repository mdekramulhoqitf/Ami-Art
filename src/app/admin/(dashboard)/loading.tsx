export default function AdminSectionLoading() {
  return (
    <div className="animate-pulse" role="status" aria-label="লোড হচ্ছে…">
      <div className="mb-8 h-8 w-48 rounded-lg bg-muted" />
      <div className="space-y-3">
        <div className="h-20 rounded-2xl border border-border bg-surface" />
        <div className="h-20 rounded-2xl border border-border bg-surface" />
        <div className="h-20 rounded-2xl border border-border bg-surface" />
      </div>
    </div>
  );
}
