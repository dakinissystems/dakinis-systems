/**
 * Sincroniza packages/shared-brand (fuente) → landing y core vendoreados.
 * Uso desde raíz control repo: node scripts/sync-shared-brand.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const src = path.join(root, "packages", "shared-brand");

const targets = [
  path.join(root, "apps", "landing", "packages", "shared-brand"),
  path.join(root, "platform", "core", "packages", "shared-brand"),
  path.join(root, "finanzas", "packages", "shared-brand"),
];

function copyRecursive(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const name of fs.readdirSync(from)) {
    if (name === "node_modules" || name === ".git") continue;
    const a = path.join(from, name);
    const b = path.join(to, name);
    if (fs.statSync(a).isDirectory()) copyRecursive(a, b);
    else fs.copyFileSync(a, b);
  }
}

if (!fs.existsSync(src)) {
  console.error("No se encontró fuente:", src);
  process.exit(1);
}

let ok = 0;
for (const dest of targets) {
  if (!fs.existsSync(path.dirname(dest))) {
    console.warn("SKIP (no existe carpeta padre):", dest);
    continue;
  }
  copyRecursive(src, dest);
  console.log("OK:", dest);
  ok += 1;
}

if (ok === 0) {
  console.error("Ningún destino sincronizado. ¿Tienes apps/landing y platform/core clonados?");
  process.exit(1);
}

console.log(`Sincronizado shared-brand → ${ok} destino(s).`);
