import { useState } from 'react';
import { BRANDS } from '../../brands';
import { PIN_PATTERN } from '../../config/appConfig';
import { submitOnEnter } from './submitOnEnter';
import { useConfig } from '../../state/ConfigContext';

type Msg = { tone: 'ok' | 'error'; text: string } | null;

export function GeneralTab() {
  const { config, updateConfig } = useConfig();
  const [saveMsg, setSaveMsg] = useState<Msg>(null);

  function update(patch: Parameters<typeof updateConfig>[0], okText: string) {
    const ok = updateConfig(patch);
    setSaveMsg(ok ? { tone: 'ok', text: okText } : { tone: 'error', text: 'Não foi possível salvar no navegador.' });
  }

  return (
    <>
      <section className="cfg-card">
        <h2>Tema</h2>
        <p className="cfg-hint">Cores, fontes, logo, fundo e mensagens de derrota da roleta.</p>
        <div className="cfg-choice" role="radiogroup" aria-label="Tema">
          {BRANDS.map((b) => (
            <label key={b.id}>
              <input
                type="radio"
                name="brand"
                checked={config.brandId === b.id}
                onChange={() => update({ brandId: b.id }, `Tema alterado para ${b.name}.`)}
              />
              {b.name}
            </label>
          ))}
        </div>
      </section>

      <section className="cfg-card">
        <h2>Validação de CPF</h2>
        <p className="cfg-hint">
          Ligada: o CPF precisa ser válido e cada CPF só pode girar uma vez. Desligada: o CPF continua sendo pedido, mas
          qualquer número é aceito e pode repetir.
        </p>
        <label className="cfg-row">
          <input
            type="checkbox"
            checked={config.validateCpf}
            onChange={(e) =>
              update(
                { validateCpf: e.target.checked },
                e.target.checked ? 'Validação de CPF ligada.' : 'Validação de CPF desligada.',
              )
            }
          />
          Validar CPF e bloquear repetidos
        </label>
      </section>

      <ChangePin onSave={(pin) => update({ pin }, 'PIN alterado.')} />

      {saveMsg && <p className={`cfg-msg cfg-msg-${saveMsg.tone}`}>{saveMsg.text}</p>}
    </>
  );
}

function ChangePin({ onSave }: { onSave: (pin: string) => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!PIN_PATTERN.test(pin)) return setError('O PIN deve ter de 4 a 8 números.');
    onSave(pin);
    setPin('');
    setError(null);
  }

  return (
    <form className="cfg-card" onSubmit={handleSubmit}>
      <h2>PIN da equipe</h2>
      <p className="cfg-hint">Pedido para abrir esta tela (atalho Ctrl+Shift+K na tela inicial da roleta).</p>
      <div className="cfg-row">
        <input
          className="cfg-input"
          type="text"
          inputMode="numeric"
          data-pin
          onKeyDown={submitOnEnter}
          autoComplete="off"
          placeholder="Novo PIN"
          value={pin}
          onChange={(e) => {
            setPin(e.target.value.replace(/\D/g, '').slice(0, 8));
            setError(null);
          }}
        />
        <button type="submit" className="cfg-btn" disabled={!pin}>
          Trocar PIN
        </button>
      </div>
      {error && <p className="cfg-msg cfg-msg-error">{error}</p>}
    </form>
  );
}
