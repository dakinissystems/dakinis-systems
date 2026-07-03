import { useEffect } from "react";

/** Modal DES — overlay + panel, cierra con Escape */
export default function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
  className = "",
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="dakinis-dialog" role="presentation" onClick={onClose}>
      <div
        className={`dakinis-dialog__panel ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "dakinis-dialog-title" : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {title ? (
          <header className="dakinis-dialog__header">
            <h2 id="dakinis-dialog-title" className="dakinis-dialog__title">
              {title}
            </h2>
            <button type="button" className="dakinis-dialog__close" onClick={onClose} aria-label="Cerrar">
              ×
            </button>
          </header>
        ) : null}
        <div className="dakinis-dialog__body">{children}</div>
        {footer ? <footer className="dakinis-dialog__footer">{footer}</footer> : null}
      </div>
    </div>
  );
}
