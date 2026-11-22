import type { Brand } from '../types';
import { ArabesqueBackground } from './ArabesqueBackground';
import { LOSE_MESSAGES } from './loseMessages';
import { PRIZES } from './prizes';
import './tokens.css';

export const notasRaras: Brand = {
  id: 'notas-raras',
  name: 'Notas Raras',
  logo: { src: '/logo.webp', width: '120px' },
  fontsHref: 'https://fonts.googleapis.com/css2?family=Rakkas&display=swap',
  confettiColors: ['#D4AF37', '#F7EFE0', '#C0392B', '#8A9A5B'],
  Background: ArabesqueBackground,
  prizes: PRIZES,
  loseMessages: LOSE_MESSAGES,
};
