const countMaskable = (text: string) => text.replace(/[^0-9*]/g, '').length;

/**
 * Aplica ao valor real uma edição feita num input que mostra o valor
 * mascarado. Supõe edição sempre no fim (quiosque: só digitar e apagar):
 * se o texto encolheu, apaga do valor real tantos dígitos quantos sumiram;
 * se cresceu, anexa o que foi digitado no fim.
 */
export function applyMaskedEdit(
  prevValue: string,
  prevDisplay: string,
  nextDisplay: string,
  format: (raw: string) => string,
): string {
  const digits = prevValue.replace(/\D/g, '');
  if (nextDisplay.length < prevDisplay.length) {
    const removed = Math.max(1, countMaskable(prevDisplay) - countMaskable(nextDisplay));
    return format(digits.slice(0, Math.max(0, digits.length - removed)));
  }
  const typed = nextDisplay.startsWith(prevDisplay) ? nextDisplay.slice(prevDisplay.length) : '';
  return format(digits + typed);
}
