/**
 * Sons sintetizados com Web Audio: nada de arquivo, funciona offline.
 * Cada função agenda notas a partir de `ctx.currentTime` na saída `out`.
 */

let noise: AudioBuffer | null = null;

function noiseBuffer(ctx: AudioContext): AudioBuffer {
  if (noise && noise.sampleRate === ctx.sampleRate) return noise;
  const length = ctx.sampleRate * 2;
  noise = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  return noise;
}

function noiseSource(ctx: AudioContext, loop = false): AudioBufferSourceNode {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx);
  src.loop = loop;
  return src;
}

/** Envelope percussivo: sobe rápido até `peak` e decai exponencialmente em `decay` s. */
function envelope(ctx: AudioContext, at: number, peak: number, decay: number, attack = 0.003): GainNode {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(peak, at + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, at + attack + decay);
  return g;
}

function tone(
  ctx: AudioContext,
  out: AudioNode,
  opts: { type: OscillatorType; freq: number; at: number; peak: number; decay: number; attack?: number; endFreq?: number },
) {
  const osc = ctx.createOscillator();
  osc.type = opts.type;
  osc.frequency.setValueAtTime(opts.freq, opts.at);
  if (opts.endFreq) osc.frequency.exponentialRampToValueAtTime(opts.endFreq, opts.at + opts.decay);
  const env = envelope(ctx, opts.at, opts.peak, opts.decay, opts.attack);
  osc.connect(env).connect(out);
  osc.start(opts.at);
  osc.stop(opts.at + (opts.attack ?? 0.003) + opts.decay + 0.05);
}

function noiseHit(
  ctx: AudioContext,
  out: AudioNode,
  opts: { at: number; peak: number; decay: number; filter: BiquadFilterType; freq: number; q?: number; attack?: number },
) {
  const src = noiseSource(ctx);
  const filter = ctx.createBiquadFilter();
  filter.type = opts.filter;
  filter.frequency.value = opts.freq;
  filter.Q.value = opts.q ?? 1;
  const env = envelope(ctx, opts.at, opts.peak, opts.decay, opts.attack);
  src.connect(filter).connect(env).connect(out);
  // começa num ponto aleatório do ruído (2 s), sem passar do fim do buffer
  src.start(opts.at, Math.random() * Math.max(0, 1.9 - opts.decay));
  src.stop(opts.at + (opts.attack ?? 0.003) + opts.decay + 0.05);
}

// ---------------------------------------------------------------- giro

/** `speed` vai de 0 (parando) a 1 (velocidade máxima). */
export type SpinSynth = {
  tick: (speed: number) => void;
  stop: () => void;
};

export type SpinVariantId = 'classico' | 'cassino' | 'eletronico' | 'tambor';

export const SPIN_VARIANTS: readonly SpinVariantId[] = ['classico', 'cassino', 'eletronico', 'tambor'];

/** Tic de madeira da lingueta batendo nos pinos. */
function classico(ctx: AudioContext, out: AudioNode): SpinSynth {
  return {
    tick(speed) {
      const t = ctx.currentTime;
      noiseHit(ctx, out, { at: t, peak: 0.55, decay: 0.03, filter: 'bandpass', freq: 2400, q: 4 });
      tone(ctx, out, { type: 'sine', freq: 950 - 200 * (1 - speed), at: t, peak: 0.3, decay: 0.035 });
    },
    stop() {},
  };
}

/** Tic metálico com um sininho agudo, clima de cassino. */
function cassino(ctx: AudioContext, out: AudioNode): SpinSynth {
  let count = 0;
  return {
    tick(speed) {
      const t = ctx.currentTime;
      tone(ctx, out, { type: 'triangle', freq: 3100, at: t, peak: 0.22, decay: 0.05 });
      tone(ctx, out, { type: 'sine', freq: 4650, at: t, peak: 0.08, decay: 0.04 });
      noiseHit(ctx, out, { at: t, peak: 0.2, decay: 0.015, filter: 'highpass', freq: 6000 });
      if (++count % 4 === 0 && speed < 0.6) {
        tone(ctx, out, { type: 'sine', freq: 1568, at: t, peak: 0.12, decay: 0.25 });
      }
    },
    stop() {},
  };
}

