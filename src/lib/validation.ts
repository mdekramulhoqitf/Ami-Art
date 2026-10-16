import * as z from "zod";
import { PRICING_MODELS } from "./pricing-engine";

export const highlightItemSchema = z.object({
  title: z.string().trim().min(1, { error: "শিরোনাম আবশ্যক।" }),
  description: z.string().trim().min(1, { error: "বিবরণ আবশ্যক।" }),
});

export const socialLinkSchema = z.object({
  platform: z.string().trim().min(1, { error: "প্ল্যাটফর্মের নাম আবশ্যক।" }),
  url: z.url({ error: "সঠিক URL লিখুন।" }),
});

export const loginSchema = z.object({
  email: z.email({ error: "সঠিক ই-মেইল ঠিকানা লিখুন।" }),
  password: z.string().min(6, { error: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।" }),
});

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, { error: "আপনার নাম লিখুন।" }),
  contact: z.string().trim().min(5, { error: "মোবাইল নম্বর বা ই-মেইল লিখুন।" }),
  service: z.string().trim().optional(),
  message: z.string().trim().min(10, { error: "কমপক্ষে ১০ অক্ষরের মেসেজ লিখুন।" }),
});

export const heroSlideSchema = z.object({
  title: z.string().trim().optional(),
  subtitle: z.string().trim().optional(),
  cta_label: z.string().trim().optional(),
  cta_url: z.union([z.url({ error: "সঠিক URL লিখুন।" }), z.literal("")]).optional(),
  alt_text: z.string().trim().optional(),
  display_order: z.coerce.number().int().default(0),
  is_active: z.coerce.boolean().default(true),
});

export const ASPECT_RATIOS = [
  "landscape-16-9",
  "wide-3-1",
  "standard-4-3",
  "square-1-1",
  "portrait-4-5",
  "vertical-9-16",
  "custom",
] as const;

export const ASPECT_RATIO_LABELS: Record<(typeof ASPECT_RATIOS)[number], string> = {
  "landscape-16-9": "ল্যান্ডস্কেপ — 16:9",
  "wide-3-1": "ওয়াইড — 3:1",
  "standard-4-3": "স্ট্যান্ডার্ড — 4:3",
  "square-1-1": "স্কয়ার — 1:1",
  "portrait-4-5": "পোর্ট্রেট — 4:5",
  "vertical-9-16": "ভার্টিক্যাল — 9:16",
  custom: "কাস্টম",
};

export const SERVICE_CATEGORIES = [
  "প্রিন্টিং",
  "সাইন ও সাইনবোর্ড",
  "গ্রাফিক ডিজাইন",
  "ব্র্যান্ডিং",
  "প্রচারমূলক ডিজাইন",
  "অন্যান্য",
] as const;

export const SERVICE_TYPES = ["digital", "physical"] as const;
export const SERVICE_TYPE_LABELS: Record<(typeof SERVICE_TYPES)[number], string> = {
  digital: "ডিজিটাল সেবা",
  physical: "প্রিন্টিং / ফিজিক্যাল সেবা",
};

export const PRODUCT_CATEGORIES = [
  "banner",
  "signboard",
  "mug",
  "tshirt",
  "jersey",
  "website",
  "print_other",
] as const;

export const PRODUCT_CATEGORY_LABELS: Record<(typeof PRODUCT_CATEGORIES)[number], string> = {
  banner: "ব্যানার / ফ্লেক্স",
  signboard: "সাইনবোর্ড",
  mug: "মগ প্রিন্ট",
  tshirt: "টি-শার্ট প্রিন্ট",
  jersey: "জার্সি প্রিন্ট",
  website: "ওয়েবসাইট",
  print_other: "অন্যান্য প্রিন্ট",
};

