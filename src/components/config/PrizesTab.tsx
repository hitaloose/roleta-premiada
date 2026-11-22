import { useState } from 'react';
import type { Prize, PrizeKind } from '../../types/prize';
import { MIN_PRIZES, prizeChances, sanitizePrizes } from '../../config/appConfig';
import { useConfig } from '../../state/ConfigContext';

/** Acima disso o texto tende a estourar a fatia (com ~6 fatias). */
const LABEL_WARN_LENGTH = 8;

const KIND_LABELS: Record<PrizeKind, string> = {
  win: 'Prêmio',
  'super-win': 'Prêmio especial',
  lose: 'Não ganhou',
};

/** Linha em edição: o peso fica como texto enquanto a pessoa digita. */
type DraftRow = { id: string; label: string; kind: PrizeKind; weight: string };

let idCounter = 0;
const newId = () => `item-${Date.now().toString(36)}-${idCounter++}`;

const toDraft = (prizes: Prize[]): DraftRow[] =>
  prizes.map((p) => ({ id: p.id, label: p.label, kind: p.kind, weight: String(p.weight ?? 1) }));

const parseWeight = (raw: string) => Number(raw.replace(',', '.'));

/**
 * Editor dos itens da roleta do tema ativo. Só é montado quando a aba é
 * aberta, para as probabilidades não ficarem na tela por padrão.
 */
