import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ServiceImage } from "./ServiceImage";
import type { Service } from "@/lib/types";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      href={`/services/${service.id}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-200 hover:-translate-y-1 hover:border-primary-200 hover:shadow-md"
    >
      <ServiceImage service={service} mode="card" />
      <div className="p-6">
        <h3 className="text-lg font-semibold text-ink">{service.title}</h3>
        {service.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-soft">
            {service.description}
          </p>
        )}
        {service.price && (
          <p className="mt-3 text-sm font-medium text-primary-700">{service.price}</p>
        )}
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary-600 group-hover:underline">
          বিস্তারিত দেখুন
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
