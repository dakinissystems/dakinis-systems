/**
 * Ensure Cloudflare rate-limit covers /api/ (and /auth/ on free plans).
 *
 * Free/Pro often allow only **1** rate-limit rule. If Auth RL already exists,
 * this script **updates that rule** to also match /api/ instead of adding a second.
 *
 * Requires CLOUDFLARE_API_TOKEN with Zone WAF Write.
 *
 * Usage:
 *   $env:CLOUDFLARE_API_TOKEN="…"   # real token — never commit or paste in chat
 *   node scripts/configure-cloudflare-api-rate-limit.mjs
 *
 * Optional env:
 *   CF_API_RL_REQUESTS (default: keep existing, else 100)
 *   CF_API_RL_PERIOD (default: keep existing, else 10)
 *   CF_API_RL_BLOCK_SECONDS (default: keep existing, else 60)
 */
const token = String(process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN || "").trim();
const zoneName = String(process.env.CLOUDFLARE_ZONE_NAME || "dakinissystems.com").trim();
let zoneId = String(process.env.CLOUDFLARE_ZONE_ID || "").trim();

const COMBINED_DESCRIPTION = "Dakinis rate limit /auth/ + /api/";
const COMBINED_EXPRESSION =
  '(http.request.uri.path contains "/auth/" or http.request.uri.path contains "/api/")';
const PHASE = "http_ratelimit";

const REQUESTS_PER_PERIOD = process.env.CF_API_RL_REQUESTS
  ? Number(process.env.CF_API_RL_REQUESTS)
  : null;
const PERIOD_SECONDS = process.env.CF_API_RL_PERIOD ? Number(process.env.CF_API_RL_PERIOD) : null;
const MITIGATION_TIMEOUT = process.env.CF_API_RL_BLOCK_SECONDS
  ? Number(process.env.CF_API_RL_BLOCK_SECONDS)
  : null;

if (!token) {
  console.error("Set CLOUDFLARE_API_TOKEN (Zone WAF Write).");
  process.exit(1);
}
if (/^<|^YOUR_|placeholder|Zone WAF Write/i.test(token)) {
  console.error("CLOUDFLARE_API_TOKEN looks like a placeholder.");
  console.error("Create a real token: https://dash.cloudflare.com/profile/api-tokens");
  console.error("Permissions: Zone WAF Edit + Zone Read (zone dakinissystems.com).");
  console.error('PowerShell: $env:CLOUDFLARE_API_TOKEN = "paste-real-token-here"');
  process.exit(1);
}

async function cf(path, { method = "GET", body, allowStatuses = [] } = {}) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const json = await res.json().catch(() => ({}));
  if (allowStatuses.includes(res.status)) return { ...json, _httpStatus: res.status };
  if (!res.ok || json.success === false) {
    const err = json?.errors?.[0]?.message || JSON.stringify(json);
    throw new Error(`${method} ${path}: HTTP ${res.status} ${err}`);
  }
  return json;
}

async function resolveZoneId() {
  if (zoneId) return zoneId;
  const list = await cf(`/zones?name=${encodeURIComponent(zoneName)}`);
  const z = list.result?.[0];
  if (!z?.id) throw new Error(`Zone not found: ${zoneName}`);
  return z.id;
}

function coversApi(expression) {
  return String(expression || "").includes("/api/");
}

function coversAuth(expression) {
  return String(expression || "").includes("/auth/");
}

function buildRule(base = {}) {
  const prev = base.ratelimit || {};
  return {
    action: base.action || "block",
    description: COMBINED_DESCRIPTION,
    enabled: base.enabled !== false,
    expression: COMBINED_EXPRESSION,
    ratelimit: {
      characteristics: ["cf.colo.id", "ip.src"],
      period: PERIOD_SECONDS ?? prev.period ?? 10,
      requests_per_period: REQUESTS_PER_PERIOD ?? prev.requests_per_period ?? 100,
      mitigation_timeout: MITIGATION_TIMEOUT ?? prev.mitigation_timeout ?? 60
    }
  };
}

