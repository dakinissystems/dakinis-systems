import { clampMinor, roundDiv } from "./money.js";

const KINDS = new Set(["earning", "deduction", "employer_contribution", "informational"]);
const METHODS = new Set(["contract", "flat", "percent", "brackets"]);
const BASES = new Set(["salary", "hourly", "daily", "piece"]);

/**
 * @param {string|undefined} jurisdictionCode
 * @param {string} onDate YYYY-MM-DD
 * @param {object[]} components
 */
export function selectComponents(components, { jurisdictionCode, onDate }) {
  return components
    .filter((component) => {
      const code = component.jurisdictionCode || "";
      const jurisdictionOk = code === "" || code === jurisdictionCode;
      const fromOk = !component.effectiveFrom || component.effectiveFrom <= onDate;
      const toOk = !component.effectiveTo || component.effectiveTo >= onDate;
      return jurisdictionOk && fromOk && toOk;
    })
    .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0) || String(a.code).localeCompare(String(b.code)));
}

/**
 * @param {object[]} lines
 * @param {string} base
 */
function resolveBase(lines, base) {
  if (base === "gross") {
    return lines.filter((line) => line.kind === "earning").reduce((sum, line) => sum + line.amountMinor, 0);
  }
  if (base === "taxable") {
    const earned = lines
      .filter((line) => line.kind === "earning" && line.taxable !== false)
      .reduce((sum, line) => sum + line.amountMinor, 0);
    const preTax = lines
      .filter((line) => line.kind === "deduction" && line.reducesTaxable)
      .reduce((sum, line) => sum + line.amountMinor, 0);
    return earned - preTax;
  }
  return lines.filter((line) => line.code === base).reduce((sum, line) => sum + line.amountMinor, 0);
}

/**
 * @param {object} engagement
 * @param {object} input
 * @param {'half_up'|'half_even'} rounding
 */
function contractAmount(engagement, input, rounding) {
  const basis = engagement.payBasis;
  const rate = engagement.amountMinor;
  if (!BASES.has(basis)) return { ok: false, code: "invalid_basis", message: `Unknown pay basis ${basis}` };
  if (!Number.isInteger(rate) || rate < 0) {
    return { ok: false, code: "invalid_amount", message: "Engagement amount must be a non-negative integer" };
  }

  if (basis === "salary") {
    const days = input.period?.dayCount;
    const nominal = input.period?.nominalDayCount;
    if (engagement.proration === "calendar_days") {
      if (!Number.isInteger(days) || !Number.isInteger(nominal) || nominal <= 0 || days < 0) {
        return { ok: false, code: "invalid_proration", message: "calendar_days needs dayCount and nominalDayCount" };
      }
      return { ok: true, amountMinor: roundDiv(rate * days, nominal, rounding), quantityMilli: days * 1000 };
    }
    return { ok: true, amountMinor: rate, quantityMilli: null };
  }

  const inputs = input.inputs || {};
  if (basis === "hourly") {
    const hours = inputs.hoursMilli ?? 0;
    if (!Number.isInteger(hours) || hours < 0) {
      return { ok: false, code: "invalid_amount", message: "hoursMilli must be a non-negative integer" };
    }
    return { ok: true, amountMinor: roundDiv(rate * hours, 1000, rounding), quantityMilli: hours, overtime: true };
  }
  if (basis === "daily") {
    const days = inputs.daysMilli ?? 0;
    if (!Number.isInteger(days) || days < 0) {
      return { ok: false, code: "invalid_amount", message: "daysMilli must be a non-negative integer" };
    }
    return { ok: true, amountMinor: roundDiv(rate * days, 1000, rounding), quantityMilli: days };
  }
  const units = inputs.unitsMilli ?? 0;
  if (!Number.isInteger(units) || units < 0) {
    return { ok: false, code: "invalid_amount", message: "unitsMilli must be a non-negative integer" };
  }
  return { ok: true, amountMinor: roundDiv(rate * units, 1000, rounding), quantityMilli: units };
}

/**
 * Marginal brackets. `upToMinor: null` is the open top band.
 * @param {number} taxable
 * @param {{ upToMinor: number|null, rateBps: number }[]} brackets
 * @param {'half_up'|'half_even'} rounding
 */
export function taxFromBrackets(taxable, brackets, rounding) {
  const ordered = [...brackets].sort((a, b) => {
    if (a.upToMinor == null) return 1;
    if (b.upToMinor == null) return -1;
    return a.upToMinor - b.upToMinor;
  });
  let cursor = 0;
  let tax = 0;
  let left = taxable;
  for (const band of ordered) {
    if (left <= 0) break;
    const cap = band.upToMinor == null ? cursor + left : band.upToMinor;
    const slice = Math.max(0, Math.min(left, cap - cursor));
    if (slice > 0) {
      tax += roundDiv(slice * band.rateBps, 10000, rounding);
      left -= slice;
      cursor += slice;
    }
  }
  return tax;
}

function fail(code, message) {
  return { ok: false, code, message };
}

/**
 * Calculate one payslip from already-selected components.
 * Amounts are integers in minor units. Rates are basis points (10000 = 100%).
 * Quantities are milli-units (1000 = 1 hour, day, or piece).
 *
 * @param {object} input
 */
