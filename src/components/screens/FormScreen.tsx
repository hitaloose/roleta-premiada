import { EnterStepForm } from '../form/EnterStepForm';
import type { EntryRecord } from '../../types/entry';

type FormScreenProps = {
  isCpfUsed: (cpf: string) => boolean;
  addEntry: (entry: Omit<EntryRecord, 'cpfDigits'>) => void;
};

// O KioskLayout centraliza na vertical; a margem de baixo sobe o formulário
// para o terço de cima da tela, na altura dos olhos com a TV de pé.
export function FormScreen({ isCpfUsed, addEntry }: FormScreenProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '50cqh' }}>
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
