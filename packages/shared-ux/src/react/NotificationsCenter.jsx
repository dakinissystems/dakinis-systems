/** Centro de notificaciones Hub (cross-producto). */
export default function NotificationsCenter({ items = [], t = (k) => k }) {
  const defaults = items.length
    ? items
    : [
        { id: "1", product: "LifeFlow", message: t("hub.notifications.scoreUp"), time: "09:12" },
        { id: "2", product: "Core", message: t("hub.notifications.newOrder"), time: "10:30" },
        { id: "3", product: "Stream", message: t("hub.notifications.published"), time: "11:05" },
        { id: "4", product: "AkoeNet", message: t("hub.notifications.newUsers"), time: "11:40" },
        { id: "5", product: "IA", message: t("hub.notifications.aiRec"), time: "12:00" },
      ];

  return (
    <section className="hub-notifications card" aria-label={t("hub.notifications.title")}>
      <h4 className="hub-notifications__title">{t("hub.notifications.title")}</h4>
      <ul className="hub-notifications__list" role="list">
        {defaults.map((n) => (
          <li key={n.id} className="hub-notifications__item">
            <span className={`hub-notifications__product hub-notifications__product--${n.product.toLowerCase()}`}>
              {n.product}
            </span>
            <span className="hub-notifications__msg">{n.message}</span>
            <time className="hub-notifications__time">{n.time}</time>
          </li>
        ))}
      </ul>
    </section>
  );
}
