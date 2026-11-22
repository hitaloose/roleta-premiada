import { useEffect, useRef } from 'react';
import { useConfettiFireworks } from '../../hooks/useConfettiFireworks';

export function FireworksLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { fireWinCelebration } = useConfettiFireworks(canvasRef);

  useEffect(() => {
    fireWinCelebration();
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
