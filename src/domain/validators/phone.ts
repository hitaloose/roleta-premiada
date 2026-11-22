export function isValidPhoneBR(raw: string): boolean {
  const digits = raw.replace(/\D/g, '');
  return /^\d{2}9?\d{8}$/.test(digits);
}

export function formatPhoneBR(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return digits.replace(/(\d*)/, '($1');
  if (digits.length <= 6) return digits.replace(/(\d{2})(\d*)/, '($1) $2');
  if (digits.length <= 10) return digits.replace(/(\d{2})(\d{4})(\d*)/, '($1) $2-$3');
  return digits.replace(/(\d{2})(\d{5})(\d*)/, '($1) $2-$3');
}
