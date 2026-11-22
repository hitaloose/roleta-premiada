import { useState } from 'react';
import { PIN_PATTERN } from '../../config/appConfig';
import { submitOnEnter } from './submitOnEnter';

type PinGateProps = {
  /** PIN salvo, ou `null` no primeiro acesso (aí o PIN é criado aqui). */
  pin: string | null;
  onCreatePin: (pin: string) => void;
  onUnlock: () => void;
  onExit: () => void;
};

export function PinGate({ pin, onCreatePin, onUnlock, onExit }: PinGateProps) {
  const [value, setValue] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const creating = pin === null;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (creating) {
      if (!PIN_PATTERN.test(value)) return setError('O PIN deve ter de 4 a 8 números.');
      if (value !== confirm) return setError('Os dois PINs não são iguais.');
      onCreatePin(value);
      onUnlock();
      return;
    }
    if (value === pin) {
      onUnlock();
    } else {
      setError('PIN incorreto.');
      setValue('');
    }
  }

  const digitsOnly = (raw: string) => raw.replace(/\D/g, '').slice(0, 8);

  return (
    <div className="cfg-gate">
      <form className="cfg-card" onSubmit={handleSubmit}>
        <h2>{creating ? 'Criar PIN da equipe' : 'Área da equipe'}</h2>
        <p className="cfg-hint">
          {creating
            ? 'Primeiro acesso: escolha um PIN de 4 a 8 números. Ele será pedido sempre que alguém abrir as configurações.'
            : 'Digite o PIN para abrir as configurações.'}
        </p>
        <input
          className="cfg-input"
          type="text"
          inputMode="numeric"
          data-pin
          onKeyDown={submitOnEnter}
          autoComplete="off"
          autoFocus
          placeholder="PIN"
          value={value}
          onChange={(e) => {
            setValue(digitsOnly(e.target.value));
            setError(null);
          }}
        />
        {creating && (
          <input
            className="cfg-input"
            type="text"
            inputMode="numeric"
            data-pin
            onKeyDown={submitOnEnter}
            autoComplete="off"
            placeholder="Repita o PIN"
            value={confirm}
            onChange={(e) => {
              setConfirm(digitsOnly(e.target.value));
              setError(null);
            }}
          />
        )}
        {error && <p className="cfg-msg cfg-msg-error">{error}</p>}
        <div className="cfg-row" style={{ marginTop: 12, justifyContent: 'space-between' }}>
          <button type="button" className="cfg-btn" onClick={onExit}>
            Voltar para a roleta
          </button>
          <button type="submit" className="cfg-btn cfg-btn-primary">
            {creating ? 'Criar e entrar' : 'Entrar'}
          </button>
        </div>
      </form>
    </div>
  );
}
