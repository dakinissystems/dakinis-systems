/** Estado de pensamiento / streaming. */
export default function AiThinking({ label = "Pensando" }) {
  return (
    <div className="dakinis-ai-thinking" role="status" aria-live="polite">
      <span className="dakinis-ai-badge">IA</span>
      <span>{label}</span>
      <span className="dakinis-ai-thinking__dots" aria-hidden="true">
        <span>.</span>
        <span>.</span>
        <span>.</span>
      </span>
    </div>
  );
}
