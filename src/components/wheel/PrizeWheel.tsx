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
  | { mode: 'spin'; targetAngle: number; durationMs: number; onSpinEnd: () => void }
);

export function PrizeWheel(props: PrizeWheelProps) {
  const { prizes, size = 520 } = props;
  const radius = size / 2;
  const groupRef = useRef<SVGGElement>(null);
  const [rotation, setRotation] = useState(0);
  const firedRef = useRef(false);

  const isSpin = props.mode === 'spin';

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
