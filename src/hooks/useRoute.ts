import { useEffect, useState } from 'react';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Caminho atual sem o base path do build (ex.: "/roleta-premiada/config" → "/config"). */
function currentPath(): string {
  const path = window.location.pathname;
  const relative = BASE && path.startsWith(BASE) ? path.slice(BASE.length) : path;
  return relative.replace(/\/+$/, '') || '/';
}

/** Navega sem recarregar a página (o estado da roleta e os dados em memória são mantidos). */
export function navigate(path: string) {
  window.history.pushState(null, '', `${BASE}${path}`);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

/**
 * Roteador mínimo por `location.pathname`. No GitHub Pages, o workflow de
 * deploy copia o index.html para 404.html, então recarregar em /config
 * também abre a app.
 */
export function useRoute(): string {
  const [path, setPath] = useState(currentPath);

  useEffect(() => {
    const onPopState = () => setPath(currentPath());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return path;
}
