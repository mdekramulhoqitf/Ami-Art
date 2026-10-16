import { WHY_CHOOSE_US_ICONS, DEFAULT_WHY_CHOOSE_US_ICON } from "./why-choose-us-icons";
import type { WhyChooseUsItem } from "@/lib/types";

export function WhyChooseUsSection({ items }: { items: WhyChooseUsItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = (item.icon && WHY_CHOOSE_US_ICONS[item.icon]) || DEFAULT_WHY_CHOOSE_US_ICON;
        return (
          <div key={item.id} className="rounded-2xl border border-primary-500/15 bg-dark p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500/15 text-white">
              <Icon className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <p className="mt-4 text-sm font-semibold text-white">{item.title}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-white/70">{item.description}</p>
          </div>
        );
      })}
    </div>
  );
}
