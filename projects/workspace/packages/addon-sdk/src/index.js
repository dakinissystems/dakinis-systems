/**
 * @dakinis/addon-sdk — register workspace addons in Dakinis Desktop / AkoeNet shell.
 */

/**
 * @param {object} ctx — { navigate, api, locale, t }
 * @param {{ manifest: object; windows?: Record<string, unknown>; widgets?: Record<string, unknown>; routes?: object[] }} spec
 */
export function registerAddon(ctx, spec) {
  const { manifest, windows = {}, widgets = {}, routes = [] } = spec
  if (!manifest?.id) throw new Error('registerAddon: manifest.id required')
  return {
    id: manifest.id,
    manifest,
    windows,
    widgets,
    routes,
    ctx,
  }
}

export function listRegisteredAddons(registry) {
  return Array.isArray(registry) ? registry : []
}

export function getAddonFromRegistry(registry, id) {
  return listRegisteredAddons(registry).find((a) => a.id === id) ?? null
}
