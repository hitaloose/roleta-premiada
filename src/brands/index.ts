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

/** Ativa os tokens CSS da marca. As fontes de todas as marcas vêm no build (ver `src/brands/<marca>/index.ts`). */
export function applyBrand(brand: Brand) {
  document.documentElement.dataset.brand = brand.id;
}