export const serviceSchema = z
  .object({
    title: z.string().trim().min(2, { error: "সেবার নাম লিখুন (কমপক্ষে ২ অক্ষর)।" }),
    description: z.string().trim().optional(),
    icon: z.string().trim().optional(),
    price: z.string().trim().optional(),
    category: z.string().trim().optional(),
    image_alt: z.string().trim().optional(),
    aspect_ratio: z.enum(ASPECT_RATIOS).default("standard-4-3"),
    custom_width: z.coerce.number().int().positive().optional(),
    custom_height: z.coerce.number().int().positive().optional(),
    service_type: z.enum(SERVICE_TYPES).default("physical"),
    product_category: z.enum(PRODUCT_CATEGORIES).default("print_other"),
    requires_delivery: z.coerce.boolean().default(true),
    display_order: z.coerce.number().int().default(0),
    is_active: z.coerce.boolean().default(true),
    pricing_model: z.enum(PRICING_MODELS).default("CUSTOM"),
    rate: z.coerce.number().min(0).optional(),
    design_fee: z.coerce.number().min(0).default(0),
    source_file_fee: z.coerce.number().min(0).default(0),
    minimum_charge: z.coerce.number().min(0).optional(),
    minimum_quantity: z.coerce.number().int().min(1).optional(),
  })
  .refine(
    (data) => data.aspect_ratio !== "custom" || (data.custom_width && data.custom_height),
    { error: "কাস্টম অনুপাতের জন্য প্রস্থ ও উচ্চতা দিন।", path: ["custom_width"] }
  );

export const portfolioItemSchema = z.object({
  title: z.string().trim().min(2, { error: "প্রকল্পের নাম লিখুন (কমপক্ষে ২ অক্ষর)।" }),
  category: z.string().trim().optional(),
  description: z.string().trim().optional(),
  alt_text: z.string().trim().optional(),
  is_featured: z.coerce.boolean().default(false),
  is_active: z.coerce.boolean().default(true),
  display_order: z.coerce.number().int().default(0),
});

export const faqItemSchema = z.object({
  question: z.string().trim().min(3, { error: "প্রশ্ন লিখুন (কমপক্ষে ৩ অক্ষর)।" }),
  answer: z.string().trim().min(3, { error: "উত্তর লিখুন (কমপক্ষে ৩ অক্ষর)।" }),
  is_active: z.coerce.boolean().default(true),
  display_order: z.coerce.number().int().default(0),
});

export const whyChooseUsItemSchema = z.object({
  title: z.string().trim().min(2, { error: "শিরোনাম লিখুন (কমপক্ষে ২ অক্ষর)।" }),
  description: z.string().trim().min(2, { error: "বিবরণ লিখুন (কমপক্ষে ২ অক্ষর)।" }),
  icon: z.string().trim().optional(),
  is_active: z.coerce.boolean().default(true),
  display_order: z.coerce.number().int().default(0),
});

export const SECTION_BANNER_POSITIONS = ["center", "top", "bottom", "left", "right"] as const;
export const SECTION_BANNER_OVERLAY_STYLES = ["dark", "light"] as const;

export const sectionBannerSchema = z.object({
  title: z.string().trim().optional(),
  short_description: z.string().trim().optional(),
  detailed_description: z.string().trim().optional(),
  alt_text: z.string().trim().optional(),
  image_position: z.enum(SECTION_BANNER_POSITIONS).default("center"),
  overlay_enabled: z.coerce.boolean().default(false),
  overlay_style: z.enum(SECTION_BANNER_OVERLAY_STYLES).default("dark"),
  is_visible: z.coerce.boolean().default(true),
});

export const BUSINESS_SOURCE_TYPES = [
  "google_maps",
  "facebook",
  "instagram",
  "website",
  "local_directory",
  "offline_research",
  "customer_referral",
  "existing_customer",
  "manual_entry",
] as const;
export const VERIFICATION_STATUSES = ["verified", "unverified", "needs_review", "outdated"] as const;
export const BUSINESS_STATUSES = ["prospect", "lead", "customer", "inactive"] as const;
export const PRIORITY_LEVELS = ["low", "normal", "high", "urgent"] as const;

