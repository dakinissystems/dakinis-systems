import workspaceAddonsJson from "./workspace-addons.json" with { type: "json" };
import workspaceWidgetsJson from "./workspace-widgets.json" with { type: "json" };

/** @type {typeof workspaceAddonsJson.addons} */
export const DAKINIS_WORKSPACE_ADDONS = dakinisSortWorkspaceAddons(workspaceAddonsJson.addons);

/** @type {typeof workspaceWidgetsJson.widgets} */
export const DAKINIS_WORKSPACE_WIDGETS = workspaceWidgetsJson.widgets;

/**
 * @param {typeof workspaceAddonsJson.addons[number][]} addons
 */
export function dakinisSortWorkspaceAddons(addons) {
  return addons.toSorted((a, b) => {
    const ao = Number(a.sortOrder ?? 999);
    const bo = Number(b.sortOrder ?? 999);
    if (ao !== bo) return ao - bo;
    return String(a.id || "").localeCompare(String(b.id || ""));
  });
}

/**
 * @param {typeof workspaceAddonsJson.addons[number]} addon
 * @param {"name"|"description"} field
 * @param {"es"|"en"} [locale]
 */
export function dakinisWorkspaceAddonField(addon, field, locale = "es") {
  const fromI18n = addon.i18n?.[field]?.[locale];
  if (fromI18n) return fromI18n;
  if (field === "name") return addon.id;
  return "";
}

/**
 * @param {typeof workspaceAddonsJson.addons[number]} addon
 * @param {"es"|"en"} [locale]
 */
export function dakinisWorkspaceAddonToTile(addon, locale = "es") {
  return {
    id: addon.id,
    label: dakinisWorkspaceAddonField(addon, "name", locale),
    description: dakinisWorkspaceAddonField(addon, "description", locale),
    category: addon.category,
    phase: addon.phase,
    icon: addon.icon,
    sortOrder: addon.sortOrder,
    builtin: Boolean(addon.builtin),
    status: addon.phase === "future" ? "roadmap" : "active",
  };
}

/**
 * @param {typeof workspaceWidgetsJson.widgets[number]} widget
 * @param {"es"|"en"} [locale]
 */
export function dakinisWorkspaceWidgetLabel(widget, locale = "es") {
  return widget.i18n?.name?.[locale] ?? widget.id;
}

export function dakinisListWorkspaceAddonTiles(locale = "es") {
  return DAKINIS_WORKSPACE_ADDONS.map((a) => dakinisWorkspaceAddonToTile(a, locale));
}

export function dakinisWorkspaceAddonsByCategory(locale = "es") {
  /** @type {Record<string, ReturnType<typeof dakinisWorkspaceAddonToTile>[]>} */
  const groups = {};
  for (const addon of DAKINIS_WORKSPACE_ADDONS) {
    const cat = addon.category || "system";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(dakinisWorkspaceAddonToTile(addon, locale));
  }
  return groups;
}

export { workspaceAddonsJson, workspaceWidgetsJson };