export function calculatePay(input) {
  const rounding = input.rounding === "half_even" ? "half_even" : "half_up";
  const engagement = input.engagement;
  if (!engagement?.currency || !engagement.payBasis) {
    return fail("invalid_engagement", "Engagement needs currency and payBasis");
  }
  if (input.currency && input.currency !== engagement.currency) {
    return fail("currency_mismatch", "Run currency does not match the engagement");
  }
  const components = [...(input.components || [])].sort(
    (a, b) => (a.sequence ?? 0) - (b.sequence ?? 0) || String(a.code).localeCompare(String(b.code))
  );
  if (!components.length) return fail("empty_components", "At least one pay component is required");

  /** @type {object[]} */
  const lines = [];
  for (const component of components) {
    if (!KINDS.has(component.kind)) return fail("invalid_component", `Unknown kind ${component.kind}`);
    if (!METHODS.has(component.method)) return fail("unknown_method", `Unknown method ${component.method}`);
    const built = linesFor(component, input, lines, rounding);
    if (!built.ok) return built;
    lines.push(...built.lines);
  }

  const grossMinor = sum(lines, (line) => line.kind === "earning");
  const deductionMinor = sum(lines, (line) => line.kind === "deduction");
  const employerMinor = sum(lines, (line) => line.kind === "employer_contribution");
  const informationalMinor = sum(lines, (line) => line.kind === "informational");
  const netMinor = grossMinor - deductionMinor;
  if (netMinor < 0 && !input.allowNegativeNet) {
    return fail("negative_net", "Net pay is negative");
  }

  return {
    ok: true,
    currency: engagement.currency,
    lines,
    grossMinor,
    deductionMinor,
    netMinor,
    employerMinor,
    informationalMinor,
  };
}

function sum(lines, predicate) {
  return lines.filter(predicate).reduce((total, line) => total + line.amountMinor, 0);
}

function linesFor(component, input, prior, rounding) {
  if (component.method === "contract") {
    const amount = contractAmount(input.engagement, input, rounding);
    if (!amount.ok) return amount;
    const lines = [
      line(component, {
        amountMinor: amount.amountMinor,
        quantityMilli: amount.quantityMilli,
        baseMinor: null,
        rateBps: null,
      }),
    ];
    if (amount.overtime) {
      for (const [index, band] of (input.inputs?.overtime || []).entries()) {
        const hours = band.hoursMilli ?? 0;
        const multiplier = band.multiplierBps ?? 10000;
        if (!Number.isInteger(hours) || hours < 0 || !Number.isInteger(multiplier) || multiplier < 0) {
          return fail("invalid_amount", "Overtime needs non-negative hoursMilli and multiplierBps");
        }
        lines.push(
          line(component, {
            code: `${component.code}:ot:${index + 1}`,
            amountMinor: roundDiv(input.engagement.amountMinor * hours * multiplier, 1000 * 10000, rounding),
            quantityMilli: hours,
            rateBps: multiplier,
            baseMinor: input.engagement.amountMinor,
          })
        );
      }
    }
    return { ok: true, lines };
  }

  if (component.method === "flat") {
    const amountMinor = component.amountMinor ?? input.inputs?.adjustments?.[component.code] ?? 0;
    if (!Number.isInteger(amountMinor)) return fail("invalid_amount", `Flat amount for ${component.code} must be an integer`);
    return { ok: true, lines: [line(component, { amountMinor, quantityMilli: null, baseMinor: null, rateBps: null })] };
  }

  const baseName = component.base || "gross";
  if (baseName !== "gross" && baseName !== "taxable" && !prior.some((item) => item.code === baseName)) {
    return fail("unknown_base", `Component ${component.code} refers to unknown base ${baseName}`);
  }
  const baseMinor = resolveBase(prior, baseName);

  if (component.method === "percent") {
    if (!Number.isInteger(component.rateBps) || component.rateBps < 0) {
      return fail("invalid_amount", `rateBps for ${component.code} must be a non-negative integer`);
    }
    const raw = roundDiv(baseMinor * component.rateBps, 10000, rounding);
    return {
      ok: true,
      lines: [
        line(component, {
          amountMinor: clampMinor(raw, component.floorMinor, component.ceilingMinor),
          quantityMilli: null,
          baseMinor,
          rateBps: component.rateBps,
        }),
      ],
    };
  }

  if (!Array.isArray(component.brackets) || !component.brackets.length) {
    return fail("invalid_component", `Brackets required for ${component.code}`);
  }
  const raw = taxFromBrackets(Math.max(0, baseMinor), component.brackets, rounding);
  return {
    ok: true,
    lines: [
      line(component, {
        amountMinor: clampMinor(raw, component.floorMinor, component.ceilingMinor),
        quantityMilli: null,
        baseMinor,
        rateBps: null,
      }),
    ],
  };
}

function line(component, fields) {
  return {
    code: fields.code || component.code,
    kind: component.kind,
    party: component.party || (component.kind === "employer_contribution" ? "employer" : "worker"),
    taxable: component.taxable !== false,
    reducesTaxable: Boolean(component.reducesTaxable),
    amountMinor: fields.amountMinor,
    quantityMilli: fields.quantityMilli,
    baseMinor: fields.baseMinor,
    rateBps: fields.rateBps,
  };
}

/** Statuses that a later calculation must not overwrite. */
export function slipIsLocked(status) {
  return status === "approved" || status === "paid" || status === "void";
}
