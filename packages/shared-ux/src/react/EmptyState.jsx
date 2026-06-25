import { getEmptyState } from "../empty-states.js";
import { getIllustration, ILLUSTRATION_KEYS } from "../../../shared-illustrations/src/index.js";

/**
 * Estado vacío Dakinis — ilustración + copy emocional + CTAs.
 */
export default function EmptyState({
  product = "generic",
  stateKey = "noData",
  title,
  hint,
  primaryAction,
  secondaryAction,
  illustrationKey,
  onPrimary,
  onSecondary,
  className = "",
}) {
  const preset = getEmptyState(product, stateKey) || getEmptyState("generic", stateKey);
  const illKey = illustrationKey || preset?.illustration || ILLUSTRATION_KEYS.emptyGeneric;
  const ill = getIllustration(illKey);

  const finalTitle = title || preset?.title || "Aún no hay datos";
  const finalHint = hint || preset?.hint || "";
  const primaryLabel = primaryAction || preset?.primaryAction;
  const secondaryLabel = secondaryAction || preset?.secondaryAction;

  return (
    <div className={`dakinis-empty-state ${className}`.trim()} role="status">
      <div
        className={`dakinis-illustration${ill?.accent === "ai" ? " dakinis-illustration--ai" : ""}`}
        aria-hidden="true"
      >
        {ill?.fallbackEmoji || "📭"}
      </div>
      <h3 className="dakinis-empty-state__title">{finalTitle}</h3>
      {finalHint ? <p className="dakinis-empty-state__hint">{finalHint}</p> : null}
      {(primaryLabel || secondaryLabel) && (
        <div className="dakinis-empty-state__actions">
          {primaryLabel ? (
            <button type="button" className="btn" onClick={onPrimary}>
              {primaryLabel}
            </button>
          ) : null}
          {secondaryLabel ? (
            <button type="button" className="btn btn-outline" onClick={onSecondary}>
              {secondaryLabel}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
