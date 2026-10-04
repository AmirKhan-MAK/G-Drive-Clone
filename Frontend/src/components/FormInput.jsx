import { useState, useId } from 'react';

/**
 * FormInput — Reusable form input with label, icon, and optional password toggle.
 *
 * @param {object} props
 * @param {string}  props.label        — visible label text
 * @param {string}  props.type         — input type (text, email, password, etc.)
 * @param {string}  props.placeholder  — placeholder text
 * @param {string}  props.value        — controlled value
 * @param {(e: Event) => void} props.onChange
 * @param {React.ReactNode} [props.icon]  — optional leading icon
 * @param {boolean} [props.required]
 * @param {string}  [props.autoComplete]
 * @param {string}  [props.name]
 */
export default function FormInput({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  icon,
  required = false,
  autoComplete,
  name,
}) {
  const id = useId();
  const isPassword = type === 'password';
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="form-field">
      <label htmlFor={id} className="form-field__label">
        {label}
      </label>
      <div className="form-field__input-wrap">
        {icon && <span className="form-field__icon" aria-hidden="true">{icon}</span>}
        <input
          id={id}
          name={name}
          type={isPassword && showPassword ? 'text' : type}
          className="form-field__input"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autoComplete}
          aria-required={required}
        />
        {isPassword && (
          <button
            type="button"
            className="form-field__toggle"
            onClick={() => setShowPassword((p) => !p)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
    </div>
  );
}


/* ── Eye Icons ── */

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    </svg>
  );
}
