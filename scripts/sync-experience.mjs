/**
 * Sincroniza paquetes DES → repos producto (shared-ux, shared-loading, shared-illustrations).
 * Uso: node scripts/sync-experience.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const packages = ["shared-ux", "shared-loading", "shared-illustrations", "shared-icons"];

const targets = [
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
for (const pkg of packages) {
  const src = path.join(root, "packages", pkg);
  if (!fs.existsSync(src)) {
    console.warn("SKIP fuente:", src);
    continue;
  }
  for (const destRoot of targets) {
    if (!fs.existsSync(path.dirname(destRoot))) {
      console.warn("SKIP destino padre:", destRoot);
      continue;
    }
    fs.mkdirSync(destRoot, { recursive: true });
    const dest = path.join(destRoot, pkg);
    copyRecursive(src, dest);
    console.log("OK:", dest);
    ok += 1;
  }
}

if (ok === 0) {
  console.error("Ningún paquete DES sincronizado.");
  process.exit(1);
}
console.log(`Sincronizado DES → ${ok} destino(s).`);
