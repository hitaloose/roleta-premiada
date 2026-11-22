import { describe, expect, it } from 'vitest';
import { entriesToCsv, mergeEntries, parseEntriesCsv } from './entriesCsv';
import type { EntryRecord } from '../types/entry';
import type { Prize } from '../types/prize';

const PRIZES: Prize[] = [
  { id: 'p1', label: '10% OFF', kind: 'win' },
  { id: 'f1', label: 'Não foi', kind: 'lose' },
  { id: 'p3', label: 'Fone BT', kind: 'super-win' },
];

function entry(overrides: Partial<EntryRecord> = {}): EntryRecord {
  return {
    name: 'Maria Silva',
    phone: '(11) 99999-8888',
    cpf: '123.456.789-09',
    cpfDigits: '12345678909',
    prizeLabel: '10% OFF',
    outcome: 'win',
    enteredAt: '2026-10-24T15:00:00.000Z',
    ...overrides,
  };
}

describe('parseEntriesCsv', () => {
  it('round-trips the exported CSV, including the BOM and quoted fields', () => {
    const entries = [
      entry({ name: 'Ana "Aninha", da Silva', prizeLabel: 'Fone BT', outcome: 'super-win' }),
      entry({ cpf: '987.654.321-00', cpfDigits: '98765432100', prizeLabel: 'Não foi', outcome: 'lose' }),
    ];
    const { entries: parsed, skipped } = parseEntriesCsv('﻿' + entriesToCsv(entries), PRIZES);
    expect(parsed).toEqual(entries);
    expect(skipped).toBe(0);
  });

  it('falls back to "win" when a winning prize label is not in the brand list', () => {
    const csv = entriesToCsv([entry({ prizeLabel: 'Prêmio antigo' })]);
    expect(parseEntriesCsv(csv, PRIZES).entries[0].outcome).toBe('win');
  });

  it('skips rows without name, CPF or a valid date', () => {
    const csv = entriesToCsv([entry(), entry({ name: '' }), entry({ cpf: '', cpfDigits: '' }), entry({ enteredAt: 'ontem' })]);
    const { entries, skipped } = parseEntriesCsv(csv, PRIZES);
    expect(entries).toHaveLength(1);
    expect(skipped).toBe(3);
  });

  it('rejects a file missing required columns', () => {
    expect(() => parseEntriesCsv('nome,telefone\nMaria,11999998888', PRIZES)).toThrow(/cpf, data_hora/);
  });
});

describe('mergeEntries', () => {
  it('adds only new records and keeps newest first', () => {
    const older = entry({ enteredAt: '2026-10-23T10:00:00.000Z' });
    const newer = entry({ cpfDigits: '98765432100', enteredAt: '2026-10-24T18:00:00.000Z' });
    const current = [entry()];
    const { merged, added } = mergeEntries(current, [entry(), older, newer]);
    expect(added).toBe(2);
    expect(merged.map((e) => e.enteredAt)).toEqual([newer.enteredAt, current[0].enteredAt, older.enteredAt]);
  });
});