export const businessSchema = z.object({
  name: z.string().trim().min(2, { error: "ব্যবসার নাম লিখুন (কমপক্ষে ২ অক্ষর)।" }),
  category: z.string().trim().optional(),
  subcategory: z.string().trim().optional(),
  area: z.string().trim().optional(),
  address: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  website: z.string().trim().optional(),
  facebook: z.string().trim().optional(),
  instagram: z.string().trim().optional(),
  google_maps_url: z.string().trim().optional(),
  source: z.string().trim().optional(),
  source_url: z.string().trim().optional(),
  source_type: z.enum(BUSINESS_SOURCE_TYPES).optional().or(z.literal("")),
  collected_by: z.string().trim().optional(),
  verification_status: z.enum(VERIFICATION_STATUSES).default("unverified"),
  business_status: z.enum(BUSINESS_STATUSES).default("prospect"),
  estimated_size: z.string().trim().optional(),
  estimated_printing_need: z.string().trim().optional(),
  estimated_printing_frequency: z.string().trim().optional(),
  potential_value: z.coerce.number().nonnegative().optional().or(z.literal("")),
  priority_level: z.enum(PRIORITY_LEVELS).default("normal"),
  new_business_flag: z.coerce.boolean().default(false),
  rebranding_flag: z.coerce.boolean().default(false),
  promotional_activity_flag: z.coerce.boolean().default(false),
  seasonal_demand: z.string().trim().optional(),
  existing_supplier_known: z.coerce.boolean().default(false),
  tags: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  next_followup_at: z.string().trim().optional(),
});

export const businessContactSchema = z.object({
  name: z.string().trim().min(2, { error: "নাম লিখুন।" }),
  role: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z.string().trim().optional(),
  is_primary: z.coerce.boolean().default(false),
  notes: z.string().trim().optional(),
});

export const OPPORTUNITY_STAGES = [
  "new",
  "researching",
  "qualified",
  "contacted",
  "interested",
  "quotation_sent",
  "negotiation",
  "won",
  "lost",
  "follow_up",
] as const;

export const opportunitySchema = z.object({
  title: z.string().trim().min(2, { error: "সুযোগের নাম লিখুন।" }),
  service_category: z.string().trim().optional(),
  stage: z.enum(OPPORTUNITY_STAGES).default("new"),
  estimated_value: z.coerce.number().nonnegative().optional().or(z.literal("")),
});

export const activityNoteSchema = z.object({
  body: z.string().trim().min(1, { error: "নোট লিখুন।" }),
});

export const quotationHeaderSchema = z.object({
  customer_name: z.string().trim().min(2, { error: "গ্রাহকের নাম লিখুন।" }),
  customer_phone: z.string().trim().min(5, { error: "ফোন নম্বর লিখুন।" }),
  customer_email: z.string().trim().optional(),
  customer_address: z.string().trim().optional(),
  discount: z.coerce.number().nonnegative().default(0),
  delivery_charge: z.coerce.number().nonnegative().default(0),
  delivery_method: z.enum(["pickup", "courier", "local_delivery", "other"]).optional().or(z.literal("")),
  delivery_address: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export const aboutContentSchema = z.object({
  heading: z.string().trim().min(1, { error: "শিরোনাম আবশ্যক।" }),
  story: z.string().trim().min(1, { error: "প্রতিষ্ঠানের গল্প আবশ্যক।" }),
  mission: z.string().trim().min(1, { error: "লক্ষ্য (Mission) আবশ্যক।" }),
  vision: z.string().trim().min(1, { error: "ভবিষ্যৎ পরিকল্পনা (Vision) আবশ্যক।" }),
  why_choose_us: z.array(highlightItemSchema).default([]),
  process_steps: z.array(highlightItemSchema).default([]),
  owner_name: z.string().trim().max(100).optional(),
  owner_designation: z.string().trim().max(100).optional(),
  owner_short_bio: z.string().trim().max(300).optional(),
  owner_bio: z.string().trim().max(2000).optional(),
  owner_experience: z.string().trim().max(50).optional(),
  owner_location: z.string().trim().max(100).optional(),
  owner_phone: z
    .union([z.string().trim().min(6).max(20), z.literal("")])
    .optional(),
  owner_email: z.union([z.email({ error: "সঠিক ই-মেইল দিন।" }), z.literal("")]).optional(),
  owner_cta_text: z.string().trim().max(50).optional(),
  owner_cta_link: z.union([z.url({ error: "সঠিক লিংক দিন।" }), z.literal("")]).optional(),
  owner_show: z.coerce.boolean().default(false),
});

export const contactSettingsSchema = z.object({
  phone: z.string().trim().min(3, { error: "মোবাইল নম্বর আবশ্যক।" }),
  email: z.email({ error: "সঠিক ই-মেইল ঠিকানা লিখুন।" }),
  address: z.string().trim().min(3, { error: "ঠিকানা আবশ্যক।" }),
  map_embed_url: z.union([z.url({ error: "সঠিক URL লিখুন।" }), z.literal("")]).optional(),
  social_links: z.array(socialLinkSchema).default([]),
});

export const siteSettingsSchema = z.object({
  business_name: z.string().trim().min(1, { error: "প্রতিষ্ঠানের নাম আবশ্যক।" }),
  tagline: z.string().trim().min(1, { error: "ট্যাগলাইন আবশ্যক।" }),
  intro_heading: z.string().trim().min(1, { error: "পরিচিতি শিরোনাম আবশ্যক।" }),
  intro_body: z.string().trim().min(1, { error: "পরিচিতি বিবরণ আবশ্যক।" }),
  meta_title: z.string().trim().min(1, { error: "মেটা টাইটেল আবশ্যক।" }),
  meta_description: z.string().trim().min(1, { error: "মেটা বিবরণ আবশ্যক।" }),
  trust_badges: z.array(highlightItemSchema).default([]),
  capability_highlights: z.array(highlightItemSchema).default([]),
});

// ---------------------------------------------------------------------------
// Site image uploads (logo, hero, about, portfolio, service images)
// ---------------------------------------------------------------------------

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];

export function validateImageFile(file: File | null): string | null {
  if (!file || file.size === 0) return null;
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return "এই ফাইলটি ব্যবহার করা যাবে না। JPG, PNG, WebP অথবা SVG ছবি আপলোড করুন।";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "ছবির আকার সর্বোচ্চ ৫ MB হতে পারে।";
  }
  return null;
}

