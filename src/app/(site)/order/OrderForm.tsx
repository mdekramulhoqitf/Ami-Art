"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronLeft, ChevronRight, Heart, PartyPopper, Sparkles } from "lucide-react";
import { FormField, Input, Select, Textarea } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { FileUpload } from "./FileUpload";
import { OrderProductFields, type CustomFieldsValue } from "@/components/site/OrderProductFields";
import { PricingCalculator, type PricingSelection } from "@/components/site/PricingCalculator";
import { submitOrder, type OrderAttachment } from "./actions";
import { incomingOrderFilePath, uploadOrderFile } from "@/lib/supabase/storage";
import { orderCustomerSchema, orderDetailsSchema, DELIVERY_METHODS, BUDGET_TYPES } from "@/lib/validation";
import { DELIVERY_METHOD_LABELS } from "@/lib/invoice-status";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { ReorderData } from "@/lib/queries/orders";
import type { DeliveryMethod, Service } from "@/lib/types";

const STEPS = [
  { id: 1, label: "আপনার তথ্য" },
  { id: 2, label: "কাজের তথ্য" },
  { id: 3, label: "ফাইল সংযুক্ত করুন" },
  { id: 4, label: "নিশ্চিতকরণ" },
] as const;

type FormState = {
  customer_name: string;
  phone: string;
  email: string;
  address: string;
  business_name: string;
  service_id: string;
  service_label: string;
  description: string;
  quantity: string;
  required_date: string;
  budget_type: (typeof BUDGET_TYPES)[number] | "";
  budget: string;
  delivery_required: boolean;
  delivery_method: DeliveryMethod | "";
  delivery_address: string;
};

function initialFormState(services: Service[], initialServiceId?: string, reorder?: ReorderData | null): FormState {
  // A reorder never carries over delivery date, budget, or delivery details —
  // only identity + work-content fields are safe to reuse; logistics/pricing
  // must always be reconsidered fresh for a new order.
  const reorderService = reorder?.serviceId ? services.find((s) => s.id === reorder.serviceId) : undefined;
  const preselected = !reorder && initialServiceId ? services.find((s) => s.id === initialServiceId) : undefined;

  return {
    customer_name: reorder?.customerName ?? "",
    phone: reorder?.phone ?? "",
    email: reorder?.email ?? "",
    address: reorder?.address ?? "",
    business_name: reorder?.businessName ?? "",
    service_id: reorderService?.id ?? preselected?.id ?? "",
    service_label: reorderService?.title ?? reorder?.serviceLabel ?? preselected?.title ?? "",
    description: reorder?.description ?? "",
    quantity: reorder?.quantity ?? "1",
    required_date: "",
    budget_type: "",
    budget: "",
    delivery_required: false,
    delivery_method: "",
    delivery_address: "",
  };
}

const REFERRAL_STORAGE_KEY = "ami_referral_code";

