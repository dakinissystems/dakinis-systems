/**
 * Maps StreamAutomator legacy license types → billing.plans codes (045).
 */

/** @type {Record<string, string>} */
export const SA_LICENSE_TO_PLAN = {
  monthly: "sa-creator-monthly",
  quarterly: "sa-pro-monthly",
  lifetime: "sa-lifetime",
};

/** @type {Record<string, string>} */
export const SA_PLAN_TO_LICENSE = {
  "sa-creator-monthly": "monthly",
  "sa-pro-monthly": "quarterly",
  "sa-lifetime": "lifetime",
};

/**
 * @param {string | null | undefined} licenseType
 * @returns {string | null}
 */
export function mapSaLicenseToPlanCode(licenseType) {
  if (!licenseType) return null;
  const key = String(licenseType).toLowerCase();
  return SA_LICENSE_TO_PLAN[key] || null;
}

/**
 * @param {string | null | undefined} planCode
 * @returns {string | null}
 */
export function mapSaPlanToLicenseType(planCode) {
  if (!planCode) return null;
  return SA_PLAN_TO_LICENSE[planCode] || null;
}

/**
 * @param {string | null | undefined} planCode
 * @returns {string | null}
 */
export function productKeyFromPlanCode(planCode) {
  if (!planCode) return null;
  if (planCode.startsWith("sa-")) return "streamautomator";
  if (planCode.startsWith("lifeflow")) return "lifeflow";
  return "core";
}
