/**
 * Quebra um rótulo de fatia em até duas linhas. Rótulos de até `maxChars`
 * caracteres ficam numa linha só; os maiores quebram no espaço mais próximo
 * do meio, para as duas linhas ficarem com tamanhos parecidos. Sem espaço
 * (uma palavra só), fica numa linha e a fonte é reduzida por quem desenha.
 */
export function splitLabel(label: string, maxChars = 14): [string] | [string, string] {
  const text = label.trim().replace(/\s+/g, ' ');
  if (text.length <= maxChars) return [text];

  const middle = text.length / 2;
  let best = -1;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === ' ' && (best === -1 || Math.abs(i - middle) < Math.abs(best - middle))) best = i;
  }
  if (best === -1) return [text];
  return [text.slice(0, best), text.slice(best + 1)];
}
