function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

/**
 * Calcula o ângulo final de rotação da roda (em graus, a partir de 0deg)
 * para que a fatia sorteada pare sob o ponteiro fixo no topo. O componente
 * de giro é montado do zero a cada rodada (0deg -> ângulo final numa única
 * transição CSS), então não há necessidade de acumular rotação entre
 * rodadas — `extraSpins` voltas completas garantem que a animação sempre
 * gira para frente antes de desacelerar até a fatia sorteada.
 */
export function computeFinalAngle(
  prizeIndex: number,
  totalSlices: number,
  extraSpins = 9,
): number {
  const sliceAngle = 360 / totalSlices;
  const targetCenter = prizeIndex * sliceAngle + sliceAngle / 2;
  const jitter = (Math.random() - 0.5) * (sliceAngle * 0.6);
  const finalWithinSlice = mod(360 - targetCenter + jitter, 360);

  return extraSpins * 360 + finalWithinSlice;
}
