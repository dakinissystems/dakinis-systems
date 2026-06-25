/** Hint IA contextual inline (morado). */
export default function AiContextualHint({ message, actionLabel, onAction, severity = "info" }) {
  if (!message) return null;
  return (
    <div className={`dakinis-ai-hint dakinis-ai-hint--${severity}`} role="note">
      <span className="dakinis-ai-badge">IA</span>
      <span className="dakinis-ai-hint__text">{message}</span>
      {actionLabel ? (
        <button type="button" className="dakinis-ai-hint__action" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
