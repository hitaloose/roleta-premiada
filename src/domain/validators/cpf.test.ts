import { describe, expect, it } from 'vitest';
import { formatCPF, isValidCPF, maskCPF } from './cpf';

describe('isValidCPF', () => {
  it('accepts known valid CPFs', () => {
    expect(isValidCPF('529.982.247-25')).toBe(true);
    expect(isValidCPF('52998224725')).toBe(true);
  });

  it('rejects CPFs with wrong check digits', () => {
    expect(isValidCPF('529.982.247-26')).toBe(false);
  });

  it('rejects all-same-digit CPFs', () => {
    expect(isValidCPF('111.111.111-11')).toBe(false);
    expect(isValidCPF('000.000.000-00')).toBe(false);
  });

  it('rejects wrong length', () => {
    expect(isValidCPF('123.456.789')).toBe(false);
    expect(isValidCPF('')).toBe(false);
  });
});

describe('formatCPF', () => {
  it('formats progressively while typing', () => {
    expect(formatCPF('529')).toBe('529');
    expect(formatCPF('529982')).toBe('529.982');
    expect(formatCPF('529982247')).toBe('529.982.247');
    expect(formatCPF('52998224725')).toBe('529.982.247-25');
  });
});

describe('maskCPF', () => {
  it('shows up to 3 digits unmasked', () => {
    expect(maskCPF('')).toBe('');
    expect(maskCPF('12')).toBe('12');
    expect(maskCPF('123')).toBe('123');
  });

  it('hides all but the last 3 digits while typing', () => {
    expect(maskCPF('123.4')).toBe('*23.4');
    expect(maskCPF('123.456.7')).toBe('***.*56.7');
  });

  it('masks a complete CPF', () => {
    expect(maskCPF('123.456.789-01')).toBe('***.***.**9-01');
  });
});
