/**
 * Dynamic quotation engine — pure, no UI/network dependency.
 * Used identically by: the public order calculator, the admin service-editor
 * preview, and the server-side order submission recompute (never trust a
 * client-submitted total; this function is the only source of truth).
 */

export const PRICING_MODELS = [
  "PER_SQFT",
  "PER_PIECE",
  "FIXED",
  "PER_PACKAGE",
  "DESIGN_ONLY",
  "PER_SQFT_PLUS_DESIGN",
  "PER_PIECE_PLUS_DESIGN",
  "CUSTOM",
] as const;
export type PricingModel = (typeof PRICING_MODELS)[number];

export const PRICING_MODEL_LABELS: Record<PricingModel, string> = {
  PER_SQFT: "প্রতি বর্গফুট",
  PER_PIECE: "প্রতি পিস",
  FIXED: "নির্দিষ্ট মূল্য",
  PER_PACKAGE: "প্যাকেজ",
  DESIGN_ONLY: "শুধু ডিজাইন",
  PER_SQFT_PLUS_DESIGN: "বর্গফুট + ডিজাইন",
  PER_PIECE_PLUS_DESIGN: "পিস + ডিজাইন",
  CUSTOM: "কাস্টম (যোগাযোগ করে জানুন)",
};

/** Models where the engine needs width/height to compute an area. */
export const SQFT_MODELS: PricingModel[] = ["PER_SQFT", "PER_SQFT_PLUS_DESIGN"];
/** Models with a per-unit print/product charge (as opposed to flat/design-only/custom). */
export const CALCULABLE_MODELS: PricingModel[] = [
  "PER_SQFT",
  "PER_PIECE",
  "FIXED",
  "PER_PACKAGE",
  "DESIGN_ONLY",
  "PER_SQFT_PLUS_DESIGN",
  "PER_PIECE_PLUS_DESIGN",
];

export const DIMENSION_UNITS = ["inch", "feet", "cm", "mm"] as const;
export type DimensionUnit = (typeof DIMENSION_UNITS)[number];

export type PricingOption = "print_only" | "design_only" | "design_and_print";

export type ServicePricingConfig = {
  pricingModel: PricingModel;
  rate: number | null;
  designFee: number;
  sourceFileFee: number;
  minimumCharge: number | null;
  minimumQuantity: number | null;
};

export type PricingEngineInput = {
  config: ServicePricingConfig;
  widthValue?: number;
  heightValue?: number;
  unit?: DimensionUnit;
  quantity: number;
  option: PricingOption;
  wantSourceFile?: boolean;
  deliveryFee?: number;
  discount?: number;
};

export type PricingEngineResult =
  | { ok: false; error: string }
  | {
      ok: true;
      widthInches: number | null;
      heightInches: number | null;
      areaSqFt: number | null;
      quantity: number;
      rate: number | null;
      basePrice: number;
      minimumApplied: boolean;
      printPrice: number;
      designFee: number;
      sourceFileFee: number;
      deliveryFee: number;
      discount: number;
      subtotal: number;
      total: number;
      minimumQuantityWarning: string | null;
    };

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function toInches(value: number, unit: DimensionUnit): number {
  switch (unit) {
    case "inch":
      return value;
    case "feet":
      return value * 12;
    case "cm":
      return value / 2.54;
    case "mm":
      return value / 25.4;
  }
}

