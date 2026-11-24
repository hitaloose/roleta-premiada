import type { ReactNode } from 'react';
import { useElementSize } from '../../hooks/useElementSize';
import { useConfig } from '../../state/ConfigContext';

// As lâmpadas ficam em 1,04r e têm ~2,6% do diâmetro, então passam ~7% do tamanho da roda.
const LIGHTS_OVERFLOW = 1.08;

// Abaixo disso a faixa de baixo não comporta a logo grande (TV em paisagem):
// ela volta para o canto inferior direito, no tamanho `brand.logo.width`.
const MIN_LOGO_BAND_PX = 80;

type WheelStageProps = {
  title: ReactNode;
  /** Chamada logo acima da roleta, na altura dos olhos. */
  hint?: ReactNode;
  /** Recebe o maior diâmetro que cabe abaixo do título e da chamada. */
  children: (size: number) => ReactNode;
};

/**
 * Tela da roleta em tela cheia, pensada para a TV de pé: título centralizado
 * no espaço de cima, chamada colada acima da roleta, roleta no centro e a
 * logo grande no espaço de baixo. As faixas de cima e de baixo dividem a
 * sobra por igual, então a roleta fica exatamente no meio quando sobra
 * espaço. Título e chamada têm altura fixa, para a roleta ter o mesmo
 * tamanho e posição na IdleScreen e na SpinningScreen e não "pular" quando o
 * giro começa.
 */
export function WheelStage({ title, hint, children }: WheelStageProps) {
  const { brand } = useConfig();
  const stage = useElementSize<HTMLDivElement>();
  const titleBox = useElementSize<HTMLDivElement>();
  const hintBox = useElementSize<HTMLDivElement>();
  const bottomBand = useElementSize<HTMLDivElement>();

  const available = Math.min(stage.width, stage.height - titleBox.height - hintBox.height);
  const size = Math.max(0, Math.floor(available / LIGHTS_OVERFLOW));
  const logoBelow = bottomBand.height >= MIN_LOGO_BAND_PX;

  return (
    <div
      ref={stage.ref}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: 'calc(100cqw - 2 * var(--space-lg))',
        height: 'calc(100cqh - 2 * var(--space-md))',
        // Título grande do palco: com a TV de pé quem manda é a largura
        // (13cqw); em paisagem a altura (9cqh) segura para não comer a roleta.
        ['--font-stage-title' as string]: 'min(13cqw, 9cqh)',
      }}
    >
      <div style={{ flex: '1 1 0', width: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            ref={titleBox.ref}
            style={{
              height: 'calc(var(--font-stage-title) * 1.25)',
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
        </div>
        <div
          ref={hintBox.ref}
          style={{
            height: 'calc(var(--font-title) * 1.4 + var(--space-sm))',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            fontSize: 'var(--font-title)',
          }}
        >
          {hint}
        </div>
      </div>

      <div
        style={{
          flexShrink: 0,
          height: size * LIGHTS_OVERFLOW,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {size > 0 && children(size)}
      </div>

      <div
        ref={bottomBand.ref}
        style={{
          flex: '1 1 0',
          minHeight: 0,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {logoBelow && (
          <img
            src={brand.logo.src}
            alt=""
            style={{ height: '70%', maxWidth: '60%', objectFit: 'contain' }}
          />
        )}
      </div>

      {!logoBelow && (
        <img
          src={brand.logo.src}
          alt=""
          style={{
            position: 'fixed',
            right: 'var(--space-md)',
            bottom: 'var(--space-md)',
            width: brand.logo.width,
            height: 'auto',
          }}
        />
      )}
    </div>
  );
}
