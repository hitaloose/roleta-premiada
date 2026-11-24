import { useEffect, useRef, useState } from 'react';
import { applyMaskedEdit } from '../../domain/maskedInput';

type FormFieldProps = {
  label: string;
  placeholder: string;
  format?: (raw: string) => string;
  /** Mostra o valor mascarado (ex.: CPF com `*`); o valor real continua no estado. */
  mask?: (value: string) => string;
  validate: (value: string) => boolean;
  errorMessage: string | ((value: string) => string);
  onSubmit: (value: string) => void;
  onKeystroke?: () => void;
};

export function FormField({
  label,
  placeholder,
  format,
  mask,
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

  const display = mask ? mask(value) : value;

  // Com máscara a edição só funciona no fim do texto: mantém o cursor lá.
  function keepCaretAtEnd() {
    const input = inputRef.current;
    if (!mask || !input) return;
    const end = input.value.length;
    if (input.selectionStart !== end || input.selectionEnd !== end) input.setSelectionRange(end, end);
  }

  function handleChange(raw: string) {
    setError(false);
    const identity = (text: string) => text;
    if (mask) setValue(applyMaskedEdit(value, display, raw, format ?? identity));
    else setValue(format ? format(raw) : raw);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', width: 'min(90cqw, 560px)' }}>
      <label style={{ fontSize: 'var(--font-title)', color: 'var(--color-text)' }}>{label}</label>
      <input
        ref={inputRef}
        value={display}
        placeholder={placeholder}
        onChange={(e) => handleChange(e.target.value)}
        onSelect={keepCaretAtEnd}
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
