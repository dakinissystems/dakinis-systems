/**
 * Skip Cloudflare bot challenges on health endpoints so GitHub Actions
 * uptime probes (and external monitors) are not blocked by Bot Fight.
 *
 * Requires CLOUDFLARE_API_TOKEN with Zone WAF Write.
 * Optional: CLOUDFLARE_ZONE_ID / CLOUDFLARE_ZONE_NAME (default dakinissystems.com)
 *
 * Usage:
 *   $env:CLOUDFLARE_API_TOKEN="…"
 *   node scripts/configure-cloudflare-health-skip.mjs
 *
 * Dashboard equivalent:
 *   Security → WAF → Custom rules → Create rule
 *   Expression: ends_with(http.request.uri.path, "/health")
 *   Action: Skip → Bot Fight Mode (+ Browser Integrity Check)
 */
const token = String(process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN || "").trim();
const zoneName = String(process.env.CLOUDFLARE_ZONE_NAME || "dakinissystems.com").trim();
let zoneId = String(process.env.CLOUDFLARE_ZONE_ID || "").trim();

const RULE_DESCRIPTION = "Dakinis skip bot challenge on /health";
const EXPRESSION =
  '(ends_with(http.request.uri.path, "/health") or http.request.uri.path eq "/health")';

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

  const phase = "http_request_firewall_custom";
  const entry = await cf(`/zones/${zoneId}/rulesets/phases/${phase}/entrypoint`);
  const rules = Array.isArray(entry.result?.rules) ? entry.result.rules : [];
  const existing = rules.find((r) => String(r.description || "").includes("skip bot challenge on /health"));
  if (existing) {
    console.log("Already present:", existing.id, existing.description);
    console.log("CLOUDFLARE_HEALTH_SKIP_OK");
    return;
  }

  const newRule = {
    action: "skip",
    action_parameters: {
      // Bot Fight + common blockers that challenge datacenter IPs (GH Actions).
      products: ["bic", "securityLevel", "uaBlock", "hot", "zoneLockdown"],
      phases: ["http_request_sbfm"]
    },
    description: RULE_DESCRIPTION,
    enabled: true,
    expression: EXPRESSION
  };

  await cf(`/zones/${zoneId}/rulesets/phases/${phase}/entrypoint`, {
    method: "PUT",
    body: {
      rules: [newRule, ...rules]
    }
  });

  console.log("Created:", RULE_DESCRIPTION);
  console.log("Expression:", EXPRESSION);
  console.log("CLOUDFLARE_HEALTH_SKIP_OK");
  console.log("");
  console.log("If Bot Fight still challenges probes, enable Skip → Bot Fight Mode in Dashboard for this rule.");
}

main().catch((err) => {
  console.error(String(err.message || err));
  process.exit(1);
});
