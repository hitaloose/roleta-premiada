import { useState } from 'react';
import type { Winner } from '../types/winner';

const STORAGE_KEY = 'roleta-premiada:winners';
const MAX_STORED = 200;

function readWinners(): Winner[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Winner[]) : [];
  } catch {
    return [];
  }
}

export function useWinnersStorage() {
  const [winners, setWinners] = useState<Winner[]>(readWinners);

  function addWinner(winner: Winner) {
    setWinners((prev) => {
      const next = [winner, ...prev].slice(0, MAX_STORED);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // localStorage cheio/indisponível: mantém em memória para a sessão atual.
      }
      return next;
    });
  }

  function clearWinners() {
    setWinners([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage indisponível: já zerado em memória.
    }
  }

  return { winners, addWinner, clearWinners };
}
