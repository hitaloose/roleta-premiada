import { describe, expect, it } from 'vitest';
import { splitLabel } from './wheelLabel';

describe('splitLabel', () => {
  it('mantém rótulos curtos numa linha', () => {
    expect(splitLabel('10% OFF')).toEqual(['10% OFF']);
    expect(splitLabel('Exatamente 14c')).toEqual(['Exatamente 14c']);
  });

  it('quebra rótulos longos no espaço mais próximo do meio', () => {
    expect(splitLabel('Vale-compra de R$ 100 na loja')).toEqual(['Vale-compra de', 'R$ 100 na loja']);
    expect(splitLabel('Brinde surpresa')).toEqual(['Brinde', 'surpresa']);
  });

  it('não quebra uma palavra só', () => {
    expect(splitLabel('Superextraordinário')).toEqual(['Superextraordinário']);
  });

  it('normaliza espaços repetidos e nas pontas', () => {
    expect(splitLabel('  Camiseta    exclusiva  ')).toEqual(['Camiseta', 'exclusiva']);
  });
});
