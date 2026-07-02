/** Mensaje de asistente IA en conversación. */
export default function AiMessage({ role = "assistant", children, timestamp }) {
  return (
    <article className={`dakinis-ai-message dakinis-ai-message--${role}`} role="article">
      <header className="dakinis-ai-message__header">
        <span className="dakinis-ai-badge">{role === "user" ? "Tú" : "IA"}</span>
        {timestamp ? <time className="dakinis-ai-message__time">{timestamp}</time> : null}
      </header>
      <div className="dakinis-ai-message__body">{children}</div>
    </article>
  );
}
