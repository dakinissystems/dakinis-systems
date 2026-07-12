#!/usr/bin/env node
/**
 * Run one or more SQL files against Postgres (Supabase).
 * Loads DATABASE_URL from env or --env-file (values only, never logged).
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "internal", "package.json"),
);
const { Pool } = require("pg");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

function parseArgs(argv) {
  const files = [];
  let envFile = null;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--env-file") {
      envFile = argv[++i];
    } else if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    } else {
      files.push(arg);
    }
  }
  return { files, envFile };
}

function sslFromUrl(url) {
  try {
    const parsed = new URL(url.replace(/^postgresql:/, "http:"));
    const host = (parsed.hostname || "").toLowerCase();
    if (host === "localhost" || host === "127.0.0.1") return undefined;
    const sslmode = parsed.searchParams.get("sslmode");
    if (sslmode === "disable") return undefined;
    if (host.includes("supabase.com") || parsed.port === "6543" || parsed.port === "5432") {
      return { rejectUnauthorized: false };
    }
  } catch {
    /* ignore */
  }
  return process.env.DATABASE_SSL === "true"
    ? { rejectUnauthorized: false }
    : undefined;
}

async function runFile(client, filePath) {
  const sql = fs.readFileSync(filePath, "utf8");
  console.log(`>> ${path.basename(filePath)}`);
  const result = await client.query(sql);
  const rows = Array.isArray(result)
    ? result.flatMap((r) => r.rows ?? [])
    : (result.rows ?? []);
  if (rows.length > 0) {
    console.table(rows);
  } else {
    console.log("   OK");
  }
}

async function main() {
  const { files, envFile } = parseArgs(process.argv.slice(2));
  if (envFile) loadEnvFile(path.resolve(envFile));
  if (files.length === 0) {
    console.error("Usage: node run-supabase-sql-files.mjs [--env-file path] file.sql ...");
    process.exit(1);
  }

  const databaseUrl = process.env.DATABASE_URL || process.env.PLATFORM_DATABASE_URL;
  if (!databaseUrl) {
    console.error("ERROR: DATABASE_URL or PLATFORM_DATABASE_URL required.");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: sslFromUrl(databaseUrl),
    max: 1,
    connectionTimeoutMillis: 15000,
  });

  const client = await pool.connect();
  try {
    for (const file of files) {
      await runFile(client, path.resolve(file));
    }
    console.log("Done.");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("FAILED:", err.message || err);
  if (err.code) console.error("code:", err.code);
  if (err.detail) console.error("detail:", err.detail);
  process.exit(1);
});
