export function Field({
  id,
  label,
  required,
  hint,
  as = "input",
  children,
  ...props
}) {
  const Control = as;
  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
        {required ? <span className="field-hint"> (required)</span> : null}
        {hint ? <span className="field-hint"> {hint}</span> : null}
      </label>
      {children ? (
        children
      ) : (
        <Control
          className={as === "textarea" ? "field-textarea" : as === "select" ? "field-select" : "field-input"}
          id={id}
          name={id}
          required={required}
          {...props}
        />
      )}
    </div>
  );
}
