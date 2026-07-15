import { query } from "../lib/db.js";

function stableBucket(seed, key) {
  const raw = `${seed}:${key}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash * 31 + raw.charCodeAt(i)) >>> 0;
  }
  return hash % 100;
}

/**
 * @param {object} row
 * @param {object} ctx
 */
function resolveFlagRow(row, ctx) {
  if (!row.enabled) return false;

  const scope = String(row.scope || "global");
  if (scope === "tenant" && row.tenant_id) {
    if (!ctx.tenantId || String(row.tenant_id) !== String(ctx.tenantId)) return false;
  }

  const targets = Array.isArray(row.target_workspaces) ? row.target_workspaces : [];
  if (targets.length > 0) {
    if (!ctx.workspaceId || !targets.includes(String(ctx.workspaceId))) return false;
  }

  const plans = Array.isArray(row.target_plans) ? row.target_plans : [];
  if (plans.length > 0) {
    if (!ctx.plan || !plans.includes(String(ctx.plan))) return false;
  }

  const pct = Number(row.rollout_percentage) || 0;
  if (pct >= 100) return true;
  if (pct <= 0) return false;

  const seed = ctx.userId || ctx.workspaceId || ctx.tenantId || "global";
  return stableBucket(seed, row.flag_key) < pct;
}

/**
 * @param {string | string[]} keys
 * @param {{
 *   workspaceId?: string,
 *   tenantId?: string,
 *   userId?: string,
 *   plan?: string,
 * }} [ctx]
 */
export async function evaluateFeatureFlags(keys, ctx = {}) {
  const list = Array.isArray(keys)
    ? keys
    : String(keys || "")
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

  if (list.length === 0) return {};

  const { rows } = await query(
    `SELECT flag_key, enabled, scope, tenant_id, rollout_percentage,
            target_workspaces, target_plans
     FROM meta.feature_flags
     WHERE flag_key = ANY($1::text[])`,
    [list],
  );

  /** @type {Record<string, boolean>} */
  const result = {};
  for (const key of list) result[key] = false;
  for (const row of rows) {
    result[row.flag_key] = resolveFlagRow(row, ctx);
  }
  return result;
}

/** Alias for batch evaluation (same implementation). */
export async function evaluateFeatureFlagsBatch(keys, ctx = {}) {
  return evaluateFeatureFlags(keys, ctx);
}
