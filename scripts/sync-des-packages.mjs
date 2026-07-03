/**
 * Sincroniza paquetes DES (shared-brand, shared-layouts) a clones vendoreados.
 * Uso: node scripts/sync-des-packages.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const packagesRoot = path.join(root, "packages");

const packageNames = ["shared-brand", "shared-layouts"];

const cloneRoots = [
  path.join(root, "apps", "landing", "packages"),
  path.join(root, "platform", "core", "packages"),
  path.join(root, "finanzas", "packages"),
  path.join(root, "hub", "packages"),
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

let ok = 0;
for (const pkg of packageNames) {
  const src = path.join(packagesRoot, pkg);
  if (!fs.existsSync(src)) {
    console.warn("SKIP (no fuente):", src);
    continue;
  }
  for (const destRoot of cloneRoots) {
    if (!fs.existsSync(path.dirname(destRoot))) {
      console.warn("SKIP (sin clone):", destRoot);
      continue;
    }
    const dest = path.join(destRoot, pkg);
    copyRecursive(src, dest);
    console.log("OK:", dest);
    ok += 1;
  }
}

if (ok === 0) {
  console.error("Ningún destino sincronizado. ¿Tienes clones en apps/, platform/, finanzas/ o hub/?");
  process.exit(1);
}

console.log(`\nListo — ${ok} destino(s).`);
