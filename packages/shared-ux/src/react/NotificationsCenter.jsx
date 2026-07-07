/** Centro de notificaciones Hub (cross-producto). */
import { EMPTY_ITEMS } from "./constants.js";

export default function NotificationsCenter({ items = EMPTY_ITEMS, loading = false, t = (k) => k }) {
  if (loading) {
    return (
      <section className="hub-notifications card" aria-label={t("hub.notifications.title")}>
        <h4 className="hub-notifications__title">{t("hub.notifications.title")}</h4>
        <p className="hub-notifications__empty">{t("hub.notifications.loading") || "Cargando…"}</p>
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className="hub-notifications card" aria-label={t("hub.notifications.title")}>
        <h4 className="hub-notifications__title">{t("hub.notifications.title")}</h4>
        <p className="hub-notifications__empty">{t("hub.notifications.empty") || "Sin notificaciones"}</p>
      </section>
    );
  }

  return (
    <section className="hub-notifications card" aria-label={t("hub.notifications.title")}>
      <h4 className="hub-notifications__title">{t("hub.notifications.title")}</h4>
      <ul className="hub-notifications__list" role="list">
        {items.map((n) => (
          <li key={n.id} className={`hub-notifications__item${n.read ? " hub-notifications__item--read" : ""}`}>
            <span className={`hub-notifications__product hub-notifications__product--${String(n.product || "hub").toLowerCase()}`}>
              {n.product || "Hub"}
            </span>
            <span className="hub-notifications__msg">{n.message || n.title}</span>
            <time className="hub-notifications__time">{n.time || ""}</time>
          </li>
        ))}
      </ul>
    </section>
  );
}
