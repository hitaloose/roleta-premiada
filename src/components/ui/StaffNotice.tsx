export type StaffNoticeTone = 'info' | 'danger';

/** Faixa no topo da tela com avisos para a equipe do evento (backup, importação). */
export function StaffNotice({ tone, children }: { tone: StaffNoticeTone; children: React.ReactNode }) {
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      style={{
        position: 'fixed',
        top: 'var(--space-sm)',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        maxWidth: '90cqw',
        padding: 'var(--space-sm) var(--space-md)',
        borderRadius: '12px',
        fontSize: 'var(--font-body)',
        fontWeight: 700,
        color: 'var(--color-bg-alt)',
        background: tone === 'danger' ? 'var(--color-danger-text)' : 'var(--color-win)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
        animation: 'fade-in 0.3s ease-out',
      }}
    >
      {children}
    </div>
  );
}
