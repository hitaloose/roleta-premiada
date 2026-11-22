import { EnterStepForm } from '../form/EnterStepForm';
import type { EntryRecord } from '../../types/entry';

type FormScreenProps = {
  isCpfUsed: (cpf: string) => boolean;
  addEntry: (entry: Omit<EntryRecord, 'cpfDigits'>) => void;
};

export function FormScreen({ isCpfUsed, addEntry }: FormScreenProps) {
  return (
    <>
      <h2
        className="font-display"
        style={{
          fontSize: 'var(--font-title)',
          marginBottom: 'var(--space-lg)',
        }}
      >
        Preencha seus dados para girar a roleta
      </h2>
      <EnterStepForm isCpfUsed={isCpfUsed} addEntry={addEntry} />
    </>
  );
}
