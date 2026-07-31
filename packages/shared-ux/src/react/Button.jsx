/**
 * Botón DES — variantes primary, secondary, ghost, danger.
 * Usa `as` para polimorfismo (p. ej. Link de react-router).
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  className = "",
  as: Comp = "button",
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

  if (Comp === "button") {
    return (
      <button type={type} className={cls} disabled={disabled} {...props}>
        {children}
      </button>
    );
  }

  return (
    <Comp
      className={cls}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : props.tabIndex}
      {...props}
    >
      {children}
    </Comp>
  );
}
