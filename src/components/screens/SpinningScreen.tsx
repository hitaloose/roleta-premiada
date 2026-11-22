import { useRef } from 'react';
import { brand } from '../../brands';
import { TIMEOUTS } from '../../config/timing';
import { PrizeWheel } from '../wheel/PrizeWheel';
import { WheelStage } from '../wheel/WheelStage';
import { computeFinalAngle } from '../../domain/wheelAngle';
import { pickLoseMessage } from '../../domain/loseMessage';
import { useMachineDispatch, useMachineState } from '../../state/MachineContext';

export function SpinningScreen() {
  const state = useMachineState();
  const dispatch = useMachineDispatch();
  const targetAngleRef = useRef<number | null>(null);

  if (state.status !== 'spinning') return null;

  if (targetAngleRef.current === null) {
    targetAngleRef.current = computeFinalAngle(state.prizeIndex, brand.prizes.length);
  }

  function handleSpinEnd() {
    if (state.status !== 'spinning') return;
    const message =
      state.prize.kind === 'lose' ? pickLoseMessage(state.lastLoseMessage ?? undefined) : undefined;
    dispatch({ type: 'SPIN_DONE', message });
  }

  const targetAngle = targetAngleRef.current;

  return (
    <WheelStage
      title={
        <h2 className="font-display" style={{ fontSize: 'var(--font-title)', margin: 0 }}>
          Boa sorte, {state.entrant.name}! 🎡
        </h2>
      }
    >
      {(size) => (
        <PrizeWheel
          prizes={brand.prizes}
          mode="spin"
          size={size}
          targetAngle={targetAngle}
          durationMs={TIMEOUTS.SPIN_DURATION_MS}
          onSpinEnd={handleSpinEnd}
        />
      )}
    </WheelStage>
  );
}
