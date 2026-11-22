export function WheelPointer() {
  return (
    <div
      style={{
        position: 'absolute',
        top: -2,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 0,
        height: 0,
        borderLeft: '14px solid transparent',
        borderRight: '14px solid transparent',
        borderTop: '22px solid var(--color-accent)',
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
        zIndex: 2,
      }}
    />
  );
}
