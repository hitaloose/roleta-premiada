import type { EntryRecord } from '../types/entry';
import type { Prize, PrizeKind } from '../types/prize';

const HEADER = ['nome', 'telefone', 'cpf', 'premio', 'resultado', 'data_hora'] as const;
const REQUIRED_COLUMNS = ['nome', 'cpf', 'data_hora'] as const;

export function normalizeCpf(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

function toCsvField(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export function entriesToCsv(entries: EntryRecord[]): string {
  const rows = entries.map((e) =>
    [e.name, e.phone, e.cpf, e.prizeLabel, e.outcome === 'lose' ? 'perdeu' : 'ganhou', e.enteredAt].map(toCsvField),
  );
  return [HEADER.map(toCsvField), ...rows].map((row) => row.join(',')).join('\r\n');
}

/** Parser de CSV (RFC 4180): campos entre aspas, `""` escapado, vírgula/quebra de linha dentro de aspas. */
function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((value) => value.trim() !== ''));
}

/**
 * O CSV exportado só diz "ganhou"/"perdeu"; o `kind` exato ('win' ou
 * 'super-win') é recuperado pelo nome do prêmio na lista da marca.
 */
function outcomeFrom(result: string, prizeLabel: string, prizes: Prize[]): PrizeKind {
  if (result.trim().toLowerCase() === 'perdeu') return 'lose';
  const prize = prizes.find((p) => p.label === prizeLabel && p.kind !== 'lose');
  return prize?.kind ?? 'win';
}

export type ParsedEntries = { entries: EntryRecord[]; skipped: number };

/** Lê um CSV no formato de `entriesToCsv`. Lança erro se faltar uma coluna obrigatória. */
export function parseEntriesCsv(text: string, prizes: Prize[]): ParsedEntries {
  const [header, ...rows] = parseCsvRows(text.replace(/^﻿/, ''));
  const columns = (header ?? []).map((name) => name.trim().toLowerCase());
  const missing = REQUIRED_COLUMNS.filter((name) => !columns.includes(name));
  if (missing.length > 0) {
    throw new Error(`CSV sem a(s) coluna(s): ${missing.join(', ')}`);
  }

  const entries: EntryRecord[] = [];
  let skipped = 0;
  for (const row of rows) {
    const get = (name: (typeof HEADER)[number]) => (row[columns.indexOf(name)] ?? '').trim();
    const cpfDigits = normalizeCpf(get('cpf'));
    const enteredAt = get('data_hora');
    if (!get('nome') || !cpfDigits || Number.isNaN(Date.parse(enteredAt))) {
      skipped++;
      continue;
    }
    entries.push({
      name: get('nome'),
      phone: get('telefone'),
      cpf: get('cpf'),
      cpfDigits,
      prizeLabel: get('premio'),
      outcome: outcomeFrom(get('resultado'), get('premio'), prizes),
      enteredAt,
    });
  }
  return { entries, skipped };
}

/**
 * Junta registros importados aos atuais sem duplicar: o mesmo CPF no
 * mesmo `enteredAt` é o mesmo registro (ex.: importar o backup duas vezes).
 * Resultado ordenado do mais recente para o mais antigo, como no storage.
 */
export function mergeEntries(current: EntryRecord[], imported: EntryRecord[]): { merged: EntryRecord[]; added: number } {
  const keyOf = (e: EntryRecord) => `${e.cpfDigits}|${e.enteredAt}`;
  const seen = new Set(current.map(keyOf));
  const fresh: EntryRecord[] = [];
  for (const entry of imported) {
    const key = keyOf(entry);
    if (seen.has(key)) continue;
    seen.add(key);
    fresh.push(entry);
  }
  const merged = [...current, ...fresh].sort((a, b) => Date.parse(b.enteredAt) - Date.parse(a.enteredAt));
  return { merged, added: fresh.length };
}
