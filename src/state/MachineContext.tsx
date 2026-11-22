import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';
import { machineReducer } from './machine.reducer';
import { initialAppState, type AppEvent, type AppState } from './machine.types';

const StateContext = createContext<AppState | null>(null);
const DispatchContext = createContext<Dispatch<AppEvent> | null>(null);

export function MachineProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(machineReducer, initialAppState);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
    </StateContext.Provider>
  );
}

export function useMachineState(): AppState {
  const state = useContext(StateContext);
  if (!state) throw new Error('useMachineState must be used within a MachineProvider');
  return state;
}

export function useMachineDispatch(): Dispatch<AppEvent> {
  const dispatch = useContext(DispatchContext);
  if (!dispatch) throw new Error('useMachineDispatch must be used within a MachineProvider');
  return dispatch;
}
