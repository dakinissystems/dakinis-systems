#!/usr/bin/env node
/**
 * Copy canonical Gitleaks workflow (+ optional config/pre-commit) into product repos.
 * Run from dakinis-systems root: node scripts/sync-gitleaks-workflow.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workflowSrc = path.join(root, ".github/workflows/gitleaks.yml");
const configSrc = path.join(root, ".gitleaks.toml");
const preCommitSrc = path.join(root, ".pre-commit-config.yaml");

/** Local checkouts that map to GitHub remotes (own .git). */
const targets = [
  { dir: ".", label: "dakinis-systems" },
  { dir: "platform/core", label: "dakinis-core" },
  { dir: "platform/auth", label: "dakinis-auth" },
  { dir: "apps/streamautomator", label: "dakinis-streamautomator" },
  { dir: "apps/akoenet/Server", label: "akoenet-backend" },
  { dir: "apps/akoenet/Client", label: "akoenet-client" },
  { dir: "billing", label: "dakinis-billing" },
  { dir: "internal", label: "dakinis-internal-api" },
  { dir: "hub", label: "dakinis-hub" },
];

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

const wf = fs.readFileSync(workflowSrc, "utf8");
let n = 0;
for (const t of targets) {
  const base = path.join(root, t.dir);
  if (!fs.existsSync(base)) {
    console.warn(`[skip] missing ${t.label} (${t.dir})`);
    continue;
  }
  const wfDest = path.join(base, ".github/workflows/gitleaks.yml");
  if (path.resolve(wfDest) !== path.resolve(workflowSrc)) {
    copyFile(workflowSrc, wfDest);
  }
  copyFile(configSrc, path.join(base, ".gitleaks.toml"));
  copyFile(preCommitSrc, path.join(base, ".pre-commit-config.yaml"));
  console.log(`OK: ${t.label}`);
  n += 1;
}

fs.mkdirSync(path.join(root, "docs/templates"), { recursive: true });
fs.writeFileSync(path.join(root, "docs/templates/gitleaks.yml"), wf);
fs.copyFileSync(configSrc, path.join(root, "docs/templates/gitleaks.toml"));
fs.copyFileSync(preCommitSrc, path.join(root, "docs/templates/pre-commit-config.gitleaks.yaml"));
console.log(`[sync-gitleaks] Done — ${n} target(s). Template → docs/templates/`);
