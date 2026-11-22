import { useEffect, useRef, useState } from 'react';
import { KioskLayout } from './components/ui/KioskLayout';
import { StaffNotice } from './components/ui/StaffNotice';
import type { StaffNoticeTone } from './components/ui/StaffNotice';
import { IdleScreen } from './components/screens/IdleScreen';
import { FormScreen } from './components/screens/FormScreen';
import { SpinningScreen } from './components/screens/SpinningScreen';
import { ResultWinScreen } from './components/screens/ResultWinScreen';
import { ResultLoseScreen } from './components/screens/ResultLoseScreen';
import { ConfigScreen } from './components/config/ConfigScreen';
import { useMachineDispatch, useMachineState } from './state/MachineContext';
import { useConfig } from './state/ConfigContext';
import { useGlobalHotkey } from './hooks/useGlobalHotkey';
import { useFullscreen } from './hooks/useFullscreen';
import { useWinnersStorage } from './hooks/useWinnersStorage';
import { useEntriesStorage } from './hooks/useEntriesStorage';
import { navigate, useRoute } from './hooks/useRoute';

const IMPORT_NOTICE_MS = 6000;

export function App() {
  const state = useMachineState();
  const dispatch = useMachineDispatch();
  const route = useRoute();
  const { prizes } = useConfig();
  const { addWinner, clearWinners } = useWinnersStorage();
  const { entries, addEntry, isCpfUsed, exportCSV, importCSV, clearEntries, saveFailed } = useEntriesStorage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importNotice, setImportNotice] = useState<{ tone: StaffNoticeTone; text: string } | null>(null);

  const isConfig = route === '/config';

  useFullscreen();
  useGlobalHotkey(
    state,
    dispatch,
    exportCSV,
    () => fileInputRef.current?.click(),
    () => navigate('/config'),
    !isConfig,
  );

  useEffect(() => {
    if (!importNotice) return;
    const timer = setTimeout(() => setImportNotice(null), IMPORT_NOTICE_MS);
    return () => clearTimeout(timer);
  }, [importNotice]);

  async function handleImportFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const { added, skipped } = await importCSV(file, prizes);
      const skippedText = skipped > 0 ? ` (${skipped} linha(s) inválida(s) ignorada(s))` : '';
      setImportNotice({ tone: 'info', text: `Importação concluída: ${added} participante(s) novo(s)${skippedText}.` });
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'arquivo inválido';
      setImportNotice({ tone: 'danger', text: `Falha ao importar: ${reason}.` });
    }
  }

  if (isConfig) {
    return (
      <ConfigScreen
        entries={entries}
        saveFailed={saveFailed}
        onExport={exportCSV}
        onImport={(file) => importCSV(file, prizes)}
        onClearData={() => {
          clearEntries();
          clearWinners();
        }}
        onExit={() => navigate('/')}
      />
    );
  }

  return (
    <KioskLayout>
      {state.status === 'idle' && <IdleScreen />}
      {state.status === 'form' && <FormScreen isCpfUsed={isCpfUsed} addEntry={addEntry} />}
      {state.status === 'spinning' && <SpinningScreen />}
      {state.status === 'result-win' && <ResultWinScreen onWinnerRecorded={addWinner} />}
      {state.status === 'result-lose' && <ResultLoseScreen />}

      {saveFailed ? (
        <StaffNotice tone="danger">
          Os dados não estão sendo salvos no navegador. Exporte agora com Ctrl+Shift+E.
        </StaffNotice>
      ) : (
        importNotice && <StaffNotice tone={importNotice.tone}>{importNotice.text}</StaffNotice>
      )}
      <input ref={fileInputRef} type="file" accept=".csv,text/csv" hidden onChange={handleImportFile} />
    </KioskLayout>
  );
}
