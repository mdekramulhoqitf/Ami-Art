import { getMediaSpec, MEDIA_SPEC_LIST, type MediaSpecKey } from "@/config/media-specs";

/** Inline hint next to one upload field — recommended size for that exact slot. */
export function ImageSizeHint({ specKey }: { specKey: MediaSpecKey }) {
  const spec = getMediaSpec(specKey);
  return (
    <div className="mt-1.5 rounded-lg border border-dashed border-border bg-muted px-3 py-2 text-xs text-ink-soft">
      <p>
        <span className="font-medium text-ink">প্রস্তাবিত মাপ:</span> {spec.width}×{spec.height}px (
        {spec.aspectRatio}, {spec.orientation === "landscape" ? "ল্যান্ডস্কেপ" : spec.orientation === "square" ? "স্কয়ার" : "পোর্ট্রেট"})
      </p>
      <p>
        <span className="font-medium text-ink">ফরম্যাট:</span> {spec.format} · সর্বোচ্চ {spec.maxFileSizeMB}MB
      </p>
      <p className="mt-0.5 text-ink-faint">{spec.adminHint}</p>
    </div>
  );
}

/** Full reference table of every media slot — for a settings/help page. */
export function ImageSizeGuideTable() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-ink-faint">
            <th className="px-4 py-3 font-medium">নাম</th>
            <th className="px-4 py-3 font-medium">মাপ</th>
            <th className="px-4 py-3 font-medium">অনুপাত</th>
            <th className="px-4 py-3 font-medium">ধরন</th>
            <th className="px-4 py-3 font-medium">ব্যবহার</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {MEDIA_SPEC_LIST.map((spec) => (
            <tr key={spec.key}>
              <td className="px-4 py-3 font-medium text-ink">{spec.label}</td>
              <td className="px-4 py-3 text-ink-soft">
                {spec.width}×{spec.height}
              </td>
              <td className="px-4 py-3 text-ink-soft">{spec.aspectRatio}</td>
              <td className="px-4 py-3 text-ink-soft">
                {spec.orientation === "landscape" ? "ল্যান্ডস্কেপ" : spec.orientation === "square" ? "স্কয়ার" : "পোর্ট্রেট"}
              </td>
              <td className="px-4 py-3 text-ink-soft">{spec.usage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