async function main() {
  zoneId = await resolveZoneId();
  console.log(`Zone ${zoneName} (${zoneId})`);

  const entry = await cf(`/zones/${zoneId}/rulesets/phases/${PHASE}/entrypoint`, {
    allowStatuses: [404]
  });

  if (entry._httpStatus === 404) {
    await cf(`/zones/${zoneId}/rulesets`, {
      method: "POST",
      body: {
        name: "default",
        description: "Zone rate limiting rules (entrypoint)",
        kind: "zone",
        phase: PHASE,
        rules: [buildRule()]
      }
    });
    console.log("Created rate-limit ruleset:", COMBINED_DESCRIPTION);
    console.log("CLOUDFLARE_API_RATE_LIMIT_APPLIED");
    return;
  }

  const rulesetId = entry.result?.id;
  const rules = Array.isArray(entry.result?.rules) ? entry.result.rules : [];
  console.log(`Existing rate-limit rules: ${rules.length}`);

  const alreadyCombined = rules.find(
    (r) => coversApi(r.expression) && coversAuth(r.expression)
  );
  if (alreadyCombined) {
    console.log("Already covers /auth/ + /api/:", alreadyCombined.id, alreadyCombined.description);
    console.log("CLOUDFLARE_API_RATE_LIMIT_OK");
    return;
  }

  const apiOnly = rules.find((r) => coversApi(r.expression));
  if (apiOnly && !coversAuth(apiOnly.expression)) {
    // Expand api-only → combined
    const updated = rules.map((r) =>
      r.id === apiOnly.id ? { id: r.id, ...buildRule(r) } : { id: r.id }
    );
    await cf(`/zones/${zoneId}/rulesets/${rulesetId}`, {
      method: "PUT",
      body: { rules: updated }
    });
    console.log("Updated existing /api/ rule → /auth/ + /api/");
    console.log("CLOUDFLARE_API_RATE_LIMIT_APPLIED");
    return;
  }

  const authOnly = rules.find((r) => coversAuth(r.expression) && !coversApi(r.expression));
  if (authOnly) {
    // Free plan: 1 slot — expand Auth rule instead of adding a second.
    const updated = rules.map((r) =>
      r.id === authOnly.id ? { id: r.id, ...buildRule(r) } : { id: r.id }
    );
    await cf(`/zones/${zoneId}/rulesets/${rulesetId}`, {
      method: "PUT",
      body: { rules: updated }
    });
    const rl = buildRule(authOnly).ratelimit;
    console.log("Plan limit ≈ 1 RL rule — expanded Auth rule to also match /api/");
    console.log(
      `  ${rl.requests_per_period} req / IP+colo / ${rl.period}s → block ${rl.mitigation_timeout}s`
    );
    console.log("  (thresholds kept from Auth rule unless CF_API_RL_* env set)");
    console.log("CLOUDFLARE_API_RATE_LIMIT_APPLIED");
    return;
  }

  // No auth/api rule yet — try to add; on plan-limit error, replace the only rule.
  try {
    await cf(`/zones/${zoneId}/rulesets/phases/${PHASE}/entrypoint`, {
      method: "PUT",
      body: { rules: [...rules.map((r) => ({ id: r.id })), buildRule()] }
    });
    console.log("Added:", COMBINED_DESCRIPTION);
    console.log("CLOUDFLARE_API_RATE_LIMIT_APPLIED");
  } catch (e) {
    const msg = String(e.message || e);
    if (!/maximum number of rules/i.test(msg) || rules.length === 0) throw e;
    console.warn(msg);
    console.warn("Replacing the single existing RL rule with combined /auth/+/api/…");
    const base = rules[0];
    await cf(`/zones/${zoneId}/rulesets/${rulesetId}`, {
      method: "PUT",
      body: { rules: [{ id: base.id, ...buildRule(base) }] }
    });
    console.log("Replaced →", COMBINED_DESCRIPTION);
    console.log("CLOUDFLARE_API_RATE_LIMIT_APPLIED");
  }
}

main().catch((err) => {
  console.error(err.message || err);
  console.error("");
  console.error("Dashboard → Security → WAF → Rate limiting rules");
  console.error(`  Edit the existing Auth rule expression to:`);
  console.error(`  ${COMBINED_EXPRESSION}`);
  process.exit(1);
});
