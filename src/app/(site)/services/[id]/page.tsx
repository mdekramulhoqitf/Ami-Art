import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceImage } from "@/components/site/ServiceImage";
import { OrderCtaButton } from "@/components/site/OrderCtaButton";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { getServiceById } from "@/lib/queries/services";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const service = await getServiceById(id);
  if (!service) return {};
  return {
    title: service.title,
    description: service.description ?? undefined,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await getServiceById(id);
  if (!service || !service.is_active) notFound();

  return (
    <section className="py-16 sm:py-20">
      <Container className="max-w-3xl">
        <ServiceImage
          service={service}
          mode="detail"
          className="rounded-2xl border border-border"
          sizes="(min-width: 768px) 768px, 100vw"
        />

        <div className="mt-8">
          {service.category && (
            <Badge tone="primary" className="mb-3">
              {service.category}
            </Badge>
          )}
          <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {service.title}
          </h1>
          {service.description && (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft">
              {service.description}
            </p>
          )}
          {service.price && (
            <p className="mt-4 text-base font-semibold text-primary-700">{service.price}</p>
          )}

          <div className="mt-8">
            <OrderCtaButton
              serviceId={service.id}
              size="lg"
              label={service.product_category === "website" ? "ওয়েবসাইট বানাতে চাই" : "এই কাজের জন্য অর্ডার শুরু করুন"}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}

export const dynamic = "force-dynamic";
