import { useRef, useState } from 'react';
import type { EntryRecord } from '../../types/entry';
import type { ImportResult } from '../../hooks/useEntriesStorage';

type ParticipantsTabProps = {
  entries: EntryRecord[];
  saveFailed: boolean;
  onExport: () => void;
  onImport: (file: File) => Promise<ImportResult>;
  onClearData: () => void;
};

type Msg = { tone: 'ok' | 'error'; text: string } | null;

const CONFIRM_WORD = 'ZERAR';

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ParticipantsTab({ entries, saveFailed, onExport, onImport, onClearData }: ParticipantsTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<Msg>(null);
  const [clearing, setClearing] = useState(false);

  const winners = entries.filter((e) => e.outcome !== 'lose').length;

  async function handleImportFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const { added, skipped } = await onImport(file);
      const skippedText = skipped > 0 ? ` (${skipped} linha(s) inválida(s) ignorada(s))` : '';
      setMsg({ tone: 'ok', text: `Importação concluída: ${added} participante(s) novo(s)${skippedText}.` });
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'arquivo inválido';
      setMsg({ tone: 'error', text: `Falha ao importar: ${reason}.` });
    }
  }

  return (
    <>
      {saveFailed && (
        <p className="cfg-msg cfg-msg-error" role="alert">
          Os dados não estão sendo salvos no navegador. Exporte agora.
        </p>
      )}

      <div className="cfg-stats">
        <div className="cfg-stat">
          <strong>{entries.length}</strong>
          <span>participantes</span>
        </div>
        <div className="cfg-stat">
          <strong>{winners}</strong>
          <span>ganharam</span>
        </div>
        <div className="cfg-stat">
          <strong>{entries.length - winners}</strong>
          <span>não ganharam</span>
        </div>
      </div>

      <section className="cfg-card">
        <h2>Dados</h2>
        <p className="cfg-hint">
          Os dados ficam só neste navegador. Exporte ao fim de cada dia. Importar soma os participantes do arquivo aos
          atuais, sem duplicar.
        </p>
        <div className="cfg-row">
          <button type="button" className="cfg-btn cfg-btn-primary" onClick={onExport}>
            Exportar CSV
          </button>
          <button type="button" className="cfg-btn" onClick={() => fileInputRef.current?.click()}>
            Importar CSV
          </button>
          <button
            type="button"
            className="cfg-btn cfg-btn-danger"
            onClick={() => setClearing(true)}
            style={{ marginLeft: 'auto' }}
          >
            Zerar dados
          </button>
        </div>
        {msg && <p className={`cfg-msg cfg-msg-${msg.tone}`}>{msg.text}</p>}
        <input ref={fileInputRef} type="file" accept=".csv,text/csv" hidden onChange={handleImportFile} />
      </section>

      <section className="cfg-card">
        <h2>Quem já rodou</h2>
        {entries.length === 0 ? (
          <p className="cfg-hint">Ninguém participou ainda.</p>
        ) : (
          <div className="cfg-table-wrap">
            <table className="cfg-table">
              <thead>
                <tr>
                  <th>Data/hora</th>
                  <th>Nome</th>
                  <th>Telefone</th>
                  <th>CPF</th>
                  <th>Prêmio</th>
                  <th>Resultado</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={`${e.cpfDigits}|${e.enteredAt}`}>
                    <td>{formatDateTime(e.enteredAt)}</td>
                    <td>{e.name}</td>
                    <td>{e.phone}</td>
                    <td>{e.cpf}</td>
                    <td>{e.prizeLabel}</td>
                    <td>
                      <span className={`cfg-badge ${e.outcome === 'lose' ? 'cfg-badge-lose' : 'cfg-badge-win'}`}>
                        {e.outcome === 'lose' ? 'perdeu' : 'ganhou'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {clearing && (
        <ClearDataModal
          total={entries.length}
          onCancel={() => setClearing(false)}
          onConfirm={(exportFirst) => {
            if (exportFirst) onExport();
            onClearData();
            setClearing(false);
            setMsg({ tone: 'ok', text: 'Dados zerados.' });
          }}
        />
      )}
    </>
  );
}

function ClearDataModal({
  total,
  onCancel,
  onConfirm,
}: {
  total: number;
  onCancel: () => void;
  onConfirm: (exportFirst: boolean) => void;
}) {
  const [typed, setTyped] = useState('');
  const confirmed = typed.trim().toUpperCase() === CONFIRM_WORD;

  return (
    <div className="cfg-modal-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="cfg-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cfg-clear-title"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === 'Escape' && onCancel()}
      >
        <h2 id="cfg-clear-title">Zerar todos os dados?</h2>
        <p className="cfg-hint">
          Apaga os {total} participante(s) e a lista de ganhadores deste navegador e libera todos os CPFs. Isso não pode
          ser desfeito. Recomendado: exporte antes.
        </p>
        <label className="cfg-hint" htmlFor="cfg-clear-input">
          Digite <strong>{CONFIRM_WORD}</strong> para confirmar:
        </label>
        <input
          id="cfg-clear-input"
          className="cfg-input"
          type="text"
          autoFocus
          autoComplete="off"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          style={{ width: '100%', margin: '6px 0 14px' }}
        />
        <div className="cfg-row" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="cfg-btn" onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className="cfg-btn cfg-btn-danger" disabled={!confirmed} onClick={() => onConfirm(false)}>
            Zerar
          </button>
          <button type="button" className="cfg-btn cfg-btn-primary" disabled={!confirmed} onClick={() => onConfirm(true)}>
            Exportar e zerar
          </button>
        </div>
      </div>
    </div>
  );
}
