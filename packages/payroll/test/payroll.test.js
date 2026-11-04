import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculatePay, selectComponents, slipIsLocked, taxFromBrackets } from "../src/calculate.js";
import { formatMinor, roundDiv } from "../src/money.js";
import { genericEngagementPack, sampleFlatLevyPack } from "../src/packs.js";

describe("money", () => {
  it("rounds half up and half even", () => {
    assert.equal(roundDiv(1 * 5000, 10000, "half_up"), 1);
    assert.equal(roundDiv(1 * 5000, 10000, "half_even"), 0);
    assert.equal(roundDiv(3 * 5000, 10000, "half_even"), 2);
    assert.equal(formatMinor(300050, 2), "3000.50");
    assert.equal(formatMinor(3000, 0), "3000");
    assert.equal(formatMinor(-50, 2), "-0.50");
  });
});

describe("calculatePay", () => {
  it("pays a monthly salary with no statutory deduction", () => {
    const pack = genericEngagementPack({ currency: "EUR", amountMinor: 300000 });
    const slip = calculatePay({
      engagement: pack.engagement,
      components: pack.components,
    });
    assert.equal(slip.ok, true);
    if (!slip.ok) return;
    assert.equal(slip.grossMinor, 300000);
    assert.equal(slip.netMinor, 300000);
    assert.equal(slip.employerMinor, 0);
  });

  it("prorates a salary by calendar days", () => {
    const slip = calculatePay({
      rounding: "half_up",
      engagement: { currency: "USD", payBasis: "salary", amountMinor: 310000, proration: "calendar_days" },
      period: { dayCount: 15, nominalDayCount: 30 },
      components: [{ code: "BASE", kind: "earning", method: "contract", sequence: 10 }],
    });
    assert.equal(slip.ok, true);
    if (!slip.ok) return;
    assert.equal(slip.grossMinor, 155000);
  });

  it("adds overtime without reducing it into the base hours", () => {
    const slip = calculatePay({
      engagement: { currency: "MXN", payBasis: "hourly", amountMinor: 10000 },
      inputs: { hoursMilli: 8_000, overtime: [{ hoursMilli: 2_000, multiplierBps: 15000 }] },
      components: [{ code: "BASE", kind: "earning", method: "contract", sequence: 10 }],
    });
    assert.equal(slip.ok, true);
    if (!slip.ok) return;
    assert.equal(slip.lines[0].amountMinor, 80_000);
    assert.equal(slip.lines[1].amountMinor, 30_000);
    assert.equal(slip.grossMinor, 110_000);
  });

  it("withholds on the taxable base and keeps the employer levy off the net", () => {
    const pack = sampleFlatLevyPack({ currency: "EUR", withholdingBps: 1000, employerLevyBps: 500 });
    const slip = calculatePay({
      engagement: { ...pack.engagement, amountMinor: 200000 },
      components: [
        ...pack.components,
        {
          code: "PENSION",
          kind: "deduction",
          method: "flat",
          amountMinor: 10000,
          reducesTaxable: true,
          sequence: 50,
        },
      ],
    });
    assert.equal(slip.ok, true);
    if (!slip.ok) return;
    assert.equal(slip.grossMinor, 200000);
    assert.equal(slip.lines.find((line) => line.code === "WITHHOLDING")?.amountMinor, 19000);
    assert.equal(slip.deductionMinor, 29000);
    assert.equal(slip.netMinor, 171000);
    assert.equal(slip.employerMinor, 10000);
  });

  it("applies marginal brackets and a ceiling", () => {
    assert.equal(
      taxFromBrackets(150000, [
        { upToMinor: 100000, rateBps: 0 },
        { upToMinor: null, rateBps: 2000 },
      ], "half_up"),
      10000
    );
    const slip = calculatePay({
      engagement: { currency: "EUR", payBasis: "salary", amountMinor: 150000 },
      components: [
        { code: "BASE", kind: "earning", method: "contract", sequence: 10 },
        {
          code: "TAX",
          kind: "deduction",
          method: "brackets",
          base: "taxable",
          sequence: 100,
          ceilingMinor: 4000,
          brackets: [
            { upToMinor: 100000, rateBps: 0 },
            { upToMinor: null, rateBps: 2000 },
          ],
        },
      ],
    });
    assert.equal(slip.ok, true);
    if (!slip.ok) return;
    assert.equal(slip.deductionMinor, 4000);
  });

  it("rejects a negative net, a currency clash, and a missing base", () => {
    const negative = calculatePay({
      engagement: { currency: "EUR", payBasis: "salary", amountMinor: 1000 },
      components: [
        { code: "BASE", kind: "earning", method: "contract", sequence: 10 },
        { code: "ADVANCE", kind: "deduction", method: "flat", amountMinor: 5000, sequence: 20 },
      ],
    });
    assert.equal(negative.ok, false);
    if (negative.ok) return;
    assert.equal(negative.code, "negative_net");

    const clash = calculatePay({
      currency: "USD",
      engagement: { currency: "EUR", payBasis: "salary", amountMinor: 1000 },
      components: [{ code: "BASE", kind: "earning", method: "contract" }],
    });
    assert.equal(clash.ok, false);

    const missing = calculatePay({
      engagement: { currency: "EUR", payBasis: "salary", amountMinor: 1000 },
      components: [
        { code: "BASE", kind: "earning", method: "contract", sequence: 10 },
        { code: "X", kind: "deduction", method: "percent", rateBps: 100, base: "BONUS", sequence: 20 },
      ],
    });
    assert.equal(missing.ok, false);
    if (missing.ok) return;
    assert.equal(missing.code, "unknown_base");
  });

  it("selects components by jurisdiction and effective date", () => {
    const selected = selectComponents(
      [
        { code: "ES", jurisdictionCode: "ES", effectiveFrom: "2026-01-01", sequence: 2 },
        { code: "ALL", jurisdictionCode: "", sequence: 1 },
        { code: "OLD", jurisdictionCode: "ES", effectiveTo: "2025-12-31", sequence: 0 },
        { code: "MX", jurisdictionCode: "MX", sequence: 3 },
      ],
      { jurisdictionCode: "ES", onDate: "2026-11-30" }
    );
    assert.deepEqual(selected.map((component) => component.code), ["ALL", "ES"]);
    assert.equal(slipIsLocked("paid"), true);
    assert.equal(slipIsLocked("calculated"), false);
  });
});
