import type { ReactNode } from 'react';
import { useElementSize } from '../../hooks/useElementSize';

// As lâmpadas ficam em 1,04r e têm ~2,6% do diâmetro, então passam ~7% do tamanho da roda.
const LIGHTS_OVERFLOW = 1.08;

type WheelStageProps = {
  title: ReactNode;
  footer?: ReactNode;
  /** Recebe o maior diâmetro que cabe entre o título e o rodapé. */
  children: (size: number) => ReactNode;
};

/**
 * Tela da roleta em tela cheia: título colado no topo, rodapé embaixo e a
 * roleta do maior tamanho que couber no meio. Título e rodapé têm altura
 * fixa, para a roleta ter exatamente o mesmo tamanho na IdleScreen e na
 * SpinningScreen e não "pular" quando o giro começa.
 */
export function WheelStage({ title, footer, children }: WheelStageProps) {
  const { ref, width, height } = useElementSize<HTMLDivElement>();
  const size = Math.floor(Math.min(width, height) / LIGHTS_OVERFLOW);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: 'calc(100cqw - 2 * var(--space-lg))',
        height: 'calc(100cqh - 2 * var(--space-md))',
      }}
    >
      <div
        style={{
          height: 'calc(var(--font-hero) * 1.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        {title}
      </div>
      <div
        ref={ref}
        style={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {size > 0 && children(size)}
      </div>
      <div style={{ height: 'calc(var(--font-hint) * 1.4 + var(--space-md))', display: 'flex', alignItems: 'flex-end' }}>
        {footer}
      </div>
    </div>
  );
}
