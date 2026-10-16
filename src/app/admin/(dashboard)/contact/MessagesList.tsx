"use client";

import { useState } from "react";
import { Mail, MailOpen, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmptyState } from "@/components/site/EmptyState";
import { formatDate } from "@/lib/utils";
import { markMessageRead, deleteMessage } from "./actions";
import type { ContactMessage } from "@/lib/types";

export function MessagesList({ messages }: { messages: ContactMessage[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (messages.length === 0) {
    return (
      <EmptyState
        icon={Mail}
        title="এখনও কোনো মেসেজ নেই।"
        description="আপনার যোগাযোগ ফর্মের মেসেজ এখানে দেখা যাবে।"
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <ul className="divide-y divide-border">
        {messages.map((message) => (
          <li key={message.id} className={message.is_read ? "bg-surface" : "bg-primary-50/40"}>
            <button
              type="button"
              onClick={() => setExpanded(expanded === message.id ? null : message.id)}
              className="flex w-full items-start gap-4 px-5 py-4 text-left"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-ink">{message.name}</p>
                  {!message.is_read && (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                  )}
                  {message.service && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-ink-soft">
                      {message.service}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-ink-faint">{message.contact}</p>
                <p
                  className={`mt-1.5 text-sm text-ink-soft ${
                    expanded === message.id ? "" : "truncate"
                  }`}
                >
                  {message.message}
                </p>
              </div>
              <span className="shrink-0 text-xs text-ink-faint">
                {formatDate(message.created_at)}
              </span>
            </button>
            <div className="flex items-center gap-1 px-5 pb-3">
              <form action={markMessageRead.bind(null, message.id, !message.is_read)}>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-soft hover:bg-muted hover:text-ink"
                >
                  {message.is_read ? (
                    <>
                      <Mail className="h-3.5 w-3.5" /> অপঠিত করুন
                    </>
                  ) : (
                    <>
                      <MailOpen className="h-3.5 w-3.5" /> পঠিত করুন
                    </>
                  )}
                </button>
              </form>
              <ConfirmDialog
                action={deleteMessage.bind(null, message.id)}
                title="মেসেজটি মুছে ফেলুন"
                description="এই মেসেজটি স্থায়ীভাবে মুছে ফেলা হবে।"
                confirmLabel="মুছে ফেলুন"
                trigger={<Trash2 className="h-3.5 w-3.5" />}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
