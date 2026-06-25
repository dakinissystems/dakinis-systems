/**
 * Hints IA contextuales — inteligencia continua sin abrir chat.
 * Siempre estilo morado (--dakinis-ai).
 */

/** @typedef {{ id: string; message: string; actionLabel?: string; actionId?: string; severity?: 'info'|'success'|'warn' }} AiHint */

export const CONTEXTUAL_AI_TEMPLATES = {
  crmInactive: (days, name) => ({
    id: "crm-inactive",
    message: `${name || "Este cliente"} lleva ${days} días sin comprar.`,
    actionLabel: "Enviar promoción",
    actionId: "crm_send_promo",
    severity: "info",
  }),
  lifeflowSavings: (pct) => ({
    id: "lifeflow-savings",
    message: `Has reducido gastos un ${pct} %. Buen trabajo.`,
    severity: "success",
  }),
  lifeflowScoreUp: (delta) => ({
    id: "lifeflow-score",
    message: `Tu LifeFlow Score subió ${delta > 0 ? "+" : ""}${delta} puntos.`,
    actionLabel: "Ver detalle",
    actionId: "open_score",
    severity: "success",
  }),
  coreLowStock: (count) => ({
    id: "core-low-stock",
    message: `${count} producto(s) bajo el mínimo de stock.`,
    actionLabel: "Ver inventario",
    actionId: "review_low_stock",
    severity: "warn",
  }),
  coreExpiring: (count) => ({
    id: "core-expiring",
    message: `${count} lote(s) caducan pronto.`,
    actionLabel: "Ver caducidad",
    actionId: "review_expiring_lots",
    severity: "warn",
  }),
  hubDaily: (items) => ({
    id: "hub-daily",
    message: `Tengo ${items.length} recomendación(es) para hoy.`,
    actionLabel: "Ver recomendaciones",
    actionId: "open_ai_recommendations",
    severity: "info",
  }),
};

export const contextualAiStylesheet = `
.dakinis-ai-hint {
  display: flex; align-items: flex-start; gap: 0.65rem;
  padding: 0.65rem 0.85rem; border-radius: 12px;
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.14), rgba(45, 212, 191, 0.05));
  border: 1px solid var(--dakinis-ai-border, rgba(168, 85, 247, 0.45));
  font-size: 0.88rem; line-height: 1.4;
}
.dakinis-ai-hint--success { border-color: rgba(82, 183, 136, 0.45); }
.dakinis-ai-hint--warn { border-color: rgba(244, 162, 97, 0.45); }
.dakinis-ai-hint__action {
  margin-left: auto; flex-shrink: 0;
  font-size: 0.78rem; font-weight: 600;
  color: var(--dakinis-ai-soft, #a855f7);
  background: none; border: none; cursor: pointer;
}
`;
