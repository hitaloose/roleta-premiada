import { useEffect } from 'react';

/**
 * Dispara `onTimeout` após `ms` enquanto `active` for true. Cada mudança
 * em `resetKey` reinicia a contagem (ex: cada tecla digitada no form).
 * O cleanup do useEffect é essencial: sem ele, uma troca de tela antes do
 * timeout expirar deixaria um `dispatch` disparando "no vácuo" depois.
 */
export function useAutoTimeout(
  active: boolean,
  ms: number,
  onTimeout: () => void,
  resetKey?: unknown,
) {
  useEffect(() => {
    if (!active) return;
    const id = setTimeout(onTimeout, ms);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, ms, resetKey]);
}
