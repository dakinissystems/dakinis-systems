/**
 * Build-time manifest for live AkoeNet workspace addons.
 * Lighter than runtime WorkspaceAddon — no lifecycle/commands.
 */

/**
 * @typedef {Object} AddonManifest
 * @property {string} id
 * @property {string} version
 * @property {string} [tier]
 * @property {string} [route]
 * @property {{ id: string; version: string }[]} capabilities
 * @property {string[]} permissions
 * @property {string[]} windows
 * @property {boolean} [syncData]
 */

/**
 * @param {unknown} manifest
 * @returns {manifest is AddonManifest}
 */
export function isAddonManifest(manifest) {
  if (!manifest || typeof manifest !== "object") return false;
  const m = /** @type {AddonManifest} */ (manifest);
  return (
    typeof m.id === "string" &&
    typeof m.version === "string" &&
    Array.isArray(m.capabilities) &&
    Array.isArray(m.permissions) &&
    Array.isArray(m.windows)
  );
}

/**
 * @param {AddonManifest} manifest
 * @param {{ permissions?: string[]; tier?: string }} [catalogEntry]
 * @param {string[]} [registryWindowIds]
 */
export function assertAddonManifest(manifest, catalogEntry, registryWindowIds) {
  if (!isAddonManifest(manifest)) {
    throw new Error(`Invalid manifest for addon: ${manifest?.id || "unknown"}`);
  }
  if (!/^\d+\.\d+\.\d+/.test(manifest.version)) {
    throw new Error(`${manifest.id}: version must be semver (x.y.z)`);
  }
  for (const cap of manifest.capabilities) {
    if (!cap?.id || !cap?.version) {
      throw new Error(`${manifest.id}: invalid capability ref`);
    }
  }
  if (catalogEntry?.permissions?.length) {
    for (const perm of manifest.permissions) {
      if (!catalogEntry.permissions.includes(perm)) {
        throw new Error(`${manifest.id}: permission "${perm}" not in catalog`);
      }
    }
  }
  if (registryWindowIds?.length) {
    const missing = registryWindowIds.filter((id) => !manifest.windows.includes(id));
    if (missing.length > 0) {
      throw new Error(
        `${manifest.id}: manifest missing window ids from registry: ${missing.join(", ")}`,
      );
    }
    const extra = manifest.windows.filter((id) => !registryWindowIds.includes(id));
    if (extra.length > 0) {
      throw new Error(
        `${manifest.id}: manifest has unknown window ids: ${extra.join(", ")}`,
      );
    }
  }
}
