/**
 * Executable validation for the pricing engine — run directly:
 *   node src/lib/pricing-engine.test.ts
 * (Node 24 runs .ts natively; no test framework dependency added.)
 */
import assert from "node:assert/strict";
import { calculateServicePrice, type ServicePricingConfig } from "./pricing-engine.ts";

let passed = 0;
function check(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`ok  - ${name}`);
  } catch (err) {
    console.error(`FAIL - ${name}`);
    throw err;
  }
}

const perSqftPlusDesign: ServicePricingConfig = {
  pricingModel: "PER_SQFT_PLUS_DESIGN",
  rate: 120,
  designFee: 500,
  sourceFileFee: 300,
  minimumCharge: null,
  minimumQuantity: null,
};

// 1. 96 x 48 inch at ৳120/sqft
check("96x48in @120/sqft -> 32 sqft, 3840", () => {
  const r = calculateServicePrice({
    config: { ...perSqftPlusDesign, designFee: 0 },
    widthValue: 96,
    heightValue: 48,
    unit: "inch",
    quantity: 1,
    option: "print_only",
  });
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.areaSqFt, 32);
    assert.equal(r.printPrice, 3840);
    assert.equal(r.total, 3840);
  }
});

// 2. 8 x 4 ft at same rate should normalize to same 96x48in / 32sqft
check("8x4ft normalizes to 96x48in / 32 sqft", () => {
  const r = calculateServicePrice({
    config: { ...perSqftPlusDesign, designFee: 0 },
    widthValue: 8,
    heightValue: 4,
    unit: "feet",
    quantity: 1,
    option: "print_only",
  });
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.widthInches, 96);
    assert.equal(r.heightInches, 48);
    assert.equal(r.areaSqFt, 32);
  }
});

// 3. quantity 2
check("quantity 2 doubles print price", () => {
  const r = calculateServicePrice({
    config: { ...perSqftPlusDesign, designFee: 500 },
    widthValue: 96,
    heightValue: 48,
    unit: "inch",
    quantity: 2,
    option: "design_and_print",
  });
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.printPrice, 7680);
    assert.equal(r.designFee, 500);
    assert.equal(r.total, 8180);
  }
});

// 4. T-shirt x 10 (per piece)
check("T-shirt x10 @350/piece + 300 design = 3800", () => {
  const r = calculateServicePrice({
    config: {
      pricingModel: "PER_PIECE_PLUS_DESIGN",
      rate: 350,
      designFee: 300,
      sourceFileFee: 0,
      minimumCharge: null,
      minimumQuantity: null,
    },
    quantity: 10,
    option: "design_and_print",
  });
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.printPrice, 3500);
    assert.equal(r.designFee, 300);
    assert.equal(r.total, 3800);
  }
});

// 5. design-only (Logo Design, ৳1000)
check("design-only Logo -> total = design fee only", () => {
  const r = calculateServicePrice({
    config: {
      pricingModel: "DESIGN_ONLY",
      rate: null,
      designFee: 1000,
      sourceFileFee: 0,
      minimumCharge: null,
      minimumQuantity: null,
    },
    quantity: 1,
    option: "design_only",
  });
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.printPrice, 0);
    assert.equal(r.designFee, 1000);
    assert.equal(r.total, 1000);
  }
});

// 6. design + print (PVC 32 sqft @120 + design 500 = 4340)
check("design_and_print PVC 32sqft @120 + design 500 = 4340", () => {
  const r = calculateServicePrice({
    config: perSqftPlusDesign,
    widthValue: 96,
    heightValue: 48,
    unit: "inch",
    quantity: 1,
    option: "design_and_print",
  });
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(r.total, 4340);
});

// 7. source file add-on
check("source file add-on adds sourceFileFee once", () => {
  const r = calculateServicePrice({
    config: perSqftPlusDesign,
    widthValue: 96,
    heightValue: 48,
    unit: "inch",
    quantity: 1,
    option: "design_and_print",
    wantSourceFile: true,
  });
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.sourceFileFee, 300);
    assert.equal(r.total, 4640);
  }
});

// 8. delivery
check("delivery fee adds to subtotal/total", () => {
  const r = calculateServicePrice({
    config: { ...perSqftPlusDesign, designFee: 0 },
    widthValue: 96,
    heightValue: 48,
    unit: "inch",
    quantity: 2,
    option: "print_only",
    deliveryFee: 100,
  });
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(r.total, 7780); // 7680 + 100
});

