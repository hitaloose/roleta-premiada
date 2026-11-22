import { useEffect, useRef, useState } from 'react';

type FormFieldProps = {
  label: string;
  placeholder: string;
  format?: (raw: string) => string;
  validate: (value: string) => boolean;
  errorMessage: string | ((value: string) => string);
  onSubmit: (value: string) => void;
  onKeystroke?: () => void;
};

export function FormField({
  label,
  placeholder,
  format,
  validate,
  errorMessage,
  onSubmit,
  onKeystroke,
}: FormFieldProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleChange(raw: string) {
    setError(false);
    setValue(format ? format(raw) : raw);
    onKeystroke?.();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    onKeystroke?.();
    if (event.key !== 'Enter') return;
    if (!validate(value)) {
      setError(true);
      return;
    }
    onSubmit(value);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', width: 'min(90vw, 560px)' }}>
      <label style={{ fontSize: 'var(--font-title)', color: 'var(--color-text)' }}>{label}</label>
      <input
        ref={inputRef}
        value={value}
        placeholder={placeholder}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="form-field-input"
        style={{
          padding: '0.75rem 1rem',
          borderRadius: 12,
          border: `2px solid ${error ? 'var(--color-danger-text)' : 'var(--color-accent)'}`,
          background: 'var(--color-surface)',
          color: 'var(--color-text)',
          outline: 'none',
        }}
      />
      {error && (
        <span style={{ color: 'var(--color-danger-text)', fontSize: 'var(--font-body)' }}>
          {typeof errorMessage === 'function' ? errorMessage(value) : errorMessage}
        </span>
      )}
    </div>
  );
}
