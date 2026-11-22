import { useEffect, useRef } from 'react';
import { useMachineDispatch, useMachineState } from '../../state/MachineContext';
import { useAutoTimeout } from '../../hooks/useAutoTimeout';
import { FireworksLayer } from '../effects/FireworksLayer';
import { SuperWinBackdrop } from '../effects/SuperWinBackdrop';
import { KeyHint } from '../ui/KeyHint';
import { TIMEOUTS } from '../../config/timing';
import type { Winner } from '../../types/winner';
import { playResult } from '../../audio/sounds';

export function ResultWinScreen({ onWinnerRecorded }: { onWinnerRecorded: (winner: Winner) => void }) {
  const state = useMachineState();
  const dispatch = useMachineDispatch();
  const recordedRef = useRef(false);

  useAutoTimeout(true, TIMEOUTS.WIN_SAFETY_TIMEOUT_MS, () => dispatch({ type: 'ACK_RESULT' }));

  useEffect(() => {
    if (state.status !== 'result-win' || recordedRef.current) return;
    recordedRef.current = true;
    if (state.prize.kind === 'super-win' && state.entrant) {
      onWinnerRecorded({ name: state.entrant.name, wonAt: new Date().toISOString(), prizeLabel: state.prize.label });
    }
    playResult(state.prize.kind);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state.status !== 'result-win') return null;

  const isSuper = state.prize.kind === 'super-win';
  const message = state.entrant
    ? `${state.entrant.name}, você ganhou: ${state.prize.label}!`
    : `Você ganhou: ${state.prize.label}!`;

  if (isSuper) {
    return (
      <>
        <SuperWinBackdrop />
        <FireworksLayer variant="super" />
        <div className="super-shake" style={{ position: 'relative', zIndex: 11 }}>
          <h1 className="font-display super-title" style={{ fontSize: 'var(--font-hero)', margin: 0 }}>
            🏆 SUPER PRÊMIO! 🏆
          </h1>
          <h2 className="font-display super-subtitle" style={{ fontSize: 'var(--font-title)' }}>
            {message}
          </h2>
          <KeyHint>Aperte ENTER para continuar</KeyHint>
        </div>
      </>
    );
  }

  return (
    <>
      <FireworksLayer />
      <h1
        className="font-display"
        style={{
          fontSize: 'var(--font-hero)',
          color: 'var(--color-win)',
          margin: 0,
        }}
      >
        🎉 Parabéns!
      </h1>
      <h2 className="font-display" style={{ fontSize: 'var(--font-title)' }}>
        {message}
      </h2>
      <KeyHint>Aperte ENTER para continuar</KeyHint>
    </>
  );
}
