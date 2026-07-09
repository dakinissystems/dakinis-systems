import { HUB_WIDGET_REGISTRY } from "../widgets.js";
import { DashboardCard } from "../DashboardCard.jsx";
import { getWidgetDisplay } from "../hub-widget-values.js";
import { dakinisHubProductEnabled } from "../../../shared-brand/src/hub-product-access.js";

/**
 * Grid de widgets Hub — usa `widgetValues` del Internal API (sin datos mock).
 */
export default function HubWidgetGrid({
  widgets = HUB_WIDGET_REGISTRY,
  widgetValues = {},
  enabledProducts = null,
  section = null,
  onAction,
  t = (k) => k,
}) {
  let list = section ? widgets.filter((w) => w.section === section) : widgets;
  if (enabledProducts?.length) {
    list = list.filter(
      (w) => w.product === "hub" || dakinisHubProductEnabled(w.product, enabledProducts)
    );
  }

  if (!list.length) {
    return null;
  }

  return (
    <div className="hub-widget-grid">
      {list.map((def) => {
        const display = getWidgetDisplay(def.id, widgetValues);
        return (
          <DashboardCard
            key={def.id}
            icon={def.icon === "sparkles" ? "✨" : def.icon || "◆"}
            title={def.title || def.id}
            value={display.value}
            trend={display.trend}
            status={display.status || def.product}
            aiHint={display.aiHint}
            actionLabel={display.actionLabel || (onAction ? t("hub.widgets.view") : undefined)}
            onAction={onAction ? () => onAction(def.id) : undefined}
            onAiHintAction={onAction ? () => onAction(`${def.id}-ai`) : undefined}
          />
        );
      })}
    </div>
  );
}
