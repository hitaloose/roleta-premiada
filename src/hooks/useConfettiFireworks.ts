import { useEffect, useRef } from 'react';
import confetti, { type CreateTypes } from 'canvas-confetti';
import { useConfig } from '../state/ConfigContext';

export type CelebrationVariant = 'win' | 'super';

const instances = new WeakMap<HTMLCanvasElement, CreateTypes>();

const SUPER_GOLD = ['#FFD700', '#FFF3B0', '#FFB300', '#FFFFFF'];

export function useConfettiFireworks(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const instanceRef = useRef<CreateTypes | null>(null);
  const COLORS = useConfig().brand.confettiColors;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let instance = instances.get(canvas);
    if (!instance) {
      // Tamanho de layout (sem a rotação do RotatedViewport). O `resize: true` do
      // canvas-confetti usa getBoundingClientRect, que devolve a caixa já girada
      // (largura/altura trocadas) e estica o confete. O layer é montado a cada
      // vitória, então medir aqui basta. Depois do confetti.create o canvas vai
      // para o worker e não pode mais ser redimensionado, por isso a instância
      // é reaproveitada se o effect rodar de novo (StrictMode).
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      instance = confetti.create(canvas, { resize: false, useWorker: true });
      instances.set(canvas, instance);
    }
    instanceRef.current = instance;
    return () => {
      instance.reset();
      instanceRef.current = null;
    };
  }, [canvasRef]);

  /** Dispara a comemoração; devolve um cleanup que interrompe os disparos pendentes. */
  function fireCelebration(variant: CelebrationVariant = 'win'): () => void {
    const fire = instanceRef.current;
    if (!fire) return () => {};
    let raf = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    if (variant === 'win') {
      const end = Date.now() + 4000;
      fire({ particleCount: 150, spread: 90, origin: { y: 0.6 }, colors: COLORS });
      (function frame() {
        fire({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors: COLORS });
        fire({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors: COLORS });
        if (Date.now() < end) raf = requestAnimationFrame(frame);
      })();
    } else {
      // Super prêmio: explosão inicial, fogos em pontos aleatórios, chuva
      // dourada de cima e canhões laterais densos, por ~8 s.
      const end = Date.now() + 8000;
      const colors = [...COLORS, ...SUPER_GOLD];
      fire({ particleCount: 260, spread: 160, startVelocity: 60, origin: { y: 0.55 }, colors, scalar: 1.3 });
      fire({ particleCount: 120, spread: 360, startVelocity: 45, origin: { x: 0.5, y: 0.4 }, colors: SUPER_GOLD, shapes: ['star'], scalar: 1.6 });

      const burst = () => {
        fire({
          particleCount: 70 + Math.floor(Math.random() * 50),
          spread: 360,
          startVelocity: 30 + Math.random() * 20,
          ticks: 90,
          gravity: 0.7,
          origin: { x: 0.1 + Math.random() * 0.8, y: 0.1 + Math.random() * 0.45 },
          colors,
          shapes: Math.random() < 0.5 ? ['star'] : ['circle'],
          scalar: 1.2,
        });
        if (Date.now() < end) timers.push(setTimeout(burst, 220 + Math.random() * 120));
      };
      timers.push(setTimeout(burst, 300));

      (function frame() {
        fire({ particleCount: 7, angle: 60, spread: 60, startVelocity: 70, origin: { x: 0, y: 0.8 }, colors });
        fire({ particleCount: 7, angle: 120, spread: 60, startVelocity: 70, origin: { x: 1, y: 0.8 }, colors });
        fire({
          particleCount: 2,
          angle: 270,
          spread: 30,
          startVelocity: 8,
          gravity: 0.6,
          origin: { x: Math.random(), y: -0.05 },
          colors: SUPER_GOLD,
          shapes: ['star'],
        });
        if (Date.now() < end) raf = requestAnimationFrame(frame);
      })();
    }

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
    };
  }

  return { fireCelebration };
}
