import { query } from "../lib/db.js";
import { createFeatureFlagService } from "@dakinis/shared-feature-flags/server";
import { DEFAULT_WORKSPACE_EVAL_KEYS } from "@dakinis/shared-feature-flags/keys";

const service = createFeatureFlagService(query);

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
  const resolved = list.length > 0 ? list : DEFAULT_WORKSPACE_EVAL_KEYS;
  return service.evaluate(resolved, ctx);
}
