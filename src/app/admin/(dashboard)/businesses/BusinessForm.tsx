"use client";

import { useActionState } from "react";
import { AlertTriangle } from "lucide-react";
import { FormField, Input, Select, Textarea, Checkbox } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import type { Business } from "@/lib/types";
import type { BusinessFormState } from "./actions";

const SOURCE_TYPE_LABELS: Record<string, string> = {
  google_maps: "Google Maps",
  facebook: "Facebook",
  instagram: "Instagram",
  website: "ওয়েবসাইট",
  local_directory: "লোকাল ডিরেক্টরি",
  offline_research: "অফলাইন রিসার্চ",
  customer_referral: "গ্রাহকের রেফারেন্স",
  existing_customer: "বিদ্যমান গ্রাহক",
  manual_entry: "সরাসরি এন্ট্রি",
};

const initialState: BusinessFormState = {};

export function BusinessForm({
  business,
  action,
  defaultStatus,
}: {
  business?: Business;
  action: (state: BusinessFormState, formData: FormData) => Promise<BusinessFormState>;
  defaultStatus?: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="max-w-3xl space-y-8">
      {state.possibleDuplicates && state.possibleDuplicates.length > 0 && (
        <div className="rounded-lg border border-accent-200 bg-accent-50 p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-danger">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            সম্ভাব্য ডুপ্লিকেট পাওয়া গেছে
          </p>
          <ul className="mt-2 space-y-1 text-sm text-ink-soft">
            {state.possibleDuplicates.map((d) => (
              <li key={d.id}>
                — {d.name} {d.phone && `(${d.phone})`} · মিল: {d.matchedOn === "phone" ? "ফোন নম্বর" : "নাম"}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-ink-faint">
            যদি এটি সত্যিই একটি নতুন, আলাদা ব্যবসা হয়, নিচের বাটনে চাপ দিয়ে তবুও সংরক্ষণ করুন।
          </p>
          <input type="hidden" name="skip_duplicate_check" value="1" />
        </div>
      )}

      <div className="space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-faint">মূল তথ্য</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label="ব্যবসার নাম" name="name" required error={state.errors?.name?.[0]}>
            <Input id="name" name="name" defaultValue={business?.name ?? ""} required />
          </FormField>
          <FormField label="ক্যাটাগরি" name="category" hint="যেমন: রেস্টুরেন্ট, স্কুল, দোকান">
            <Input id="category" name="category" defaultValue={business?.category ?? ""} />
          </FormField>
          <FormField label="সাব-ক্যাটাগরি" name="subcategory">
            <Input id="subcategory" name="subcategory" defaultValue={business?.subcategory ?? ""} />
          </FormField>
          <FormField label="এলাকা" name="area" hint="যেমন: বরগুনা সদর, আমতলী">
            <Input id="area" name="area" defaultValue={business?.area ?? ""} />
          </FormField>
        </div>
        <FormField label="ঠিকানা" name="address">
          <Input id="address" name="address" defaultValue={business?.address ?? ""} />
        </FormField>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label="ফোন" name="phone">
            <Input id="phone" name="phone" defaultValue={business?.phone ?? ""} />
          </FormField>
          <FormField label="ওয়েবসাইট" name="website">
            <Input id="website" name="website" defaultValue={business?.website ?? ""} />
          </FormField>
          <FormField label="Facebook" name="facebook">
            <Input id="facebook" name="facebook" defaultValue={business?.facebook ?? ""} />
          </FormField>
          <FormField label="Instagram" name="instagram">
            <Input id="instagram" name="instagram" defaultValue={business?.instagram ?? ""} />
          </FormField>
        </div>
        <FormField label="Google Maps লিংক" name="google_maps_url">
          <Input id="google_maps_url" name="google_maps_url" defaultValue={business?.google_maps_url ?? ""} />
        </FormField>
      </div>

      <div className="space-y-5 border-t border-border pt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-faint">উৎস (Source)</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label="উৎসের ধরন" name="source_type">
            <Select id="source_type" name="source_type" defaultValue={business?.source_type ?? ""}>
              <option value="">নির্বাচন করুন</option>
              {Object.entries(SOURCE_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="উৎস / নোট" name="source" hint="যেমন: Google Maps সার্চ, রেফারেন্স দিয়েছেন যিনি">
            <Input id="source" name="source" defaultValue={business?.source ?? ""} />
          </FormField>
          <FormField label="উৎসের লিংক" name="source_url">
            <Input id="source_url" name="source_url" defaultValue={business?.source_url ?? ""} />
          </FormField>
          <FormField label="সংগ্রহকারী" name="collected_by">
            <Input id="collected_by" name="collected_by" defaultValue={business?.collected_by ?? ""} />
          </FormField>
        </div>
        <FormField label="যাচাই অবস্থা" name="verification_status">
          <Select
            id="verification_status"
            name="verification_status"
            defaultValue={business?.verification_status ?? "unverified"}
          >
            <option value="unverified">অযাচাইকৃত</option>
            <option value="verified">যাচাইকৃত</option>
            <option value="needs_review">পর্যালোচনা প্রয়োজন</option>
            <option value="outdated">পুরনো তথ্য</option>
          </Select>
        </FormField>
      </div>

      <div className="space-y-5 border-t border-border pt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-faint">যোগ্যতা নির্ধারণ</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label="স্ট্যাটাস" name="business_status">
            <Select
              id="business_status"
              name="business_status"
              defaultValue={business?.business_status ?? defaultStatus ?? "prospect"}
            >
              <option value="prospect">প্রসপেক্ট</option>
              <option value="lead">লিড</option>
              <option value="customer">গ্রাহক</option>
              <option value="inactive">নিষ্ক্রিয়</option>
            </Select>
          </FormField>
          <FormField label="অগ্রাধিকার" name="priority_level">
            <Select id="priority_level" name="priority_level" defaultValue={business?.priority_level ?? "normal"}>
              <option value="low">কম</option>
              <option value="normal">স্বাভাবিক</option>
              <option value="high">উচ্চ</option>
              <option value="urgent">জরুরি</option>
            </Select>
          </FormField>
          <FormField label="আনুমানিক আকার" name="estimated_size" hint="যেমন: ছোট, মাঝারি, বড়">
            <Input id="estimated_size" name="estimated_size" defaultValue={business?.estimated_size ?? ""} />
          </FormField>
          <FormField label="সম্ভাব্য মূল্য (৳)" name="potential_value">
            <Input
              id="potential_value"
              name="potential_value"
              type="number"
              min={0}
              defaultValue={business?.potential_value ?? ""}
            />
          </FormField>
          <FormField label="প্রিন্টিং প্রয়োজন" name="estimated_printing_need">
            <Input
              id="estimated_printing_need"
              name="estimated_printing_need"
              defaultValue={business?.estimated_printing_need ?? ""}
            />
          </FormField>
          <FormField label="প্রিন্টিং এর ঘনত্ব" name="estimated_printing_frequency" hint="যেমন: মাসিক, মৌসুমি">
            <Input
              id="estimated_printing_frequency"
              name="estimated_printing_frequency"
              defaultValue={business?.estimated_printing_frequency ?? ""}
            />
          </FormField>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          <Checkbox name="new_business_flag" label="নতুন ব্যবসা" defaultChecked={business?.new_business_flag ?? false} />
          <Checkbox name="rebranding_flag" label="রিব্র্যান্ডিং করছে" defaultChecked={business?.rebranding_flag ?? false} />
          <Checkbox
            name="promotional_activity_flag"
            label="প্রচারণামূলক কার্যক্রম চলছে"
            defaultChecked={business?.promotional_activity_flag ?? false}
          />
          <Checkbox
            name="existing_supplier_known"
            label="বর্তমান সাপ্লায়ার জানা আছে"
            defaultChecked={business?.existing_supplier_known ?? false}
          />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label="মৌসুমি চাহিদা" name="seasonal_demand" hint="যেমন: ঈদ, পূজা, নতুন বছর">
            <Input id="seasonal_demand" name="seasonal_demand" defaultValue={business?.seasonal_demand ?? ""} />
          </FormField>
          <FormField label="পরবর্তী ফলো-আপ তারিখ" name="next_followup_at">
            <Input
              id="next_followup_at"
              name="next_followup_at"
              type="date"
              defaultValue={business?.next_followup_at ? business.next_followup_at.slice(0, 10) : ""}
            />
          </FormField>
        </div>
      </div>

      <div className="space-y-5 border-t border-border pt-6">
        <FormField label="ট্যাগ" name="tags" hint="কমা দিয়ে আলাদা করুন — যেমন: রেস্টুরেন্ট, উচ্চ-মূল্য">
          <Input id="tags" name="tags" defaultValue={business?.tags?.join(", ") ?? ""} />
        </FormField>
        <FormField label="নোট" name="notes">
          <Textarea id="notes" name="notes" rows={4} defaultValue={business?.notes ?? ""} />
        </FormField>
      </div>

      {state.message && !state.possibleDuplicates && (
        <p className="text-sm text-danger">{state.message}</p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "সংরক্ষণ হচ্ছে…" : business ? "সংরক্ষণ করুন" : "ব্যবসা যোগ করুন"}
        </Button>
      </div>
    </form>
  );
}
