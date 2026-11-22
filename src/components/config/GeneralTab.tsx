import { useState } from 'react';
import { BRANDS } from '../../brands';
import {
  ATTRACT_TEXT_MAX,
  DEFAULT_ATTRACT,
  PIN_PATTERN,
  sanitizeAttractText,
  type AttractConfig,
  type ScreenRotation,
} from '../../config/appConfig';
import { playResult, previewSpinSound } from '../../audio/sounds';
import { unlockAudio } from '../../audio/engine';
import { submitOnEnter } from './submitOnEnter';
import { useConfig } from '../../state/ConfigContext';

const ROTATION_OPTIONS: { value: ScreenRotation; label: string }[] = [
  { value: 0, label: 'Paisagem (0°)' },
  { value: 90, label: 'Vertical – girar para a direita (90°)' },
  { value: 270, label: 'Vertical – girar para a esquerda (270°)' },
  { value: 180, label: 'Invertida (180°)' },
];

type Msg = { tone: 'ok' | 'error'; text: string } | null;

const SOUND_PREVIEWS: { label: string; play: () => void }[] = [
  { label: 'Giro (aleatório)', play: previewSpinSound },
  { label: 'Prêmio', play: () => playResult('win') },
  { label: 'Super prêmio', play: () => playResult('super-win') },
  { label: 'Falha', play: () => playResult('lose') },
];

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
        <h2>Orientação da tela</h2>
        <p className="cfg-hint">
          Use quando a TV estiver montada na vertical e o computador continuar em paisagem. A tela gira na hora: escolha
          a opção em que o texto fica de pé.
        </p>
        <div className="cfg-choice" role="radiogroup" aria-label="Orientação da tela">
          {ROTATION_OPTIONS.map((o) => (
            <label key={o.value}>
              <input
                type="radio"
                name="rotation"
                checked={config.rotation === o.value}
                onChange={() => update({ rotation: o.value }, `Orientação alterada para ${o.label}.`)}
              />
              {o.label}
            </label>
          ))}
        </div>
      </section>

      <section className="cfg-card">
        <h2>Coleta de dados</h2>
        <p className="cfg-hint">
          Ligada: cada participante informa nome, telefone e CPF antes de girar, e tudo fica salvo. Desligada: ENTER (ou
          ESPAÇO) na tela inicial já gira a roleta e mostra o prêmio, sem pedir nem salvar nada.
        </p>
        <label className="cfg-row">
          <input
            type="checkbox"
            checked={config.collectData}
            onChange={(e) =>
              update(
                { collectData: e.target.checked },
                e.target.checked ? 'Coleta de dados ligada.' : 'Coleta de dados desligada: ENTER gira direto.',
              )
            }
          />
          Pedir nome, telefone e CPF
        </label>
      </section>

      <section className="cfg-card">
        <h2>Sons</h2>
        <p className="cfg-hint">
          Som do giro (sorteado a cada rodada entre várias opções), do prêmio, do super prêmio e da falha.
        </p>
        <label className="cfg-row">
          <input
            type="checkbox"
            checked={config.soundEnabled}
            onChange={(e) =>
              update({ soundEnabled: e.target.checked }, e.target.checked ? 'Sons ligados.' : 'Sons desligados.')
            }
          />
          Tocar sons
        </label>
        <div className="cfg-row" style={{ marginTop: 12, flexWrap: 'wrap' }}>
          {SOUND_PREVIEWS.map((p) => (
            <button
              key={p.label}
              type="button"
              className="cfg-btn"
              disabled={!config.soundEnabled}
              onClick={() => {
                unlockAudio();
                p.play();
              }}
            >
              ▶ {p.label}
            </button>
          ))}
        </div>
      </section>

      <AttractSettings
        value={config.attract}
        onSave={(attract, text) => update({ attract }, text)}
      />

      <section className="cfg-card">
        <h2>Validação de CPF</h2>
        {!config.collectData && (
          <p className="cfg-msg cfg-msg-warn">Sem efeito enquanto a coleta de dados estiver desligada.</p>
        )}
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

function AttractSettings({
  value,
  onSave,
}: {
  value: AttractConfig;
  onSave: (attract: AttractConfig, okText: string) => void;
}) {
  const [title, setTitle] = useState(value.title);
  const [subtitle, setSubtitle] = useState(value.subtitle);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next = {
      enabled: value.enabled,
      title: sanitizeAttractText(title, DEFAULT_ATTRACT.title),
      subtitle: sanitizeAttractText(subtitle, DEFAULT_ATTRACT.subtitle),
    };
    setTitle(next.title);
    setSubtitle(next.subtitle);
    onSave(next, 'Textos da chamada salvos.');
  }

  return (
    <form className="cfg-card" onSubmit={handleSubmit}>
      <h2>Chamada na tela inicial</h2>
      <p className="cfg-hint">
        Título grande e subtítulo piscando no centro da tela inicial, por cima da roleta (ex.: "Girou, ganhou!" /
        "Participe grátis").
      </p>
      <label className="cfg-row">
        <input
          type="checkbox"
          checked={value.enabled}
          onChange={(e) =>
            onSave(
              { ...value, enabled: e.target.checked },
              e.target.checked ? 'Chamada ligada.' : 'Chamada desligada.',
            )
          }
        />
        Mostrar a chamada piscante
      </label>
      <div className="cfg-row" style={{ marginTop: 12, flexWrap: 'wrap' }}>
        <input
          className="cfg-input"
          type="text"
          aria-label="Título"
          placeholder="Título"
          maxLength={ATTRACT_TEXT_MAX}
          onKeyDown={submitOnEnter}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="cfg-input"
          type="text"
          aria-label="Subtítulo"
          placeholder="Subtítulo"
          maxLength={ATTRACT_TEXT_MAX}
          onKeyDown={submitOnEnter}
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
        />
        <button
          type="submit"
          className="cfg-btn"
          disabled={title.trim() === value.title && subtitle.trim() === value.subtitle}
        >
          Salvar textos
        </button>
      </div>
    </form>
  );
}
