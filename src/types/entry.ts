import type { PrizeKind } from './prize';

export type EntryRecord = {
  name: string;
  phone: string;
  cpf: string;
  cpfDigits: string;
  prizeLabel: string;
  outcome: PrizeKind;
  enteredAt: string;
};
