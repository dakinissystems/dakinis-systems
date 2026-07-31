/**
 * Sync design-system packages into app vendors.
 * Canonical: shared-foundation, shared-theme, shared-brand (facade + catalog).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const packagesRoot = path.join(root, "packages");

const PACKAGE_NAMES = [
  "shared-foundation",
  "shared-theme",
  "shared-brand",
  "shared-layouts",
  "shared-ux",
];

const appRoots = [
  path.join(root, "apps", "landing"),
  path.join(root, "platform", "core"),
  path.join(root, "finanzas"),
  path.join(root, "hub"),
  path.join(root, "apps", "akoenet", "Client"),
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

/** Refresh brand-local CSS mirrors from foundation/theme (self-contained tokens.css). */
function mirrorCssIntoBrand() {
  const brand = path.join(packagesRoot, "shared-brand", "src");
  const foundation = path.join(packagesRoot, "shared-foundation", "src");
  const theme = path.join(packagesRoot, "shared-theme", "src");
  fs.mkdirSync(path.join(brand, "foundation"), { recursive: true });
  fs.mkdirSync(path.join(brand, "semantic"), { recursive: true });
  fs.mkdirSync(path.join(brand, "products"), { recursive: true });
  fs.copyFileSync(
    path.join(foundation, "foundation", "tokens-base.css"),
    path.join(brand, "foundation", "tokens-base.css")
  );
  for (const f of fs.readdirSync(path.join(theme, "semantic"))) {
    fs.copyFileSync(path.join(theme, "semantic", f), path.join(brand, "semantic", f));
  }
  for (const f of fs.readdirSync(path.join(theme, "products"))) {
    fs.copyFileSync(path.join(theme, "products", f), path.join(brand, "products", f));
  }
  console.log("OK: mirrored foundation/theme CSS → shared-brand");
}

mirrorCssIntoBrand();

let ok = 0;
for (const appRoot of appRoots) {
  if (!fs.existsSync(appRoot)) {
    console.warn("SKIP (no app):", appRoot);
    continue;
  }
  const destPackages = path.join(appRoot, "packages");
  for (const name of PACKAGE_NAMES) {
    const src = path.join(packagesRoot, name);
    const dest = path.join(destPackages, name);
    if (!fs.existsSync(src)) {
      console.warn("SKIP missing source:", src);
      continue;
    }
    copyRecursive(src, dest);
    console.log("OK:", dest);
    ok += 1;
  }
}

if (ok === 0) {
  console.error("Ningún destino sincronizado.");
  process.exit(1);
}
console.log(`Sincronizados ${ok} package-destinos (foundation + theme + brand + layouts + ux).`);
