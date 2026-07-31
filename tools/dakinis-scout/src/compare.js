/**
 * @param {number} buy
 * @param {number} sell
 * @param {number} [fees=0]
 */
export function calcProfit(buy, sell, fees = 0) {
  const b = Number(buy);
  const s = Number(sell);
  const f = Number(fees) || 0;
  if (![b, s].every(Number.isFinite)) return null;
  return round2(s - b - f);
}

/**
 * @param {number} buy
 * @param {number} sell
 * @param {number} [fees=0]
 */
export function calcRoi(buy, sell, fees = 0) {
  const b = Number(buy);
  const profit = calcProfit(buy, sell, fees);
  if (profit == null || !Number.isFinite(b) || b <= 0) return null;
  return round2((profit / b) * 100);
}

/**
 * @param {number[]} values
 */
export function median(values) {
  const xs = values.filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  if (!xs.length) return null;
  const mid = Math.floor(xs.length / 2);
  return xs.length % 2 ? xs[mid] : round2((xs[mid - 1] + xs[mid]) / 2);
}

/**
 * @param {number[]} values
 */
export function mean(values) {
  const xs = values.filter((n) => Number.isFinite(n));
  if (!xs.length) return null;
  return round2(xs.reduce((a, b) => a + b, 0) / xs.length);
}

/**
 * @param {number[]} values
 * @param {number} p 0–1
 */
export function percentile(values, p) {
  const xs = values.filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  if (!xs.length) return null;
  const clamped = Math.min(1, Math.max(0, Number(p)));
  const idx = (xs.length - 1) * clamped;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return xs[lo];
  return round2(xs[lo] + (xs[hi] - xs[lo]) * (idx - lo));
}

/**
 * @param {number} n
 */
export function round2(n) {
  return Math.round(Number(n) * 100) / 100;
}

/**
 * @param {number} profit
 * @returns {"green"|"yellow"|"red"}
 */
export function urgencyFromProfit(profit) {
  if (profit >= 50) return "red";
  if (profit >= 25) return "yellow";
  return "green";
}
