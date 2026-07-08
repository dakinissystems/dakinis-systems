/**
 * Permissions Engine — RBAC por servidor AkoeNet.
 * Integra con akoenet.roles / role_permissions en AkoeNet Server.
 */

/** @typedef {{ resource: string; action: string; scope?: string }} Permission */

const MODERATION_ACTIONS = new Set([
  "moderation.ban",
  "moderation.kick",
  "moderation.mute",
  "moderation.timeout",
  "moderation.warn",
  "moderation.purge",
  "moderation.lock",
  "moderation.slowmode",
]);

const ADMIN_ACTIONS = new Set(["automation.flow", "knowledge.add", "support.ticket"]);

/**
 * @param {string} action
 */
export function permissionForAction(action) {
  if (MODERATION_ACTIONS.has(action)) {
    return { resource: "server", action: "moderate", scope: "server" };
  }
  if (action.startsWith("ai.")) {
    return { resource: "ai", action: "use", scope: "server" };
  }
  if (ADMIN_ACTIONS.has(action) || action.startsWith("business.")) {
    return { resource: "server", action: "manage", scope: "server" };
  }
  return { resource: "server", action: "read", scope: "server" };
}

export class PermissionsEngine {
  /**
   * @param {{ isSuperAdmin?: (userId: string) => Promise<boolean>; isServerOwner?: (userId: string, serverId: string) => Promise<boolean>; getUserPermissions?: (userId: string, serverId: string) => Promise<Permission[]> }} adapters
   */
  constructor(adapters = {}) {
    this.isSuperAdmin = adapters.isSuperAdmin ?? (async () => false);
    this.isServerOwner = adapters.isServerOwner ?? (async () => false);
    this.getUserPermissions = adapters.getUserPermissions ?? (async () => []);
  }

  /**
   * @param {string} userId
   * @param {string|number} serverId
   * @param {string} action
   */
  async canExecute(userId, serverId, action) {
    if (!userId) return false;
    if (await this.isSuperAdmin(userId)) return true;
    if (await this.isServerOwner(userId, String(serverId))) return true;

    const required = permissionForAction(action);
    const perms = await this.getUserPermissions(userId, String(serverId));

    return perms.some(
      (p) =>
        (p.resource === required.resource || p.resource === "*") &&
        (p.action === required.action || p.action === "*")
    );
  }
}
