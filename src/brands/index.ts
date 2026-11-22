import type { Brand } from './types';
import { motaFashion } from './mota-fashion';
import { notasRaras } from './notas-raras';

/** Temas disponíveis na tela /config, na ordem em que aparecem lá. */
export const BRANDS: Brand[] = [notasRaras, motaFashion];

export const DEFAULT_BRAND_ID = notasRaras.id;

export function getBrand(id: string): Brand | undefined {
  return BRANDS.find((b) => b.id === id);
}

export { publicAsset } from './publicAsset';

const FONTS_LINK_ID = 'brand-fonts';

/** Ativa os tokens CSS da marca e troca as fontes dela. Pode ser chamado de novo ao trocar o tema. */
export function applyBrand(brand: Brand) {
  document.documentElement.dataset.brand = brand.id;

  let fonts = document.getElementById(FONTS_LINK_ID) as HTMLLinkElement | null;
  if (!fonts) {
    fonts = document.createElement('link');
    fonts.id = FONTS_LINK_ID;
    fonts.rel = 'stylesheet';
    document.head.appendChild(fonts);
  }
  if (fonts.href !== brand.fontsHref) fonts.href = brand.fontsHref;
}
