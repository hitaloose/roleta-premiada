import { useEffect, useRef } from 'react';
import { TIMEOUTS } from '../../config/timing';
import { PrizeWheel } from '../wheel/PrizeWheel';
import { WheelStage } from '../wheel/WheelStage';
import { computeFinalAngle } from '../../domain/wheelAngle';
import { pickLoseMessage } from '../../domain/loseMessage';
import { useMachineDispatch, useMachineState } from '../../state/MachineContext';
import { useConfig } from '../../state/ConfigContext';
import { startSpinSound, type SpinSound } from '../../audio/sounds';

export function SpinningScreen() {
  const state = useMachineState();
  const dispatch = useMachineDispatch();
  const { brand, prizes } = useConfig();
  const targetAngleRef = useRef<number | null>(null);
  const spinSoundRef = useRef<SpinSound | null>(null);

  // Um som de giro sorteado por rodada; para quando a roleta para ou a tela sai.
  useEffect(() => {
    const sound = startSpinSound();
    spinSoundRef.current = sound;
    return () => sound.stop();
  }, []);

  if (state.status !== 'spinning') return null;

  if (targetAngleRef.current === null) {
    targetAngleRef.current = computeFinalAngle(state.prizeIndex, prizes.length);
  }

  function handleSpinEnd() {
    if (state.status !== 'spinning') return;
    spinSoundRef.current?.stop();
    const message =
      state.prize.kind === 'lose' ? pickLoseMessage(brand.loseMessages, state.lastLoseMessage ?? undefined) : undefined;
    dispatch({ type: 'SPIN_DONE', message });
  }

  const targetAngle = targetAngleRef.current;

  return (
    <WheelStage
      title={
        <h2 className="font-display" style={{ fontSize: 'var(--font-title)', margin: 0 }}>
          {state.entrant ? `Boa sorte, ${state.entrant.name}! 🎡` : 'Boa sorte! 🎡'}
        </h2>
      }
    >
      {(size) => (
        <PrizeWheel
          prizes={prizes}
          mode="spin"
          size={size}
          targetAngle={targetAngle}
          durationMs={TIMEOUTS.SPIN_DURATION_MS}
          onSpinEnd={handleSpinEnd}
          onSliceCross={(speed) => spinSoundRef.current?.tick(speed)}
        />
      )}
    </WheelStage>
  );
}
