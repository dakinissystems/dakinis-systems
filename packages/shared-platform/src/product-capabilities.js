/**
 * Product / domain capabilities for multi-tenant feature gating and nav.
 * Distinct from workspace addon CapabilityRegistry runtime IDs.
 */

/** @typedef {'crm'|'sales'|'inventory'|'hospitality'|'whatsapp'|'reports'|'billing'|'ai'|'hub'} ProductCapability */

/** @type {Record<ProductCapability, { id: ProductCapability; label: string; nav: { path: string; label: string; children?: { path: string; label: string }[] }[] }>} */
export const PRODUCT_CAPABILITIES = {
  crm: {
    id: "crm",
    label: "CRM",
    nav: [{ path: "/app/crm", label: "CRM" }],
  },
  sales: {
    id: "sales",
    label: "Ventas",
    nav: [{ path: "/app/ventas", label: "Ventas" }],
  },
  inventory: {
    id: "inventory",
    label: "Inventario",
    nav: [{ path: "/app/inventario", label: "Inventario" }],
  },
  hospitality: {
    id: "hospitality",
    label: "Hospitality",
    nav: [
      {
        path: "/sistema/restaurant",
        label: "Hospitality",
        children: [
          { path: "/sistema/restaurant", label: "TPV / Sala" },
          { path: "/sistema/restaurant#kitchen", label: "Cocina" },
          { path: "/sistema/restaurant#tables", label: "Mesas" },
          { path: "/sistema/restaurant#delivery", label: "Delivery" },
        ],
      },
    ],
  },
  whatsapp: {
    id: "whatsapp",
    label: "WhatsApp",
    nav: [{ path: "/app/whatsapp/conversations", label: "WhatsApp" }],
  },
  reports: {
    id: "reports",
    label: "Reportes",
    nav: [{ path: "/app/reportes", label: "Reportes" }],
  },
  billing: {
    id: "billing",
    label: "Billing",
    nav: [{ path: "/admin/plan", label: "Plan" }],
  },
  ai: {
    id: "ai",
    label: "Copilot",
    nav: [],
  },
  hub: {
    id: "hub",
    label: "Hub",
    nav: [{ path: "/", label: "Mi día" }],
  },
};

/** Plan API module keys → product capabilities */
export const MODULE_TO_CAPABILITY = Object.freeze({
  crm: "crm",
  leads: "crm",
  whatsapp: "whatsapp",
  inventory: "inventory",
  inventario: "inventory",
  sales: "sales",
  ventas: "sales",
  reports: "reports",
  analytics: "reports",
  dashboard: "hub",
  agenda: "hospitality",
  booking: "hospitality",
  ia: "ai",
  ai: "ai",
});

/**
 * @param {string[]|Set<string>|null|undefined} enabled
 * @returns {typeof PRODUCT_CAPABILITIES[ProductCapability]['nav'][number][]}
 */
export function buildNavFromCapabilities(enabled) {
  const set = enabled instanceof Set ? enabled : new Set(enabled || Object.keys(PRODUCT_CAPABILITIES));
  /** @type {typeof PRODUCT_CAPABILITIES[ProductCapability]['nav'][number][]} */
  const items = [];
  for (const key of Object.keys(PRODUCT_CAPABILITIES)) {
    if (!set.has(key)) continue;
    items.push(...PRODUCT_CAPABILITIES[/** @type {ProductCapability} */ (key)].nav);
  }
  return items;
}

/**
 * @param {string[]|null|undefined} enabled
 * @param {ProductCapability} capability
 */
export function tenantHasCapability(enabled, capability) {
  if (!enabled || !enabled.length) return true;
  return enabled.includes(capability);
}

/**
 * Resolve tenant capabilities from session / plan modules / business type.
 * @param {{ business?: { capabilities?: string[]; modulesEnabled?: string[]; type?: string; planTier?: string }; capabilities?: string[] }|null|undefined} session
 * @returns {ProductCapability[]}
 */
export function resolveTenantCapabilities(session) {
  const explicit = session?.capabilities || session?.business?.capabilities;
  if (Array.isArray(explicit) && explicit.length) {
    return [...new Set(explicit.map(String))];
  }

  const modules = session?.business?.modulesEnabled;
  /** @type {Set<string>} */
  const caps = new Set(["hub"]);

  if (Array.isArray(modules) && modules.length) {
    for (const m of modules) {
      const cap = MODULE_TO_CAPABILITY[String(m).toLowerCase()];
      if (cap) caps.add(cap);
    }
  } else {
    caps.add("crm");
    caps.add("sales");
    caps.add("inventory");
    caps.add("reports");
    caps.add("whatsapp");
  }

  const bizType = String(session?.business?.type || "").toLowerCase();
  if (
    bizType === "restaurant" ||
    bizType === "hospitality" ||
    bizType === "bar" ||
    bizType === "cafe" ||
    bizType.includes("restaur")
  ) {
    caps.add("hospitality");
    caps.add("inventory");
    caps.add("sales");
  }

  return [...caps];
}
