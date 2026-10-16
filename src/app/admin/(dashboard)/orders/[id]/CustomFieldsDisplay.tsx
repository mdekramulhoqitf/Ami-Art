const FIELD_LABELS: Record<string, string> = {
  width: "প্রস্থ",
  height: "উচ্চতা",
  text: "লেখা",
  color: "রঙ",
  special_instructions: "বিশেষ নির্দেশনা",
  player_name: "নাম",
  player_number: "নম্বর",
  size: "সাইজ",
  sponsor_info: "স্পনসর তথ্য",
  business_name: "ব্যবসার নাম",
  business_type: "ব্যবসার ধরন",
  sections_needed: "প্রয়োজনীয় সেকশন",
  facebook_url: "Facebook পেজ",
  whatsapp: "WhatsApp",
  google_maps_url: "Google Maps",
  reference_website: "রেফারেন্স ওয়েবসাইট",
};

type CustomFields = Record<string, unknown>;

export function CustomFieldsDisplay({ customFields }: { customFields: CustomFields }) {
  const sizes = Array.isArray(customFields.sizes)
    ? (customFields.sizes as { size: string; quantity: string }[])
    : [];
  const entries = Object.entries(customFields).filter(
    ([key, value]) => key !== "sizes" && value !== undefined && value !== ""
  );

  if (entries.length === 0 && sizes.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="mb-3 text-sm font-semibold text-ink">অতিরিক্ত তথ্য</h2>
      <dl className="space-y-2 text-sm">
        {entries.map(([key, value]) => (
          <div key={key} className="flex justify-between gap-4">
            <dt className="text-ink-faint">{FIELD_LABELS[key] ?? key}</dt>
            <dd className="text-right font-medium text-ink">{String(value)}</dd>
          </div>
        ))}
        {sizes.length > 0 && (
          <div>
            <dt className="mb-1 text-ink-faint">সাইজ ও পরিমাণ</dt>
            <dd className="flex flex-wrap gap-2">
              {sizes
                .filter((row) => row.quantity)
                .map((row, i) => (
                  <span key={i} className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-ink">
                    {row.size} — {row.quantity}
                  </span>
                ))}
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