// ---------------------------------------------------------------------------
// Order form ("ঘরে বসে অর্ডার করুন")
// ---------------------------------------------------------------------------

/**
 * Guards against exactly the corruption a controlled `<input type="date">`
 * can produce (e.g. a garbled year like "0296") — requires strict
 * YYYY-MM-DD, a real calendar date, and a plausible year range, rather than
 * silently accepting whatever string the browser handed back.
 */
function isValidFutureIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (year < 2000 || year > 2100) return false;
  const date = new Date(value + "T00:00:00");
  if (Number.isNaN(date.getTime())) return false;
  if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date.getTime() < today.getTime()) return false;
  return true;
}

export const orderCustomerSchema = z.object({
  customer_name: z.string().trim().min(2, { error: "আপনার নাম লিখুন।" }),
  phone: z
    .string()
    .trim()
    .min(6, { error: "সঠিক মোবাইল নম্বর লিখুন।" })
    .refine((v) => /^(?:\+?88)?01[3-9]\d{8}$/.test(v.replace(/[\s-]/g, "")), {
      error: "সঠিক মোবাইল নম্বর লিখুন।",
    }),
  // Progressive profiling: only name + phone are truly required. Email is
  // optional, but if the customer does type one, it must be a real address.
  email: z.union([z.email({ error: "সঠিক ই-মেইল লিখুন।" }), z.literal("")]).optional(),
  address: z.string().trim().optional(),
  business_name: z.string().trim().optional(),
});

export const DELIVERY_METHODS = ["pickup", "courier", "local_delivery", "other"] as const;
export const BUDGET_TYPES = ["known", "negotiable"] as const;

