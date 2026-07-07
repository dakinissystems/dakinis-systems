/** Timeline de eventos IA. */
import { EMPTY_EVENTS } from "./constants.js";

export default function AiTimeline({ events = EMPTY_EVENTS }) {
  if (!events.length) return null;
  return (
    <ol className="dakinis-ai-timeline">
      {events.map((evt, i) => (
        <li key={evt.id || i} className="dakinis-ai-timeline__item">
          <span className="dakinis-ai-badge">IA</span>
          <div>
            <strong>{evt.title}</strong>
            {evt.detail ? <p>{evt.detail}</p> : null}
            {evt.time ? <time>{evt.time}</time> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
