import Image from "next/image";
import Link from "next/link";
import { Pencil, Plus, Wrench } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmptyState } from "@/components/site/EmptyState";
import { Button } from "@/components/ui/Button";
import { DEFAULT_SERVICE_ICON, SERVICE_ICONS } from "@/components/site/service-icons";
import { ASPECT_RATIO_LABELS } from "@/lib/validation";
import { getAllServices } from "@/lib/queries/services";
import { deleteService, toggleServiceActive } from "./actions";

export default async function ServicesAdminPage() {
  const services = await getAllServices();

  return (
    <div>
      <PageHeader
        title="আমাদের সেবা"
        description="ওয়েবসাইটে দেখানো সেবাগুলো পরিচালনা করুন।"
        action={
          <Button href="/admin/services/new" size="sm">
            <Plus className="h-4 w-4" />
            নতুন সেবা যোগ করুন
          </Button>
        }
      />

      {services.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="এখনও কোনো সেবা যোগ করা হয়নি।"
          description="আপনার প্রথম সেবা যোগ করে শুরু করুন।"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = (service.icon && SERVICE_ICONS[service.icon]) || DEFAULT_SERVICE_ICON;
            return (
              <div key={service.id} className="overflow-hidden rounded-2xl border border-border bg-surface">
                <div className="relative flex h-36 items-center justify-center bg-muted">
                  {service.image_url ? (
                    <Image
                      src={service.image_url}
                      alt={service.image_alt || service.title}
                      fill
                      sizes="360px"
                      className="object-cover"
                    />
                  ) : (
                    <Icon className="h-9 w-9 text-primary-300" strokeWidth={1.25} />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-ink">{service.title}</p>
                    <StatusBadge active={service.is_active} />
                  </div>
                  <p className="mt-1 text-xs text-ink-faint">
                    {ASPECT_RATIO_LABELS[service.aspect_ratio]} · ক্রম {service.display_order}
                  </p>
                  {service.category && (
                    <p className="mt-1 text-xs text-primary-600">{service.category}</p>
                  )}

                  <div className="mt-4 flex items-center gap-1 border-t border-border pt-3">
                    <Link
                      href={`/admin/services/${service.id}/edit`}
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-soft hover:bg-muted hover:text-ink"
                      aria-label="সম্পাদনা"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <form action={toggleServiceActive.bind(null, service.id, !service.is_active)}>
                      <button
                        type="submit"
                        className="rounded-lg px-2.5 h-8 text-xs font-medium text-ink-soft hover:bg-muted hover:text-ink"
                      >
                        {service.is_active ? "নিষ্ক্রিয় করুন" : "সক্রিয় করুন"}
                      </button>
                    </form>
                    <div className="ml-auto">
                      <ConfirmDialog
                        action={deleteService.bind(null, service.id)}
                        title="সেবাটি মুছে ফেলুন"
                        description={`"${service.title}" স্থায়ীভাবে মুছে ফেলা হবে।`}
                        confirmLabel="মুছে ফেলুন"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const dynamic = "force-dynamic";
