/** Acción sugerida por la IA. */
export default function AiAction({ label, description, onClick, disabled = false }) {
  if (!label) return null;
  return (
    <div className="dakinis-ai-action">
      <div>
        <strong>{label}</strong>
        {description ? <p className="dakinis-ai-action__desc">{description}</p> : null}
      </div>
      <button type="button" className="dakinis-ai-action__btn" onClick={onClick} disabled={disabled}>
        Ejecutar
      </button>
    </div>
  );
}
