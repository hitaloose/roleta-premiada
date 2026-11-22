// 'win' e 'super-win' mostram a mesma animação de vitória; só 'super-win' entra no ticker de últimos ganhadores.
export type PrizeKind = 'win' | 'super-win' | 'lose';

export type Prize = {
  id: string;
  label: string;
  kind: PrizeKind;
  weight?: number;
};
