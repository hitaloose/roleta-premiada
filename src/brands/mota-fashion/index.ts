import type { Brand } from '../types';
import { WatercolorBackground } from './WatercolorBackground';
import { LOSE_MESSAGES } from './loseMessages';
import { PRIZES } from './prizes';
import './tokens.css';

export const motaFashion: Brand = {
  id: 'mota-fashion',
  name: 'Mota Fashion',
  logo: { src: '/mota-fashion/logo.png', width: '210px' },
  fontsHref: 'https://fonts.googleapis.com/css2?family=Open+Sans:wdth,wght@75,300;75,600;100,400;100,600&display=swap',
  confettiColors: ['#d845c1', '#f0c8e0', '#7a1a5e', '#ffffff'],
  Background: WatercolorBackground,
  prizes: PRIZES,
  loseMessages: LOSE_MESSAGES,
};
