import { useEffect, useRef } from 'react';
import { useMachineDispatch, useMachineState } from '../../state/MachineContext';
import { useAutoTimeout } from '../../hooks/useAutoTimeout';
import { FireworksLayer } from '../effects/FireworksLayer';
import { KeyHint } from '../ui/KeyHint';
import { TIMEOUTS } from '../../config/timing';
import type { Winner } from '../../types/winner';

export function ResultWinScreen({ onWinnerRecorded }: { onWinnerRecorded: (winner: Winner) => void }) {
  const state = useMachineState();
  const dispatch = useMachineDispatch();
  const recordedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useAutoTimeout(true, TIMEOUTS.WIN_SAFETY_TIMEOUT_MS, () => dispatch({ type: 'ACK_RESULT' }));

  useEffect(() => {
    if (state.status !== 'result-win' || recordedRef.current) return;
    recordedRef.current = true;
    if (state.prize.kind === 'super-win') {
      onWinnerRecorded({ name: state.entrant.name, wonAt: new Date().toISOString(), prizeLabel: state.prize.label });
    }

    audioRef.current = new Audio('/sounds/win.mp3');
    audioRef.current.play().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state.status !== 'result-win') return null;

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
        {state.entrant.name}, você ganhou: {state.prize.label}!
      </h2>
      <KeyHint>Aperte ENTER para continuar</KeyHint>
    </>
  );
}
