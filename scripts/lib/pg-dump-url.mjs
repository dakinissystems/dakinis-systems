/**
 * Rewrite Supabase URLs so pg_dump works from GitHub Actions (IPv4).
 * - Drop pgbouncer=true / prefer session port 5432
 * - Rewrite db.<ref>.supabase.co → pooler host with postgres.<ref>
 */

/**
 * @param {string} raw
 * @param {{ poolerHost?: string }} [opts]
 */
export function dumpCompatibleUrl(raw, opts = {}) {
  const u = new URL(raw);
  u.searchParams.delete("pgbouncer");

  const direct = u.hostname.match(/^db\.([a-z0-9]{20})\.supabase\.co$/i);
  if (direct) {
    const ref = direct[1];
    u.hostname = opts.poolerHost || process.env.SUPABASE_POOLER_HOST || "aws-1-eu-west-1.pooler.supabase.com";
    if (u.username === "postgres") {
      u.username = `postgres.${ref}`;
    }
  }

  if (u.port === "6543" || (u.hostname.includes("pooler") && (!u.port || u.port === ""))) {
    u.port = "5432";
  }
  if (!u.searchParams.has("sslmode")) {
    u.searchParams.set("sslmode", "require");
  }
  return u.toString();
}

/**
 * Safe one-line summary (no password).
 * @param {string} raw
 */
export function summarizeDatabaseUrl(raw) {
  try {
    const u = new URL(raw);
    const ref =
      (u.username.match(/^postgres\.([a-z0-9]{20})$/i) || [])[1] ||
      (u.hostname.match(/^db\.([a-z0-9]{20})\.supabase\.co$/i) || [])[1] ||
      "?";
    return { host: u.hostname, port: u.port || "(default)", user: u.username, ref };
  } catch {
    return { host: "?", port: "?", user: "?", ref: "?" };
  }
}
