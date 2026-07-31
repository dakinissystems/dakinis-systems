/**
 * Patrón Form DES — título, campos, acciones, estados.
 * API semántica (sin colores de marca).
 */
import Button from "./Button.jsx";
import Input from "./Input.jsx";

export default function FormPattern({
  title,
  description,
  fields = [],
  values = {},
  onChange,
  onSubmit,
  submitLabel = "Guardar",
  secondaryLabel,
  onSecondary,
  busy = false,
  error,
  success,
  className = "",
  children,
}) {
  function handleSubmit(e) {
    e.preventDefault();
    if (!busy) onSubmit?.(values, e);
  }

  return (
    <form
      className={`dakinis-pattern-form ${className}`.trim()}
      onSubmit={handleSubmit}
      noValidate
    >
      {(title || description) && (
        <header className="dakinis-pattern-form__head">
          {title ? <h2 className="dakinis-pattern-form__title">{title}</h2> : null}
          {description ? <p className="dakinis-pattern-form__desc">{description}</p> : null}
        </header>
      )}

      <div className="dakinis-pattern-form__fields">
        {fields.map((field) => (
          <Input
            key={field.name || field.id}
            id={field.id || field.name}
            name={field.name}
            label={field.label}
            type={field.type || "text"}
            hint={field.hint}
            error={field.error}
            required={field.required}
            disabled={busy || field.disabled}
            value={values[field.name] ?? ""}
            onChange={(ev) => onChange?.(field.name, ev.target.value, ev)}
            placeholder={field.placeholder}
            autoComplete={field.autoComplete}
          />
        ))}
        {children}
      </div>

      {error ? (
        <p className="dakinis-pattern-form__error" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="dakinis-pattern-form__success" role="status">
          {success}
        </p>
      ) : null}

      <div className="dakinis-pattern-form__actions">
        {secondaryLabel ? (
          <Button type="button" variant="ghost" disabled={busy} onClick={onSecondary}>
            {secondaryLabel}
          </Button>
        ) : null}
        <Button type="submit" variant="primary" disabled={busy}>
          {busy ? "Guardando…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
