import type { AppEvent, AppState } from './machine.types';

export function machineReducer(state: AppState, event: AppEvent): AppState {
  switch (event.type) {
    case 'START':
      return { status: 'form', step: 'name', data: {}, lastLoseMessage: state.lastLoseMessage };

    case 'SUBMIT_NAME':
      if (state.status !== 'form' || state.step !== 'name') return state;
      return {
        status: 'form',
        step: 'phone',
        data: { ...state.data, name: event.value },
        lastLoseMessage: state.lastLoseMessage,
      };

    case 'SUBMIT_PHONE':
      if (state.status !== 'form' || state.step !== 'phone') return state;
      return {
        status: 'form',
        step: 'cpf',
        data: { ...state.data, phone: event.value },
        lastLoseMessage: state.lastLoseMessage,
      };

    case 'ENTRY_COMPLETE':
      if (state.status !== 'form' || state.step !== 'cpf') return state;
      return {
        status: 'spinning',
        entrant: event.entrant,
        prize: event.prize,
        prizeIndex: event.prizeIndex,
        lastLoseMessage: state.lastLoseMessage,
      };

    case 'CANCEL_FORM':
      if (state.status !== 'form') return state;
      return { status: 'idle', lastLoseMessage: state.lastLoseMessage };

    case 'SPIN_DONE': {
      if (state.status !== 'spinning') return state;
      if (state.prize.kind === 'win' || state.prize.kind === 'super-win') {
        return {
          status: 'result-win',
          entrant: state.entrant,
          prize: state.prize,
          lastLoseMessage: state.lastLoseMessage,
        };
      }
      const message = event.message ?? 'Não foi dessa vez!';
      return {
        status: 'result-lose',
        entrant: state.entrant,
        prize: state.prize,
        message,
        lastLoseMessage: message,
      };
    }

    case 'ACK_RESULT':
      if (state.status !== 'result-win' && state.status !== 'result-lose') return state;
      return { status: 'idle', lastLoseMessage: state.lastLoseMessage };

    case 'TIMEOUT':
      return { status: 'idle', lastLoseMessage: state.lastLoseMessage };

    default:
      return state;
  }
}
