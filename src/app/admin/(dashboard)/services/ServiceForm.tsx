"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormField, Input, Textarea, Select, Checkbox } from "@/components/ui/FormField";
import { UploadField } from "@/components/admin/UploadField";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { SERVICE_ICONS } from "@/components/site/service-icons";
import {
  ASPECT_RATIOS,
  ASPECT_RATIO_LABELS,
  SERVICE_CATEGORIES,
  SERVICE_TYPES,
  SERVICE_TYPE_LABELS,
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABELS,
} from "@/lib/validation";
import {
  PRICING_MODELS,
  PRICING_MODEL_LABELS,
  SQFT_MODELS,
  calculateServicePrice,
  type PricingModel,
} from "@/lib/pricing-engine";
import type { AspectRatio, Service } from "@/lib/types";
import type { ServiceFormState } from "./actions";

const initialState: ServiceFormState = {};

/** Service images have an admin-chosen ratio (see aspect_ratio select below),
 * so a single fixed media-spec doesn't apply — show guidance matching
 * whatever ratio is currently selected instead of leaving the admin to guess. */
const ASPECT_RATIO_PX: Record<AspectRatio, string> = {
  "landscape-16-9": "প্রস্তাবিত: 1280 × 720px (16:9)",
  "wide-3-1": "প্রস্তাবিত: 1500 × 500px (3:1)",
  "standard-4-3": "প্রস্তাবিত: 1200 × 900px (4:3)",
  "square-1-1": "প্রস্তাবিত: 1200 × 1200px (1:1)",
  "portrait-4-5": "প্রস্তাবিত: 960 × 1200px (4:5)",
  "vertical-9-16": "প্রস্তাবিত: 720 × 1280px (9:16)",
  custom: "কাস্টম মাপ — নিচে প্রস্থ ও উচ্চতা লিখুন",
};

