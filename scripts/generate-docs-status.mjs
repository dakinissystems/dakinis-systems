#!/usr/bin/env node
/**
 * Genera fragmentos para STATUS.md desde el repo.
 * Uso: node scripts/generate-docs-status.mjs
 *
 * Futuro: Railway API, Supabase migration_history, CI React Doctor.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function readJson(rel) {
  const p = join(root, rel);
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, "utf8"));
}

async function probe(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    return res.ok ? "🟢" : "🟡";
  } catch {
    return "🔴";
  }
}

const scaffolds = [
  ["billing", "billing/package.json"],
  ["notifications", "notifications/package.json"],
  ["search", "search/package.json"],
  ["internal", "internal/package.json"],
];

console.log("# Generated platform snapshot\n");
console.log(`Generated: ${new Date().toISOString().slice(0, 10)}\n`);

console.log("## Scaffold versions\n");
console.log("| Service | version |");
console.log("|---------|---------|");
for (const [name, rel] of scaffolds) {
  const pkg = readJson(rel);
  console.log(`| ${name} | ${pkg?.version ?? "—"} |`);
}

console.log("\n## Health probes (public)\n");
const endpoints = [
  ["Gateway/Core health", "https://api.dakinissystems.com/core/api/health"],
  ["LifeFlow API", "https://finance-api.dakinissystems.com/health"],
  ["Tabletop API", "https://tabletop-api.dakinissystems.com/health"],
];

console.log("| Endpoint | Status |");
console.log("|----------|--------|");
for (const [label, url] of endpoints) {
  const status = await probe(url);
  console.log(`| ${label} | ${status} |`);
}

console.log("\n---\n");
console.log("Paste relevant rows into docs/STATUS.md");
console.log("Manual fields: MRR, clientes, piloto, último backup");
