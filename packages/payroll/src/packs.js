/**
 * Packs are data. They are not a statutory table for any country.
 * A market adapter supplies its own components, brackets, and labels.
 */

/**
 * Salary or hourly contract, no statutory withholding.
 * The tenant adds deductions in their jurisdiction.
 * @param {{ currency: string, payBasis?: string, amountMinor?: number }} options
 */
export function genericEngagementPack(options) {
  return {
    currency: options.currency,
    rounding: "half_up",
    exponent: options.currency === "JPY" ? 0 : 2,
    engagement: {
      currency: options.currency,
      payBasis: options.payBasis || "salary",
      amountMinor: options.amountMinor ?? 0,
      proration: "none",
    },
    components: [
      {
        code: "BASE",
        kind: "earning",
        method: "contract",
        party: "worker",
        sequence: 10,
        taxable: true,
        jurisdictionCode: "",
      },
    ],
  };
}

/**
 * Example of a flat worker withholding plus an employer levy.
 * The rates are placeholders for tests and for showing the shape of a market pack.
 * @param {{ currency: string, withholdingBps?: number, employerLevyBps?: number }} options
 */
export function sampleFlatLevyPack(options) {
  const base = genericEngagementPack(options);
  return {
    ...base,
    sample: true,
    components: [
      ...base.components,
      {
        code: "WITHHOLDING",
        kind: "deduction",
        method: "percent",
        base: "taxable",
        rateBps: options.withholdingBps ?? 1000,
        party: "worker",
        sequence: 100,
        jurisdictionCode: "",
      },
      {
        code: "EMPLOYER_LEVY",
        kind: "employer_contribution",
        method: "percent",
        base: "gross",
        rateBps: options.employerLevyBps ?? 500,
        party: "employer",
        sequence: 200,
        jurisdictionCode: "",
      },
    ],
  };
}
