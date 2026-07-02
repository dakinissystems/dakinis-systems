/** Chip de sugerencia IA clickeable. */
export default function AiSuggestion({ label, onSelect, disabled = false }) {
  if (!label) return null;
  return (
    <button
      type="button"
      className="dakinis-ai-suggestion"
      onClick={onSelect}
      disabled={disabled}
    >
      <span className="dakinis-ai-badge">IA</span>
      {label}
    </button>
  );
}
