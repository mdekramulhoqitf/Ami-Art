"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function ContactTabs({
  infoPanel,
  messagesPanel,
  unreadCount,
}: {
  infoPanel: React.ReactNode;
  messagesPanel: React.ReactNode;
  unreadCount: number;
}) {
  const [tab, setTab] = useState<"info" | "messages">("info");

  return (
    <div>
      <div className="mb-8 flex gap-1 border-b border-border">
        {(
          [
            { key: "info", label: "যোগাযোগের তথ্য" },
            { key: "messages", label: `মেসেজ${unreadCount > 0 ? ` (${unreadCount})` : ""}` },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "relative -mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              tab === t.key
                ? "border-primary-600 text-primary-700"
                : "border-transparent text-ink-soft hover:text-ink"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "info" ? infoPanel : messagesPanel}
    </div>
  );
}
