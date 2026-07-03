/** Botón DES — variantes primary, secondary, ghost, danger */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  className = "",
  ...props
}) {
  const cls = [
    "dakinis-btn",
    `dakinis-btn--${variant}`,
    `dakinis-btn--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button type={type} className={cls} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
