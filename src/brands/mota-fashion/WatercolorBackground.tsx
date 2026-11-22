import { useMemo } from 'react';
import { publicAsset } from '../publicAsset';

/** Aquarela de fundo (em public/mota-fashion). Opções: bg1.JPG, bg2.JPG, bg3.JPG. */
const BACKGROUND_IMAGE = publicAsset('mota-fashion/bg2.JPG');

/** Coração em traço fino, no estilo dos ícones das artes da marca. viewBox 24x24. */
const HEART_PATH = 'M12 20.5C12 20.5 3 14.6 3 8.9 3 6 5.2 3.8 7.9 3.8c1.7 0 3.2.9 4.1 2.3.9-1.4 2.4-2.3 4.1-2.3C18.8 3.8 21 6 21 8.9c0 5.7-9 11.6-9 11.6z';

/**
 * Fundo ambiente da Mota Fashion: uma imagem de aquarela rosa cobrindo a
 * tela, com corações subindo por cima.
 */
export function WatercolorBackground() {
  const hearts = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 14 + Math.random() * 18,
        duration: 20 + Math.random() * 16,
        delay: -Math.random() * 30,
        tilt: -20 + Math.random() * 40,
        // Um em cada três é preenchido com o magenta da aquarela; o resto é só contorno.
        filled: i % 3 === 0,
      })),
    [],
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        backgroundImage: `url(${BACKGROUND_IMAGE})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {hearts.map((h) => (
        <span
          key={h.id}
          style={{
            position: 'absolute',
            bottom: '-5%',
            left: `${h.left}%`,
            opacity: 0,
            animation: `float-dust ${h.duration}s linear infinite`,
            animationDelay: `${h.delay}s`,
          }}
        >
          <svg
            width={h.size}
            height={h.size}
            viewBox="0 0 24 24"
            style={{ display: 'block', transform: `rotate(${h.tilt}deg)` }}
          >
            <path
              d={HEART_PATH}
              fill={h.filled ? 'var(--color-accent-soft)' : 'none'}
              stroke={h.filled ? 'none' : 'var(--color-accent)'}
              strokeWidth={1.3}
              strokeLinejoin="round"
            />
          </svg>
        </span>
      ))}
    </div>
  );
}
