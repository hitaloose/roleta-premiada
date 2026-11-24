import { useState } from 'react';
import { FormField } from './FormField';
import { useMachineDispatch, useMachineState } from '../../state/MachineContext';
import { useConfig } from '../../state/ConfigContext';
import { useAutoTimeout } from '../../hooks/useAutoTimeout';
import { isValidName } from '../../domain/validators/name';
import { formatPhoneBR, isValidPhoneBR } from '../../domain/validators/phone';
import { formatCPF, isValidCPF, maskCPF } from '../../domain/validators/cpf';
import { weightedDraw } from '../../domain/weightedDraw';
import { TIMEOUTS } from '../../config/timing';
import type { EntrantData } from '../../types/form';
import type { EntryRecord } from '../../types/entry';

type EnterStepFormProps = {
  isCpfUsed: (cpf: string) => boolean;
  addEntry: (entry: Omit<EntryRecord, 'cpfDigits'>) => void;
};

export function EnterStepForm({ isCpfUsed, addEntry }: EnterStepFormProps) {
  const state = useMachineState();
  const dispatch = useMachineDispatch();
  const { config, prizes } = useConfig();
  const [activityTick, setActivityTick] = useState(0);

  useAutoTimeout(
    true,
    TIMEOUTS.FORM_INACTIVITY_MS,
    () => dispatch({ type: 'CANCEL_FORM' }),
    activityTick,
  );

  if (state.status !== 'form') return null;

  const bumpActivity = () => setActivityTick((t) => t + 1);

  if (state.step === 'name') {
    return (
      <FormField
        key="name"
        label="Qual o seu nome?"
        placeholder="Digite seu nome e aperte Enter"
        format={(raw) => raw.toLocaleUpperCase('pt-BR')}
        validate={isValidName}
        errorMessage="Digite um nome válido (mínimo 3 letras)."
        onSubmit={(value) => dispatch({ type: 'SUBMIT_NAME', value: value.trim() })}
        onKeystroke={bumpActivity}
      />
    );
  }

  if (state.step === 'phone') {
    return (
      <FormField
        key="phone"
        label="Seu telefone com DDD"
        placeholder="(11) 99999-8888"
        format={formatPhoneBR}
        validate={isValidPhoneBR}
        errorMessage="Digite um telefone válido com DDD."
        onSubmit={(value) => dispatch({ type: 'SUBMIT_PHONE', value })}
        onKeystroke={bumpActivity}
      />
    );
  }

  return (
    <FormField
      key="cpf"
      label="Seu CPF"
      placeholder="000.000.000-00"
      format={formatCPF}
      mask={maskCPF}
      validate={(value) =>
        config.validateCpf ? isValidCPF(value) && !isCpfUsed(value) : value.replace(/\D/g, '').length > 0
      }
      errorMessage={(value) =>
        config.validateCpf && isValidCPF(value)
          ? 'Este CPF já participou. Cada CPF pode rodar a roleta uma única vez.'
          : 'Digite um CPF válido.'
      }
      onSubmit={(value) => {
        const entrant: EntrantData = { ...(state.data as Omit<EntrantData, 'cpf'>), cpf: value };
        const { item: prize, index: prizeIndex } = weightedDraw(prizes);
        addEntry({
          name: entrant.name,
          phone: entrant.phone,
          cpf: entrant.cpf,
          prizeLabel: prize.label,
          outcome: prize.kind,
          enteredAt: new Date().toISOString(),
        });
        dispatch({ type: 'ENTRY_COMPLETE', entrant, prize, prizeIndex });
      }}
      onKeystroke={bumpActivity}
    />
  );
}
