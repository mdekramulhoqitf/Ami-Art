"use client";

import { useState, useTransition } from "react";
import { Copy, Check, Share2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { generateReferralCode } from "./actions";

export function ReferralSection({
  token,
  eligible,
  initialCode,
  commissionRate,
}: {
  token: string;
  eligible: boolean;
  initialCode: string | null;
  commissionRate: number | null;
}) {
  const [code, setCode] = useState(initialCode);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  if (!eligible) return null;

  const ratePercent = commissionRate != null ? Math.round(commissionRate * 1000) / 10 : null;
  // NEXT_PUBLIC_ env vars are inlined at build time — identical on server and
  // client, unlike window.location.origin (which caused a real hydration
  // mismatch here: server has no window, client does).
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const referralLink = code ? `${siteUrl}/order?ref=${code}` : "";
  const shareText = `আমি Ami Art থেকে অর্ডার করেছি। আপনারও কিছু লাগলে এই লিংক দিয়ে অর্ডার করতে পারেন: ${referralLink}`;

  function copy(text: string, which: "code" | "link") {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(which);
      setTimeout(() => setCopied((c) => (c === which ? null : c)), 2000);
    });
  }

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  // Feature check happens at click time (client-only by definition — a
  // click can't fire during SSR), so there is no server/client render to
  // keep in sync and no effect needed. Falls back to the same WhatsApp link
  // rendered as a real anchor just below, so the action is never a dead end
  // on browsers without the Web Share API.
  function share() {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      navigator.share({ text: shareText }).catch(() => {});
    } else {
      window.open(whatsappHref, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className="mt-8 rounded-2xl border border-border bg-surface p-6 sm:p-8">
      <h2 className="text-base font-semibold text-ink">রেফার করে আয় করুন</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
        আপনি Ami Art থেকে অর্ডার করেছেন। এখন আপনার পরিচিত কেউ আপনার রেফারেল লিংক দিয়ে অর্ডার করলে, সেই যোগ্য অর্ডার থেকে আপনি রিওয়ার্ড পাবেন।
      </p>

      {!code ? (
        <Button
          size="sm"
          className="mt-4"
          disabled={pending}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const result = await generateReferralCode(token);
              if (result.success && result.referralCode) {
                setCode(result.referralCode);
              } else {
                setError(result.message ?? "রেফারেল কোড তৈরি করা যায়নি।");
              }
            });
          }}
        >
          {pending ? "তৈরি হচ্ছে..." : "আমার রেফারেল কোড তৈরি করুন"}
        </Button>
      ) : (
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">আপনার রেফারেল কোড</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <p className="text-2xl font-semibold tracking-wide text-ink">{code}</p>
            <Button size="sm" variant="secondary" onClick={() => copy(code, "code")}>
              {copied === "code" ? (
                <>
                  <Check className="h-3.5 w-3.5" /> কপি হয়েছে
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> কোড কপি করুন
                </>
              )}
            </Button>
          </div>

          <p className="mt-4 text-xs font-medium uppercase tracking-wide text-ink-faint">আপনার রেফারেল লিংক</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <p className="max-w-full truncate text-sm text-ink-soft">{referralLink}</p>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => copy(referralLink, "link")}>
              {copied === "link" ? (
                <>
                  <Check className="h-3.5 w-3.5" /> কপি হয়েছে
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> লিংক কপি করুন
                </>
              )}
            </Button>
            <Button size="sm" variant="secondary" onClick={share}>
              <Share2 className="h-3.5 w-3.5" /> শেয়ার করুন
            </Button>
            <Button size="sm" variant="secondary" href={whatsappHref} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp-এ শেয়ার করুন
            </Button>
          </div>

          {ratePercent != null && (
            <p className="mt-3 text-xs text-ink-faint">বর্তমান রিওয়ার্ড রেট: {ratePercent}%</p>
          )}
        </div>
      )}

      {error && <p className="mt-2 text-xs text-danger">{error}</p>}

      {code && (
        <ol className="mt-6 grid grid-cols-1 gap-3 border-t border-border pt-5 text-xs text-ink-soft sm:grid-cols-3">
          <li className="flex items-start gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-ink">
              ১
            </span>
            আপনার লিংক কপি করুন
          </li>
          <li className="flex items-start gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-ink">
              ২
            </span>
            বন্ধুর সাথে শেয়ার করুন
          </li>
          <li className="flex items-start gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-ink">
              ৩
            </span>
            যোগ্য অর্ডার হলে রিওয়ার্ড পান
          </li>
        </ol>
      )}
    </div>
  );
}
