import { useState } from 'react';
import type { EntryRecord } from '../../types/entry';
import type { ImportResult } from '../../hooks/useEntriesStorage';
import { useConfig } from '../../state/ConfigContext';
import { PinGate } from './PinGate';
import { GeneralTab } from './GeneralTab';
import { ParticipantsTab } from './ParticipantsTab';
import { PrizesTab } from './PrizesTab';
import './config.css';

type ConfigScreenProps = {
  entries: EntryRecord[];
  saveFailed: boolean;
  onExport: () => void;
  onImport: (file: File) => Promise<ImportResult>;
  onClearData: () => void;
  onExit: () => void;
};

type TabId = 'general' | 'participants' | 'prizes';

const TABS: { id: TabId; label: string }[] = [
  { id: 'general', label: 'Geral' },
  { id: 'participants', label: 'Participantes' },
  { id: 'prizes', label: 'Itens da roleta' },
];

/**
 * Tela da equipe (/config), aberta pelo atalho Ctrl+Shift+K. Pede o PIN a
 * cada visita e sempre abre na aba Geral: os itens e as chances da roleta
 * só aparecem quando alguém clica na aba "Itens da roleta".
 */
export function ConfigScreen({ entries, saveFailed, onExport, onImport, onClearData, onExit }: ConfigScreenProps) {
  const { config, updateConfig } = useConfig();
  const [unlocked, setUnlocked] = useState(false);
  const [tab, setTab] = useState<TabId>('general');

  if (!unlocked) {
    return (
      <div className="cfg">
        <PinGate
          pin={config.pin}
          onCreatePin={(pin) => updateConfig({ pin })}
          onUnlock={() => setUnlocked(true)}
          onExit={onExit}
        />
      </div>
    );
  }

  return (
    <div className="cfg">
      <div className="cfg-wrap">
        <header className="cfg-header">
          <h1>Configurações da roleta</h1>
          <button type="button" className="cfg-btn cfg-btn-primary" onClick={onExit}>
            Voltar para a roleta
          </button>
        </header>

        <nav className="cfg-tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              className="cfg-tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div role="tabpanel">
          {tab === 'general' && <GeneralTab />}
          {tab === 'participants' && (
            <ParticipantsTab
              entries={entries}
              saveFailed={saveFailed}
              onExport={onExport}
              onImport={onImport}
              onClearData={onClearData}
            />
          )}
          {tab === 'prizes' && <PrizesTab />}
        </div>
      </div>
    </div>
  );
}
