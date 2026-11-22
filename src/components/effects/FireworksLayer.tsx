import { useEffect, useRef } from 'react';
import { useConfettiFireworks, type CelebrationVariant } from '../../hooks/useConfettiFireworks';

export function FireworksLayer({ variant = 'win' }: { variant?: CelebrationVariant }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { fireCelebration } = useConfettiFireworks(canvasRef);

  useEffect(() => {
    return fireCelebration(variant);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    />
  );
}
