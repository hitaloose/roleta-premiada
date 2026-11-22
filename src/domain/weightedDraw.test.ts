import { describe, expect, it, vi, afterEach } from 'vitest';
import { weightedDraw } from './weightedDraw';

describe('weightedDraw', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('picks the first item when random lands in its weight range', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const items = [{ weight: 1 }, { weight: 1 }];
    expect(weightedDraw(items).index).toBe(0);
  });

  it('picks the last item when random lands at the top of the range', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999999);
    const items = [{ weight: 1 }, { weight: 1 }];
    expect(weightedDraw(items).index).toBe(1);
  });

  it('respects relative weights over many draws', () => {
    vi.spyOn(Math, 'random').mockRestore();
    const items = [{ weight: 9 }, { weight: 1 }];
    let firstCount = 0;
    const trials = 5000;
    for (let i = 0; i < trials; i++) {
      if (weightedDraw(items).index === 0) firstCount++;
    }
    const ratio = firstCount / trials;
    expect(ratio).toBeGreaterThan(0.8);
    expect(ratio).toBeLessThan(1);
  });

  it('defaults missing weight to 1', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.6);
    const items = [{ weight: 1 }, {}];
    expect(weightedDraw(items).index).toBe(1);
  });
});
