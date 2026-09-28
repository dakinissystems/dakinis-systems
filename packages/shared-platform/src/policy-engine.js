/**
 * Minimal policy engine: can(userCtx, action, resource, tenantCtx) → ALLOW | DENY.
 */

/**
 * @typedef {object} PolicySubject
 * @property {string} [userId]
 * @property {string[]} [permissions]
 * @property {string} [role]
 */

/**
 * @typedef {object} PolicyResource
 * @property {string} type - e.g. invoice, contact, table
 * @property {string} [id]
 * @property {string} [tenantId]
 */

/**
 * @param {PolicySubject} subject
 * @param {string} action - e.g. create, read, update, delete, manage
 * @param {PolicyResource} resource
 * @param {{ permission?: string; check?: (s: PolicySubject, a: string, r: PolicyResource) => boolean }} [rule]
 * @returns {'ALLOW'|'DENY'}
 */
export function evaluatePolicy(subject, action, resource, rule = {}) {
  const granted = subject?.permissions || [];
  if (granted.includes("platform:admin") || granted.includes("*")) return "ALLOW";

  if (typeof rule.check === "function") {
    return rule.check(subject, action, resource) ? "ALLOW" : "DENY";
  }

  if (rule.permission) {
    if (granted.includes(rule.permission)) return "ALLOW";
    // capability wildcard: inventory.* matches inventory.product.write
    const [ns] = String(rule.permission).split(":");
    if (ns && granted.includes(`${ns}:*`)) return "ALLOW";
    const [cap] = String(rule.permission).split(".");
    if (cap && granted.includes(`${cap}.*`)) return "ALLOW";
    return "DENY";
  }

  return "DENY";
}

/**
 * @param {PolicySubject} subject
 * @param {string} action
 * @param {PolicyResource} resource
 * @param {Parameters<typeof evaluatePolicy>[3]} [rule]
 */
export function assertPolicy(subject, action, resource, rule) {
  const decision = evaluatePolicy(subject, action, resource, rule);
  if (decision === "DENY") {
    const err = new Error("permission_denied");
    err.code = "PERMISSION_DENIED";
    err.status = 403;
    throw err;
  }
  return decision;
}
