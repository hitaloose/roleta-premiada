import type { ReactNode } from 'react';
import { useConfig } from '../../state/ConfigContext';

/**
 * Gira o app inteiro conforme `config.rotation`, para a TV montada na vertical
 * com o computador em paisagem. Em 90°/270° largura e altura são trocadas.
 *
 * É também um size container: dentro do app use `cqw`/`cqh` (nunca `vw`/`vh`),
 * que medem esta caixa já girada. Elementos `position: fixed` lá dentro ficam
 * presos a ela por causa do `transform`.
 */
export function RotatedViewport({ children }: { children: ReactNode }) {
  const { rotation } = useConfig().config;
  const swap = rotation % 180 !== 0;
  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        width: swap ? '100vh' : '100vw',
        height: swap ? '100vw' : '100vh',
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        containerType: 'size',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );
}
