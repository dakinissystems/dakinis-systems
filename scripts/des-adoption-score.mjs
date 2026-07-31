/**
 * Objective DES adoption score per product UI.
 *
 * Scoring (max 100):
 *   +30 uses Foundation/Theme tokens.css (or brand tokens entry)
 *   +20 uses AppShell / dakinis-shell
 *   +20 uses DES components (shared-ux Button/Card/Dialog or .dakinis-*)
 *   +10 no product-local :root hex palette (or aliases only to var(--dakinis-*))
 *   +20 uses shared theme engine / data-theme|data-product
 *
 * Usage: node scripts/des-adoption-score.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** @type {{ id: string; label: string; paths: string[]; checks: Record<string, (ctx: Ctx) => boolean> }} */
const PRODUCTS = [
  {
    id: "hub",
    label: "Hub",
    paths: ["hub/src", "hub/web/src"],
    checks: {
      tokens: (c) => c.has(/tokens\.css|shared-foundation|@brand\/tokens/),
      shell: (c) => c.has(/AppShell|dakinis-shell|hub-shell/),
      components: (c) => c.has(/shared-ux|dakinis-btn|dakinis-card|DashboardCard/),
      noLocalHexRoot: (c) => !c.has(/:root\s*\{[^}]*#[0-9a-fA-F]{3,8}/) || c.has(/var\(--dakinis-/),
      themeEngine: (c) => c.has(/applyDesTheme|data-product|theme-engine|applyDesColorMode/),
    },
  },
  {
    id: "core",
    label: "Dakinis One (Core)",
    paths: ["platform/core/web"],
    checks: {
      tokens: (c) => c.has(/tokens\.css|shared-foundation/),
      shell: (c) => c.has(/AppShell|dakinis-shell/),
      components: (c) => c.has(/shared-ux|dakinis-btn|dakinis-card/),
      noLocalHexRoot: (c) => c.has(/--bg:\s*var\(--dakinis-/) && !c.has(/--brand:\s*#/),
      themeEngine: (c) => c.has(/applyDesTheme|applyDesColorMode|bootstrapDesAppearance|data-product/),
    },
  },
  {
    id: "lifeflow",
    label: "LifeFlow",
    paths: ["finanzas/web/src"],
    checks: {
      tokens: (c) => c.has(/tokens\.css|shared-foundation/),
      shell: (c) => c.has(/AppShell|dakinis-shell|app-shell/),
      components: (c) => c.has(/shared-ux|dakinis-btn|dakinis-card/),
      noLocalHexRoot: (c) => c.has(/--accent:\s*var\(--dakinis-/),
      themeEngine: (c) =>
        c.has(/bootstrapDesAppearance|applyDesColorMode|applyDesTheme/) &&
        c.has(/product=["']lifeflow|data-product=["']lifeflow/),
    },
  },
  {
    id: "landing",
    label: "Landing",
    paths: ["apps/landing/src"],
    checks: {
      tokens: (c) => c.has(/tokens\.css|shared-brand\/tokens/),
      shell: (c) => c.has(/AppShell|dakinis-shell|CorporateShell/),
      components: (c) => c.has(/dakinis-|shared-ux/),
      noLocalHexRoot: (c) => c.has(/var\(--dakinis-surface-0/) || !c.has(/background:\s*#0[bB]0[bB]0[fF]/),
      themeEngine: (c) => c.has(/applyDesTheme|applyDesColorMode|bootstrapDesAppearance|data-product/),
    },
  },
  {
    id: "akoenet",
    label: "AkoeNet",
    paths: ["apps/akoenet/Client/src"],
    checks: {
      tokens: (c) => c.has(/tokens\.css|shared-foundation|dakinis-surface/),
      shell: (c) => c.has(/AppShell|dakinis-shell/),
      components: (c) => c.has(/shared-ux|dakinis-btn/),
      noLocalHexRoot: (c) => c.has(/desThemeBridge|data-theme/),
      themeEngine: (c) => c.has(/desThemeBridge|applyDesColorMode|themePreferences/),
    },
  },
  {
    id: "streamautomator",
    label: "StreamAutomator",
    paths: ["apps/streamautomator/apps/web/src", "apps/streamautomator/apps/web/tailwind.config.js"],
    checks: {
      tokens: (c) => c.has(/dakinis-|tailwind-preset|shared-theme|shared-foundation/),
      shell: (c) => c.has(/AppShell|dakinis-shell/),
      components: (c) => c.has(/shared-ux|dakinis-btn/),
      noLocalHexRoot: (c) => c.has(/--dakinis-radius|--dakinis-font-sans/),
      themeEngine: (c) => c.has(/data-product=["']streamautomator|applyDesTheme|bootstrapDesAppearance/),
    },
  },
];

const WEIGHTS = {
  tokens: 30,
  shell: 20,
  components: 20,
  noLocalHexRoot: 10,
  themeEngine: 20,
};

/**
 * @typedef {{ text: string; has: (re: RegExp) => boolean }} Ctx
 */

function collectText(relPaths) {
  const chunks = [];
  for (const rel of relPaths) {
    const abs = path.join(root, rel);
    if (!fs.existsSync(abs)) continue;
    const st = fs.statSync(abs);
    if (st.isFile()) {
      chunks.push(fs.readFileSync(abs, "utf8"));
      continue;
    }
    walk(abs, chunks);
  }
  return chunks.join("\n");
}

function walk(dir, chunks, depth = 0) {
  if (depth > 6) return;
  for (const name of fs.readdirSync(dir)) {
    if (name === "node_modules" || name === "dist" || name === "build") continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, chunks, depth + 1);
    else if (/\.(jsx?|tsx?|css|mjs|cjs)$/i.test(name)) {
      try {
        chunks.push(fs.readFileSync(p, "utf8"));
      } catch {
        /* ignore */
      }
    }
  }
}

function scoreProduct(product) {
  const text = collectText(product.paths);
  const ctx = {
    text,
    has: (re) => re.test(text),
  };
  /** @type {Record<string, boolean>} */
  const detail = {};
  let total = 0;
  for (const [key, weight] of Object.entries(WEIGHTS)) {
    const ok = product.checks[key](ctx);
    detail[key] = ok;
    if (ok) total += weight;
  }
  return { id: product.id, label: product.label, score: total, detail };
}

const results = PRODUCTS.map(scoreProduct);
console.log("DES adoption (objective) — DES v1.1\n");
console.log(
  "Product".padEnd(28) +
    "Score".padEnd(8) +
    "Tok30 Shell20 Comp20 Hex10 Theme20"
);
console.log("-".repeat(72));
for (const r of results) {
  const flags = ["tokens", "shell", "components", "noLocalHexRoot", "themeEngine"]
    .map((k) => (r.detail[k] ? "✓" : "·"))
    .join("     ");
  console.log(`${r.label.padEnd(28)}${String(r.score).padEnd(8)}${flags}`);
}
console.log("\nWeights: tokens +30 · AppShell +20 · DES components +20 · no local hex root +10 · theme engine +20");

const outPath = path.join(root, "docs", "des-adoption-latest.json");
fs.writeFileSync(
  outPath,
  JSON.stringify(
    {
      desVersion: "1.1.0",
      generatedAt: new Date().toISOString(),
      weights: WEIGHTS,
      results,
    },
    null,
    2
  )
);
console.log(`\nWrote ${outPath}`);
