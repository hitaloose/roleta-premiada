import type { ComponentType } from 'react';
import type { Prize } from '../types/prize';

/**
 * Tudo que muda de uma empresa para outra. As cores e fontes ficam no
 * `tokens.css` de cada marca (escopado por `:root[data-brand="<id>"]`);
 * aqui fica o que não é CSS.
 */
export type Brand = {
  id: string;
  name: string;
  logo: {
    src: string;
    /** Largura CSS da logo no canto inferior direito da tela inicial. */
    width: string;
  };
  /** URL do Google Fonts com as fontes usadas no tokens.css da marca. */
  fontsHref: string;
  confettiColors: string[];
  Background: ComponentType;
  prizes: Prize[];
  loseMessages: string[];
};
