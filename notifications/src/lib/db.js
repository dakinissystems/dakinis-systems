import pg from "pg";
import { config } from "../config.js";

const { Pool } = pg;

/** @type {pg.Pool | null} */
let pool = null;

export function notificationsDbEnabled() {
  return Boolean(String(config.databaseUrl || "").trim());
}

export function getPool() {
  if (!notificationsDbEnabled()) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: config.databaseUrl,
      ssl: config.databaseSsl ? { rejectUnauthorized: false } : undefined,
      max: Number(process.env.DATABASE_POOL_MAX) || 5,
    });
    pool.on("error", (err) => {
      console.warn("[notifications/db] pool error:", err instanceof Error ? err.message : err);
    });
  }
  return pool;
}

/**
 * @param {string} text
 * @param {unknown[]} [params]
 */
export async function query(text, params = []) {
  const p = getPool();
  if (!p) throw new Error("database_not_configured");
  const client = await p.connect();
  try {
    await client.query("SET search_path TO hub, dakinis_auth, public");
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

export async function checkDbHealth() {
  if (!notificationsDbEnabled()) {
    return { enabled: false, ok: false, reason: "no_database_url" };
  }
  try {
    await query("SELECT 1 AS ok");
    return { enabled: true, ok: true };
  } catch (err) {
    return {
      enabled: true,
      ok: false,
      reason: err instanceof Error ? err.message : "db_error",
    };
  }
}
