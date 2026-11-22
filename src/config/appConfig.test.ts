import { describe, expect, it } from 'vitest';
import { ATTRACT_TEXT_MAX, prizeChances, sanitizeConfig, sanitizePrizes } from './appConfig';

const BRAND_IDS = ['notas-raras', 'mota-fashion'];
const DEFAULT = 'notas-raras';

const validPrizes = [
  { id: 'a', label: '10% OFF', kind: 'win', weight: 3 },
  { id: 'b', label: 'Quase!', kind: 'lose', weight: 1 },
];

describe('sanitizeConfig', () => {
  it('usa os padrões quando o valor não é um objeto', () => {
    expect(sanitizeConfig(null, BRAND_IDS, DEFAULT)).toEqual({
      brandId: DEFAULT,
      validateCpf: true,
      pin: null,
      prizesByBrand: {},
      rotation: 0,
      collectData: true,
      soundEnabled: true,
      attract: { enabled: false, title: 'Girou, ganhou!', subtitle: 'Participe grátis' },
    });
    expect(sanitizeConfig('lixo', BRAND_IDS, DEFAULT).brandId).toBe(DEFAULT);
  });

  it('ignora tema desconhecido e mantém os campos válidos', () => {
    const config = sanitizeConfig({ brandId: 'outra', validateCpf: false, pin: '1234' }, BRAND_IDS, DEFAULT);
    expect(config).toMatchObject({ brandId: DEFAULT, validateCpf: false, pin: '1234' });
  });

  it('aceita só rotações de 0, 90, 180 e 270 graus', () => {
    expect(sanitizeConfig({ rotation: 90 }, BRAND_IDS, DEFAULT).rotation).toBe(90);
    expect(sanitizeConfig({ rotation: 270 }, BRAND_IDS, DEFAULT).rotation).toBe(270);
    expect(sanitizeConfig({ rotation: 45 }, BRAND_IDS, DEFAULT).rotation).toBe(0);
    expect(sanitizeConfig({ rotation: '90' }, BRAND_IDS, DEFAULT).rotation).toBe(0);
  });

  it('lê coleta de dados e som só quando são booleanos', () => {
    expect(sanitizeConfig({ collectData: false, soundEnabled: false }, BRAND_IDS, DEFAULT)).toMatchObject({
      collectData: false,
      soundEnabled: false,
    });
    expect(sanitizeConfig({ collectData: 'não', soundEnabled: 0 }, BRAND_IDS, DEFAULT)).toMatchObject({
      collectData: true,
      soundEnabled: true,
    });
  });

  it('saneia a chamada piscante: corta espaços, limita o tamanho e volta ao padrão se vazio', () => {
    const config = sanitizeConfig(
      { attract: { enabled: true, title: '  Gire agora  ', subtitle: '   ' } },
      BRAND_IDS,
      DEFAULT,
    );
    expect(config.attract).toEqual({ enabled: true, title: 'Gire agora', subtitle: 'Participe grátis' });
    expect(sanitizeConfig({ attract: { title: 'x'.repeat(100) } }, BRAND_IDS, DEFAULT).attract.title).toHaveLength(
      ATTRACT_TEXT_MAX,
    );
    expect(sanitizeConfig({ attract: 'lixo' }, BRAND_IDS, DEFAULT).attract.enabled).toBe(false);
  });

  it('descarta PIN fora do formato', () => {
    expect(sanitizeConfig({ pin: '12' }, BRAND_IDS, DEFAULT).pin).toBeNull();
    expect(sanitizeConfig({ pin: 'abcd' }, BRAND_IDS, DEFAULT).pin).toBeNull();
  });

  it('mantém só listas de itens válidas de temas conhecidos', () => {
    const config = sanitizeConfig(
      {
        brandId: 'mota-fashion',
        prizesByBrand: {
          'mota-fashion': validPrizes,
          'notas-raras': [validPrizes[0]],
          desconhecida: validPrizes,
        },
      },
      BRAND_IDS,
      DEFAULT,
    );
    expect(config.brandId).toBe('mota-fashion');
    expect(Object.keys(config.prizesByBrand)).toEqual(['mota-fashion']);
  });
});

describe('sanitizePrizes', () => {
  it('rejeita a lista inteira se um item for inválido', () => {
    expect(sanitizePrizes([...validPrizes, { id: 'c', label: '', kind: 'win', weight: 1 }])).toBeNull();
    expect(sanitizePrizes([...validPrizes, { id: 'c', label: 'X', kind: 'empate', weight: 1 }])).toBeNull();
    expect(sanitizePrizes([...validPrizes, { id: 'c', label: 'X', kind: 'win', weight: 0 }])).toBeNull();
  });

  it('exige pelo menos dois itens', () => {
    expect(sanitizePrizes([])).toBeNull();
    expect(sanitizePrizes(validPrizes)).toHaveLength(2);
  });
});

describe('prizeChances', () => {
  it('calcula a % de cada item pelo peso', () => {
    expect(prizeChances([{ weight: 1 }, { weight: 3 }])).toEqual([25, 75]);
  });

  it('usa peso 1 quando omitido', () => {
    expect(prizeChances([{}, { weight: 1 }])).toEqual([50, 50]);
  });

  it('devolve 0 quando não há peso positivo', () => {
    expect(prizeChances([{ weight: 0 }])).toEqual([0]);
  });
});
