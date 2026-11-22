import { useConfig } from '../../state/ConfigContext';

/**
 * Chamada piscante (título grande + subtítulo) centralizada por cima da tela
 * inicial, estilo "aperte start". Ligada e editada na /config, aba Geral.
 */
export function AttractOverlay() {
  const { attract } = useConfig().config;
  if (!attract.enabled) return null;
  return (
    <div className="attract" aria-live="off">
      <h1 className="font-display attract-title">{attract.title}</h1>
      <p className="font-display attract-subtitle">{attract.subtitle}</p>
    </div>
  );
}
