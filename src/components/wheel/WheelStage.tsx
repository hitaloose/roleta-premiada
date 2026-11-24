import type { ReactNode } from 'react';
import { useElementSize } from '../../hooks/useElementSize';
import { useConfig } from '../../state/ConfigContext';

// As lâmpadas ficam em 1,04r e têm ~2,6% do diâmetro, então passam ~7% do tamanho da roda.
const LIGHTS_OVERFLOW = 1.08;

// Abaixo disso a faixa de baixo não comporta a logo grande: ela vai para o
// canto inferior direito, no tamanho `brand.logo.width`.
const MIN_LOGO_BAND_PX = 80;

type WheelStageProps = {
  title: ReactNode;
  /** Chamada "Aperte...": acima da roleta com a TV de pé, abaixo dela na horizontal. */
  hint?: ReactNode;
  /** Recebe o maior diâmetro que cabe junto com o título e a chamada. */
  children: (size: number) => ReactNode;
};

/**
 * Tela da roleta em tela cheia, com dois arranjos conforme a tela:
 *
 * - **TV de pé** (mais alta que larga): título grande centralizado no espaço
 *   de cima, chamada colada acima da roleta (altura dos olhos), roleta no
 *   centro e a logo grande no espaço de baixo.
 * - **TV na horizontal**: título no topo, roleta no meio, chamada embaixo e a
 *   logo pequena no canto.
 *
 * As faixas de cima e de baixo dividem a sobra por igual, então a roleta fica
 * no meio. Título e chamada têm altura fixa, para a roleta ter o mesmo tamanho
 * e posição na IdleScreen e na SpinningScreen e não "pular" quando o giro
 * começa.
 */
export function WheelStage(props: WheelStageProps) {
  const { brand } = useConfig();
  const stage = useElementSize<HTMLDivElement>();
  const portrait = stage.height > stage.width;
  const titleSize = brand.stage?.titleSize ?? (portrait ? 'min(13cqw, 9cqh)' : 'var(--font-hero)');

  return (
    <div
      ref={stage.ref}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: 'calc(100cqw - 2 * var(--space-lg))',
        height: 'calc(100cqh - 2 * var(--space-md))',
        // De pé quem manda é a largura (13cqw); na horizontal volta ao título padrão.
        ['--font-stage-title' as string]: titleSize,
      }}
    >
      {/* key: as medições internas recomeçam quando a orientação muda. */}
      <StageBody
        key={portrait ? 'portrait' : 'landscape'}
        {...props}
        hint={brand.stage?.hideHint ? undefined : props.hint}
        portrait={portrait}
        stageWidth={stage.width}
        stageHeight={stage.height}
      />
    </div>
  );
}

type StageBodyProps = WheelStageProps & { portrait: boolean; stageWidth: number; stageHeight: number };

function StageBody({ title, hint, children, portrait, stageWidth, stageHeight }: StageBodyProps) {
  const { brand } = useConfig();
  const titleBox = useElementSize<HTMLDivElement>();
  const hintBox = useElementSize<HTMLDivElement>();
  const bottomBand = useElementSize<HTMLDivElement>();

  // A roleta fica no centro: as faixas de cima e de baixo têm a mesma altura,
  // então reserva duas vezes a mais alta (título + chamada de pé; de deitado,
  // título em cima e chamada embaixo).
  const topHeight = titleBox.height + (portrait ? hintBox.height : 0);
  const bottomHeight = portrait ? 0 : hintBox.height;
  const available = Math.min(stageWidth, stageHeight - 2 * Math.max(topHeight, bottomHeight));
  const size = Math.max(0, Math.floor(available / LIGHTS_OVERFLOW));
  const logoBelow = portrait && bottomBand.height >= MIN_LOGO_BAND_PX;

  const titleRow = (
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
  );

  const hintRow = hint && (
    <div
      ref={hintBox.ref}
      style={
        portrait
          ? {
              height: 'calc(var(--font-title) * 1.4 + var(--space-sm))',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              fontSize: 'var(--font-title)',
            }
          : {
              height: 'calc(var(--font-hint) * 1.4 + var(--space-md))',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              fontSize: 'var(--font-hint)',
            }
      }
    >
      {hint}
    </div>
  );

  return (
    <>
      <div
        style={{
          flex: '1 1 0',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {portrait ? (
          <>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{titleRow}</div>
            {hintRow}
          </>
        ) : (
          titleRow
        )}
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
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: portrait ? 'center' : 'flex-end',
        }}
      >
        {!portrait && hintRow}
        {logoBelow && (
          <img src={brand.logo.src} alt="" style={{ height: '70%', maxWidth: '60%', objectFit: 'contain' }} />
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
    </>
  );
}
