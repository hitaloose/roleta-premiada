import type { Brand } from './types';
import { motaFashion } from './mota-fashion';
import { notasRaras } from './notas-raras';

const BRANDS: Record<string, Brand> = {
  [notasRaras.id]: notasRaras,
  [motaFashion.id]: motaFashion,
};

/**
 * Marca do build, escolhida por VITE_BRAND (ex.: no `.env.local` de cada
 * computador do evento). Sem a variável, usa a Notas Raras.
 */
const brandId = import.meta.env.VITE_BRAND ?? notasRaras.id;
const selected = BRANDS[brandId];
if (!selected) {
  throw new Error(`VITE_BRAND desconhecida: "${brandId}". Opções: ${Object.keys(BRANDS).join(', ')}`);
}

export const brand: Brand = selected;

/** Ativa os tokens CSS da marca e carrega as fontes dela. Chamar antes do primeiro render. */
export function applyBrand() {
  document.documentElement.dataset.brand = brand.id;

  const fonts = document.createElement('link');
  fonts.rel = 'stylesheet';
  fonts.href = brand.fontsHref;
  document.head.appendChild(fonts);
}
