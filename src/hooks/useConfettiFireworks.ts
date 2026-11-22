import { useEffect, useRef } from 'react';
import confetti, { type CreateTypes } from 'canvas-confetti';
import { useConfig } from '../state/ConfigContext';

export function useConfettiFireworks(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const instanceRef = useRef<CreateTypes | null>(null);
  const COLORS = useConfig().brand.confettiColors;

  useEffect(() => {
    if (!canvasRef.current) return;
    instanceRef.current = confetti.create(canvasRef.current, { resize: true, useWorker: true });
    return () => {
      instanceRef.current?.reset();
      instanceRef.current = null;
    };
  }, [canvasRef]);

  function fireWinCelebration() {
    const fire = instanceRef.current;
    if (!fire) return;

    const duration = 4000;
    const end = Date.now() + duration;

    fire({ particleCount: 150, spread: 90, origin: { y: 0.6 }, colors: COLORS });

    (function frame() {
      fire({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors: COLORS });
      fire({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors: COLORS });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }

  return { fireWinCelebration };
}
