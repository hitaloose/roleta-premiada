import { useEffect } from 'react';
import { useMachineDispatch, useMachineState } from '../../state/MachineContext';
import { useAutoTimeout } from '../../hooks/useAutoTimeout';
import { TIMEOUTS } from '../../config/timing';
import { playResult } from '../../audio/sounds';
import { useConfig } from '../../state/ConfigContext';

export function ResultLoseScreen() {
  const state = useMachineState();
  const dispatch = useMachineDispatch();
  const { brand } = useConfig();

  useAutoTimeout(true, TIMEOUTS.LOSE_MESSAGE_DURATION_MS, () => dispatch({ type: 'ACK_RESULT' }));

  useEffect(() => {
    playResult('lose');
  }, []);

  if (state.status !== 'result-lose') return null;

  if (brand.LoseScreen) return <brand.LoseScreen />;

  return (
    <>
      <h1 style={{ fontSize: 'var(--font-hero)', color: 'var(--color-lose)', margin: 0 }}>😅</h1>
      <h2 className="font-display" style={{ fontSize: 'var(--font-title)' }}>{state.message}</h2>
    </>
  );
}
