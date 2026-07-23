/**
 * Create Cloudflare rate-limit rule for /api/ (complements Auth RL /auth/).
 *
 * Requires CLOUDFLARE_API_TOKEN with Zone WAF Write (or Account rulesets).
 * Optional: CLOUDFLARE_ZONE_ID / CLOUDFLARE_ZONE_NAME (default dakinissystems.com)
 *
 * Usage:
 *   $env:CLOUDFLARE_API_TOKEN="…"
 *   node scripts/configure-cloudflare-api-rate-limit.mjs
 *
 * If your plan rejects the ruleset, create the same rule in Dashboard:
 *   Security → WAF → Rate limiting rules
 *   URI Path contains /api/ · 100 req / IP / 10s · Block 1 min
 */
const token = String(process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN || "").trim();
const zoneName = String(process.env.CLOUDFLARE_ZONE_NAME || "dakinissystems.com").trim();
let zoneId = String(process.env.CLOUDFLARE_ZONE_ID || "").trim();

const RULE_DESCRIPTION = "Dakinis API rate limit /api/";
const REQUESTS_PER_PERIOD = Number(process.env.CF_API_RL_REQUESTS || 100);
const PERIOD_SECONDS = Number(process.env.CF_API_RL_PERIOD || 10);
const MITIGATION_TIMEOUT = Number(process.env.CF_API_RL_BLOCK_SECONDS || 60);

if (!token) {
  console.error("Set CLOUDFLARE_API_TOKEN (Zone WAF Write).");
  process.exit(1);
}

async function cf(path, { method = "GET", body } = {}) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const json = await res.json().catch(() => ({}));
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

async function main() {
  zoneId = await resolveZoneId();
  console.log(`Zone ${zoneName} (${zoneId})`);

  const phase = "http_ratelimit";
  let entry;
  try {
    entry = await cf(`/zones/${zoneId}/rulesets/phases/${phase}/entrypoint`);
  } catch (e) {
    console.error(String(e.message || e));
    console.error("");
    console.error("API rate-limit ruleset not available (plan?) — create in Dashboard:");
    console.error(`  ${RULE_DESCRIPTION}`);
    console.error(`  Expression: http.request.uri.path contains "/api/"`);
    console.error(`  ${REQUESTS_PER_PERIOD} req / IP / ${PERIOD_SECONDS}s → Block ${MITIGATION_TIMEOUT}s`);
    process.exit(2);
  }

  const rules = Array.isArray(entry.result?.rules) ? entry.result.rules : [];
  const existing = rules.find((r) => String(r.description || "").includes("API rate limit /api/"));
  if (existing) {
    console.log("Already present:", existing.id, existing.description);
    console.log("CLOUDFLARE_API_RATE_LIMIT_OK");
    return;
  }

  const newRule = {
    action: "block",
    description: RULE_DESCRIPTION,
    expression: '(http.request.uri.path contains "/api/")',
    ratelimit: {
      characteristics: ["ip.src"],
      period: PERIOD_SECONDS,
      requests_per_period: REQUESTS_PER_PERIOD,
      mitigation_timeout: MITIGATION_TIMEOUT
    }
  };

  await cf(`/zones/${zoneId}/rulesets/phases/${phase}/entrypoint`, {
    method: "PUT",
    body: {
      rules: [...rules, newRule]
    }
  });

  console.log("Added:", RULE_DESCRIPTION);
  console.log(
    `  ${REQUESTS_PER_PERIOD} req / IP / ${PERIOD_SECONDS}s → block ${MITIGATION_TIMEOUT}s`
  );
  console.log("CLOUDFLARE_API_RATE_LIMIT_APPLIED");
}

main().catch((err) => {
  console.error(err.message || err);
  console.error("");
  console.error("Fallback Dashboard → Security → WAF → Rate limiting rules → Create rule");
  process.exit(1);
});
