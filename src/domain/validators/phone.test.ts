import { describe, expect, it } from 'vitest';
import { formatPhoneBR, isValidPhoneBR } from './phone';

describe('isValidPhoneBR', () => {
  it('accepts an 11-digit mobile number with DDD', () => {
    expect(isValidPhoneBR('(11) 99999-8888')).toBe(true);
    expect(isValidPhoneBR('11999998888')).toBe(true);
  });

  it('accepts a 10-digit landline number with DDD', () => {
    expect(isValidPhoneBR('(11) 3333-4444')).toBe(true);
  });

  it('rejects too few or too many digits', () => {
    expect(isValidPhoneBR('123456789')).toBe(false);
    expect(isValidPhoneBR('123456789012')).toBe(false);
  });
});

describe('formatPhoneBR', () => {
  it('formats progressively while typing a mobile number', () => {
    expect(formatPhoneBR('11')).toBe('(11');
    expect(formatPhoneBR('1199999')).toBe('(11) 9999-9');
    expect(formatPhoneBR('11999998888')).toBe('(11) 99999-8888');
  });

  it('formats a 10-digit landline number', () => {
    expect(formatPhoneBR('1133334444')).toBe('(11) 3333-4444');
  });
});
