/** Permission keys — capability-style, not role-only. */

export const PERMISSIONS = {
  // Workspace
  workspaceAddonInstall: "workspace:addon.install",
  workspaceAddonRemove: "workspace:addon.remove",
  workspaceAddonConfigure: "workspace:addon.configure",
  // Billing
  billingUpdate: "billing:update",
  billingView: "billing:view",
  billingInvoiceRead: "billing.invoice.read",
  billingInvoiceManage: "billing.invoice.manage",
  // Stream
  streamPublish: "stream:publish",
  streamDelete: "stream:delete",
  streamDirectorStart: "stream:director.start",
  // CRM
  crmView: "crm:view",
  crmEdit: "crm:edit",
  crmContactRead: "crm.contact.read",
  crmContactWrite: "crm.contact.write",
  // Inventory
  inventoryProductRead: "inventory.product.read",
  inventoryProductWrite: "inventory.product.write",
  // Sales
  salesOrderRead: "sales.order.read",
  salesOrderCreate: "sales.order.create",
  // Hospitality
  hospitalityTableRead: "hospitality.table.read",
  hospitalityTableManage: "hospitality.table.manage",
  hospitalityOrderCreate: "hospitality.order.create",
  // Platform
  platformAdmin: "platform:admin",
  wildcard: "*",
};

/**
 * @param {string[]} granted
 * @param {string} permission
 */
export function hasPermission(granted, permission) {
  if (!Array.isArray(granted)) return false;
  if (granted.includes(PERMISSIONS.platformAdmin) || granted.includes(PERMISSIONS.wildcard)) {
    return true;
  }
  if (granted.includes(permission)) return true;
  // namespace:*  e.g. billing:*
  const colon = permission.indexOf(":");
  if (colon > 0) {
    const ns = permission.slice(0, colon);
    if (granted.includes(`${ns}:*`)) return true;
  }
  // capability.*  e.g. inventory.*
  const dot = permission.indexOf(".");
  if (dot > 0) {
    const cap = permission.slice(0, dot);
    if (granted.includes(`${cap}.*`)) return true;
  }
  return false;
}

/**
 * @param {string[]} granted
 * @param {string[]} required
 */
export function hasAllPermissions(granted, required) {
  return required.every((p) => hasPermission(granted, p));
}

/**
 * Role → default permission presets (starting point for SaaS RBAC).
 */
export const ROLE_PRESETS = {
  owner: [PERMISSIONS.wildcard],
  manager: [
    "inventory.*",
    "sales.*",
    "hospitality.*",
    "crm.*",
    PERMISSIONS.billingView,
  ],
  waiter: [
    PERMISSIONS.hospitalityTableRead,
    PERMISSIONS.hospitalityOrderCreate,
  ],
  member: [PERMISSIONS.crmView, PERMISSIONS.billingView],
};
