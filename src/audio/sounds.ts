import type { PrizeKind } from '../types/prize';
import { audio, getOverride, playBuffer } from './engine';
import { SPIN_VARIANTS, createSpinSynth, playLose, playSuperWin, playWin, type SpinVariantId } from './synth';

/**
 * API de som usada pelas telas. Cada som pode ser substituído por um mp3 em
 * `public/sounds/` com o nome de SOUND_FILES (ex.: `super-win.mp3`,
 * `spin-tambor.mp3`); sem o arquivo, toca a versão sintetizada.
 */
export const SOUND_FILES: readonly string[] = ['win', 'super-win', 'lose', ...SPIN_VARIANTS.map((v) => `spin-${v}`)];

export type SpinSound = {
  /** Chamado a cada fatia que passa pelo ponteiro. `speed` de 0 (parando) a 1. */
  tick: (speed: number) => void;
  stop: () => void;
};

const SILENT: SpinSound = { tick() {}, stop() {} };

let lastVariant: SpinVariantId | null = null;

/** Sorteia o som do giro, evitando repetir o do giro anterior. */
function pickVariant(): SpinVariantId {
  const options = SPIN_VARIANTS.filter((v) => v !== lastVariant);
  lastVariant = options[Math.floor(Math.random() * options.length)];
  return lastVariant;
}

export function startSpinSound(): SpinSound {
  const a = audio();
  if (!a) return SILENT;
  const variant = pickVariant();

  const file = getOverride(`spin-${variant}`);
  if (file) {
    const voice = playBuffer(file, true);
    return { tick() {}, stop: () => voice?.stop(0.4) };
  }

  const synth = createSpinSynth(variant, a.ctx, a.out);
  let stopped = false;
  return {
    tick(speed) {
      if (!stopped) synth.tick(Math.max(0, Math.min(1, speed)));
    },
    stop() {
      if (stopped) return;
      stopped = true;
      synth.stop();
    },
  };
}

export function playResult(kind: PrizeKind) {
  const a = audio();
  if (!a) return;
  const file = getOverride(kind);
  if (file) {
    playBuffer(file);
    return;
  }
  if (kind === 'super-win') playSuperWin(a.ctx, a.out);
  else if (kind === 'win') playWin(a.ctx, a.out);
  else playLose(a.ctx, a.out);
}

/** Simula um giro de ~3 s desacelerando, para o botão "Ouvir" da /config. */
export function previewSpinSound() {
  const sound = startSpinSound();
  const ticks = 34;
  let elapsed = 0;
  for (let i = 0; i < ticks; i++) {
    const progress = i / ticks;
    const speed = 1 - progress;
    elapsed += 25 + 260 * progress ** 2.2;
    setTimeout(() => sound.tick(speed), elapsed);
  }
  setTimeout(() => sound.stop(), elapsed + 150);
}
