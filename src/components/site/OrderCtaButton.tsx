import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function OrderCtaButton({
  serviceId,
  size = "md",
  variant = "cta",
  className,
  label = "ঘরে বসে অর্ডার করুন",
}: {
  serviceId?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "ghost" | "cta";
  className?: string;
  label?: string;
}) {
  const href = serviceId ? `/order?service=${serviceId}` : "/order";

  return (
    <Button href={href} size={size} variant={variant} className={cn(className)}>
      {label}
    </Button>
  );
}
