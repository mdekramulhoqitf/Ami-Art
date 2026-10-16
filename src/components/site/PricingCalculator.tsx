"use client";

import { useEffect, useState } from "react";
import { FormField, Input, Select } from "@/components/ui/FormField";
import { Numeral } from "@/components/ui/Numeral";
import { toBengaliDigits } from "@/lib/utils";
import {
  DIMENSION_UNITS,
  SQFT_MODELS,
  calculateServicePrice,
  servicePricingConfig,
  type DimensionUnit,
  type PricingOption,
} from "@/lib/pricing-engine";
import type { Service } from "@/lib/types";
import type { PricingEngineResult } from "@/lib/pricing-engine";

export type PricingSelection = {
  widthValue?: number;
  heightValue?: number;
  unit?: DimensionUnit;
  quantity: number;
  option: PricingOption;
  wantSourceFile?: boolean;
  result: PricingEngineResult | null;
};

const UNIT_LABELS: Record<DimensionUnit, string> = {
  inch: "ইঞ্চি",
  feet: "ফুট",
  cm: "সেমি",
  mm: "মিমি",
};

function taka(amount: number) {
  return `৳ ${toBengaliDigits(amount.toLocaleString("en-BD", { maximumFractionDigits: 2 }))}`;
}

/**
 * Customer-facing live quotation calculator. Renders nothing for services
 * without pricing configured (falls back to the existing free-text
 * quantity/budget fields). Reports its raw inputs — never a computed total —
 * up to the parent via onChange; the server independently recomputes the
 * authoritative price at submission time.
 */
export function PricingCalculator({
  service,
  onChange,
}: {
  service: Service;
  onChange: (selection: PricingSelection) => void;
}) {
  const config = servicePricingConfig(service);
  const needsDimensions = SQFT_MODELS.includes(config.pricingModel);
  const isDesignOnly = config.pricingModel === "DESIGN_ONLY";

  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [unit, setUnit] = useState<DimensionUnit>("inch");
  const [quantity, setQuantity] = useState("1");
  const [option, setOption] = useState<PricingOption>(isDesignOnly ? "design_only" : "design_and_print");
  const [wantSourceFile, setWantSourceFile] = useState(false);

  const widthValue = width ? Number(width) : undefined;
  const heightValue = height ? Number(height) : undefined;
  const quantityValue = quantity ? Number(quantity) : NaN;

  const result =
    config.pricingModel === "CUSTOM"
      ? null
      : calculateServicePrice({
          config,
          widthValue,
          heightValue,
          unit,
          quantity: quantityValue,
          option,
          wantSourceFile,
        });

  useEffect(() => {
    onChange({ widthValue, heightValue, unit, quantity: quantityValue, option, wantSourceFile, result });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widthValue, heightValue, unit, quantityValue, option, wantSourceFile]);

  if (config.pricingModel === "CUSTOM") return null;

  return (
    <div className="rounded-xl border border-primary-200 bg-primary-50/40 p-4">
      <p className="mb-1 text-sm font-semibold text-ink">মূল্য হিসাব করুন</p>
      {needsDimensions && (
        <p className="mb-3 text-xs text-ink-soft">
          মাপ জানেন না? সমস্যা নেই — কোথায় ব্যবহার করবেন তা অর্ডারের বিস্তারিতে লিখুন, প্রয়োজনীয় মাপ
          সম্পর্কে আমরা আপনাকে গাইড করব।
        </p>
      )}
      {!isDesignOnly && (
        <div className="mb-3 flex flex-wrap gap-4 text-sm">
          {(["design_and_print", "print_only", "design_only"] as PricingOption[]).map((opt) => (
            <label key={opt} className="flex items-center gap-1.5 text-ink">
              <input
                type="radio"
                checked={option === opt}
                onChange={() => setOption(opt)}
                className="h-4 w-4 text-primary-600"
              />
              {opt === "design_and_print" ? "ডিজাইন + প্রিন্ট" : opt === "print_only" ? "শুধু প্রিন্ট" : "শুধু ডিজাইন"}
            </label>
          ))}
        </div>
      )}

      {needsDimensions && option !== "design_only" && (
        <div className="mb-3 grid grid-cols-3 gap-3">
          <FormField label="প্রস্থ" name="pricing_width">
            <Input type="number" min={0} value={width} onChange={(e) => setWidth(e.target.value)} />
          </FormField>
          <FormField label="উচ্চতা" name="pricing_height">
            <Input type="number" min={0} value={height} onChange={(e) => setHeight(e.target.value)} />
          </FormField>
          <FormField label="একক" name="pricing_unit">
            <Select value={unit} onChange={(e) => setUnit(e.target.value as DimensionUnit)}>
              {DIMENSION_UNITS.map((u) => (
                <option key={u} value={u}>
                  {UNIT_LABELS[u]}
                </option>
              ))}
            </Select>
          </FormField>
        </div>
      )}

      {option !== "design_only" && (
        <div className="mb-3 max-w-[140px]">
          <FormField label="পরিমাণ" name="pricing_quantity">
            <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </FormField>
        </div>
      )}

      {config.sourceFileFee > 0 && option !== "print_only" && (
        <label className="mb-3 flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={wantSourceFile}
            onChange={(e) => setWantSourceFile(e.target.checked)}
            className="h-4 w-4 rounded text-primary-600"
          />
          ডিজাইন ফাইল নিতে চাই (+<Numeral>{taka(config.sourceFileFee)}</Numeral>)
        </label>
      )}

      <div className="rounded-lg bg-surface p-3 text-sm">
        {result?.ok ? (
          <div className="space-y-1">
            {result.areaSqFt !== null && (
              <div className="flex justify-between text-ink-soft">
                <span>মোট আয়তন</span>
                <span>
                  <Numeral>{toBengaliDigits(result.areaSqFt ?? "")}</Numeral> বর্গফুট
                </span>
              </div>
            )}
            {result.printPrice > 0 && (
              <div className="flex justify-between text-ink-soft">
                <span>প্রিন্ট</span>
                <span><Numeral>{taka(result.printPrice)}</Numeral></span>
              </div>
            )}
            {result.designFee > 0 && (
              <div className="flex justify-between text-ink-soft">
                <span>ডিজাইন</span>
                <span><Numeral>{taka(result.designFee)}</Numeral></span>
              </div>
            )}
            {result.sourceFileFee > 0 && (
              <div className="flex justify-between text-ink-soft">
                <span>সোর্স ফাইল</span>
                <span><Numeral>{taka(result.sourceFileFee)}</Numeral></span>
              </div>
            )}
            {result.minimumApplied && (
              <p className="text-xs text-ink-faint">ন্যূনতম চার্জ প্রযোজ্য হয়েছে</p>
            )}
            <div className="flex justify-between border-t border-border pt-1.5 text-base font-semibold text-primary-700">
              <span>সর্বমোট (আনুমানিক)</span>
              <span><Numeral>{taka(result.total)}</Numeral></span>
            </div>
            {result.minimumQuantityWarning && (
              <p className="text-xs text-danger">{result.minimumQuantityWarning}</p>
            )}
            <p className="text-[11px] text-ink-faint">
              ডেলিভারি চার্জ ও চূড়ান্ত ছাড় অর্ডার নিশ্চিত করার সময় যোগ হবে।
            </p>
          </div>
        ) : (
          <p className="text-ink-soft">{result?.error ?? "মাপ ও পরিমাণ দিন — মূল্য এখানে দেখা যাবে।"}</p>
        )}
      </div>
    </div>
  );
}