export function calculateServicePrice(input: PricingEngineInput): PricingEngineResult {
  const { config, option } = input;
  const unit = input.unit ?? "inch";

  const quantity = input.quantity;
  if (!isFiniteNumber(quantity) || quantity <= 0) {
    return { ok: false, error: "সঠিক পরিমাণ দিন।" };
  }

  const deliveryFee = isFiniteNumber(input.deliveryFee) && input.deliveryFee > 0 ? input.deliveryFee : 0;
  const discount = isFiniteNumber(input.discount) && input.discount > 0 ? input.discount : 0;

  const needsDimensions = SQFT_MODELS.includes(config.pricingModel) && option !== "design_only";
  let widthInches: number | null = null;
  let heightInches: number | null = null;
  let areaSqFt: number | null = null;

  if (needsDimensions) {
    if (!isFiniteNumber(input.widthValue) || !isFiniteNumber(input.heightValue)) {
      return { ok: false, error: "সঠিক প্রস্থ ও উচ্চতা দিন।" };
    }
    if (input.widthValue <= 0 || input.heightValue <= 0) {
      return { ok: false, error: "মাপ শূন্য বা ঋণাত্মক হতে পারবে না।" };
    }
    widthInches = round2(toInches(input.widthValue, unit));
    heightInches = round2(toInches(input.heightValue, unit));
    areaSqFt = round2((widthInches * heightInches) / 144);
  }

  const minimumQuantityWarning =
    config.minimumQuantity && quantity < config.minimumQuantity
      ? `ন্যূনতম অর্ডার ${config.minimumQuantity}টি`
      : null;

  // Base print/product price, before minimum-charge floor. design_only never
  // computes a print price regardless of model.
  let basePrice = 0;
  let minimumApplied = false;

  if (option !== "design_only" && config.pricingModel !== "CUSTOM" && config.pricingModel !== "DESIGN_ONLY") {
    const rate = config.rate;
    if (!isFiniteNumber(rate) || rate < 0) {
      return { ok: false, error: "এই সেবার মূল্য এখনও নির্ধারণ করা হয়নি — সরাসরি যোগাযোগ করুন।" };
    }

    if (config.pricingModel === "PER_SQFT" || config.pricingModel === "PER_SQFT_PLUS_DESIGN") {
      basePrice = round2((areaSqFt as number) * rate * quantity);
    } else if (config.pricingModel === "PER_PIECE" || config.pricingModel === "PER_PIECE_PLUS_DESIGN") {
      basePrice = round2(rate * quantity);
    } else if (config.pricingModel === "FIXED" || config.pricingModel === "PER_PACKAGE") {
      basePrice = round2(rate);
    }

    if (isFiniteNumber(config.minimumCharge) && config.minimumCharge > 0 && basePrice < config.minimumCharge) {
      basePrice = config.minimumCharge;
      minimumApplied = true;
    }
  }

  const printPrice = option === "design_only" ? 0 : basePrice;
  const includesDesign =
    option === "design_only" ||
    option === "design_and_print" ||
    config.pricingModel === "DESIGN_ONLY";
  const designFee = includesDesign ? Math.max(config.designFee ?? 0, 0) : 0;
  const sourceFileFee = input.wantSourceFile ? Math.max(config.sourceFileFee ?? 0, 0) : 0;

  const subtotal = round2(printPrice + designFee + sourceFileFee + deliveryFee);
  const total = round2(Math.max(subtotal - discount, 0));

  return {
    ok: true,
    widthInches,
    heightInches,
    areaSqFt,
    quantity,
    rate: config.rate,
    basePrice,
    minimumApplied,
    printPrice,
    designFee,
    sourceFileFee,
    deliveryFee,
    discount,
    subtotal,
    total,
    minimumQuantityWarning,
  };
}

/** Reads a service row's pricing columns into engine config, tolerating rows from before the pricing migration ran (columns absent → CUSTOM/manual quote). */
export function servicePricingConfig(service: {
  pricing_model?: string | null;
  rate?: number | null;
  design_fee?: number | null;
  source_file_fee?: number | null;
  minimum_charge?: number | null;
  minimum_quantity?: number | null;
}): ServicePricingConfig {
  const model = PRICING_MODELS.includes(service.pricing_model as PricingModel)
    ? (service.pricing_model as PricingModel)
    : "CUSTOM";
  return {
    pricingModel: model,
    rate: service.rate ?? null,
    designFee: service.design_fee ?? 0,
    sourceFileFee: service.source_file_fee ?? 0,
    minimumCharge: service.minimum_charge ?? null,
    minimumQuantity: service.minimum_quantity ?? null,
  };
}
