/**
 * @dakinis/addon-sdk — register workspace addons in Dakinis Desktop Runtime.
 */
import { assertWorkspaceAddon, LIFECYCLE_HOOKS } from './workspace-addon.contract.js'

/**
 * @param {object} ctx — RuntimeContext: { navigate, api, locale, t, events, platform, windows, widgets, commands }
 * @param {import('./workspace-addon.contract.js').WorkspaceAddon} spec
 */
export function registerAddon(ctx, spec) {
  assertWorkspaceAddon(spec)
  const registered = {
    id: spec.id,
    version: spec.version,
    tier: spec.tier,
    permissions: spec.permissions,
    capabilities: spec.capabilities,
    widgets: spec.widgets,
    commands: spec.commands,
    windows: spec.windows,
    routes: spec.routes,
    settings: spec.settings ?? null,
    lifecycle: spec.lifecycle,
    dependencies: spec.dependencies ?? { required: [], optional: [], conflicts: [] },
    ctx,
  }

  for (const hook of LIFECYCLE_HOOKS) {
    const fn = spec.lifecycle[hook]
    if (typeof fn === 'function') {
      registered.lifecycle[hook] = () => fn(ctx)
    }
  }

  return registered
}

export function listRegisteredAddons(registry) {
  return Array.isArray(registry) ? registry : []
}

export function getAddonFromRegistry(registry, id) {
  return listRegisteredAddons(registry).find((a) => a.id === id) ?? null
}

export { assertWorkspaceAddon, isWorkspaceAddon, LIFECYCLE_HOOKS, PLATFORM_SERVICES, CAPABILITY_IDS } from './workspace-addon.contract.js'
export { assertAddonManifest, isAddonManifest } from './manifest.contract.js'
export {
  discoverAddonManifests,
  buildRouteMapFromManifests,
  parseManifestGlob,
} from './plugin-loader.js'