const orderDetailsShape = {
  service_label: z.string().trim().min(1, { error: "কাজের ধরন নির্বাচন করুন।" }),
  service_id: z.string().trim().optional(),
  description: z.string().trim().min(10, {
    error: "আপনার কাজের বিস্তারিত লিখুন (কমপক্ষে ১০ অক্ষর)।",
  }),
  quantity: z
    .string()
    .trim()
    .min(1, { error: "পরিমাণ লিখুন।" })
    .refine((value) => /^\d+$/.test(value) && Number(value) >= 1, {
      error: "পরিমাণ কমপক্ষে ১ হতে হবে (শুধু সংখ্যা)।",
    }),
  // Optional: a firm deadline isn't required to place an order — AMI ART
  // always follows up by phone, where a flexible/unsure timeline can be
  // clarified. Still validated as a real future date when provided.
  required_date: z
    .string()
    .trim()
    .refine((value) => value === "" || isValidFutureIsoDate(value), {
      error: "আজ বা পরবর্তী একটি সঠিক তারিখ বেছে নিন।",
    })
    .optional(),
  budget_type: z.enum(BUDGET_TYPES, { error: "বাজেট সম্পর্কে জানান।" }),
  budget: z.string().trim().optional(),
  delivery_required: z.coerce.boolean().default(false),
  // The <Select> defaults to an empty-string "নির্বাচন করুন" option, not an
  // absent key — `.optional()` alone only tolerates a missing/undefined
  // key, so that empty string used to fail z.enum() validation directly
  // and leak Zod's raw English "Invalid option: expected one of..." before
  // deliveryRefinementCheck ever got a chance to show its Bengali message.
  // Accepting "" here lets that refinement (which already treats a falsy
  // delivery_method as "not chosen") produce the friendly error instead.
  delivery_method: z
    .union([z.enum(DELIVERY_METHODS), z.literal("")], {
      error: "ডেলিভারি পদ্ধতি নির্বাচন করুন।",
    })
    .optional(),
  delivery_address: z.string().trim().optional(),
  custom_fields: z.string().trim().optional(), // JSON string, parsed server-side
};

function deliveryRefinementCheck(data: {
  delivery_required: boolean;
  delivery_method?: string;
  delivery_address?: string;
}) {
  if (!data.delivery_required) return true;
  return !!data.delivery_method && !!data.delivery_address?.trim();
}

const deliveryRefinementOptions = {
  error: "ডেলিভারি পদ্ধতি ও ঠিকানা লিখুন।",
  path: ["delivery_address"] as const,
};

function budgetRefinementCheck(data: { budget_type: string; budget?: string }) {
  if (data.budget_type !== "known") return true;
  const amount = data.budget?.trim();
  return !!amount && /^\d+$/.test(amount) && Number(amount) >= 1;
}

const budgetRefinementOptions = {
  error: "সঠিক বাজেট পরিমাণ লিখুন।",
  path: ["budget"] as const,
};

export const orderDetailsSchema = z
  .object(orderDetailsShape)
  .refine(deliveryRefinementCheck, {
    error: deliveryRefinementOptions.error,
    path: [...deliveryRefinementOptions.path],
  })
  .refine(budgetRefinementCheck, {
    error: budgetRefinementOptions.error,
    path: [...budgetRefinementOptions.path],
  });

export const orderFormSchema = orderCustomerSchema
  .extend(orderDetailsShape)
  .refine(deliveryRefinementCheck, {
    error: deliveryRefinementOptions.error,
    path: [...deliveryRefinementOptions.path],
  })
  .refine(budgetRefinementCheck, {
    error: budgetRefinementOptions.error,
    path: [...budgetRefinementOptions.path],
  });

// ---------------------------------------------------------------------------
// Product-specific order field groups (stored in orders.custom_fields)
// ---------------------------------------------------------------------------

export const bannerFieldsSchema = z.object({
  width: z.string().trim().min(1, { error: "প্রস্থ লিখুন।" }),
  height: z.string().trim().min(1, { error: "উচ্চতা লিখুন।" }),
});

export const mugFieldsSchema = z.object({
  text: z.string().trim().optional(),
});

export const tshirtSizeRowSchema = z.object({
  size: z.enum(["S", "M", "L", "XL", "XXL"]),
  quantity: z.string().trim().optional(),
});

export const tshirtFieldsSchema = z.object({
  color: z.string().trim().optional(),
  sizes: z.array(tshirtSizeRowSchema).default([]),
  special_instructions: z.string().trim().optional(),
});

export const jerseyFieldsSchema = z.object({
  player_name: z.string().trim().optional(),
  player_number: z.string().trim().optional(),
  size: z.string().trim().optional(),
  sponsor_info: z.string().trim().optional(),
});

export const websiteFieldsSchema = z.object({
  business_name: z.string().trim().optional(),
  business_type: z.string().trim().optional(),
  sections_needed: z.string().trim().optional(),
  facebook_url: z.string().trim().optional(),
  whatsapp: z.string().trim().optional(),
  google_maps_url: z.string().trim().optional(),
  reference_website: z.string().trim().optional(),
});

