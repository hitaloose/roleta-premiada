import { publicAsset } from '../brands/publicAsset';

/**
 * Motor de áudio compartilhado (Web Audio). O `AudioContext` é criado sob
 * demanda e destravado no primeiro keydown (política de autoplay do Chrome).
 * Tudo passa por um compressor na saída, para sons simultâneos não estourarem.
 */
let ctx: AudioContext | null = null;
let output: AudioNode | null = null;
let enabled = true;
const overrides = new Map<string, AudioBuffer>();

function rawContext(): AudioContext | null {
  if (ctx) return ctx;
  try {
    ctx = new AudioContext();
  } catch {
    return null;
  }
  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -10;
  compressor.ratio.value = 6;
  const master = ctx.createGain();
  master.gain.value = 0.8;
  master.connect(compressor).connect(ctx.destination);
  output = master;
  return ctx;
}

/** Contexto pronto para tocar, ou `null` se o som estiver desligado/indisponível. */
export function audio(): { ctx: AudioContext; out: AudioNode } | null {
  if (!enabled) return null;
  const c = rawContext();
  if (!c || !output) return null;
  if (c.state === 'suspended') c.resume().catch(() => {});
  return { ctx: c, out: output };
}

/** Chame dentro de um gesto do usuário (keydown/click) para liberar o áudio. */
export function unlockAudio() {
  audio();
}

export function setSoundEnabled(value: boolean) {
  enabled = value;
}

/** mp3 em `public/sounds/<nome>.mp3` que substitui o som sintetizado de mesmo nome. */
export function getOverride(name: string): AudioBuffer | undefined {
  return overrides.get(name);
}

/**
 * Tenta carregar `public/sounds/<nome>.mp3` para cada nome. Arquivo ausente
 * (404, ou o index.html que o servidor de dev devolve no lugar) falha no
 * decode e é ignorado: vale o som sintetizado.
 */
export async function preloadOverrides(names: readonly string[]) {
  const c = rawContext();
  if (!c) return;
  await Promise.all(
    names.map(async (name) => {
      try {
        const res = await fetch(publicAsset(`sounds/${name}.mp3`));
        if (!res.ok || (res.headers.get('content-type') ?? '').includes('text/html')) return;
        overrides.set(name, await c.decodeAudioData(await res.arrayBuffer()));
      } catch {
        // sem arquivo: fica o sintetizado
      }
    }),
  );
}

export type Voice = { stop: (fadeSeconds?: number) => void };

/** Toca um AudioBuffer (override em mp3). */
export function playBuffer(buffer: AudioBuffer, loop = false): Voice | null {
  const a = audio();
  if (!a) return null;
  const src = a.ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = loop;
  const gain = a.ctx.createGain();
  src.connect(gain).connect(a.out);
  src.start();
  return {
    stop(fade = 0.25) {
      const t = a.ctx.currentTime;
      gain.gain.setValueAtTime(gain.gain.value, t);
      gain.gain.linearRampToValueAtTime(0, t + fade);
      src.stop(t + fade + 0.05);
    },
  };
}
