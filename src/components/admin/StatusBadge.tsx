import { Badge } from "@/components/ui/Badge";

export function StatusBadge({ active }: { active: boolean }) {
  return (
    <Badge tone={active ? "success" : "neutral"}>
      <span
        className={`h-1.5 w-1.5 rounded-full ${active ? "bg-success" : "bg-ink-faint"}`}
      />
      {active ? "সক্রিয়" : "নিষ্ক্রিয়"}
    </Badge>
  );
}
