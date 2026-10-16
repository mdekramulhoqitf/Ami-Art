import Image from "next/image";
import { SERVICE_ICONS, DEFAULT_SERVICE_ICON } from "./service-icons";
import { cn } from "@/lib/utils";
import type { AspectRatio } from "@/lib/types";

const ASPECT_RATIO_CLASSES: Record<Exclude<AspectRatio, "custom">, string> = {
  "landscape-16-9": "aspect-[16/9]",
  "wide-3-1": "aspect-[3/1]",
  "standard-4-3": "aspect-[4/3]",
  "square-1-1": "aspect-square",
  "portrait-4-5": "aspect-[4/5]",
  "vertical-9-16": "aspect-[9/16]",
};

type ServiceImageData = {
  image_url: string | null;
  image_alt: string | null;
  title: string;
  icon: string | null;
  aspect_ratio: AspectRatio;
  custom_width: number | null;
  custom_height: number | null;
};

/**
 * "card" mode always crops to one uniform height (object-cover) so the public
 * services grid stays visually aligned no matter what ratio each service was
 * given. "detail" mode honors the stored aspect ratio exactly (object-contain)
 * so the full artwork is never cropped.
 */
export function ServiceImage({
  service,
  mode,
  className,
  sizes,
}: {
  service: ServiceImageData;
  mode: "card" | "detail";
  className?: string;
  sizes?: string;
}) {
  const Icon = (service.icon && SERVICE_ICONS[service.icon]) || DEFAULT_SERVICE_ICON;

  const isCustom = service.aspect_ratio === "custom";
  const customStyle =
    mode === "detail" && isCustom && service.custom_width && service.custom_height
      ? { aspectRatio: `${service.custom_width} / ${service.custom_height}` }
      : undefined;

  const shapeClass =
    mode === "card"
      ? "h-52 sm:h-56"
      : service.aspect_ratio === "custom"
        ? ""
        : (ASPECT_RATIO_CLASSES[service.aspect_ratio] ?? "aspect-[4/3]");

  if (!service.image_url) {
    return (
      <div
        className={cn(
          "flex w-full items-center justify-center bg-primary-50 text-primary-300",
          shapeClass,
          className
        )}
        style={customStyle}
      >
        <Icon className="h-12 w-12" strokeWidth={1.25} />
      </div>
    );
  }

  return (
    <div className={cn("relative w-full overflow-hidden bg-muted", shapeClass, className)} style={customStyle}>
      <Image
        src={service.image_url}
        alt={service.image_alt || service.title}
        fill
        sizes={sizes ?? "(min-width: 1024px) 33vw, 100vw"}
        className={mode === "card" ? "object-cover" : "object-contain"}
      />
    </div>
  );
}