export function ServiceForm({
  service,
  action,
}: {
  service?: Service;
  action: (state: ServiceFormState, formData: FormData) => Promise<ServiceFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const { showToast } = useToast();
  const router = useRouter();
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(service?.aspect_ratio ?? "standard-4-3");

  const [pricingModel, setPricingModel] = useState<PricingModel>(service?.pricing_model ?? "CUSTOM");
  const [rate, setRate] = useState(service?.rate?.toString() ?? "");
  const [designFee, setDesignFee] = useState(service?.design_fee?.toString() ?? "0");
  const [sourceFileFee, setSourceFileFee] = useState(service?.source_file_fee?.toString() ?? "0");
  const [minimumCharge, setMinimumCharge] = useState(service?.minimum_charge?.toString() ?? "");
  const [minimumQuantity, setMinimumQuantity] = useState(service?.minimum_quantity?.toString() ?? "");

  const [previewWidth, setPreviewWidth] = useState("96");
  const [previewHeight, setPreviewHeight] = useState("48");
  const [previewQuantity, setPreviewQuantity] = useState("1");

  const needsDimensions = SQFT_MODELS.includes(pricingModel);
  const isDesignOnly = pricingModel === "DESIGN_ONLY";
  const isFlat = pricingModel === "FIXED" || pricingModel === "PER_PACKAGE";
  const includesDesignFee =
    pricingModel === "PER_SQFT_PLUS_DESIGN" || pricingModel === "PER_PIECE_PLUS_DESIGN" || isDesignOnly;

  const preview = calculateServicePrice({
    config: {
      pricingModel,
      rate: rate ? Number(rate) : null,
      designFee: Number(designFee) || 0,
      sourceFileFee: Number(sourceFileFee) || 0,
      minimumCharge: minimumCharge ? Number(minimumCharge) : null,
      minimumQuantity: minimumQuantity ? Number(minimumQuantity) : null,
    },
    widthValue: Number(previewWidth),
    heightValue: Number(previewHeight),
    unit: "inch",
    quantity: Number(previewQuantity) || 1,
    option: isDesignOnly ? "design_only" : includesDesignFee ? "design_and_print" : "print_only",
  });

  useEffect(() => {
    if (state.message && !state.errors) {
      showToast("error", state.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <FormField label="সেবার নাম" name="title" required error={state.errors?.title?.[0]}>
        <Input id="title" name="title" defaultValue={service?.title ?? ""} required />
      </FormField>

      <FormField label="সংক্ষিপ্ত বিবরণ" name="description" error={state.errors?.description?.[0]}>
        <Textarea id="description" name="description" rows={3} defaultValue={service?.description ?? ""} />
      </FormField>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="ক্যাটাগরি" name="category">
          <Select id="category" name="category" defaultValue={service?.category ?? ""}>
            <option value="">নির্বাচন করুন</option>
            {SERVICE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="আইকন" name="icon" hint="ছবি না থাকলে এই আইকন দেখা যাবে">
          <Select id="icon" name="icon" defaultValue={service?.icon ?? ""}>
            <option value="">ডিফল্ট</option>
            {Object.keys(SERVICE_ICONS).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField label="ছবির অনুপাত" name="aspect_ratio">
        <Select
          id="aspect_ratio"
          name="aspect_ratio"
          value={aspectRatio}
          onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
        >
          {ASPECT_RATIOS.map((ratio) => (
            <option key={ratio} value={ratio}>
              {ASPECT_RATIO_LABELS[ratio]}
            </option>
          ))}
        </Select>
      </FormField>

      {aspectRatio === "custom" && (
        <div className="grid grid-cols-2 gap-5">
          <FormField label="প্রস্থ" name="custom_width" error={state.errors?.custom_width?.[0]}>
            <Input
              id="custom_width"
              name="custom_width"
              type="number"
              min={1}
              placeholder="1200"
              defaultValue={service?.custom_width ?? ""}
            />
          </FormField>
          <FormField label="উচ্চতা" name="custom_height" error={state.errors?.custom_height?.[0]}>
            <Input
              id="custom_height"
              name="custom_height"
              type="number"
              min={1}
              placeholder="400"
              defaultValue={service?.custom_height ?? ""}
            />
          </FormField>
        </div>
      )}

      <p className="mb-1.5 text-xs text-ink-soft">
        {ASPECT_RATIO_PX[aspectRatio]} &middot; JPG/PNG/WebP &middot; সর্বোচ্চ 5MB
      </p>
      <UploadField
        name="image"
        label="সেবার ছবি"
        existingUrl={service?.image_url}
        aspect={
          aspectRatio === "square-1-1"
            ? "aspect-square"
            : aspectRatio === "portrait-4-5"
              ? "aspect-[4/5]"
              : aspectRatio === "vertical-9-16"
                ? "aspect-[9/16]"
                : aspectRatio === "wide-3-1"
                  ? "aspect-[3/1]"
                  : "aspect-video"
        }
      />

      <FormField label="ছবির বিকল্প লেখা (Alt Text)" name="image_alt" hint="অ্যাক্সেসিবিলিটি ও SEO-র জন্য">
        <Input
          id="image_alt"
          name="image_alt"
          placeholder="যেমন: ব্যানার ও ফ্লেক্স প্রিন্টিং সেবা"
          defaultValue={service?.image_alt ?? ""}
        />
      </FormField>

      <FormField label="মূল্য" name="price" hint="ঐচ্ছিক — খালি রাখলে দেখানো হবে না">
        <Input id="price" name="price" placeholder="যেমন: ৫০০ টাকা থেকে শুরু" defaultValue={service?.price ?? ""} />
      </FormField>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="সেবার ধরন" name="service_type">
          <Select id="service_type" name="service_type" defaultValue={service?.service_type ?? "physical"}>
            {SERVICE_TYPES.map((t) => (
              <option key={t} value={t}>
                {SERVICE_TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="প্রোডাক্ট ক্যাটাগরি" name="product_category" hint="অর্ডার ফর্মের নির্দিষ্ট ফিল্ড নির্ধারণ করে">
          <Select
            id="product_category"
            name="product_category"
            defaultValue={service?.product_category ?? "print_other"}
          >
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {PRODUCT_CATEGORY_LABELS[c]}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <Checkbox
        name="requires_delivery"
        label="ডেলিভারি প্রয়োজন?"
        defaultChecked={service?.requires_delivery ?? true}
      />

      <div className="rounded-2xl border border-border bg-muted p-5">
        <h3 className="mb-1 text-sm font-semibold text-ink">মূল্য নির্ধারণ</h3>
        <p className="mb-4 text-xs text-ink-soft">
          গ্রাহকের অর্ডার পাতায় স্বয়ংক্রিয় মূল্য হিসাব চালু করতে এখানে মূল্য নির্ধারণ করুন। &ldquo;কাস্টম&rdquo;
          রাখলে গ্রাহক সরাসরি যোগাযোগ করে মূল্য জানবেন।
        </p>

        <FormField label="মূল্য নির্ধারণ পদ্ধতি" name="pricing_model">
          <Select
            id="pricing_model"
            name="pricing_model"
            value={pricingModel}
            onChange={(e) => setPricingModel(e.target.value as PricingModel)}
          >
            {PRICING_MODELS.map((m) => (
              <option key={m} value={m}>
                {PRICING_MODEL_LABELS[m]}
              </option>
            ))}
          </Select>
        </FormField>

        {pricingModel !== "CUSTOM" && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {!isDesignOnly && (
              <FormField
                label={needsDimensions ? "প্রতি বর্গফুট (৳)" : isFlat ? "মূল মূল্য (৳)" : "প্রতি পিস (৳)"}
                name="rate"
                error={state.errors?.rate?.[0]}
              >
                <Input id="rate" name="rate" type="number" min={0} step="0.01" value={rate} onChange={(e) => setRate(e.target.value)} />
              </FormField>
            )}

            {includesDesignFee && (
              <FormField label="ডিজাইন চার্জ (৳)" name="design_fee">
                <Input
                  id="design_fee"
                  name="design_fee"
                  type="number"
                  min={0}
                  step="0.01"
                  value={designFee}
                  onChange={(e) => setDesignFee(e.target.value)}
                />
              </FormField>
            )}

            <FormField label="সোর্স ফাইল চার্জ (৳)" name="source_file_fee" hint="ঐচ্ছিক — গ্রাহক 'ডিজাইন ফাইল চাই' নির্বাচন করলে যোগ হবে">
              <Input
                id="source_file_fee"
                name="source_file_fee"
                type="number"
                min={0}
                step="0.01"
                value={sourceFileFee}
                onChange={(e) => setSourceFileFee(e.target.value)}
              />
            </FormField>

            {!isDesignOnly && !isFlat && (
              <FormField label="ন্যূনতম চার্জ (৳)" name="minimum_charge" hint="ঐচ্ছিক">
                <Input
                  id="minimum_charge"
                  name="minimum_charge"
                  type="number"
                  min={0}
                  step="0.01"
                  value={minimumCharge}
                  onChange={(e) => setMinimumCharge(e.target.value)}
                />
              </FormField>
            )}

            {pricingModel.startsWith("PER_PIECE") && (
              <FormField label="ন্যূনতম পরিমাণ" name="minimum_quantity" hint="ঐচ্ছিক">
                <Input
                  id="minimum_quantity"
                  name="minimum_quantity"
                  type="number"
                  min={1}
                  value={minimumQuantity}
                  onChange={(e) => setMinimumQuantity(e.target.value)}
                />
              </FormField>
            )}
          </div>
        )}

        {pricingModel !== "CUSTOM" && (
          <div className="mt-5 rounded-xl border border-dashed border-border bg-surface p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-faint">
              প্রিভিউ ক্যালকুলেটর — শুধু যাচাইয়ের জন্য
            </p>
            <div className="flex flex-wrap items-end gap-3">
              {needsDimensions && (
                <>
                  <label className="text-xs text-ink-soft">
                    প্রস্থ (ইঞ্চি)
                    <Input
                      type="number"
                      min={0}
                      className="mt-1 w-24"
                      value={previewWidth}
                      onChange={(e) => setPreviewWidth(e.target.value)}
                    />
                  </label>
                  <label className="text-xs text-ink-soft">
                    উচ্চতা (ইঞ্চি)
                    <Input
                      type="number"
                      min={0}
                      className="mt-1 w-24"
                      value={previewHeight}
                      onChange={(e) => setPreviewHeight(e.target.value)}
                    />
                  </label>
                </>
              )}
              {!isDesignOnly && (
                <label className="text-xs text-ink-soft">
                  পরিমাণ
                  <Input
                    type="number"
                    min={1}
                    className="mt-1 w-20"
                    value={previewQuantity}
                    onChange={(e) => setPreviewQuantity(e.target.value)}
                  />
                </label>
              )}
            </div>
            <div className="mt-3 text-sm">
              {preview.ok ? (
                <>
                  {preview.areaSqFt !== null && (
                    <span className="text-ink-soft">{preview.areaSqFt} sq ft &middot; </span>
                  )}
                  <span className="font-semibold text-primary-700">
                    সর্বমোট ৳ {preview.total.toLocaleString("en-BD")}
                  </span>
                </>
              ) : (
                <span className="text-danger">{preview.error}</span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-8">
        <FormField label="ক্রম" name="display_order" hint="ছোট সংখ্যা আগে দেখাবে">
          <Input
            id="display_order"
            name="display_order"
            type="number"
            className="w-28"
            defaultValue={service?.display_order ?? 0}
          />
        </FormField>
        <div className="pt-6">
          <Checkbox name="is_active" label="সক্রিয়" defaultChecked={service?.is_active ?? true} />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "সংরক্ষণ হচ্ছে..." : service ? "সংরক্ষণ করুন" : "সেবা যোগ করুন"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/services")}>
          বাতিল
        </Button>
      </div>
    </form>
  );
}
