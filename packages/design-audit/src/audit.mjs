#!/usr/bin/env node
/**
 * Dakinis Design Inspector — valida CSS/JSX contra tokens DES.
 * Uso: node packages/design-audit/src/audit.mjs [paths...]
 * Exit 1 si hay violaciones (para CI).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DAKINIS_SURFACES, DAKINIS_AI_ACCENT, DAKINIS_PRODUCT_THEMES } from "../../shared-brand/src/colors.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../../..");

const ALLOWED_HEX = new Set([
  ...Object.values(DAKINIS_SURFACES),
  ...Object.values(DAKINIS_AI_ACCENT).filter((v) => typeof v === "string" && v.startsWith("#")),
  ...Object.values(DAKINIS_PRODUCT_THEMES).flatMap((t) =>
    Object.values(t).filter((v) => typeof v === "string" && v.startsWith("#"))
  ),
  "#2dd4bf", "#14b8a6", "#22d3ee", "#06b6d4", "#3dd6c6", "#2a9d8f",
  "#3b82f6", "#2563eb", "#7c3aed", "#6d28d9", "#a78bfa", "#a855f7",
  "#4a7c9e", "#5d94b8", "#c9a227", "#059669", "#047857",
  "#f4a261", "#e76f6f", "#52b788", "#f97316", "#f87171",
  "#0f1419", "#17344e", "#08111d", "#122840",
  "#9146FF", "#9146ff", "#1DA1F2", "#1da1f2", "#E4405F", "#e4405f", "#5865F2", "#5865f2",
  "#ffffff", "#fff", "#000000", "#000",
  "transparent",
]);

for (const h of [...ALLOWED_HEX]) {
  if (typeof h === "string" && h.startsWith("#")) ALLOWED_HEX.add(h.toLowerCase());
}

const ALLOWED_FONTS = ["inter", "jetbrains mono", "cinzel", "source sans", "system-ui", "arial", "sans-serif", "monospace"];

const DEFAULT_PATHS = [
  path.join(root, "packages/shared-brand/src/tokens.css"),
  path.join(root, "platform/core/web/styles.css"),
  path.join(root, "finanzas/web/src/styles/app.css"),
];

function normalizeHex(h) {
  return h.toLowerCase();
}

function collectFiles(target) {
  if (!fs.existsSync(target)) return [];
  const stat = fs.statSync(target);
  if (stat.isFile()) return [target];
  const out = [];
  for (const name of fs.readdirSync(target)) {
    if (name === "node_modules" || name === ".git") continue;
    const p = path.join(target, name);
    const s = fs.statSync(p);
    if (s.isDirectory()) out.push(...collectFiles(p));
    else if (/\.(css|jsx|tsx|js)$/i.test(name)) out.push(p);
  }
  return out;
}

function auditFile(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const rel = path.relative(root, filePath);
  const issues = [];

  const hexRe = /#([0-9a-fA-F]{3,8})\b/g;
  let m;
  while ((m = hexRe.exec(text)) !== null) {
    const raw = `#${m[1]}`;
    let hex = raw;
    if (m[1].length === 3) {
      hex = `#${m[1].split("").map((c) => c + c).join("")}`;
    }
    hex = normalizeHex(hex);
    if (!ALLOWED_HEX.has(hex) && !ALLOWED_HEX.has(raw.toLowerCase())) {
      issues.push({ type: "color", message: `Color no autorizado: ${raw}`, file: rel });
    }
  }

  const fontRe = /font-family:\s*([^;{}]+)/gi;
  while ((m = fontRe.exec(text)) !== null) {
    const families = m[1].split(",").map((f) => f.replace(/['"]/g, "").trim().toLowerCase());
    for (const f of families) {
      if (!f) continue;
      const ok = ALLOWED_FONTS.some((allowed) => f.includes(allowed));
      if (!ok && !f.startsWith("var(")) {
        issues.push({ type: "font", message: `Tipografía no autorizada: ${f}`, file: rel });
      }
    }
  }

  if (/dm sans/i.test(text) && !rel.includes("DND")) {
    issues.push({ type: "font", message: "DM Sans deprecado — usar Inter", file: rel });
  }

  return issues;
}

const args = process.argv.slice(2);
const targets = args.length ? args.map((p) => path.resolve(process.cwd(), p)) : DEFAULT_PATHS;

let allIssues = [];
for (const t of targets) {
  for (const f of collectFiles(t)) {
    allIssues.push(...auditFile(f));
  }
}

const unique = [];
const seen = new Set();
for (const i of allIssues) {
  const k = `${i.file}:${i.message}`;
  if (seen.has(k)) continue;
  seen.add(k);
  unique.push(i);
}

if (unique.length === 0) {
  console.log("✓ Design audit OK — tokens y tipografía coherentes.");
  process.exit(0);
}

console.error(`✗ Design audit: ${unique.length} issue(s)\n`);
for (const i of unique.slice(0, 50)) {
  console.error(`  [${i.type}] ${i.file}: ${i.message}`);
}
if (unique.length > 50) console.error(`  … y ${unique.length - 50} más`);
process.exit(1);
