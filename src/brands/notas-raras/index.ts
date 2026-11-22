import type { Brand } from '../types';
import { publicAsset } from '../publicAsset';
import { ArabesqueBackground } from './ArabesqueBackground';
import { LOSE_MESSAGES } from './loseMessages';
import { PRIZES } from './prizes';
// Fontes empacotadas no build (sem Google Fonts): a roleta abre offline.
import '@fontsource/rakkas/400.css';
import './tokens.css';

export const notasRaras: Brand = {
  id: 'notas-raras',
  name: 'Notas Raras',
  logo: { src: publicAsset('logo.webp'), width: '120px' },
  confettiColors: ['#D4AF37', '#F7EFE0', '#C0392B', '#8A9A5B'],
  Background: ArabesqueBackground,
  prizes: PRIZES,
  loseMessages: LOSE_MESSAGES,
};
