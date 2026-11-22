import { useEffect, useMemo, useState } from 'react';
import type { EntryRecord } from '../types/entry';
import type { Prize } from '../types/prize';
import { entriesToCsv, mergeEntries, normalizeCpf, parseEntriesCsv } from '../domain/entriesCsv';

const STORAGE_KEY = 'roleta-premiada:entries';

function readEntries(): EntryRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as EntryRecord[]) : [];
  } catch {
    return [];
  }
}

/** Retorna false se o localStorage estiver cheio/indisponível. */
function writeEntries(entries: EntryRecord[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return true;
  } catch {
    return false;
  }
}

export type ImportResult = { added: number; skipped: number };

/**
 * Log completo de participantes (ganhadores e perdedores), usado para
 * bloquear CPF repetido e para exportar os dados ao final do evento.
 * Diferente de `useWinnersStorage`, que guarda só ganhadores para o
 * ticker visual e é limitado a 200 itens.
 *
 * `saveFailed` fica true enquanto a última gravação tiver falhado — os
 * registros seguem em memória, mas somem ao recarregar se não forem
 * exportados.
 */
export function useEntriesStorage() {
  const [entries, setEntries] = useState<EntryRecord[]>(readEntries);
  const [saveFailed, setSaveFailed] = useState(false);

  const usedCpfs = useMemo(() => new Set(entries.map((e) => e.cpfDigits)), [entries]);

  // Pede ao Chrome para não apagar os dados do site quando o disco ficar
  // cheio. O Chrome decide sozinho (sem prompt) e pode negar.
  useEffect(() => {
    navigator.storage
      ?.persist?.()
      .then((granted) => console.info(`[storage] armazenamento persistente: ${granted ? 'concedido' : 'negado'}`))
      .catch(() => {});
  }, []);

  function save(next: EntryRecord[]) {
    setEntries(next);
    setSaveFailed(!writeEntries(next));
  }

  function isCpfUsed(cpf: string): boolean {
    if (import.meta.env.DEV) return false;
    return usedCpfs.has(normalizeCpf(cpf));
  }

  function addEntry(entry: Omit<EntryRecord, 'cpfDigits'>) {
    save([{ ...entry, cpfDigits: normalizeCpf(entry.cpf) }, ...entries]);
  }

  function exportCSV() {
    const blob = new Blob(['﻿' + entriesToCsv(entries)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `roleta-premiada-participantes-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Junta os participantes de um CSV exportado aos atuais, sem duplicar.
   * `prizes` (itens do tema ativo) recupera se cada ganhador foi 'win' ou
   * 'super-win'. Lança erro se o arquivo for inválido.
   */
  async function importCSV(file: File, prizes: Prize[]): Promise<ImportResult> {
    const { entries: imported, skipped } = parseEntriesCsv(await file.text(), prizes);
    const { merged, added } = mergeEntries(entries, imported);
    if (added > 0) save(merged);
    return { added, skipped };
  }

  /** Apaga todos os participantes (e libera os CPFs). */
  function clearEntries() {
    save([]);
  }

  return { entries, addEntry, isCpfUsed, exportCSV, importCSV, clearEntries, saveFailed };
}
