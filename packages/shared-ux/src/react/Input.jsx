/** Input DES — text, email, password, search */
export default function Input({
  label,
  id,
  hint,
  error,
  className = "",
  ...props
}) {
  const inputId = id || props.name;
  return (
    <label className={`dakinis-field ${className}`.trim()} htmlFor={inputId}>
      {label ? <span className="dakinis-field__label">{label}</span> : null}
      <input id={inputId} className={`dakinis-input ${error ? "dakinis-input--error" : ""}`} {...props} />
      {hint && !error ? <span className="dakinis-field__hint">{hint}</span> : null}
      {error ? <span className="dakinis-field__error" role="alert">{error}</span> : null}
    </label>
  );
}
