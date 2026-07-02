/** Indicador de confianza de respuesta IA (0–100). */
export default function AiConfidence({ value = 0, label = "Confianza" }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="dakinis-ai-confidence" role="meter" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <span className="dakinis-ai-confidence__label">{label}</span>
      <div className="dakinis-ai-confidence__bar">
        <div className="dakinis-ai-confidence__fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="dakinis-ai-confidence__value">{pct}%</span>
    </div>
  );
}
