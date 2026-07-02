/** Advertencia IA con severidad. */
export default function AiWarning({ message, severity = "warning" }) {
  if (!message) return null;
  return (
    <div className={`dakinis-ai-warning dakinis-ai-warning--${severity}`} role="alert">
      <span className="dakinis-ai-badge">IA</span>
      <span>{message}</span>
    </div>
  );
}
