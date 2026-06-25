/** Timeline de actividad Hub. */
export default function ActivityTimeline({ events = [], t = (k) => k }) {
  const defaults = events.length
    ? events
    : [
        { id: "1", time: "10:30", label: t("hub.timeline.invoice") },
        { id: "2", time: "10:32", label: t("hub.timeline.ai"), ai: true },
        { id: "3", time: "10:45", label: t("hub.timeline.score") },
        { id: "4", time: "11:02", label: t("hub.timeline.customer") },
      ];

  return (
    <section className="hub-activity card" aria-label={t("hub.timeline.title")}>
      <h4 className="hub-activity__title">{t("hub.timeline.title")}</h4>
      <ol className="hub-activity__list">
        {defaults.map((ev) => (
          <li key={ev.id} className={`hub-activity__item${ev.ai ? " hub-activity__item--ai" : ""}`}>
            <time>{ev.time}</time>
            <span>{ev.label}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
