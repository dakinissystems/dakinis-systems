#!/usr/bin/env node
/**
 * Generates addon folder trees from catalog/workspace-addons.json
 * Run: node projects/workspace/scripts/scaffold-addons.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const catalogPath = path.join(root, "catalog", "workspace-addons.json");
const depsPath = path.join(root, "catalog", "addon-dependencies.json");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const depsCatalog = JSON.parse(fs.readFileSync(depsPath, "utf8"));

function depsFor(addonId) {
  const row = depsCatalog.matrix?.[addonId];
  if (!row) return { required: [], optional: [], conflicts: [] };
  const a = row.addons;
  if (a && typeof a === "object" && !Array.isArray(a)) return a;
  return { required: Array.isArray(a) ? a : [], optional: [], conflicts: [] };
}

function capabilitiesFor(addonId) {
  const row = depsCatalog.matrix?.[addonId];
  if (!row?.capabilities) return [{ id: "addon-sdk", version: "1" }];
  return row.capabilities.map((c) =>
    typeof c === "string" ? { id: c, version: "1" } : c
  );
}

const ADDON_DIRS = [
  "src/index.jsx",
  "src/manifest.json",
  "src/routes/.gitkeep",
  "src/windows/.gitkeep",
  "src/services/.gitkeep",
  "src/hooks/.gitkeep",
  "src/components/.gitkeep",
  "src/api/.gitkeep",
  "src/widgets/.gitkeep",
  "src/styles/.gitkeep",
  "src/assets/.gitkeep",
  "README.md",
];

function manifestFor(addon) {
  return {
    id: addon.id,
    name: addon.i18n.name.en,
    version: "0.1.0",
    icon: addon.icon,
    tier: addon.tier,
    category: addon.category,
    phase: addon.phase,
    admission: addon.admission || [],
    permissions: addon.permissions || [],
    capabilities: capabilitiesFor(addon.id),
    dependencies: depsFor(addon.id),
    windows: addon.windows || [],
    i18n: addon.i18n,
  };
}

function readmeFor(addon) {
  const en = addon.i18n.description.en;
  const es = addon.i18n.description.es;
  const wins = (addon.windows || []).map((w) => `- \`${w}\``).join("\n");
  return `# ${addon.i18n.name.en} / ${addon.i18n.name.es}

> **Tier:** \`${addon.tier}\` · **Phase:** \`${addon.phase}\` · **Category:** \`${addon.category}\`

${en}

${es}

## Windows

${wins || "_TBD_"}

## Structure

Same layout as every Dakinis Workspace addon — see [\`../docs/ADDON-SDK.md\`](../docs/ADDON-SDK.md).
`;
}

function indexStub(addon) {
  return `/**
 * ${addon.i18n.name.en} — Dakinis Workspace addon entry.
 * Register with @dakinis/addon-sdk when the shell is wired.
 */
export { default as manifest } from './manifest.json';

export function registerAddon(_ctx) {
  // TODO: register windows, widgets and routes
}
`;
}

for (const addon of catalog.addons) {
  const base = path.join(root, "addons", addon.id);
  for (const rel of ADDON_DIRS) {
    const full = path.join(base, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    if (rel.endsWith(".gitkeep")) {
      if (!fs.existsSync(full)) fs.writeFileSync(full, "");
      continue;
    }
    if (rel === "src/manifest.json") {
      fs.writeFileSync(full, `${JSON.stringify(manifestFor(addon), null, 2)}\n`);
    } else if (rel === "README.md") {
      fs.writeFileSync(full, readmeFor(addon));
    } else if (rel === "src/index.jsx") {
      fs.writeFileSync(full, indexStub(addon));
    }
  }
}

const desktopDirs = [
  "desktop/launcher/README.md",
  "desktop/dock/README.md",
  "desktop/activity-center/README.md",
  "desktop/command-palette/README.md",
  "desktop/notification-center/README.md",
  "desktop/desktop-shell/README.md",
];

for (const rel of desktopDirs) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  if (!fs.existsSync(full)) {
    fs.writeFileSync(full, `# ${path.basename(path.dirname(full))}\n\nShell component — see \`docs/ARCHITECTURE.md\`.\n`);
  }
}

const pkgDirs = [
  "packages/window-manager/src/FloatingWindow.jsx",
  "packages/window-manager/src/WindowProvider.jsx",
  "packages/window-manager/src/WindowRegistry.js",
  "packages/window-manager/README.md",
  "packages/addon-sdk/README.md",
  "packages/ui/README.md",
  "packages/widgets/README.md",
  "packages/shared-hooks/README.md",
  "packages/layouts/README.md",
  "packages/animations/README.md",
];

for (const rel of pkgDirs) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  if (!fs.existsSync(full)) {
    fs.writeFileSync(full, `// ${path.basename(full)} — scaffold\n`);
  }
}

const svcDirs = [
  "services/desktop-api/README.md",
  "services/sync/README.md",
  "services/storage/README.md",
  "services/plugins/README.md",
];

for (const rel of svcDirs) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  if (!fs.existsSync(full)) fs.writeFileSync(full, `# ${path.basename(path.dirname(full))}\n`);
}

console.log(`Scaffolded ${catalog.addons.length} addons under projects/workspace/addons/`);
