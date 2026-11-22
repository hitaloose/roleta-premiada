import type { Prize } from '../../types/prize';

/**
 * Fatias da roleta. Cada fatia ocupa o mesmo espaço visual na roda
 * (360 / PRIZES.length graus) — `weight` afeta apenas a probabilidade
 * de sorteio, não o tamanho da fatia. `weight` é relativo entre os
 * itens, não precisa somar 100 (padrão é 1 quando omitido).
 *
 * A cor de cada fatia é definida pela posição (magenta/rosa alternados
 * em PrizeWheel), não por item aqui — só o texto e o resultado importam.
 *
 * Editar este array para configurar o evento: quantos prêmios,
 * quantas falhas, e a chance relativa de cada um. Mantenha `label`
 * curto (até ~8 caracteres) — com 6 fatias o espaço por fatia é
 * pequeno e textos longos estouram para fora da fatia.
 */
export const PRIZES: Prize[] = [
  { id: 'p1', label: '10% OFF', kind: 'win', weight: 3 },
  { id: 'f1', label: 'Não foi', kind: 'lose', weight: 5 },
  { id: 'p2', label: 'Brinde!', kind: 'win', weight: 2 },
  { id: 'f2', label: 'Quase!', kind: 'lose', weight: 5 },
  { id: 'p3', label: 'Fone BT', kind: 'super-win', weight: 1 },
  { id: 'f3', label: 'Falhou', kind: 'lose', weight: 5 },
];
