import type { ReactNode } from 'react';
import { useConfig } from '../../state/ConfigContext';

export function KioskLayout({ children }: { children: ReactNode }) {
  const { brand } = useConfig();
  return (
    <div
      style={{
        position: 'relative',
        width: '100cqw',
        height: '100cqh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'var(--space-md) var(--space-lg)',
        background: 'radial-gradient(circle at 50% 30%, var(--color-bg-alt), var(--color-bg))',
        overflow: 'hidden',
      }}
    >
      <brand.Background key={brand.id} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {children}
      </div>
    </div>
  );
}
