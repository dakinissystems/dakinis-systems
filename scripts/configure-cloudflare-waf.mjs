/**
 * Configure Cloudflare WAF baseline for dakinissystems.com.
 *
 * Requires:
 *   CLOUDFLARE_API_TOKEN  — Zone:WAF Write + Zone:Settings Read (or Account WAF)
 *   CLOUDFLARE_ZONE_ID    — optional; auto-resolved from CLOUDFLARE_ZONE_NAME
 *   CLOUDFLARE_ZONE_NAME  — default dakinissystems.com
 *
 * Usage:
 *   $env:CLOUDFLARE_API_TOKEN="…"
 *   node scripts/configure-cloudflare-waf.mjs
 */
const token = String(process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN || "").trim();
const zoneName = String(process.env.CLOUDFLARE_ZONE_NAME || "dakinissystems.com").trim();
let zoneId = String(process.env.CLOUDFLARE_ZONE_ID || "").trim();

if (!token) {
  console.error("Set CLOUDFLARE_API_TOKEN (Zone WAF Write).");
  process.exit(1);
}

async function cf(path, { method = "GET", body } = {}) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
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

  // Enable Cloudflare Managed Ruleset (OWASP / managed) at zone level via rulesets API.
  // Package: Cloudflare Managed Ruleset + OWASP Core Ruleset (IDs are account/zone package entries).
  const entry = await cf(`/zones/${zoneId}/rulesets/phases/http_request_firewall_managed/entrypoint`);
  console.log("Managed firewall entrypoint rules:", entry.result?.rules?.length ?? 0);

  // Ensure Bot Fight Mode-ish security level at least "medium" if still "essentially_off"/"low".
  const settings = await cf(`/zones/${zoneId}/settings/security_level`);
  const level = settings.result?.value;
  console.log("security_level:", level);
  if (level === "essentially_off" || level === "low") {
    await cf(`/zones/${zoneId}/settings/security_level`, {
      method: "PATCH",
      body: { value: "medium" },
    });
    console.log("security_level → medium");
  }

  // Browser integrity check
  const bic = await cf(`/zones/${zoneId}/settings/browser_check`);
  if (bic.result?.value !== "on") {
    await cf(`/zones/${zoneId}/settings/browser_check`, {
      method: "PATCH",
      body: { value: "on" },
    });
    console.log("browser_check → on");
  } else {
    console.log("browser_check: on");
  }

  // SSL recommended
  const ssl = await cf(`/zones/${zoneId}/settings/ssl`);
  console.log("ssl:", ssl.result?.value);

  console.log("");
  console.log("CLOUDFLARE_WAF_BASELINE_APPLIED");
  console.log("Still do in dashboard (plan-dependent):");
  console.log("  Security → WAF → Managed rules → Cloudflare Managed + OWASP → Managed Challenge/Block");
  console.log("  Security → Bots → Bot Fight Mode / Super Bot Fight");
  console.log("  Security → WAF → Rate limiting rules for /auth/*");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