export function PrizesTab() {
  const { config, brand, prizes, updateConfig } = useConfig();
  const [rows, setRows] = useState<DraftRow[]>(() => toDraft(prizes));
  const [msg, setMsg] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);

  const weights = rows.map((r) => parseWeight(r.weight));
  const chances = prizeChances(weights.map((w) => ({ weight: Number.isFinite(w) ? w : 0 })));
  const winChance = chances.reduce((sum, c, i) => (rows[i].kind === 'lose' ? sum : sum + c), 0);
  const isDirty = JSON.stringify(rows) !== JSON.stringify(toDraft(prizes));
  const isCustom = brand.id in config.prizesByBrand;

  function updateRow(index: number, patch: Partial<DraftRow>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
    setMsg(null);
  }

  function move(index: number, delta: number) {
    setRows((prev) => {
      const next = [...prev];
      const [row] = next.splice(index, 1);
      next.splice(index + delta, 0, row);
      return next;
    });
    setMsg(null);
  }

  function save() {
    const candidate = rows.map((r) => ({ id: r.id, label: r.label.trim(), kind: r.kind, weight: parseWeight(r.weight) }));
    const clean = sanitizePrizes(candidate);
    if (!clean) {
      setMsg({
        tone: 'error',
        text: `Revise os itens: são necessários pelo menos ${MIN_PRIZES}, todos com nome e peso maior que zero.`,
      });
      return;
    }
    const ok = updateConfig({ prizesByBrand: { ...config.prizesByBrand, [brand.id]: clean } });
    setRows(toDraft(clean));
    setMsg(ok ? { tone: 'ok', text: 'Itens salvos. A roleta já usa os novos itens.' } : { tone: 'error', text: 'Não foi possível salvar no navegador.' });
  }

  function restoreDefault() {
    const { [brand.id]: _removed, ...rest } = config.prizesByBrand;
    const ok = updateConfig({ prizesByBrand: rest });
    setRows(toDraft(brand.prizes));
    setMsg(ok ? { tone: 'ok', text: `Itens padrão do tema ${brand.name} restaurados.` } : { tone: 'error', text: 'Não foi possível salvar no navegador.' });
  }

  return (
    <section className="cfg-card">
      <h2>Itens da roleta: {brand.name}</h2>
      <p className="cfg-hint">
        Todas as fatias têm o mesmo tamanho na roda; o peso muda só a chance de sorteio. Os itens são salvos por tema.
        {isCustom ? ' Este tema está usando itens editados.' : ' Este tema está usando os itens padrão.'}
      </p>

      <div className="cfg-table-wrap" style={{ maxHeight: 'none' }}>
        <table className="cfg-table">
          <thead>
            <tr>
              <th>Ordem</th>
              <th style={{ width: '40%' }}>Texto na fatia</th>
              <th>Tipo</th>
              <th className="cfg-num">Peso</th>
              <th className="cfg-num">Chance</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const weightInvalid = !(weights[i] > 0);
              return (
                <tr key={row.id}>
                  <td>
                    <div className="cfg-row" style={{ gap: 4, flexWrap: 'nowrap' }}>
                      <button
                        type="button"
                        className="cfg-btn cfg-btn-small"
                        aria-label="Mover para cima"
                        disabled={i === 0}
                        onClick={() => move(i, -1)}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="cfg-btn cfg-btn-small"
                        aria-label="Mover para baixo"
                        disabled={i === rows.length - 1}
                        onClick={() => move(i, 1)}
                      >
                        ↓
                      </button>
                    </div>
                  </td>
                  <td>
                    <input
                      className="cfg-input"
                      type="text"
                      value={row.label}
                      aria-label="Texto na fatia"
                      aria-invalid={!row.label.trim()}
                      onChange={(e) => updateRow(i, { label: e.target.value })}
                    />
                    {row.label.trim().length > LABEL_WARN_LENGTH && (
                      <div className="cfg-msg cfg-msg-warn" style={{ margin: '4px 0 0' }}>
                        Texto longo: pode não caber na fatia.
                      </div>
                    )}
                  </td>
                  <td>
                    <select
                      className="cfg-input"
                      value={row.kind}
                      aria-label="Tipo"
                      onChange={(e) => updateRow(i, { kind: e.target.value as PrizeKind })}
                    >
                      {(Object.keys(KIND_LABELS) as PrizeKind[]).map((kind) => (
                        <option key={kind} value={kind}>
                          {KIND_LABELS[kind]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="cfg-num">
                    <input
                      className="cfg-input"
                      type="text"
                      inputMode="decimal"
                      value={row.weight}
                      aria-label="Peso"
                      aria-invalid={weightInvalid}
                      style={{ width: 80, textAlign: 'right', borderColor: weightInvalid ? 'var(--cfg-danger)' : undefined }}
                      onChange={(e) => updateRow(i, { weight: e.target.value })}
                    />
                  </td>
                  <td className="cfg-num">{chances[i].toFixed(1)}%</td>
                  <td>
                    <button
                      type="button"
                      className="cfg-btn cfg-btn-small"
                      disabled={rows.length <= MIN_PRIZES}
                      onClick={() => {
                        setRows((prev) => prev.filter((_, j) => j !== i));
                        setMsg(null);
                      }}
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="cfg-hint" style={{ marginTop: 12 }}>
        Chance total de ganhar algum prêmio: <strong>{winChance.toFixed(1)}%</strong>. &quot;Prêmio especial&quot; também
        entra na lista de últimos ganhadores.
      </p>

      {rows.length % 2 === 1 && (
        <p className="cfg-msg cfg-msg-warn" style={{ marginBottom: 12 }}>
          Com número ímpar de itens, a primeira e a última fatia ficam com a mesma cor, lado a lado.
        </p>
      )}

      <div className="cfg-row">
        <button
          type="button"
          className="cfg-btn"
          onClick={() => {
            setRows((prev) => [...prev, { id: newId(), label: '', kind: 'win', weight: '1' }]);
            setMsg(null);
          }}
        >
          Adicionar item
        </button>
        <button type="button" className="cfg-btn" onClick={restoreDefault}>
          Restaurar padrão do tema
        </button>
        <button
          type="button"
          className="cfg-btn"
          disabled={!isDirty}
          onClick={() => {
            setRows(toDraft(prizes));
            setMsg(null);
          }}
          style={{ marginLeft: 'auto' }}
        >
          Descartar alterações
        </button>
        <button type="button" className="cfg-btn cfg-btn-primary" disabled={!isDirty} onClick={save}>
          Salvar itens
        </button>
      </div>
      {msg && <p className={`cfg-msg cfg-msg-${msg.tone}`}>{msg.text}</p>}
    </section>
  );
}
