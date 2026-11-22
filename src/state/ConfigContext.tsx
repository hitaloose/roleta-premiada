import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Brand } from '../brands/types';
import type { Prize } from '../types/prize';
import { BRANDS, DEFAULT_BRAND_ID, applyBrand, getBrand } from '../brands';
import { loadConfig, saveConfig, type AppConfig } from '../config/appConfig';
import { setSoundEnabled } from '../audio/engine';

type ConfigContextValue = {
  config: AppConfig;
  /** Tema ativo. */
  brand: Brand;
  /** Itens da roleta do tema ativo: os editados na /config ou o padrão do tema. */
  prizes: Prize[];
  /** Grava a mudança no localStorage. Retorna false se a gravação falhar. */
  updateConfig: (patch: Partial<AppConfig>) => boolean;
};

const ConfigContext = createContext<ConfigContextValue | null>(null);

const BRAND_IDS = BRANDS.map((b) => b.id);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AppConfig>(() => loadConfig(BRAND_IDS, DEFAULT_BRAND_ID));

  const brand = getBrand(config.brandId) ?? getBrand(DEFAULT_BRAND_ID)!;
  const prizes = config.prizesByBrand[brand.id] ?? brand.prizes;

  useEffect(() => {
    applyBrand(brand);
  }, [brand]);

  useEffect(() => {
    setSoundEnabled(config.soundEnabled);
  }, [config.soundEnabled]);

  const value = useMemo<ConfigContextValue>(
    () => ({
      config,
      brand,
      prizes,
      updateConfig(patch) {
        const next = { ...config, ...patch };
        setConfig(next);
        return saveConfig(next);
      },
    }),
    [config, brand, prizes],
  );

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useConfig(): ConfigContextValue {
  const value = useContext(ConfigContext);
  if (!value) throw new Error('useConfig must be used within a ConfigProvider');
  return value;
}
