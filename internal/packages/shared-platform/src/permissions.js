/** Permission keys — capability-style, not role-only. */

export const PERMISSIONS = {
  workspaceAddonInstall: "workspace:addon.install",
  workspaceAddonRemove: "workspace:addon.remove",
  workspaceAddonConfigure: "workspace:addon.configure",
  billingUpdate: "billing:update",
  billingView: "billing:view",
  streamPublish: "stream:publish",
  streamDelete: "stream:delete",
  streamDirectorStart: "stream:director.start",
  crmEdit: "crm:edit",
  crmView: "crm:view",
  platformAdmin: "platform:admin",
};

/**
 * @param {string[]} granted
 * @param {string} permission
 */
export function hasPermission(granted, permission) {
  if (!Array.isArray(granted)) return false;
  if (granted.includes(PERMISSIONS.platformAdmin)) return true;
  return granted.includes(permission);
}

/**
 * @param {string[]} granted
 * @param {string[]} required
 */
export function hasAllPermissions(granted, required) {
  return required.every((p) => hasPermission(granted, p));
}
