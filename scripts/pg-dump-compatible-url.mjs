#!/usr/bin/env node
import { dumpCompatibleUrl, summarizeDatabaseUrl } from "./lib/pg-dump-url.mjs";

const raw = String(process.env.BACKUP_DATABASE_URL || process.env.DATABASE_URL || "").trim();
if (!raw) {
  console.error("DATABASE_URL / BACKUP_DATABASE_URL required");
  process.exit(1);
}
const rewritten = dumpCompatibleUrl(raw);
if (process.argv.includes("--summary")) {
  console.log(JSON.stringify(summarizeDatabaseUrl(rewritten)));
} else {
  process.stdout.write(rewritten);
}
