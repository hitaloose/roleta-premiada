import { useEffect } from 'react';
import type { Dispatch } from 'react';
import type { AppEvent, AppState } from '../state/machine.types';

/**
 * Único listener de teclado no nível da app. Decide a ação pelo
 * `state.status` atual: Espaço só inicia o fluxo em `idle`; Enter/Espaço
 * confirmam o resultado em `result-win`/`result-lose`. Em `form`, cada
 * `<input>` trata seu próprio Enter localmente — este listener ignora
 * essas teclas nesse estado para não competir com a digitação. F2 em
 * `form` cancela na hora (ex.: CPF já usado) em vez de esperar o timeout
 * de inatividade para voltar à home. Não usamos Esc (sai do fullscreen do
 * kiosk — ver useFullscreen), Backspace/Delete (usadas pra editar os
 * campos), F1 (reentra em fullscreen — ver useFullscreen), nem
 * F5/F6/F7/F11/F12 (reservadas pelo Chrome: refresh, foco na barra de
 * endereço, navegação por cursor, fullscreen e DevTools).
 *
 * Ctrl+Shift+E e Ctrl+Shift+U são atalhos ocultos (não anunciados na UI)
 * para a equipe do evento exportar e importar os dados dos participantes
 * em CSV. Ctrl+Shift+K (só em `idle`) abre a tela /config da equipe.
 * Evitamos Ctrl+Shift+I/J/C (DevTools), Ctrl+Shift+O (favoritos) e
 * Ctrl+Shift+M (troca de perfil), reservados pelo Chrome.
 *
 * Com `onQuickSpin` (modo rápido: coleta de dados desligada na /config),
 * Enter ou Espaço em `idle` giram direto, sem formulário. Teclas segurando
 * (`event.repeat`) são ignoradas para o Enter do resultado não girar de novo.
 *
 * Com `enabled` false (ex.: na /config) nenhum atalho é tratado.
 */
export function useGlobalHotkey(
  state: AppState,
  dispatch: Dispatch<AppEvent>,
  onExport?: () => void,
  onImport?: () => void,
  onOpenConfig?: () => void,
  enabled = true,
  onQuickSpin?: () => void,
) {
  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (onOpenConfig && state.status === 'idle' && event.ctrlKey && event.shiftKey && event.code === 'KeyK') {
        event.preventDefault();
        onOpenConfig();
        return;
      }

      if (onExport && event.ctrlKey && event.shiftKey && event.code === 'KeyE') {
        event.preventDefault();
        onExport();
        return;
      }

      if (onImport && event.ctrlKey && event.shiftKey && event.code === 'KeyU') {
        event.preventDefault();
        onImport();
        return;
      }

      if (onQuickSpin && state.status === 'idle' && (event.code === 'Space' || event.code === 'Enter')) {
        event.preventDefault();
        if (!event.repeat) onQuickSpin();
        return;
      }

      if (state.status === 'idle' && event.code === 'Space') {
        event.preventDefault();
        dispatch({ type: 'START' });
        return;
      }

      if (state.status === 'form' && event.code === 'F2') {
        event.preventDefault();
        dispatch({ type: 'CANCEL_FORM' });
        return;
      }

      if (
        (state.status === 'result-win' || state.status === 'result-lose') &&
        (event.code === 'Space' || event.code === 'Enter')
      ) {
        event.preventDefault();
        if (event.repeat) return;
        dispatch({ type: 'ACK_RESULT' });
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, dispatch, onExport, onImport, onOpenConfig, enabled, onQuickSpin]);
}