export function OrderForm({
  services,
  initialServiceId,
  initialReferralCode,
  reorderData,
  reorderAvailableReward,
}: {
  services: Service[];
  initialServiceId?: string;
  initialReferralCode?: string;
  reorderData?: ReorderData | null;
  reorderAvailableReward?: number | null;
}) {
  const [step, setStep] = useState(1);
  // Referral attribution must survive refresh/navigation, not just React
  // state — localStorage persists it across the whole visit. The trust-line
  // UI only reflects arriving fresh via ?ref= this load (server value, no
  // hydration mismatch); the actual value submitted with the order also
  // covers a code stored from an earlier visit, via a ref so restoring it
  // from localStorage never needs a setState-in-effect.
  const referralCode = initialReferralCode?.trim().toUpperCase() || null;
  const referralCodeRef = useRef<string | null>(referralCode);
  const [form, setForm] = useState<FormState>(() => initialFormState(services, initialServiceId, reorderData));
  const [customFields, setCustomFields] = useState<CustomFieldsValue>(
    () => (reorderData?.customFields as CustomFieldsValue) ?? {}
  );
  const [pricingSelection, setPricingSelection] = useState<PricingSelection | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [orderToken, setOrderToken] = useState<string | null>(null);
  const [customerNumber, setCustomerNumber] = useState<string | null>(null);
  const [isNewCustomer, setIsNewCustomer] = useState<boolean | null>(null);
  const [welcomePoints, setWelcomePoints] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (referralCode) {
      window.localStorage.setItem(REFERRAL_STORAGE_KEY, referralCode);
      return;
    }
    const stored = window.localStorage.getItem(REFERRAL_STORAGE_KEY);
    if (stored) referralCodeRef.current = stored;
  }, [referralCode]);

  // Progressive-profiling recognition: a phone match returns only a first
  // name — never full profile/history — so a stranger typing someone else's
  // real number can't see anything private, only a generic greeting.
  const [recognizedName, setRecognizedName] = useState<string | null>(null);
  const [useSaved, setUseSaved] = useState(false);
  const [dismissedRecognition, setDismissedRecognition] = useState(false);
  const checkedPhoneRef = useRef<string>("");

  async function checkPhoneRecognition(phone: string) {
    const trimmed = phone.trim();
    if (trimmed.length < 10 || trimmed === checkedPhoneRef.current) return;
    checkedPhoneRef.current = trimmed;
    try {
      const supabase = createClient();
      const { data } = await supabase.rpc("check_returning_customer", { p_phone: trimmed });
      if (data && data.length > 0 && data[0].out_name) {
        setRecognizedName(data[0].out_name);
        setDismissedRecognition(false);
      } else {
        setRecognizedName(null);
      }
    } catch {
      // Recognition is a convenience, never a requirement — a failed lookup
      // just means the form behaves like a first-time order.
    }
  }

  const selectedService = useMemo(
    () => services.find((s) => s.id === form.service_id),
    [services, form.service_id]
  );
  const requiresDelivery = selectedService ? selectedService.requires_delivery : true;
  const productCategory = selectedService?.product_category ?? "print_other";

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function goNext() {
    if (step === 1) {
      const result = orderCustomerSchema.safeParse(form);
      if (!result.success) {
        setErrors(flatten(result.error.flatten().fieldErrors));
        return;
      }
    }
    if (step === 2) {
      const result = orderDetailsSchema.safeParse({
        ...form,
        delivery_required: requiresDelivery && form.delivery_required,
      });
      const dimensionErrors: Record<string, string> = {};
      if (productCategory === "banner" || productCategory === "signboard") {
        if (!customFields.width?.trim()) dimensionErrors.width = "প্রস্থ লিখুন।";
        if (!customFields.height?.trim()) dimensionErrors.height = "উচ্চতা লিখুন।";
      }
      if (!result.success || Object.keys(dimensionErrors).length > 0) {
        setErrors({
          ...(result.success ? {} : flatten(result.error.flatten().fieldErrors)),
          ...dimensionErrors,
        });
        return;
      }
    }
    setErrors({});
    setStep((s) => Math.min(s + 1, 4));
  }

  function goBack() {
    setErrors({});
    setStep((s) => Math.max(s - 1, 1));
  }

  function handleSubmit() {
    setSubmitError(null);
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.set(key, typeof value === "boolean" ? String(value) : value);
    });
    if (!requiresDelivery) {
      formData.set("delivery_required", "false");
    }
    formData.set("custom_fields", JSON.stringify(customFields));
    formData.set("product_category", productCategory);
    if (referralCodeRef.current) {
      formData.set("referral_code", referralCodeRef.current);
    }
    if (pricingSelection && selectedService?.pricing_model !== "CUSTOM") {
      formData.set(
        "pricing_input",
        JSON.stringify({
          widthValue: pricingSelection.widthValue,
          heightValue: pricingSelection.heightValue,
          unit: pricingSelection.unit,
          quantity: pricingSelection.quantity,
          option: pricingSelection.option,
          wantSourceFile: pricingSelection.wantSourceFile,
        })
      );
    }
    startTransition(async () => {
      // Files go straight from the browser to Storage; only their paths
      // reach the Server Action, whose body Vercel caps at 4.5 MB.
      if (files.length > 0) {
        setUploadingFiles(true);
        try {
          const supabase = createClient();
          const batchId = crypto.randomUUID();
          const attachments: OrderAttachment[] = [];
          for (const file of files) {
            const path = incomingOrderFilePath(batchId, file.name);
            await uploadOrderFile(supabase, path, file);
            attachments.push({ path, name: file.name, type: file.type, size: file.size });
          }
          formData.set("attachments", JSON.stringify(attachments));
        } catch {
          setSubmitError("ফাইল আপলোড করা যায়নি। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।");
          return;
        } finally {
          setUploadingFiles(false);
        }
      }

      const result = await submitOrder(formData);
      if (result.success && result.orderNumber) {
        setOrderNumber(result.orderNumber);
        setOrderToken(result.orderToken ?? null);
        setCustomerNumber(result.customerNumber ?? null);
        setIsNewCustomer(result.isNewCustomer ?? null);
        setWelcomePoints(result.welcomePoints ?? null);
      } else {
        setErrors(result.errors ? flatten(result.errors) : {});
        setSubmitError(result.message ?? "অর্ডারটি পাঠানো যায়নি। আবার চেষ্টা করুন।");
      }
    });
  }

  if (orderNumber) {
    return (
      <div className="mx-auto max-w-lg animate-fade-in rounded-2xl border border-border bg-surface p-8 text-center sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-success">
          <PartyPopper className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-ink">
          {isNewCustomer === false ? "আবারও ধন্যবাদ" : "ধন্যবাদ"}, {form.customer_name} ❤️
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          আপনার অর্ডারটি আমরা পেয়েছি, যত্নসহকারে সংরক্ষণ করা হয়েছে। খুব শিগগিরই আমাদের পক্ষ থেকে আপনার সাথে যোগাযোগ করা হবে।
        </p>
        <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-primary-50 px-5 py-2.5 text-sm font-semibold text-primary-700">
          অর্ডার নম্বর: {orderNumber}
        </div>

        {customerNumber && (
          <div className="mt-4 rounded-xl border border-primary-200 bg-primary-50/60 p-4 text-left">
            <p className="text-xs font-medium uppercase tracking-wide text-primary-700">
              আপনার AMI ART কাস্টমার আইডি
            </p>
            <p className="mt-1 text-lg font-semibold text-ink">{customerNumber}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
              {isNewCustomer === false
                ? "আপনার নতুন অর্ডারটি আপনার আগের AMI ART প্রোফাইলের সাথেই যুক্ত হয়েছে।"
                : "এখন থেকে আপনার অর্ডার, রিওয়ার্ড ও রেফারেল — সবকিছু এই আইডির সাথে যুক্ত থাকবে।"}
            </p>
            {welcomePoints != null && welcomePoints > 0 && (
              <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-primary-700">
                <Heart className="h-4 w-4 fill-current" /> স্বাগতম বোনাস: {welcomePoints} AMI Points অর্জিত হয়েছে
              </p>
            )}
          </div>
        )}

        {orderToken && (
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <Button href={`/order/status/${orderToken}`} size="sm">
              আমার অর্ডার ও AMI ART দেখুন
            </Button>
            <Button href={`/order/status/${orderToken}#referral`} variant="ghost" size="sm">
              বন্ধুকে রেফার করুন
            </Button>
          </div>
        )}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button href="/">হোমে ফিরে যান</Button>
          <Button
            variant="secondary"
            onClick={() => {
              setForm(initialFormState(services));
              setCustomFields({});
              setFiles([]);
              setStep(1);
              setOrderNumber(null);
              setOrderToken(null);
              setCustomerNumber(null);
              setIsNewCustomer(null);
              setWelcomePoints(null);
              setRecognizedName(null);
              setUseSaved(false);
              setDismissedRecognition(false);
              checkedPhoneRef.current = "";
            }}
          >
            আরেকটি অর্ডার করুন
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {reorderData && (
        <div className="mb-5 rounded-xl border border-border bg-muted px-4 py-3 text-sm text-ink-soft">
          <p>আপনার আগের অর্ডারের তথ্য রাখা হয়েছে। প্রয়োজন হলে পরিবর্তন করুন।</p>
          {reorderAvailableReward != null && reorderAvailableReward > 0 && (
            <p className="mt-1 text-xs text-ink-faint">
              আপনার Reward balance: ৳{reorderAvailableReward.toLocaleString("en-BD")} — ইনভয়েস তৈরি হলে ব্যবহার করতে
              পারবেন।
            </p>
          )}
        </div>
      )}
      {referralCode && (
        <p className="mb-4 text-center text-xs text-ink-faint">আপনি একটি AMI ART Referral Link থেকে এসেছেন।</p>
      )}
      <ol className="mb-10 flex items-center justify-between">
        {STEPS.map((s, i) => (
          <li key={s.id} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                  step === s.id
                    ? "bg-primary-600 text-white"
                    : step > s.id
                      ? "bg-primary-100 text-primary-700"
                      : "bg-muted text-ink-faint"
                )}
              >
                {step > s.id ? <CheckCircle2 className="h-5 w-5" /> : s.id}
              </div>
              <span
                className={cn(
                  "hidden text-xs font-medium sm:block",
                  step === s.id ? "text-ink" : "text-ink-faint"
                )}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-2 h-0.5 flex-1 rounded-full transition-colors",
                  step > s.id ? "bg-primary-300" : "bg-border"
                )}
              />
            )}
          </li>
        ))}
      </ol>

      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
        {Object.keys(errors).length > 0 && (
          <div role="alert" className="mb-5 rounded-lg bg-accent-50 px-4 py-3 text-sm text-danger">
            <p className="font-medium">নিচের তথ্যগুলো একটু ঠিক করে দিন:</p>
            <ul className="mt-1 list-inside list-disc space-y-0.5">
              {Object.values(errors).map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <p className="text-sm text-ink-soft">আপনার সাথে পরিচিত হই ❤️ শুধু নাম আর নম্বরটা দিন, বাকিটা এগিয়ে যাই।</p>
            <FormField label="নাম" name="customer_name" required error={errors.customer_name}>
              <Input
                value={form.customer_name}
                onChange={(e) => update("customer_name", e.target.value)}
                placeholder="আপনার নাম"
              />
            </FormField>
            <FormField
              label="মোবাইল নম্বর"
              name="phone"
              required
              error={errors.phone}
              hint="আপনার কাজের বিষয়ে প্রয়োজনে যোগাযোগ করার জন্য।"
            >
              <Input
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                onBlur={(e) => checkPhoneRecognition(e.target.value)}
                placeholder="01xxxxxxxxx"
                inputMode="tel"
              />
            </FormField>

            {recognizedName && !dismissedRecognition && (
              <div className="animate-fade-in rounded-xl border border-primary-200 bg-primary-50/60 p-4">
                <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
                  <Sparkles className="h-4 w-4 text-primary-600" />
                  আবারও স্বাগতম, {recognizedName} ❤️
                </p>
                <p className="mt-1 text-sm text-ink-soft">আপনার আগের তথ্য পাওয়া গেছে। এগুলো ব্যবহার করবেন?</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setUseSaved(true);
                      setDismissedRecognition(true);
                      update("customer_name", recognizedName);
                    }}
                  >
                    হ্যাঁ, এগিয়ে যান
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setUseSaved(false);
                      setDismissedRecognition(true);
                    }}
                  >
                    নতুন তথ্য ব্যবহার করুন
                  </Button>
                </div>
              </div>
            )}

            <FormField
              label="ই-মেইল"
              name="email"
              error={errors.email}
              hint="ঐচ্ছিক — অর্ডারের আপডেট পাঠানোর জন্য।"
            >
              <Input
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="you@example.com"
                type="email"
              />
            </FormField>
            <FormField label="ঠিকানা" name="address" hint="ঐচ্ছিক">
              <Input
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                placeholder="আপনার ঠিকানা"
              />
            </FormField>

            {!useSaved && (
              <FormField
                label="ব্যবসা/প্রতিষ্ঠানের নাম"
                name="business_name"
                hint="ব্যবসার জন্য অর্ডার করলে দিন — না হলে ফাঁকা রাখুন।"
              >
                <Input
                  value={form.business_name}
                  onChange={(e) => update("business_name", e.target.value)}
                  placeholder="যেমন: আমি আর্ট"
                />
              </FormField>
            )}

            <p className="text-xs leading-relaxed text-ink-faint">
              আপনার তথ্য পরবর্তী অর্ডার সহজ করার জন্য সংরক্ষণ করা হবে। আপনি চাইলে যেকোনো সময় আপনার তথ্য পরিবর্তন
              করতে পারবেন।
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <p className="text-sm text-ink-soft">আপনার কাজটা একটু বুঝে নিই — যতটুকু জানেন, ততটুকুই লিখুন।</p>
            <FormField label="আপনি কী কাজ করতে চান?" name="service_label" required error={errors.service_label}>
              <Select
                value={form.service_id || "other"}
                onChange={(e) => {
                  if (e.target.value === "other") {
                    update("service_id", "");
                    update("service_label", "");
                  } else {
                    const selected = services.find((s) => s.id === e.target.value);
                    update("service_id", e.target.value);
                    update("service_label", selected?.title ?? "");
                  }
                  setCustomFields({});
                }}
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
                <option value="other">অন্যান্য</option>
              </Select>
            </FormField>

            {!form.service_id && (
              <FormField label="আপনার কাজের ধরন লিখুন" name="service_label_custom" required error={errors.service_label}>
                <Input
                  value={form.service_label}
                  onChange={(e) => update("service_label", e.target.value)}
                  placeholder="যেমন: কাস্টম স্টিকার"
                />
              </FormField>
            )}

            {selectedService && productCategory !== "print_other" && (
              <div className="rounded-xl border border-border bg-muted p-4">
                <OrderProductFields
                  category={productCategory}
                  value={customFields}
                  onChange={setCustomFields}
                  errors={errors}
                />
              </div>
            )}

            {selectedService && selectedService.pricing_model !== "CUSTOM" && (
              <PricingCalculator service={selectedService} onChange={setPricingSelection} />
            )}

            <FormField
              label="আপনার কাজটা একটু বুঝিয়ে বলুন"
              name="description"
              required
              error={errors.description}
              hint="কী বানাতে চান, কোথায় ব্যবহার করবেন, কতগুলো লাগবে — যা জানেন লিখুন। বাকিটা আমরা প্রয়োজনে জিজ্ঞাসা করব।"
            >
              <Textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={6}
                placeholder="যেমন: দোকানের সামনে লাগানোর জন্য একটা সাইনবোর্ড দরকার, নাম ও ঠিকানা থাকবে..."
              />
            </FormField>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormField label="পরিমাণ" name="quantity" required error={errors.quantity}>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  value={form.quantity}
                  onChange={(e) => update("quantity", e.target.value)}
                  placeholder="যেমন: ২"
                />
              </FormField>
              <FormField
                label="প্রয়োজনের তারিখ"
                name="required_date"
                error={errors.required_date}
                hint="নির্দিষ্ট তারিখ না জানলেও সমস্যা নেই — ফাঁকা রাখতে পারেন।"
              >
                {/* Deliberately uncontrolled: a controlled type="date" input that
                    feeds value back into the DOM on every keystroke fights the
                    browser's own date-segment editor and can corrupt the typed
                    year (e.g. "0296"). Reading via onChange without echoing
                    value back avoids that; remounting on step re-entry (this
                    block only renders when step === 2) still restores whatever
                    was last saved in state. */}
                <Input
                  key={step}
                  type="date"
                  defaultValue={form.required_date}
                  min={new Date().toISOString().slice(0, 10)}
                  max={`${new Date().getFullYear() + 5}-12-31`}
                  onChange={(e) => update("required_date", e.target.value)}
                />
              </FormField>
            </div>

            <div>
              <p className="text-sm font-medium text-ink">
                আপনার বাজেট সম্পর্কে কিছু ধারণা আছে?
                <span className="ml-0.5 text-accent-500">*</span>
              </p>
              <p className="mb-2 mt-0.5 text-xs text-ink-soft">
                {selectedService && selectedService.pricing_model !== "CUSTOM"
                  ? "উপরে হিসাব করা মূল্যটি প্রাথমিক ধারণা — চূড়ান্ত করার আগে এখানে আপনার বাজেট জানাতে পারেন।"
                  : "না জানলেও সমস্যা নেই। প্রয়োজন অনুযায়ী আলোচনা করা যাবে।"}
              </p>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm text-ink">
                  <input
                    type="radio"
                    name="budget_type"
                    checked={form.budget_type === BUDGET_TYPES[0]}
                    onChange={() => update("budget_type", BUDGET_TYPES[0])}
                    className="h-4 w-4 text-primary-600"
                  />
                  বাজেট জানা আছে
                </label>
                <label className="flex items-center gap-2 text-sm text-ink">
                  <input
                    type="radio"
                    name="budget_type"
                    checked={form.budget_type === BUDGET_TYPES[1]}
                    onChange={() => update("budget_type", BUDGET_TYPES[1])}
                    className="h-4 w-4 text-primary-600"
                  />
                  আলোচনা সাপেক্ষে
                </label>
              </div>
              {errors.budget_type && <p className="mt-1.5 text-xs text-danger">{errors.budget_type}</p>}
              {form.budget_type === BUDGET_TYPES[0] && (
                <div className="mt-3">
                  <Input
                    type="number"
                    min={1}
                    value={form.budget}
                    onChange={(e) => update("budget", e.target.value)}
                    placeholder="৳ পরিমাণ লিখুন"
                  />
                  {errors.budget && <p className="mt-1.5 text-xs text-danger">{errors.budget}</p>}
                </div>
              )}
            </div>

            {requiresDelivery && (
              <>
                <div>
                  <p className="mb-2 text-sm font-medium text-ink">ডেলিভারি প্রয়োজন?</p>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 text-sm text-ink">
                      <input
                        type="radio"
                        name="delivery_required"
                        checked={form.delivery_required}
                        onChange={() => update("delivery_required", true)}
                        className="h-4 w-4 text-primary-600"
                      />
                      হ্যাঁ
                    </label>
                    <label className="flex items-center gap-2 text-sm text-ink">
                      <input
                        type="radio"
                        name="delivery_required"
                        checked={!form.delivery_required}
                        onChange={() => update("delivery_required", false)}
                        className="h-4 w-4 text-primary-600"
                      />
                      না (দোকান থেকে সংগ্রহ)
                    </label>
                  </div>
                </div>

                {form.delivery_required && (
                  <>
                    <FormField label="ডেলিভারি পদ্ধতি" name="delivery_method" required>
                      <Select
                        value={form.delivery_method}
                        onChange={(e) => update("delivery_method", e.target.value as DeliveryMethod)}
                      >
                        <option value="">নির্বাচন করুন</option>
                        {DELIVERY_METHODS.filter((m) => m !== "pickup").map((m) => (
                          <option key={m} value={m}>
                            {DELIVERY_METHOD_LABELS[m]}
                          </option>
                        ))}
                      </Select>
                    </FormField>
                    {form.delivery_method === "courier" && (
                      <p className="text-xs text-ink-soft">
                        কুরিয়ার ডেলিভারি সুবিধা রয়েছে। প্রযোজ্য ক্ষেত্রে কুরিয়ার চার্জ যোগ হবে।
                      </p>
                    )}
                    <FormField
                      label="ডেলিভারি ঠিকানা"
                      name="delivery_address"
                      required
                      error={errors.delivery_address}
                    >
                      <Input
                        value={form.delivery_address}
                        onChange={(e) => update("delivery_address", e.target.value)}
                        placeholder="ডেলিভারির ঠিকানা লিখুন"
                      />
                    </FormField>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="mb-1.5 text-sm font-medium text-ink">
              ছবি, লোগো বা ডিজাইন ফাইল থাকলে যুক্ত করুন
            </p>
            <p className="mb-4 text-sm text-ink-soft">
              ঐচ্ছিক — ডিজাইন ফাইল না থাকলেও সমস্যা নেই, ফাইল ছাড়াই অর্ডার করা যায়।
            </p>
            <FileUpload files={files} onChange={setFiles} />
          </div>
        )}

        {step === 4 && (
          <div>
            <ReviewSummary form={form} files={files} requiresDelivery={requiresDelivery} />
            <div className="mt-6 rounded-lg bg-muted p-4 text-xs leading-relaxed text-ink-soft">
              <p className="mb-1 font-semibold text-ink">অর্ডার পাঠানোর আগে</p>
              আপনার দেওয়া তথ্য ও ফাইল শুধুমাত্র আপনার কাজের বিষয়ে যোগাযোগ ও অর্ডার প্রক্রিয়ার জন্য
              ব্যবহার করা হবে।
            </div>
            {submitError && (
              <p role="alert" className="mt-4 rounded-lg bg-accent-50 px-4 py-3 text-sm text-danger">
                {submitError}
              </p>
            )}
          </div>
        )}

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="secondary"
            className="w-full justify-center sm:w-auto"
            onClick={step === 1 ? () => router.push("/") : goBack}
          >
            <ChevronLeft className="h-4 w-4" />
            {step === 1 ? "বাতিল" : "পূর্ববর্তী"}
          </Button>

          {step < 4 ? (
            <Button type="button" className="w-full justify-center sm:w-auto" onClick={goNext}>
              পরবর্তী ধাপে যান
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="cta"
              className="w-full justify-center sm:w-auto"
              onClick={handleSubmit}
              disabled={pending}
            >
              {uploadingFiles
                ? "ফাইল আপলোড হচ্ছে..."
                : pending
                  ? "অর্ডার পাঠানো হচ্ছে..."
                  : "অর্ডার নিশ্চিত করুন"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewSummary({
  form,
  files,
  requiresDelivery,
}: {
  form: FormState;
  files: File[];
  requiresDelivery: boolean;
}) {
  const rows: [string, string][] = [
    ["নাম", form.customer_name],
    ["মোবাইল নম্বর", form.phone],
    ...(form.email ? ([["ই-মেইল", form.email]] as [string, string][]) : []),
    ...(form.business_name ? ([["ব্যবসা/প্রতিষ্ঠান", form.business_name]] as [string, string][]) : []),
    ["কাজের ধরন", form.service_label],
    ["পরিমাণ", form.quantity || "—"],
    ["প্রয়োজনের তারিখ", form.required_date || "নির্দিষ্ট নয় (ফ্লেক্সিবল)"],
    ["বাজেট", form.budget_type === "known" ? `৳ ${form.budget || "—"}` : "আলোচনা সাপেক্ষে"],
    [
      "ডেলিভারি",
      requiresDelivery
        ? form.delivery_required
          ? DELIVERY_METHOD_LABELS[form.delivery_method || "other"]
          : "দোকান থেকে সংগ্রহ"
        : "প্রযোজ্য নয়",
    ],
    ["সংযুক্ত ফাইল", files.length > 0 ? `${files.length}টি ফাইল` : "কোনো ফাইল নেই"],
  ];

  return (
    <div>
      <h2 className="mb-4 text-base font-semibold text-ink">আপনার তথ্য পর্যালোচনা করুন</h2>
      <dl className="space-y-2.5 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 border-b border-border pb-2.5">
            <dt className="text-ink-soft">{label}</dt>
            <dd className="text-right font-medium text-ink">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">কাজের বিস্তারিত</p>
        <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
          {form.description}
        </p>
      </div>
    </div>
  );
}

function flatten(errors: Record<string, string[] | undefined>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(errors)) {
    if (value && value[0]) result[key] = value[0];
  }
  return result;
}
