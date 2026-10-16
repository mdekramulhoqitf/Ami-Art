import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  logoUrl,
  businessName,
  className,
  variant = "default",
  imgClassName,
}: {
  logoUrl: string | null;
  businessName: string;
  className?: string;
  variant?: "default" | "light";
  /** Overrides the rendered height of the logo image (width stays auto — never distort/crop the wordmark). */
  imgClassName?: string;
}) {
  if (logoUrl) {
    return (
      <Link href="/" className={cn("flex items-center", className)} aria-label={businessName}>
        {/* Ami Art's primary logo is a ~4.55:1 wide wordmark, not a square
            mark — intrinsic size below matches that so Next/Image's layout
            reservation doesn't fight the real aspect ratio. */}
        <Image
          src={logoUrl}
          alt={businessName}
          width={320}
          height={70}
          className={cn("w-auto object-contain", imgClassName ?? "h-11 sm:h-14")}
          priority
        />
      </Link>
    );
  }

  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2.5", className)}
      aria-label={businessName}
    >
      <svg
        width="34"
        height="34"
        viewBox="0 0 34 34"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect width="34" height="34" rx="9" fill="#FF4D5A" />
        <path d="M10 24L17 9L24 24H19.5L17 18L14.5 24H10Z" fill="white" />
        <circle cx="24.5" cy="10.5" r="3.5" fill="#61FFA0" />
      </svg>
      <span
        className={cn(
          "text-lg font-semibold tracking-tight",
          variant === "light" ? "text-white" : "text-ink"
        )}
      >
        {businessName}
      </span>
    </Link>
  );
}
