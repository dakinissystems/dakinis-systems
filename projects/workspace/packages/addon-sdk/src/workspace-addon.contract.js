/**
 * @file workspace-addon.contract.js
 * Strict WorkspaceAddon contract for Dakinis Desktop Runtime.
 * @see projects/workspace/docs/DESKTOP-RUNTIME.md
 */

/**
 * @typedef {'auth'|'ai'|'storage'|'billing'|'search'|'knowledge'|'events'|'notifications'|'metrics'|'network'|'realtime'|'voice'|'git'|'redis'|'marketplace'} PlatformService
 */

/**
 * @typedef {'core'|'productivity'|'developer'|'stream'|'media'|'entertainment'|'system'} AddonTier
 */

/**
 * @typedef {Object} CapabilityRef
 * @property {string} id
 * @property {string} version
 */

/**
 * @typedef {Object} CommandDef
 * @property {string} id
 * @property {{ en: string; es: string }} title
 * @property {() => void|Promise<void>} run
 */

/**
 * @typedef {Object} AddonLifecycle
 * @property {(ctx: object) => void|Promise<void>} [onInstall]
 * @property {(ctx: object) => void|Promise<void>} [onEnable]
 * @property {(ctx: object) => void|Promise<void>} [onDisable]
 * @property {(ctx: object) => void|Promise<void>} [onStart]
 * @property {(ctx: object) => void|Promise<void>} [onStop]
 * @property {(ctx: object) => void|Promise<void>} [onWorkspaceLoaded]
 * @property {(ctx: object) => void|Promise<void>} [onWorkspaceClosed]
 */

/**
 * @typedef {Object} AddonDependencies
 * @property {string[]} [required]
 * @property {string[]} [optional]
 * @property {string[]} [conflicts]
 */

/**
 * @typedef {Object} WorkspaceAddon
 * @property {string} id
 * @property {string} version
 * @property {AddonTier} tier
 * @property {PlatformService[]} permissions
 * @property {CapabilityRef[]} capabilities
 * @property {Record<string, unknown>} widgets
 * @property {CommandDef[]} commands
 * @property {Record<string, unknown>} windows
 * @property {object[]} routes
 * @property {object} [settings]
 * @property {AddonLifecycle} lifecycle
 * @property {AddonDependencies} [dependencies]
 */

/** @type {readonly string[]} */
export const PLATFORM_SERVICES = Object.freeze([
  'auth', 'ai', 'storage', 'billing', 'search', 'knowledge', 'events',
  'notifications', 'metrics', 'network', 'realtime', 'voice', 'git', 'redis', 'marketplace',
])

/** @type {readonly string[]} */
export const CAPABILITY_IDS = Object.freeze([
  'window-manager', 'addon-sdk', 'widget-framework', 'command-palette', 'marketplace',
])

/** @type {readonly string[]} */
export const LIFECYCLE_HOOKS = Object.freeze([
  'onInstall', 'onEnable', 'onDisable', 'onStart', 'onStop', 'onWorkspaceLoaded', 'onWorkspaceClosed',
])

/**
 * @param {unknown} spec
 * @returns {spec is WorkspaceAddon}
 */
export function isWorkspaceAddon(spec) {
  if (!spec || typeof spec !== 'object') return false
  const a = /** @type {WorkspaceAddon} */ (spec)
  return (
    typeof a.id === 'string' &&
    typeof a.version === 'string' &&
    typeof a.tier === 'string' &&
    Array.isArray(a.permissions) &&
    Array.isArray(a.capabilities) &&
    a.widgets != null &&
    typeof a.widgets === 'object' &&
    Array.isArray(a.commands) &&
    a.windows != null &&
    typeof a.windows === 'object' &&
    Array.isArray(a.routes) &&
    a.lifecycle != null &&
    typeof a.lifecycle === 'object'
  )
}

/**
 * @param {WorkspaceAddon} spec
 */
export function assertWorkspaceAddon(spec) {
  if (!isWorkspaceAddon(spec)) {
    throw new Error('WorkspaceAddon contract violation')
  }
  for (const cap of spec.capabilities) {
    if (!cap?.id || !cap?.version) {
      throw new Error(`WorkspaceAddon ${spec.id}: invalid capability ref`)
    }
  }
}
