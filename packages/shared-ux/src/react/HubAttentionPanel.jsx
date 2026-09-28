import { resolveHubT } from "../hub-i18n.js";
import { deriveHubAttention } from "../hub-attention.js";

const SEVERITY_ICON = {
  critical: "●",
  warning: "⚠",
  info: "ℹ",
};

/**
 * Hub Attention Center — “qué requiere atención ahora” (OS del negocio).
 * @param {{ dashboard?: object; items?: object[]; onItem?: (item: object) => void; onProduct?: (p: object) => void; t?: Function; loading?: boolean }} props
 */
export default function HubAttentionPanel({
  dashboard = null,
  items: itemsProp = null,
  onItem,
  onProduct,
  t,
  loading = false,
}) {
  const derived = itemsProp
    ? { count: itemsProp.length, items: itemsProp, products: [] }
    : deriveHubAttention(dashboard);

  const { count, items, products } = derived;
  const title = resolveHubT(t, "hub.attention.title", "Requieren atención");
  const empty = resolveHubT(t, "hub.attention.empty", "Nada urgente ahora mismo");
  const productsLabel = resolveHubT(t, "hub.attention.products", "Productos");

  if (loading) {
    return (
      <section className="hub-attention hub-attention--loading" aria-busy="true" aria-label={title}>
        <div className="hub-attention__skel" />
        <div className="hub-attention__skel hub-attention__skel--short" />
        <style>{ATTENTION_CSS}</style>
      </section>
    );
  }

  return (
    <section className="hub-attention" aria-labelledby="hub-attention-title">
      <header className="hub-attention__head">
        <h2 id="hub-attention-title" className="hub-attention__title">
          {count > 0 ? (
            <>
              <span className="hub-attention__pulse" aria-hidden>
                ●
              </span>{" "}
              {count} {title.toLowerCase()}
            </>
          ) : (
            title
          )}
        </h2>
      </header>

      {items.length === 0 ? (
        <p className="hub-attention__empty">{empty}</p>
      ) : (
        <ul className="hub-attention__list">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={`hub-attention__item hub-attention__item--${item.severity || "info"}`}
                onClick={() => onItem?.(item)}
              >
                <span className="hub-attention__icon" aria-hidden>
                  {SEVERITY_ICON[item.severity] || SEVERITY_ICON.info}
                </span>
                <span className="hub-attention__body">
                  <span className="hub-attention__label">{item.title}</span>
                  {item.detail ? <span className="hub-attention__detail">{item.detail}</span> : null}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {products.length > 0 ? (
        <div className="hub-attention__products">
          <h3 className="hub-attention__products-title">{productsLabel}</h3>
          <ul className="hub-attention__product-list">
            {products.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  className="hub-attention__product"
                  onClick={() => onProduct?.(p)}
                >
                  <span>{p.name}</span>
                  <span
                    className={`hub-attention__badge${p.badge > 0 ? " hub-attention__badge--hot" : ""}`}
                  >
                    {p.badge > 0 ? `● ${p.badge}` : "0"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <style>{ATTENTION_CSS}</style>
    </section>
  );
}

const ATTENTION_CSS = `
  .hub-attention {
    padding: 1rem 1.1rem;
    border-radius: 0.85rem;
    border: 1px solid var(--dakinis-border, rgba(255,255,255,0.12));
    background: var(--dakinis-surface-1, rgba(255,255,255,0.04));
  }
  .hub-attention__head { margin-bottom: 0.75rem; }
  .hub-attention__title {
    margin: 0; font-size: 1.05rem; font-weight: 700; letter-spacing: -0.01em;
    display: flex; align-items: center; gap: 0.4rem;
  }
  .hub-attention__pulse { color: #f87171; font-size: 0.7rem; animation: hub-att-pulse 1.6s ease-in-out infinite; }
  @keyframes hub-att-pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
  .hub-attention__empty {
    margin: 0; font-size: 0.88rem; color: var(--dakinis-muted, rgba(255,255,255,0.55));
  }
  .hub-attention__list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.45rem; }
  .hub-attention__item {
    display: flex; align-items: flex-start; gap: 0.65rem; width: 100%;
    text-align: left; padding: 0.7rem 0.85rem; border-radius: 0.65rem;
    border: 1px solid transparent; background: transparent; color: inherit;
    cursor: pointer; font: inherit;
  }
  .hub-attention__item:hover {
    background: var(--dakinis-surface-2, rgba(45,212,191,0.06));
    border-color: var(--dakinis-border, rgba(255,255,255,0.1));
  }
  .hub-attention__item--critical { border-color: rgba(239,68,68,0.25); }
  .hub-attention__item--warning { border-color: rgba(245,158,11,0.2); }
  .hub-attention__icon { flex-shrink: 0; margin-top: 0.1rem; opacity: 0.9; }
  .hub-attention__body { min-width: 0; }
  .hub-attention__label { display: block; font-weight: 600; font-size: 0.9rem; line-height: 1.35; }
  .hub-attention__detail { display: block; font-size: 0.78rem; opacity: 0.7; margin-top: 0.15rem; line-height: 1.4; }
  .hub-attention__products { margin-top: 1rem; padding-top: 0.85rem; border-top: 1px solid var(--dakinis-border, rgba(255,255,255,0.08)); }
  .hub-attention__products-title { margin: 0 0 0.5rem; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; opacity: 0.65; }
  .hub-attention__product-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.25rem; }
  .hub-attention__product {
    display: flex; justify-content: space-between; align-items: center; width: 100%;
    padding: 0.45rem 0.55rem; border: none; border-radius: 0.45rem;
    background: transparent; color: inherit; cursor: pointer; font: inherit; font-size: 0.88rem;
  }
  .hub-attention__product:hover { background: rgba(255,255,255,0.04); }
  .hub-attention__badge { font-size: 0.78rem; opacity: 0.55; font-variant-numeric: tabular-nums; }
  .hub-attention__badge--hot { opacity: 1; color: var(--dakinis-primary, #2dd4bf); font-weight: 600; }
  .hub-attention__skel {
    height: 2.5rem; border-radius: 0.5rem; margin-bottom: 0.5rem;
    background: linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.09), rgba(255,255,255,0.04));
    background-size: 200% 100%; animation: hub-att-shimmer 1.2s ease-in-out infinite;
  }
  .hub-attention__skel--short { width: 60%; }
  @keyframes hub-att-shimmer { 0%{background-position:100% 0} 100%{background-position:-100% 0} }
`;
