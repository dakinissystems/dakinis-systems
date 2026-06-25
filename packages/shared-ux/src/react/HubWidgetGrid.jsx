import { HUB_WIDGET_REGISTRY } from "../widgets.js";
import { DashboardCard } from "../DashboardCard.jsx";

/**
 * Grid de widgets Hub — datos mock/placeholder hasta API por producto.
 */
export default function HubWidgetGrid({ widgets = HUB_WIDGET_REGISTRY, onAction, t = (k) => k }) {
  const demo = [
    { id: "lifeflow-score", value: "742", trend: "↑ +12", status: "LifeFlow", aiHint: { message: t("hub.widgets.lifeflowHint") } },
    { id: "core-sales-today", value: "€ 1.240", trend: "+8%", status: "Core", actionLabel: t("hub.widgets.viewSales") },
    { id: "stream-next-live", value: "Vie 20:00", status: "Stream", actionLabel: t("hub.widgets.openCalendar") },
    { id: "akoenet-online", value: "15", status: "AkoeNet", actionLabel: t("hub.widgets.viewCommunity") },
    { id: "ai-recommendations", value: "3", status: "IA", aiHint: { message: t("hub.widgets.aiHint"), actionLabel: t("hub.widgets.viewRecs") } },
  ];

  return (
    <div className="hub-widget-grid">
      {demo.map((w) => {
        const def = widgets.find((x) => x.id === w.id) || widgets[0];
        return (
          <DashboardCard
            key={w.id}
            icon={def?.icon === "sparkles" ? "✨" : "◆"}
            title={def?.title || w.id}
            value={w.value}
            trend={w.trend}
            status={w.status}
            aiHint={w.aiHint}
            actionLabel={w.actionLabel}
            onAction={() => onAction?.(w.id)}
            onAiHintAction={() => onAction?.(`${w.id}-ai`)}
          />
        );
      })}
    </div>
  );
}
