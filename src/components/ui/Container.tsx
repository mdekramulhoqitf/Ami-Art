import { cn } from "@/lib/utils";

export function Container({
  className,
  children,
  as: As = "div",
}: {
  className?: string;
  children: React.ReactNode;
  as?: React.ElementType;
}) {
  return (
    <As className={cn("mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:px-10", className)}>
      {children}
    </As>
  );
}
