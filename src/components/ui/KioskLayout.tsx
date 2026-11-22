import type { ReactNode } from 'react';
import { brand } from '../../brands';

export function KioskLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
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
      <brand.Background />
   
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {children}
      </div>
    </div>
  );
}
