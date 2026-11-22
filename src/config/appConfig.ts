import type { Prize, PrizeKind } from '../types/prize';

/**
 * Configuração do evento editada na tela /config e guardada no
 * localStorage do navegador (por endereço: localhost e GitHub Pages têm
 * configs separadas).
 */
export type AppConfig = {
  brandId: string;
  /** Desligado: o CPF continua sendo pedido, mas qualquer valor é aceito e repetidos não são bloqueados. */
  validateCpf: boolean;
  /** PIN numérico da equipe para abrir a /config. `null` até ser criado no primeiro acesso. */
  pin: string | null;
  /** Itens da roleta editados por tema. Sem entrada, vale o padrão do tema (src/brands/<marca>/prizes.ts). */
  prizesByBrand: Record<string, Prize[]>;
};

export const CONFIG_STORAGE_KEY = 'roleta-premiada:config';

const PRIZE_KINDS: PrizeKind[] = ['win', 'super-win', 'lose'];
export const MIN_PRIZES = 2;
export const PIN_PATTERN = /^\d{4,8}$/;

export function defaultConfig(defaultBrandId: string): AppConfig {
  return { brandId: defaultBrandId, validateCpf: true, pin: null, prizesByBrand: {} };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sanitizePrize(value: unknown): Prize | null {
  if (!isRecord(value)) return null;
  const { id, label, kind, weight } = value;
  if (typeof id !== 'string' || !id) return null;
  if (typeof label !== 'string' || !label.trim()) return null;
  if (!PRIZE_KINDS.includes(kind as PrizeKind)) return null;
  if (typeof weight !== 'number' || !Number.isFinite(weight) || weight <= 0) return null;
  return { id, label, kind: kind as PrizeKind, weight };
}

/** Lista de itens válida, ou `null` se algum item estiver inválido ou houver menos de MIN_PRIZES. */
export function sanitizePrizes(value: unknown): Prize[] | null {
  if (!Array.isArray(value)) return null;
  const prizes = value.map(sanitizePrize);
  if (prizes.length < MIN_PRIZES || prizes.some((p) => p === null)) return null;
  return prizes as Prize[];
}

/** Aceita qualquer valor lido do storage e devolve uma config válida, caindo nos padrões campo a campo. */
export function sanitizeConfig(value: unknown, brandIds: string[], defaultBrandId: string): AppConfig {
  const config = defaultConfig(defaultBrandId);
  if (!isRecord(value)) return config;

  if (typeof value.brandId === 'string' && brandIds.includes(value.brandId)) config.brandId = value.brandId;
  if (typeof value.validateCpf === 'boolean') config.validateCpf = value.validateCpf;
  if (typeof value.pin === 'string' && PIN_PATTERN.test(value.pin)) config.pin = value.pin;

  if (isRecord(value.prizesByBrand)) {
    for (const [brandId, prizes] of Object.entries(value.prizesByBrand)) {
      const clean = brandIds.includes(brandId) ? sanitizePrizes(prizes) : null;
      if (clean) config.prizesByBrand[brandId] = clean;
    }
  }
  return config;
}

export function loadConfig(brandIds: string[], defaultBrandId: string): AppConfig {
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    return sanitizeConfig(raw ? JSON.parse(raw) : null, brandIds, defaultBrandId);
  } catch {
    return defaultConfig(defaultBrandId);
  }
}

/** Retorna false se o localStorage estiver cheio/indisponível. */
export function saveConfig(config: AppConfig): boolean {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    return true;
  } catch {
    return false;
  }
}

/** Chance de cada item em %, na mesma ordem (mesma regra do weightedDraw: peso padrão 1). */
export function prizeChances(prizes: Pick<Prize, 'weight'>[]): number[] {
  const weights = prizes.map((p) => Math.max(0, p.weight ?? 1));
  const total = weights.reduce((a, b) => a + b, 0);
  return weights.map((w) => (total > 0 ? (w / total) * 100 : 0));
}
