/**
 * Badge DES — estados semánticos (no colores de marca en la API).
 * @param {"neutral"|"success"|"warning"|"danger"|"info"|"accent"|"ai"} [tone="neutral"]
 */
export default function Badge({ children, tone = "neutral", className = "", ...props }) {
  const cls = ["dakinis-badge", `dakinis-badge--${tone}`, className].filter(Boolean).join(" ");
  return (
    <span className={cls} {...props}>
      {children}
    </span>
  );
}
