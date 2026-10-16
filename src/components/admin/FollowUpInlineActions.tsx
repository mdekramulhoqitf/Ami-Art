"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/FormField";
import {
  completeFollowUp,
  skipFollowUp,
  postponeFollowUp,
  addFollowUpNote,
} from "@/app/admin/(dashboard)/followups/actions";

/** Same four actions and the same follow_ups row /admin/followups itself
    acts on (completeFollowUp/skipFollowUp/postponeFollowUp/addFollowUpNote) —
    just exposed inline on the order/customer page instead of forcing a trip
    to the global follow-up list. Each action already revalidates this exact
    page's path (see revalidateFollowupSurfaces in followups/actions.ts), so
    the row disappears here the moment it's completed/skipped, same as it
    would on /admin/followups. */
export function FollowUpInlineActions({ followUpId }: { followUpId: string }) {
  const [pending, startTransition] = useTransition();
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState("");

  return (
    <div className="mt-3 border-t border-border pt-3">
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="primary"
          disabled={pending}
          onClick={() => startTransition(() => completeFollowUp(followUpId))}
        >
          সম্পন্ন
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={pending}
          onClick={() => {
            const in3Days = new Date();
            in3Days.setDate(in3Days.getDate() + 3);
            startTransition(() => postponeFollowUp(followUpId, in3Days.toISOString()));
          }}
        >
          ৩ দিন পরে করবো
        </Button>
        <Button size="sm" variant="ghost" disabled={pending} onClick={() => setShowNote((s) => !s)}>
          নোট যোগ করুন
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={() => startTransition(() => skipFollowUp(followUpId))}
        >
          বাদ দিন
        </Button>
      </div>

      {showNote && (
        <div className="mt-2 flex gap-2">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="একটি নোট লিখুন..."
            aria-label="ফলো-আপ নোট"
            className="flex-1"
          />
          <Button
            size="sm"
            disabled={pending || !note.trim()}
            onClick={() =>
              startTransition(async () => {
                await addFollowUpNote(followUpId, note);
                setNote("");
                setShowNote(false);
              })
            }
          >
            সংরক্ষণ
          </Button>
        </div>
      )}
    </div>
  );
}
