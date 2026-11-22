import { useMemo } from 'react';

const TILE_W = 128;
const TILE_H = 168;
const PETAL_LEN = 17;
const PETAL_BULGE = 8;
const LEAF_BULGE = 11;
const NODES: Array<[number, number]> = [
  [TILE_W / 2, TILE_H / 2],
  [0, 0],
  [TILE_W, 0],
  [0, TILE_H],
  [TILE_W, TILE_H],
];

/** Folha/pétala pontiaguda (vesica) entre dois pontos — o motivo clássico da treliça mourisca/gótica. */
function leafSegment(x1: number, y1: number, x2: number, y2: number, bulge: number): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const len = Math.hypot(x2 - x1, y2 - y1);
  const nx = (-(y2 - y1) / len) * bulge;
  const ny = ((x2 - x1) / len) * bulge;
  const x1s = x1.toFixed(2);
  const y1s = y1.toFixed(2);
  const x2s = x2.toFixed(2);
  const y2s = y2.toFixed(2);
  return `M ${x1s} ${y1s} Q ${(mx + nx).toFixed(2)} ${(my + ny).toFixed(2)} ${x2s} ${y2s} Q ${(mx - nx).toFixed(2)} ${(my - ny).toFixed(2)} ${x1s} ${y1s}`;
}

/** Quadrifólio: 4 pétalas pontiagudas irradiando do nó, alinhadas com as linhas verticais/diagonais. */
function quatrefoil(cx: number, cy: number): string {
  const dirs: Array<[number, number]> = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  return dirs.map(([dx, dy]) => leafSegment(cx, cy, cx + dx * PETAL_LEN, cy + dy * PETAL_LEN, PETAL_BULGE)).join(' ');
}

const [CENTER, TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT] = NODES;
const LATTICE_PATH = [
  // linhas verticais ligando os nós de cada coluna
  `M ${CENTER[0]} 0 L ${CENTER[0]} ${TILE_H}`,
  `M 0 0 L 0 ${TILE_H}`,
  `M ${TILE_W} 0 L ${TILE_W} ${TILE_H}`,
  // folhas pontiagudas ligando o nó central às quatro diagonais
  leafSegment(...CENTER, ...TOP_LEFT, LEAF_BULGE),
  leafSegment(...CENTER, ...TOP_RIGHT, LEAF_BULGE),
  leafSegment(...CENTER, ...BOTTOM_LEFT, LEAF_BULGE),
  leafSegment(...CENTER, ...BOTTOM_RIGHT, LEAF_BULGE),
].join(' ');

const PETALS_PATH = NODES.map(([x, y]) => quatrefoil(x, y)).join(' ');

/**
 * Fundo ambiente do totem: uma treliça de quadrifólios com arcos ogivais
 * (referência a papéis de parede/têxteis árabes) que deriva bem devagar,
 * mais partículas douradas subindo como um incenso/perfume — tudo CSS/SVG
 * puro, sem canvas nem timers, pois roda o evento inteiro sem pesar a máquina.
 */
export function ArabesqueBackground() {
  const particles = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 3 + Math.random() * 5,
        duration: 18 + Math.random() * 16,
        delay: -Math.random() * 30,
      })),
    [],
  );

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      <svg
        width="140%"
        height="140%"
        style={{
          position: 'absolute',
          top: '-20%',
          left: '-20%',
          opacity: 0.12,
          animation: 'arabesque-drift 90s ease-in-out infinite',
        }}
      >
        <defs>
          <pattern id="arabesque-trellis" width={TILE_W} height={TILE_H} patternUnits="userSpaceOnUse">
            <path d={LATTICE_PATH} fill="none" stroke="var(--color-accent)" strokeWidth={1} />
            <path d={PETALS_PATH} fill="none" stroke="var(--color-accent)" strokeWidth={1} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#arabesque-trellis)" />
      </svg>

      {particles.map((p) => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            bottom: '-5%',
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: 'var(--color-accent)',
            boxShadow: '0 0 6px 1px var(--color-accent)',
            opacity: 0,
            animation: `float-dust ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
