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
    /** Largura CSS da logo quando ela não cabe embaixo da roleta (TV em paisagem) e vai para o canto inferior direito. */
    width: string;
  };
  confettiColors: string[];
  /** Ajustes da tela da roleta (WheelStage). */
  stage?: {
    /** Esconde a chamada "Aperte..." (só o nome da marca fica em cima). */
    hideHint?: boolean;
    /** Tamanho CSS do nome da marca nas duas orientações (padrão: grande de pé, normal na horizontal). */
    titleSize?: string;
  };
  Background: ComponentType;
  /** Tela própria de "não ganhou". Sem ela, mostra uma das `loseMessages` sorteada. */
  LoseScreen?: ComponentType;
  prizes: Prize[];
  loseMessages: string[];
};
