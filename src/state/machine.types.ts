import type { Prize } from '../types/prize';
import type { EntrantData, FormStep } from '../types/form';

type AppStatus =
  | { status: 'idle' }
  | { status: 'form'; step: FormStep; data: Partial<EntrantData> }
  | { status: 'spinning'; entrant: EntrantData; prize: Prize; prizeIndex: number }
  | { status: 'result-win'; entrant: EntrantData; prize: Prize }
  | { status: 'result-lose'; entrant: EntrantData; prize: Prize; message: string };

/** `lastLoseMessage` rides alongside every status so the next loss can avoid repeating it. */
export type AppState = AppStatus & { lastLoseMessage: string | null };

export type AppEvent =
  | { type: 'START' }
  | { type: 'SUBMIT_NAME'; value: string }
  | { type: 'SUBMIT_PHONE'; value: string }
  | { type: 'ENTRY_COMPLETE'; entrant: EntrantData; prize: Prize; prizeIndex: number }
  | { type: 'CANCEL_FORM' }
  | { type: 'SPIN_DONE'; message?: string }
  | { type: 'ACK_RESULT' }
  | { type: 'TIMEOUT' };

export const initialAppState: AppState = { status: 'idle', lastLoseMessage: null };
