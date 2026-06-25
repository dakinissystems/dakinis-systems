/**
 * Logros transversales — aparecen en Hub además del producto origen.
 */

/** @typedef {{ id: string; title: string; description: string; product: string; icon: string; hubVisible?: boolean }} AchievementDef */

export const CROSS_PRODUCT_ACHIEVEMENTS = [
  { id: "first-customer", title: "Primer cliente", description: "Creaste tu primer cliente en Core.", product: "core", icon: "user-check", hubVisible: true },
  { id: "first-payment", title: "Primer pago", description: "Registraste tu primer cobro.", product: "core", icon: "credit-card", hubVisible: true },
  { id: "first-order", title: "Primer pedido", description: "Completaste tu primer pedido.", product: "core", icon: "shopping-bag", hubVisible: true },
  { id: "first-stream", title: "Primer stream", description: "Programaste tu primera publicación en Stream.", product: "streamautomator", icon: "radio", hubVisible: true },
  { id: "first-goal", title: "Primer objetivo", description: "Definiste tu primera meta en LifeFlow.", product: "lifeflow", icon: "target", hubVisible: true },
  { id: "first-server", title: "Primer servidor", description: "Creaste tu primera comunidad en AkoeNet.", product: "akoenet", icon: "server", hubVisible: true },
  { id: "first-ai-question", title: "Primera pregunta IA", description: "Consultaste a Dakinis AI.", product: "ai", icon: "sparkles", hubVisible: true },
  { id: "hub-connected", title: "Ecosistema conectado", description: "Usas 3 o más productos Dakinis.", product: "hub", icon: "layout-grid", hubVisible: true },
];

export function getHubAchievements() {
  return CROSS_PRODUCT_ACHIEVEMENTS.filter((a) => a.hubVisible);
}
