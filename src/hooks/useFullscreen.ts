import { useEffect } from 'react';

/**
 * Atalho oculto para forçar reentrar em fullscreen depois de um Esc
 * acidental (Esc sempre sai do fullscreen, não dá pra bloquear isso).
 * F1 não tem atalho padrão no Chrome, ao contrário de F5/F6/F7/F10/F11/F12
 * (refresh, foco na barra de endereço, navegação por cursor, foco no menu,
 * fullscreen e DevTools) — e F2 já é usado em useGlobalHotkey.
 */
const FULLSCREEN_KEY = 'F1';

/**
 * Entra em fullscreen no primeiro keydown da sessão. A Fullscreen API exige
 * um gesto do usuário — não pode ser chamada no mount. Em produção, rodar o
 * Chrome com --kiosk é mais robusto (a Fullscreen API sozinha pode ser
 * cancelada pelo usuário/staff apertando Esc).
 */
export function useFullscreen() {
  useEffect(() => {
    function requestFullscreenOnce() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.code === FULLSCREEN_KEY) {
        event.preventDefault();
        requestFullscreenOnce();
      }
    }

    window.addEventListener('keydown', requestFullscreenOnce, { once: true });
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', requestFullscreenOnce);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}
