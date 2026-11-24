import type { CSSProperties, ReactNode } from 'react';

export function KeyHint({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        marginTop: 'var(--space-md)',
        fontSize: 'var(--font-hint)',
        color: 'var(--color-accent)',
        fontWeight: 700,
        animation: 'pulse 1.6s ease-in-out infinite',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