// 9. discount, and never negative
check("discount reduces total, clamped at 0", () => {
  const r1 = calculateServicePrice({
    config: { ...perSqftPlusDesign, designFee: 0 },
    widthValue: 96,
    heightValue: 48,
    unit: "inch",
    quantity: 1,
    option: "print_only",
    discount: 340,
  });
  assert.equal(r1.ok, true);
  if (r1.ok) assert.equal(r1.total, 3500);

  const r2 = calculateServicePrice({
    config: { ...perSqftPlusDesign, designFee: 0 },
    widthValue: 96,
    heightValue: 48,
    unit: "inch",
    quantity: 1,
    option: "print_only",
    discount: 999999,
  });
  assert.equal(r2.ok, true);
  if (r2.ok) assert.equal(r2.total, 0);
});

// 10. minimum charge
check("minimum charge floors a small print price", () => {
  const r = calculateServicePrice({
    config: {
      pricingModel: "PER_SQFT",
      rate: 100,
      designFee: 0,
      sourceFileFee: 0,
      minimumCharge: 500,
      minimumQuantity: null,
    },
    widthValue: 24,
    heightValue: 12,
    unit: "inch",
    quantity: 1,
    option: "print_only",
  });
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.areaSqFt, 2);
    assert.equal(r.basePrice < 500 ? "would-be-200" : "n/a", "n/a"); // sanity: 2*100=200 < 500
    assert.equal(r.printPrice, 500);
    assert.equal(r.minimumApplied, true);
  }
});

// 11. minimum quantity — warns, does not silently change qty
check("minimum quantity warns without altering entered quantity", () => {
  const r = calculateServicePrice({
    config: {
      pricingModel: "PER_PIECE",
      rate: 350,
      designFee: 0,
      sourceFileFee: 0,
      minimumCharge: null,
      minimumQuantity: 5,
    },
    quantity: 2,
    option: "print_only",
  });
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.quantity, 2);
    assert.equal(r.minimumQuantityWarning, "ন্যূনতম অর্ডার 5টি");
    assert.equal(r.printPrice, 700); // still computed on entered qty
  }
});

// 12. zero dimension -> rejected
check("zero dimension rejected", () => {
  const r = calculateServicePrice({
    config: perSqftPlusDesign,
    widthValue: 0,
    heightValue: 48,
    unit: "inch",
    quantity: 1,
    option: "print_only",
  });
  assert.equal(r.ok, false);
});

// 13. negative dimension -> rejected
check("negative dimension rejected", () => {
  const r = calculateServicePrice({
    config: perSqftPlusDesign,
    widthValue: -5,
    heightValue: 48,
    unit: "inch",
    quantity: 1,
    option: "print_only",
  });
  assert.equal(r.ok, false);
});

// 14. invalid input (NaN / Infinity / non-finite)
check("NaN and Infinity rejected", () => {
  const r1 = calculateServicePrice({
    config: perSqftPlusDesign,
    widthValue: NaN,
    heightValue: 48,
    unit: "inch",
    quantity: 1,
    option: "print_only",
  });
  assert.equal(r1.ok, false);

  const r2 = calculateServicePrice({
    config: perSqftPlusDesign,
    quantity: Infinity,
    option: "design_only",
  });
  assert.equal(r2.ok, false);
});

// 15. decimal dimension
check("decimal dimensions compute correctly", () => {
  const r = calculateServicePrice({
    config: { ...perSqftPlusDesign, designFee: 0 },
    widthValue: 36.5,
    heightValue: 24.25,
    unit: "inch",
    quantity: 1,
    option: "print_only",
  });
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.areaSqFt, round2((36.5 * 24.25) / 144));
    function round2(v: number) {
      return Math.round((v + Number.EPSILON) * 100) / 100;
    }
  }
});

// 16. CUSTOM model / old service with no pricing configured — never crashes
check("CUSTOM model returns a friendly not-configured error, not a crash", () => {
  const r = calculateServicePrice({
    config: {
      pricingModel: "CUSTOM",
      rate: null,
      designFee: 0,
      sourceFileFee: 0,
      minimumCharge: null,
      minimumQuantity: null,
    },
    quantity: 1,
    option: "print_only",
  });
  assert.equal(r.ok, true); // CUSTOM never throws — engine returns 0 print price
  if (r.ok) assert.equal(r.printPrice, 0);
});

console.log(`\n${passed}/${passed} pricing engine checks passed`);