/** Blip de videogame que fica mais grave conforme a roleta desacelera. */
function eletronico(ctx: AudioContext, out: AudioNode): SpinSynth {
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 2600;
  filter.connect(out);
  return {
    tick(speed) {
      const t = ctx.currentTime;
      const freq = 280 + 900 * speed;
      tone(ctx, filter, { type: 'square', freq, endFreq: freq * 0.7, at: t, peak: 0.14, decay: 0.05 });
    },
    stop() {
      setTimeout(() => filter.disconnect(), 300);
    },
  };
}

/** Rufar de tambor contínuo (mais forte quanto mais rápido) com batidas nos pinos. */
function tambor(ctx: AudioContext, out: AudioNode): SpinSynth {
  const src = noiseSource(ctx, true);
  const band = ctx.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.value = 1800;
  band.Q.value = 0.8;
  // tremolo rápido imita as baquetas
  const roll = ctx.createGain();
  roll.gain.value = 0.5;
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 22;
  const lfoDepth = ctx.createGain();
  lfoDepth.gain.value = 0.5;
  lfo.connect(lfoDepth).connect(roll.gain);
  const level = ctx.createGain();
  level.gain.value = 0.0001;
  level.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.3);
  src.connect(band).connect(roll).connect(level).connect(out);
  src.start();
  lfo.start();

  return {
    tick(speed) {
      const t = ctx.currentTime;
      level.gain.setTargetAtTime(0.04 + 0.16 * speed, t, 0.1);
      tone(ctx, out, { type: 'sine', freq: 160, endFreq: 70, at: t, peak: 0.35, decay: 0.08 });
    },
    stop() {
      const t = ctx.currentTime;
      level.gain.cancelScheduledValues(t);
      level.gain.setValueAtTime(Math.max(level.gain.value, 0.0001), t);
      level.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      src.stop(t + 0.35);
      lfo.stop(t + 0.35);
    },
  };
}

const SPIN_FACTORIES: Record<SpinVariantId, (ctx: AudioContext, out: AudioNode) => SpinSynth> = {
  classico,
  cassino,
  eletronico,
  tambor,
};

export function createSpinSynth(variant: SpinVariantId, ctx: AudioContext, out: AudioNode): SpinSynth {
  return SPIN_FACTORIES[variant](ctx, out);
}

// ---------------------------------------------------------------- resultados

const NOTE = { G4: 392, C5: 523.25, E5: 659.25, G5: 783.99, C6: 1046.5, E6: 1318.5, G6: 1568 };

/** Prêmio: arpejo maior brilhante com um brilhinho no fim. */
export function playWin(ctx: AudioContext, out: AudioNode) {
  const t = ctx.currentTime + 0.02;
  [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6].forEach((f, i) => {
    tone(ctx, out, { type: 'triangle', freq: f, at: t + i * 0.11, peak: 0.35, decay: i === 3 ? 0.9 : 0.3 });
    tone(ctx, out, { type: 'sine', freq: f * 2, at: t + i * 0.11, peak: 0.08, decay: 0.25 });
  });
  [NOTE.E6, NOTE.G6, NOTE.C6 * 2].forEach((f, i) => {
    tone(ctx, out, { type: 'sine', freq: f, at: t + 0.5 + i * 0.07, peak: 0.1, decay: 0.4 });
  });
}

/** Nota de metal (dente de serra filtrado) com vibrato, para a fanfarra. */
function brass(ctx: AudioContext, out: AudioNode, freq: number, at: number, length: number, peak: number) {
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.value = freq;
  const vibrato = ctx.createOscillator();
  vibrato.frequency.value = 5.5;
  const vibratoDepth = ctx.createGain();
  vibratoDepth.gain.setValueAtTime(0, at);
  vibratoDepth.gain.linearRampToValueAtTime(freq * 0.012, at + length);
  vibrato.connect(vibratoDepth).connect(osc.frequency);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(freq * 1.5, at);
  filter.frequency.exponentialRampToValueAtTime(freq * 6, at + 0.06);
  filter.frequency.exponentialRampToValueAtTime(freq * 3, at + length);

  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(peak, at + 0.03);
  g.gain.setValueAtTime(peak, at + length - 0.08);
  g.gain.exponentialRampToValueAtTime(0.0001, at + length);

  osc.connect(filter).connect(g).connect(out);
  osc.start(at);
  vibrato.start(at);
  osc.stop(at + length + 0.05);
  vibrato.stop(at + length + 0.05);
}

