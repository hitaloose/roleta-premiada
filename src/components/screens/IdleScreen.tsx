import { brand } from '../../brands';
import { PrizeWheel } from '../wheel/PrizeWheel';
import { WheelStage } from '../wheel/WheelStage';
import { KeyHint } from '../ui/KeyHint';

/**
 * Layout para TV na horizontal: nome da marca no topo, roleta do maior
 * tamanho possível no meio e a logo pequena no canto inferior direito. A
 * lista de últimos ganhadores (WinnersTicker) está oculta neste layout.
 */
export function IdleScreen() {
  return (
    <>
      <WheelStage
        title={
          <h1 className="font-display" style={{ fontSize: 'var(--font-hero)', textTransform: 'uppercase', margin: 0 }}>
            {brand.name}
          </h1>
        }
        footer={<KeyHint>Aperte ESPAÇO para começar</KeyHint>}
      >
        {(size) => <PrizeWheel prizes={brand.prizes} mode="idle" size={size} />}
      </WheelStage>
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
    </>
  );
}
