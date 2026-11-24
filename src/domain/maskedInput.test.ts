import { describe, expect, it } from 'vitest';
import { applyMaskedEdit } from './maskedInput';
import { formatCPF, maskCPF } from './validators/cpf';

function type(value: string, nextDisplay: (display: string) => string) {
  return applyMaskedEdit(value, maskCPF(value), nextDisplay(maskCPF(value)), formatCPF);
}

describe('applyMaskedEdit (CPF)', () => {
  it('appends a typed digit', () => {
    expect(type('123.45', (d) => d + '6')).toBe('123.456');
    expect(type('', (d) => d + '1')).toBe('1');
  });

  it('removes the last digit on backspace', () => {
    expect(type('123.456', (d) => d.slice(0, -1))).toBe('123.45');
  });

  it('removes a digit right after punctuation', () => {
    expect(type('123.4', (d) => d.slice(0, -1))).toBe('123');
    expect(type('123.456.789-0', (d) => d.slice(0, -1))).toBe('123.456.789');
  });

  it('ignores letters', () => {
    expect(type('123', (d) => d + 'a')).toBe('123');
  });

  it('stops at 11 digits', () => {
    expect(type('123.456.789-01', (d) => d + '9')).toBe('123.456.789-01');
  });

  it('clears everything when the whole text is deleted', () => {
    expect(type('123.456.789-01', () => '')).toBe('');
  });
});
