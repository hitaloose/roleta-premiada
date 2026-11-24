import { EnterStepForm } from '../form/EnterStepForm';
import type { EntryRecord } from '../../types/entry';

type FormScreenProps = {
  isCpfUsed: (cpf: string) => boolean;
  addEntry: (entry: Omit<EntryRecord, 'cpfDigits'>) => void;
};

// O KioskLayout centraliza na vertical; a margem de baixo sobe o formulário
// para ~40% da altura, na altura dos olhos com a TV de pé.
export function FormScreen({ isCpfUsed, addEntry }: FormScreenProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20cqh' }}>
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
    </div>
  );
}
