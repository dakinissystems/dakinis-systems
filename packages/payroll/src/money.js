/** Integer money. `amountMinor` is the currency's minor unit (cents, yen, fils). */

/**
 * @param {number} numerator
 * @param {number} denominator
 * @param {'half_up'|'half_even'} [mode]
 */
export function roundDiv(numerator, denominator, mode = "half_up") {
  if (!Number.isInteger(numerator) || !Number.isInteger(denominator) || denominator <= 0) {
    throw new TypeError("roundDiv expects an integer numerator and a positive integer denominator");
  }
  const negative = numerator < 0;
  const absolute = negative ? -numerator : numerator;
  const quotient = Math.floor(absolute / denominator);
  const remainder = absolute % denominator;
  let bump = 0;
  if (remainder !== 0) {
    const twice = remainder * 2;
    if (mode === "half_even") {
      if (twice > denominator || (twice === denominator && quotient % 2 === 1)) bump = 1;
    } else if (twice >= denominator) {
      bump = 1;
    }
  }
  const rounded = quotient + bump;
  return negative ? -rounded : rounded;
}

/**
 * @param {number} amountMinor
 * @param {number} [exponent]
 */
export function formatMinor(amountMinor, exponent = 2) {
  if (!Number.isInteger(amountMinor) || !Number.isInteger(exponent) || exponent < 0 || exponent > 6) {
    throw new TypeError("formatMinor expects an integer amount and an exponent from 0 to 6");
  }
  const sign = amountMinor < 0 ? "-" : "";
  const absolute = Math.abs(amountMinor);
  if (exponent === 0) return sign + String(absolute);
  const factor = 10 ** exponent;
  const whole = Math.floor(absolute / factor);
  const fraction = String(absolute % factor).padStart(exponent, "0");
  return `${sign}${whole}.${fraction}`;
}

/**
 * @param {number} amountMinor
 * @param {number|null|undefined} floorMinor
 * @param {number|null|undefined} ceilingMinor
 */
export function clampMinor(amountMinor, floorMinor, ceilingMinor) {
  let amount = amountMinor;
  if (floorMinor != null && amount < floorMinor) amount = floorMinor;
  if (ceilingMinor != null && amount > ceilingMinor) amount = ceilingMinor;
  return amount;
}
