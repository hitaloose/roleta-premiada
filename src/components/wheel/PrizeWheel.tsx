import { useEffect, useRef, useState } from 'react';
import type { Prize } from '../../types/prize';
import { WheelSlice } from './WheelSlice';
import { WheelPointer } from './WheelPointer';
import { WheelLights } from './WheelLights';

const SLICE_COLORS = ['var(--color-wine)', 'var(--color-surface)'];
const SLICE_TEXT_COLORS = ['var(--color-wine-text)', 'var(--color-text)'];

type PrizeWheelProps = {
  prizes: Prize[];
  size?: number;
} & (
  | { mode: 'idle' }
  | {
      mode: 'spin';
      targetAngle: number;
      durationMs: number;
      onSpinEnd: () => void;
      /** A cada fatia que passa pelo ponteiro (som de tic). `speed` de 0 a 1. */
      onSliceCross?: (speed: number) => void;
    }
);

/** Velocidade (graus/s) tratada como 1 no `speed` do onSliceCross: perto do pico do giro. */
const MAX_SPEED_DEG_S = 2400;
/** Intervalo mínimo entre tics, para não virar um zumbido no começo do giro. */
const MIN_TICK_INTERVAL_MS = 28;

function currentAngle(node: Element): number {
  const transform = getComputedStyle(node).transform;
  if (!transform || transform === 'none') return 0;
  const m = new DOMMatrixReadOnly(transform);
  return (Math.atan2(m.b, m.a) * 180) / Math.PI;
}

export function PrizeWheel(props: PrizeWheelProps) {
  const { prizes, size = 520 } = props;
  const radius = size / 2;
  const groupRef = useRef<SVGGElement>(null);
  const [rotation, setRotation] = useState(0);
  const firedRef = useRef(false);

  const isSpin = props.mode === 'spin';
  const propsRef = useRef(props.mode === 'spin' ? props : null);
  propsRef.current = props.mode === 'spin' ? props : null;

  useEffect(() => {
    if (!isSpin) return;
    firedRef.current = false;
    let raf2 = 0;
    // duas rAF garantem que o navegador pinte o frame em 0deg antes de
    // aplicar o alvo, senão a transição CSS pode "pular" sem animar.
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setRotation(props.targetAngle));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpin]);

  useEffect(() => {
    if (!isSpin) return;
    const node = groupRef.current;
    const onEnd = () => {
      if (firedRef.current) return;
      firedRef.current = true;
      props.onSpinEnd();
    };
    node?.addEventListener('transitionend', onEnd);
    const fallback = setTimeout(onEnd, props.durationMs + 800);
    return () => {
      node?.removeEventListener('transitionend', onEnd);
      clearTimeout(fallback);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpin]);

  // Acompanha o ângulo real da transição CSS para tocar o tic sincronizado
  // com cada fatia que cruza o ponteiro.
  const sliceCount = prizes.length;
  useEffect(() => {
    if (!isSpin) return;
    const node = groupRef.current;
    if (!node) return;
    const sliceAngle = 360 / sliceCount;
    let raf = 0;
    let last = currentAngle(node);
    let lastTime = performance.now();
    let total = 0;
    let lastSlice = 0;
    let lastTickAt = 0;
    const loop = (now: number) => {
      const angle = currentAngle(node);
      const delta = ((angle - last + 540) % 360) - 180;
      last = angle;
      total += Math.max(0, delta);
      const dt = Math.max(1, now - lastTime);
      lastTime = now;
      const slice = Math.floor(total / sliceAngle);
      if (slice !== lastSlice && now - lastTickAt >= MIN_TICK_INTERVAL_MS) {
        lastSlice = slice;
        lastTickAt = now;
        const speed = (Math.max(0, delta) / dt) * 1000;
        propsRef.current?.onSliceCross?.(Math.min(1, speed / MAX_SPEED_DEG_S));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [isSpin, sliceCount]);

  const style = isSpin
    ? {
        transform: `rotate(${rotation}deg)`,
        transition: `transform ${props.durationMs}ms cubic-bezier(0.15, 0.85, 0.35, 1)`,
      }
    : { animation: 'idle-spin 14s linear infinite' };

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <WheelLights size={size} spinning={isSpin} />
      <WheelPointer />
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g ref={groupRef} style={{ transformOrigin: `${radius}px ${radius}px`, ...style }}>
          {prizes.map((prize, index) => (
            <WheelSlice
              key={prize.id}
              index={index}
              total={prizes.length}
              color={SLICE_COLORS[index % 2]}
              textColor={SLICE_TEXT_COLORS[index % 2]}
              label={prize.label}
              radius={radius}
            />
          ))}
          <circle
            cx={radius}
            cy={radius}
            r={radius * 0.08}
            fill="var(--color-accent)"
            stroke="var(--color-wine-deep)"
            strokeWidth={2}
          />
        </g>
        {/* aro estático (não gira com as fatias), emoldurando a borda como uma roleta de verdade */}
        <circle
          cx={radius}
          cy={radius}
          r={radius * 0.965}
          fill="none"
          stroke="var(--color-wine-deep)"
          strokeWidth={radius * 0.075}
        />
        <circle cx={radius} cy={radius} r={radius * 0.93} fill="none" stroke="var(--color-accent)" strokeWidth={radius * 0.012} />
      </svg>
    </div>
  );
}
