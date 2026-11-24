import { PrizeWheel } from '../wheel/PrizeWheel';
import { WheelStage } from '../wheel/WheelStage';
import { KeyHint } from '../ui/KeyHint';
import { useConfig } from '../../state/ConfigContext';

/**
 * Tela inicial: nome da marca no espaço de cima, chamada logo acima da roleta
 * (altura dos olhos com a TV de pé), roleta no centro e a logo embaixo — tudo
 * posicionado pelo WheelStage. A lista de últimos ganhadores (WinnersTicker)
 * está oculta neste layout.
 */
export function IdleScreen() {
  const { brand, prizes, config } = useConfig();
  return (
    <WheelStage
      title={
        <h1
          className="font-display stage-title"
          data-text={brand.name}
          style={{ fontSize: 'var(--font-stage-title)', textTransform: 'uppercase', margin: 0 }}
        >
          {brand.name}
        </h1>
      }
      hint={
        <KeyHint style={{ marginTop: 0, fontSize: 'inherit' }}>
          {config.collectData ? 'Aperte ESPAÇO para começar' : 'Aperte ENTER para girar'}
        </KeyHint>
      }
    >
      {(size) => <PrizeWheel prizes={prizes} mode="idle" size={size} />}
    </WheelStage>
  );
}
