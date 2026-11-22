import { describe, expect, it } from 'vitest';
import { machineReducer } from './machine.reducer';
import { initialAppState } from './machine.types';
import type { Prize } from '../types/prize';

const winPrize: Prize = { id: 'p1', label: 'Win', kind: 'win' };
const superWinPrize: Prize = { id: 'p2', label: 'Super Win', kind: 'super-win' };
const losePrize: Prize = { id: 'f1', label: 'Lose', kind: 'lose' };

describe('machineReducer', () => {
  it('goes from idle to form on START', () => {
    const next = machineReducer(initialAppState, { type: 'START' });
    expect(next).toEqual({ status: 'form', step: 'name', data: {}, lastLoseMessage: null });
  });

  it('walks through the form steps collecting data', () => {
    let state = machineReducer(initialAppState, { type: 'START' });
    state = machineReducer(state, { type: 'SUBMIT_NAME', value: 'Ana' });
    expect(state).toMatchObject({ status: 'form', step: 'phone', data: { name: 'Ana' } });

    state = machineReducer(state, { type: 'SUBMIT_PHONE', value: '11999998888' });
    expect(state).toMatchObject({
      status: 'form',
      step: 'cpf',
      data: { name: 'Ana', phone: '11999998888' },
    });
  });

  it('goes from idle straight to spinning without entrant on QUICK_SPIN', () => {
    const next = machineReducer(initialAppState, { type: 'QUICK_SPIN', prize: winPrize, prizeIndex: 2 });
    expect(next).toEqual({ status: 'spinning', entrant: null, prize: winPrize, prizeIndex: 2, lastLoseMessage: null });
  });

  it('ignores QUICK_SPIN outside idle', () => {
    const form = machineReducer(initialAppState, { type: 'START' });
    expect(machineReducer(form, { type: 'QUICK_SPIN', prize: winPrize, prizeIndex: 0 })).toBe(form);
  });

  it('ignores SUBMIT_NAME when not on the name step', () => {
    const state = machineReducer(initialAppState, { type: 'SUBMIT_NAME', value: 'Ana' });
    expect(state).toBe(initialAppState);
  });

  it('moves from cpf step to spinning on ENTRY_COMPLETE', () => {
    let state = machineReducer(initialAppState, { type: 'START' });
    state = machineReducer(state, { type: 'SUBMIT_NAME', value: 'Ana' });
    state = machineReducer(state, { type: 'SUBMIT_PHONE', value: '11999998888' });
    const entrant = { name: 'Ana', phone: '11999998888', cpf: '52998224725' };
    state = machineReducer(state, {
      type: 'ENTRY_COMPLETE',
      entrant,
      prize: winPrize,
      prizeIndex: 0,
    });
    expect(state).toEqual({
      status: 'spinning',
      entrant,
      prize: winPrize,
      prizeIndex: 0,
      lastLoseMessage: null,
    });
  });

  it('SPIN_DONE with a win prize goes to result-win', () => {
    const entrant = { name: 'Ana', phone: '11999998888', cpf: '52998224725' };
    const spinning = {
      status: 'spinning' as const,
      entrant,
      prize: winPrize,
      prizeIndex: 0,
      lastLoseMessage: null,
    };
    const next = machineReducer(spinning, { type: 'SPIN_DONE' });
    expect(next).toEqual({ status: 'result-win', entrant, prize: winPrize, lastLoseMessage: null });
  });

  it('SPIN_DONE with a super-win prize also goes to result-win', () => {
    const entrant = { name: 'Ana', phone: '11999998888', cpf: '52998224725' };
    const spinning = {
      status: 'spinning' as const,
      entrant,
      prize: superWinPrize,
      prizeIndex: 0,
      lastLoseMessage: null,
    };
    const next = machineReducer(spinning, { type: 'SPIN_DONE' });
    expect(next).toEqual({ status: 'result-win', entrant, prize: superWinPrize, lastLoseMessage: null });
  });

  it('SPIN_DONE with a lose prize goes to result-lose and remembers the message', () => {
    const entrant = { name: 'Ana', phone: '11999998888', cpf: '52998224725' };
    const spinning = {
      status: 'spinning' as const,
      entrant,
      prize: losePrize,
      prizeIndex: 1,
      lastLoseMessage: null,
    };
    const next = machineReducer(spinning, { type: 'SPIN_DONE', message: 'Quase!' });
    expect(next).toEqual({
      status: 'result-lose',
      entrant,
      prize: losePrize,
      message: 'Quase!',
      lastLoseMessage: 'Quase!',
    });
  });

  it('ACK_RESULT and TIMEOUT return to idle, preserving lastLoseMessage', () => {
    const resultLose = {
      status: 'result-lose' as const,
      entrant: { name: 'Ana', phone: '11999998888', cpf: '52998224725' },
      prize: losePrize,
      message: 'Quase!',
      lastLoseMessage: 'Quase!',
    };
    expect(machineReducer(resultLose, { type: 'ACK_RESULT' })).toEqual({
      status: 'idle',
      lastLoseMessage: 'Quase!',
    });
    expect(machineReducer(resultLose, { type: 'TIMEOUT' })).toEqual({
      status: 'idle',
      lastLoseMessage: 'Quase!',
    });
  });
});
