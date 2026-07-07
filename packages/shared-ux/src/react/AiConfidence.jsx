/** Indicador de confianza de respuesta IA (0–100). */
export default function AiConfidence({ value = 0, label = "Confianza" }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="dakinis-ai-confidence">
      <span className="dakinis-ai-confidence__label">{label}</span>
      <meter className="dakinis-ai-confidence__bar" value={pct} min={0} max={100} aria-label={`${label}: ${pct}%`} />
      <span className="dakinis-ai-confidence__value">{pct}%</span>
    </div>
  );
}