/** Super prêmio: fanfarra de metais, prato, sinos e aplausos (~4,5 s). */
export function playSuperWin(ctx: AudioContext, out: AudioNode) {
  const t = ctx.currentTime + 0.02;
  // "tã-tã-tã-TAAAM"
  const fanfare: [number, number, number][] = [
    [NOTE.G4, 0, 0.14],
    [NOTE.G4, 0.16, 0.14],
    [NOTE.G4, 0.32, 0.14],
    [NOTE.C5, 0.48, 0.5],
    [NOTE.G4, 1.0, 0.18],
    [NOTE.C5, 1.2, 1.6],
  ];
  for (const [f, start, len] of fanfare) {
    brass(ctx, out, f, t + start, len, 0.16);
    brass(ctx, out, f * 1.5, t + start, len, 0.07);
  }
  // acorde final cheio
  [NOTE.E5, NOTE.G5, NOTE.C6].forEach((f) => brass(ctx, out, f, t + 1.2, 1.6, 0.07));
  // pratos
  noiseHit(ctx, out, { at: t + 0.48, peak: 0.35, decay: 1.2, filter: 'highpass', freq: 5000 });
  noiseHit(ctx, out, { at: t + 1.2, peak: 0.5, decay: 2.2, filter: 'highpass', freq: 4500 });
  // bumbo
  [0.48, 1.2].forEach((s) => tone(ctx, out, { type: 'sine', freq: 120, endFreq: 45, at: t + s, peak: 0.7, decay: 0.35 }));
  // sinos subindo
  [NOTE.C6, NOTE.E6, NOTE.G6, NOTE.C6 * 2, NOTE.E6 * 2].forEach((f, i) =>
    tone(ctx, out, { type: 'sine', freq: f, at: t + 1.25 + i * 0.09, peak: 0.1, decay: 0.8 }),
  );
  // aplausos: muitas palmas curtas aleatórias
  for (let i = 0; i < 140; i++) {
    const at = t + 1.3 + Math.random() * 3;
    noiseHit(ctx, out, {
      at,
      peak: 0.04 + Math.random() * 0.06,
      decay: 0.02 + Math.random() * 0.03,
      filter: 'bandpass',
      freq: 900 + Math.random() * 1800,
      q: 1.2,
    });
  }
}

/** Falha: "uó-uó-uó-uóóó" de trombone descendo. */
export function playLose(ctx: AudioContext, out: AudioNode) {
  const t = ctx.currentTime + 0.02;
  const notes: [number, number, number][] = [
    [392, 0, 0.35],
    [370, 0.4, 0.35],
    [349.2, 0.8, 0.35],
    [329.6, 1.2, 1.0],
  ];
  for (const [f, start, len] of notes) {
    const at = t + start;
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(f, at);
    osc.frequency.linearRampToValueAtTime(f * 0.97, at + len);
    if (len > 0.5) {
      const vib = ctx.createOscillator();
      vib.frequency.value = 6;
      const depth = ctx.createGain();
      depth.gain.value = f * 0.02;
      vib.connect(depth).connect(osc.frequency);
      vib.start(at + 0.15);
      vib.stop(at + len);
    }
    // "wah": o filtro abre e fecha em cada nota
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.value = 6;
    filter.frequency.setValueAtTime(300, at);
    filter.frequency.exponentialRampToValueAtTime(1400, at + 0.12);
    filter.frequency.exponentialRampToValueAtTime(350, at + len);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(0.3, at + 0.04);
    g.gain.setValueAtTime(0.3, at + len - 0.1);
    g.gain.exponentialRampToValueAtTime(0.0001, at + len);
    osc.connect(filter).connect(g).connect(out);
    osc.start(at);
    osc.stop(at + len + 0.05);
  }
}
