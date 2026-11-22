export function weightedDraw<T extends { weight?: number }>(items: T[]): { item: T; index: number } {
  const weights = items.map((i) => i.weight ?? 1);
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;

  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return { item: items[i], index: i };
  }

  const lastIndex = items.length - 1;
  return { item: items[lastIndex], index: lastIndex };
}
