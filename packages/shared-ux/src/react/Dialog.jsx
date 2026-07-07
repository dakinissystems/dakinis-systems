import { useEffect, useRef } from "react";

/** Modal DES — native `<dialog>` with focus trap and Escape. */
export default function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
  className = "",
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    function onCancel(e) {
      e.preventDefault();
      onClose?.();
    }
    dialog.addEventListener("cancel", onCancel);
    return () => dialog.removeEventListener("cancel", onCancel);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      className={`dakinis-dialog dakinis-dialog--native ${className}`.trim()}
      aria-labelledby={title ? "dakinis-dialog-title" : undefined}
      aria-label={title ? undefined : "Dialog"}
    >
      <button
        type="button"
        className="dakinis-dialog__backdrop"
        aria-label="Cerrar"
        onClick={() => onClose?.()}
      />
      <div className={`dakinis-dialog__panel ${className}`.trim()}>
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
    </dialog>
  );
}
