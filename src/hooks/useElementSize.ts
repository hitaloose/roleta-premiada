import { useLayoutEffect, useRef, useState } from 'react';

/** Largura/altura atuais de um elemento, atualizadas quando ele muda de tamanho. */
export function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  // Layout effect + medição inicial síncrona: o tamanho já está certo no primeiro
  // paint, sem um frame vazio esperando o primeiro callback do ResizeObserver.
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const { width, height } = node.getBoundingClientRect();
    setSize({ width, height });
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, ...size };
}
