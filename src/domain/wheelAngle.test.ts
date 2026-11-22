import { describe, expect, it, vi, afterEach } from 'vitest';
import { computeFinalAngle } from './wheelAngle';

describe('computeFinalAngle', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('always includes at least extraSpins full turns', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const angle = computeFinalAngle(0, 6, 6);
    expect(angle).toBeGreaterThanOrEqual(6 * 360);
    expect(angle).toBeLessThan(7 * 360);
  });

  it('lands within the target slice bounds (no jitter)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5); // jitter = 0
    const totalSlices = 6;
    const sliceAngle = 360 / totalSlices;
    const prizeIndex = 2;
    const angle = computeFinalAngle(prizeIndex, totalSlices, 4);
    const finalWithinSlice = angle % 360;
    const targetCenter = prizeIndex * sliceAngle + sliceAngle / 2;
    const expectedCenter = (360 - targetCenter + 360) % 360;
    expect(finalWithinSlice).toBeCloseTo(expectedCenter, 5);
  });
});
