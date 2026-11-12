import pg from "pg";
import { config } from "./config.js";

const { Pool } = pg;

/** @type {pg.Pool | null} */
let pool = null;

export function getPool() {
  if (!config.databaseUrl) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: config.databaseUrl,
      ssl: config.databaseSsl ? { rejectUnauthorized: false } : undefined,
      max: Number(process.env.DATABASE_POOL_MAX) || 10,
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
  return p.query(text, params);
}

function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error("timeout")), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export async function checkDbHealth(timeoutMs = 800) {
  try {
    const p = getPool();
    if (!p) return { ok: false, reason: "not_configured" };
    await withTimeout(p.query("SELECT 1"), timeoutMs);
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : "db_error" };
  }
}
