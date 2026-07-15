import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

/**
 * Discover addon manifests from a modules directory (Node / prebuild).
 * Each subfolder may contain manifest.json.
 *
 * @param {string} modulesDir absolute path to src/modules
 * @returns {Array<{ id: string; folder: string; manifest: object; manifestPath: string }>}
 */
export function discoverAddonManifests(modulesDir) {
  const entries = [];
  let dirs;
  try {
    dirs = readdirSync(modulesDir);
  } catch {
    return entries;
  }

  for (const name of dirs) {
    const folder = path.join(modulesDir, name);
    if (!statSync(folder).isDirectory()) continue;
    const manifestPath = path.join(folder, "manifest.json");
    try {
      const raw = readFileSync(manifestPath, "utf8");
      const manifest = JSON.parse(raw);
      entries.push({
        id: manifest.id || name,
        folder: name,
        manifest,
        manifestPath,
      });
    } catch {
      /* skip folders without manifest */
    }
  }

  return entries.sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Build route map from discovered manifests.
 * @param {ReturnType<typeof discoverAddonManifests>} discovered
 */
export function buildRouteMapFromManifests(discovered) {
  /** @type {Record<string, string>} */
  const routes = {};
  for (const item of discovered) {
    if (item.manifest.route) {
      routes[item.id] = item.manifest.route;
    }
  }
  return routes;
}

/**
 * Vite/browser: discover manifests via import.meta.glob (call from Client code).
 * @param {Record<string, { default?: object } | object>} manifestGlob
 */
export function parseManifestGlob(manifestGlob) {
  const items = [];
  for (const [filePath, mod] of Object.entries(manifestGlob)) {
    const manifest = mod?.default ?? mod;
    const match = filePath.match(/\/modules\/([^/]+)\/manifest\.json$/);
    const folder = match?.[1] || manifest?.id;
    if (!manifest?.id) continue;
    items.push({ id: manifest.id, folder, manifest, manifestPath: filePath });
  }
  return items.sort((a, b) => a.id.localeCompare(b.id));
}
