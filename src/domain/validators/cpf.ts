function calcCheckDigit(base: string, factorStart: number): number {
  let sum = 0;
  for (let i = 0; i < base.length; i++) {
    sum += parseInt(base[i], 10) * (factorStart - i);
  }
  const rest = (sum * 10) % 11;
  return rest === 10 ? 0 : rest;
}

export function isValidCPF(raw: string): boolean {
  const cpf = raw.replace(/\D/g, '');
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const d1 = calcCheckDigit(cpf.slice(0, 9), 10);
  const d2 = calcCheckDigit(cpf.slice(0, 10), 11);
  return d1 === parseInt(cpf[9], 10) && d2 === parseInt(cpf[10], 10);
}

export function formatCPF(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

/** Esconde com `*` todos os dígitos menos os 3 últimos, mantendo `.` e `-`. */
export function maskCPF(formatted: string): string {
  let toHide = Math.max(0, formatted.replace(/\D/g, '').length - 3);
  return formatted.replace(/\d/g, (digit) => {
    if (toHide === 0) return digit;
    toHide--;
    return '*';
  });
}
