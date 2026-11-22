import { useMemo } from 'react';

type WheelLightsProps = {
  size: number;
  spinning: boolean;
  count?: number;
};

/** Aro de lâmpadas (estilo espelho de camarim) em volta da roleta. */
export function WheelLights({ size, spinning, count = 24 }: WheelLightsProps) {
  const radius = size / 2;
  const bulbRingRadius = radius * 1.04;
  const bulbSize = Math.max(8, size * 0.026);

  const bulbs = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angleRad = ((360 / count) * i - 90) * (Math.PI / 180);
        return {
          id: i,
          x: radius + bulbRingRadius * Math.cos(angleRad),
          y: radius + bulbRingRadius * Math.sin(angleRad),
          // Lâmpadas alternadas disparam a animação meio ciclo defasadas
          // uma da outra, criando o efeito clássico de "luz correndo".
          delay: (i % 2) * 0.22,
          twinkleDelay: (i * 0.37) % 3,
        };
      }),
    [count, radius, bulbRingRadius],
  );

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {bulbs.map((b) => (
        <span
          key={b.id}
          style={{
            position: 'absolute',
            left: b.x - bulbSize / 2,
            top: b.y - bulbSize / 2,
            width: bulbSize,
            height: bulbSize,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 30%, var(--color-bulb-highlight), var(--color-accent) 55%, var(--color-wine-deep) 100%)',
            boxShadow: '0 0 5px 1.5px var(--color-bulb-glow)',
            animation: spinning
              ? `bulb-blink 0.45s steps(1, end) infinite`
              : `bulb-twinkle 2.8s ease-in-out infinite`,
            animationDelay: spinning ? `${b.delay}s` : `${b.twinkleDelay}s`,
          }}
        />
      ))}
    </div>
  );
}