// ---------------------------------------------------------------------------
// Delivery settings (admin → সেটিংস → ডেলিভারি সেটিংস)
// ---------------------------------------------------------------------------

export const deliverySettingsSchema = z.object({
  courier_fee: z.coerce.number().min(0).default(0),
  local_delivery_fee: z.coerce.number().min(0).default(0),
  free_delivery_threshold: z.coerce.number().min(0).optional(),
  enabled: z.coerce.boolean().default(true),
});

export const orderReplySchema = z.object({
  message: z.string().trim().min(1, { error: "মেসেজ লিখুন।" }),
});

export const MAX_ORDER_FILE_BYTES = 15 * 1024 * 1024;
export const MAX_ORDER_TOTAL_BYTES = 50 * 1024 * 1024;
export const MAX_ORDER_FILES = 8;

const ORDER_FILE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "pdf",
  "svg",
  "ai",
  "psd",
  "doc",
  "docx",
  "zip",
];

const ORDER_FILE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "application/postscript", // .ai
  "image/vnd.adobe.photoshop",
  "application/x-photoshop",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/zip",
  "application/x-zip-compressed",
  "application/octet-stream", // browsers often fall back to this for .ai/.psd
];

export function validateOrderFile(file: File): string | null {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const extensionOk = ORDER_FILE_EXTENSIONS.includes(extension);
  const mimeOk = !file.type || ORDER_FILE_MIME_TYPES.includes(file.type);

  if (!extensionOk || !mimeOk) {
    return "এই ধরনের ফাইল নেওয়া যাচ্ছে না। JPG, PNG, PDF-এর মতো সাধারণ ফরম্যাটে আপলোড করুন।";
  }
  if (file.size > MAX_ORDER_FILE_BYTES) {
    return "ফাইলটির আকার একটু বড় হয়ে গেছে। ছোট ফাইল দিয়ে আবার চেষ্টা করুন।";
  }
  return null;
}

export function validateOrderFileList(files: File[]): string | null {
  if (files.length > MAX_ORDER_FILES) {
    return `একবারে সর্বোচ্চ ${MAX_ORDER_FILES}টি ফাইল সংযুক্ত করা যাবে।`;
  }
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  if (totalSize > MAX_ORDER_TOTAL_BYTES) {
    return "সব ফাইল মিলিয়ে আকার একটু বড় হয়ে গেছে। কয়েকটা ফাইল বাদ দিয়ে আবার চেষ্টা করুন।";
  }
  for (const file of files) {
    const error = validateOrderFile(file);
    if (error) return error;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Quotation / Invoice
// ---------------------------------------------------------------------------

export const invoiceItemSchema = z.object({
  service_name: z.string().trim().min(1, { error: "সেবার নাম লিখুন।" }),
  quantity: z.coerce.number().positive({ error: "সঠিক পরিমাণ লিখুন।" }),
  unit_price: z.coerce.number().min(0, { error: "সঠিক একক মূল্য লিখুন।" }),
});

export const ESTIMATED_COMPLETION_PRESETS = ["< ১ দিন", "< ২ দিন", "৩–৫ দিন", "৭ দিন"] as const;

export const invoiceSchema = z.object({
  customer_name: z.string().trim().min(1, { error: "গ্রাহকের নাম আবশ্যক।" }),
  customer_phone: z.string().trim().min(1, { error: "মোবাইল নম্বর আবশ্যক।" }),
  customer_email: z.string().trim().optional(),
  customer_address: z.string().trim().optional(),
  invoice_date: z.string().trim().min(1, { error: "ইনভয়েসের তারিখ আবশ্যক।" }),
  items: z.array(invoiceItemSchema).min(1, { error: "কমপক্ষে একটি সেবা যোগ করুন।" }),
  design_charge: z.coerce.number().min(0).default(0),
  delivery_charge: z.coerce.number().min(0).default(0),
  courier_charge: z.coerce.number().min(0).default(0),
  other_charge: z.coerce.number().min(0).default(0),
  discount: z.coerce.number().min(0).default(0),
  paid_amount: z.coerce.number().min(0).default(0),
  estimated_completion: z.string().trim().optional(),
  delivery_method: z.enum(DELIVERY_METHODS).optional(),
  delivery_address: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});
