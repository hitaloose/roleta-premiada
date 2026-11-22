import { useEffect, useState } from 'react';
import type { Winner } from '../../types/winner';
import { TIMEOUTS } from '../../config/timing';

const GROUP_SIZE = 3;

function formatWonAt(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function WinnersTicker({ winners }: { winners: Winner[] }) {
  const [offset, setOffset] = useState(0);
  const groupCount = Math.max(1, Math.ceil(winners.length / GROUP_SIZE));

  useEffect(() => {
    if (winners.length <= GROUP_SIZE) return;
    const id = setInterval(() => {
      setOffset((prev) => (prev + 1) % groupCount);
    }, TIMEOUTS.IDLE_TICKER_INTERVAL_MS);
    return () => clearInterval(id);
  }, [winners.length, groupCount]);

  if (winners.length === 0) {
    return (
      <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-body)' }}>
        Seja o primeiro ganhador de hoje! 🎉
      </div>
    );
  }

  const visible = winners.slice(offset * GROUP_SIZE, offset * GROUP_SIZE + GROUP_SIZE);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-sm)',
        width: 'min(100%, 640px)',
      }}
    >
      <div style={{ fontSize: 'var(--font-body)', color: 'var(--color-text-muted)' }}>
        🏆 Últimos ganhadores
      </div>
      {visible.map((winner, i) => (
        <div
          key={`${winner.name}-${winner.wonAt}-${i}`}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 'var(--space-md)',
            background: 'var(--color-surface)',
            borderRadius: 12,
            padding: '0.75rem 1.5rem',
            fontSize: 'var(--font-body)',
            animation: 'fade-in 0.4s ease-out',
          }}
        >
          <span>{winner.name}</span>
          <span style={{ color: 'var(--color-text-muted)' }}>{formatWonAt(winner.wonAt)}</span>
        </div>
      ))}
    </div>
  );
}
