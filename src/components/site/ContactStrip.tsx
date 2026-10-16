import { Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";
import type { ContactSettings } from "@/lib/types";

/**
 * Compact top bar above the navbar — real contact info, always visible,
 * no need to open /contact. `contact_settings.phone` may hold more than
 * one number (admin separates with a comma/slash); each renders as its
 * own tel: link. Location, phone (first number), and email must all fit
 * on one line down to ~360px with zero horizontal scroll — location is
 * the flexible item (shrinks/truncates first via flex-1 min-w-0), the
 * first phone number is protected at full width, email is capped with
 * its own max-width + ellipsis so it can never push phone off-screen but
 * also never fully disappears.
 */
export function ContactStrip({ contact }: { contact: ContactSettings }) {
  const phones = contact.phone
    .split(/[,/]/)
    .map((p) => p.trim())
    .filter(Boolean);
  const firstPhone = phones[0];

  return (
    <div className="border-b border-border bg-dark text-white">
      <Container className="flex h-8 items-center gap-1.5 text-[11px] sm:h-9 sm:gap-4 sm:text-xs">
        <div className="flex min-w-0 flex-1 items-center gap-1 text-white/80 sm:gap-1.5">
          <MapPin className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
          <span className="truncate">{contact.address}</span>
        </div>
        {phones.map((phone) => (
          <a
            key={phone}
            href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
            className={cn(
              "-my-2 flex shrink-0 items-center gap-1 whitespace-nowrap py-2 hover:text-primary-200 sm:-my-2.5 sm:gap-1.5 sm:py-2.5",
              phone !== firstPhone && "hidden sm:flex"
            )}
          >
            <Phone className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
            {phone}
          </a>
        ))}
        <a
          href={`mailto:${contact.email}`}
          className="-my-2 flex max-w-[112px] shrink-0 items-center gap-1 py-2 hover:text-primary-200 sm:-my-2.5 sm:max-w-none sm:gap-1.5 sm:py-2.5"
        >
          <Mail className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
          <span className="truncate">{contact.email}</span>
        </a>
      </Container>
    </div>
  );
}
