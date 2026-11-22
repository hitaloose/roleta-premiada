import type { Brand } from '../types';
import { publicAsset } from '../publicAsset';
import { WatercolorBackground } from './WatercolorBackground';
import { LOSE_MESSAGES } from './loseMessages';
import { PRIZES } from './prizes';
// Fontes empacotadas no build (sem Google Fonts): a roleta abre offline.
import '@fontsource-variable/open-sans/wdth.css';
import './tokens.css';

export const motaFashion: Brand = {
  id: 'mota-fashion',
  name: 'Mota Fashion',
  logo: { src: publicAsset('mota-fashion/logo.png'), width: '210px' },
  confettiColors: ['#d845c1', '#f0c8e0', '#7a1a5e', '#ffffff'],
  Background: WatercolorBackground,
  prizes: PRIZES,
  loseMessages: LOSE_MESSAGES,
};
