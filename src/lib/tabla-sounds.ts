// Circular-membrane mode ratios (normalized Bessel zeros) — gives struck drumheads their
// characteristic inharmonic, non-integer overtone series instead of a flat/synthetic tone.
const MEMBRANE_PARTIALS = [1, 1.594, 2.136, 2.296, 2.653, 2.918];

type MembraneSpec = {
  fundamental: number;
  partialCount: number; // how many MEMBRANE_PARTIALS to use
  decay: number; // seconds, fundamental's decay; higher partials decay proportionally faster
  pitchBendSemitones: number; // negative = bend down (bayan "wah"), 0 = no bend
  pitchBendTime: number;
  strikeNoiseAmt: number; // 0..1, amount of transient finger/hand contact noise
  strikeNoiseDecay: number;
  strikeNoiseFreq: number;
  outputGain: number;
};

const SPECS: Record<string, MembraneSpec> = {
  // Dha = dayan (treble) + bayan (bass) struck together
  dha: { fundamental: 230, partialCount: 5, decay: 0.5, pitchBendSemitones: 0, pitchBendTime: 0, strikeNoiseAmt: 0.5, strikeNoiseDecay: 0.04, strikeNoiseFreq: 2600, outputGain: 1 },
  dhin: { fundamental: 220, partialCount: 6, decay: 0.85, pitchBendSemitones: 0, pitchBendTime: 0, strikeNoiseAmt: 0.45, strikeNoiseDecay: 0.05, strikeNoiseFreq: 2200, outputGain: 1 },
  dhage: { fundamental: 240, partialCount: 4, decay: 0.22, pitchBendSemitones: 0, pitchBendTime: 0, strikeNoiseAmt: 0.55, strikeNoiseDecay: 0.04, strikeNoiseFreq: 2800, outputGain: 0.85 },
  dhere: { fundamental: 250, partialCount: 3, decay: 0.16, pitchBendSemitones: 0, pitchBendTime: 0, strikeNoiseAmt: 0.55, strikeNoiseDecay: 0.03, strikeNoiseFreq: 3000, outputGain: 0.65 },

  // Bayan-only bols (bass drum, characteristic pitch bend "wah")
  ge: { fundamental: 78, partialCount: 4, decay: 0.55, pitchBendSemitones: -2.5, pitchBendTime: 0.18, strikeNoiseAmt: 0.3, strikeNoiseDecay: 0.05, strikeNoiseFreq: 900, outputGain: 0.95 },
  ga: { fundamental: 78, partialCount: 4, decay: 0.55, pitchBendSemitones: -2.5, pitchBendTime: 0.18, strikeNoiseAmt: 0.3, strikeNoiseDecay: 0.05, strikeNoiseFreq: 900, outputGain: 0.95 },
  ka: { fundamental: 95, partialCount: 2, decay: 0.07, pitchBendSemitones: 0, pitchBendTime: 0, strikeNoiseAmt: 0.4, strikeNoiseDecay: 0.04, strikeNoiseFreq: 700, outputGain: 0.6 },

  // Dayan-only closed/damped bols (short, muted)
  ki: { fundamental: 320, partialCount: 2, decay: 0.05, pitchBendSemitones: 0, pitchBendTime: 0, strikeNoiseAmt: 0.7, strikeNoiseDecay: 0.04, strikeNoiseFreq: 3400, outputGain: 0.5 },
  ke: { fundamental: 300, partialCount: 2, decay: 0.05, pitchBendSemitones: 0, pitchBendTime: 0, strikeNoiseAmt: 0.7, strikeNoiseDecay: 0.04, strikeNoiseFreq: 3200, outputGain: 0.5 },
  ta: { fundamental: 280, partialCount: 2, decay: 0.06, pitchBendSemitones: 0, pitchBendTime: 0, strikeNoiseAmt: 0.6, strikeNoiseDecay: 0.05, strikeNoiseFreq: 2900, outputGain: 0.65 },
  na: { fundamental: 250, partialCount: 4, decay: 0.45, pitchBendSemitones: 0, pitchBendTime: 0, strikeNoiseAmt: 0.4, strikeNoiseDecay: 0.05, strikeNoiseFreq: 2200, outputGain: 0.75 },
  ti: { fundamental: 340, partialCount: 2, decay: 0.04, pitchBendSemitones: 0, pitchBendTime: 0, strikeNoiseAmt: 0.75, strikeNoiseDecay: 0.03, strikeNoiseFreq: 3600, outputGain: 0.45 },
  ra: { fundamental: 320, partialCount: 2, decay: 0.04, pitchBendSemitones: 0, pitchBendTime: 0, strikeNoiseAmt: 0.7, strikeNoiseDecay: 0.03, strikeNoiseFreq: 3300, outputGain: 0.45 },
  kit: { fundamental: 330, partialCount: 2, decay: 0.04, pitchBendSemitones: 0, pitchBendTime: 0, strikeNoiseAmt: 0.7, strikeNoiseDecay: 0.03, strikeNoiseFreq: 3400, outputGain: 0.45 },

  // Dayan-open, ringing bols
  tin: { fundamental: 200, partialCount: 6, decay: 0.9, pitchBendSemitones: 0, pitchBendTime: 0, strikeNoiseAmt: 0.4, strikeNoiseDecay: 0.05, strikeNoiseFreq: 2000, outputGain: 0.85 },
  tu: { fundamental: 230, partialCount: 5, decay: 0.6, pitchBendSemitones: 0, pitchBendTime: 0, strikeNoiseAmt: 0.35, strikeNoiseDecay: 0.05, strikeNoiseFreq: 2100, outputGain: 0.75 },
  tra: { fundamental: 260, partialCount: 4, decay: 0.4, pitchBendSemitones: 0, pitchBendTime: 0, strikeNoiseAmt: 0.4, strikeNoiseDecay: 0.04, strikeNoiseFreq: 2400, outputGain: 0.7 },
  kat: { fundamental: 290, partialCount: 2, decay: 0.08, pitchBendSemitones: 0, pitchBendTime: 0, strikeNoiseAmt: 0.55, strikeNoiseDecay: 0.04, strikeNoiseFreq: 2700, outputGain: 0.6 },
};

const DEFAULT_SPEC = SPECS.ta;

const BOTH_DRUMS = new Set(["dha", "dhin", "dhage", "dhere"]);
const BAYAN_ONLY = new Set(["ge", "ga", "ka"]);

export type StrikeDrum = "dayan" | "bayan" | "both";

export function getStrikeDrum(token: string): StrikeDrum | null {
  const key = normalize(token);
  if (!key || key === "-" || key === "_") return null;

  if (BOTH_DRUMS.has(key)) return "both";
  if (BAYAN_ONLY.has(key)) return "bayan";

  const known = [...BOTH_DRUMS, ...BAYAN_ONLY].sort((a, b) => b.length - a.length);
  for (const k of known) {
    if (key.startsWith(k)) return BOTH_DRUMS.has(k) ? "both" : "bayan";
  }

  return "dayan";
}

function normalize(token: string): string {
  return token.trim().toLowerCase().replace(/[^a-z]/g, "");
}

export function getBolProfile(token: string): MembraneSpec | null {
  const key = normalize(token);
  if (!key || key === "-" || key === "_") return null;
  if (SPECS[key]) return SPECS[key];

  if (key.startsWith("tira") || key.startsWith("tiri") || key.includes("kita")) {
    return SPECS.ki;
  }

  const known = Object.keys(SPECS).sort((a, b) => b.length - a.length);
  for (const k of known) {
    if (key.startsWith(k)) return SPECS[k];
  }

  return DEFAULT_SPEC;
}

let noiseBuffer: AudioBuffer | null = null;
function getNoiseBuffer(ctx: AudioContext): AudioBuffer {
  if (noiseBuffer) return noiseBuffer;
  const length = ctx.sampleRate * 1;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  noiseBuffer = buffer;
  return buffer;
}

let reverbImpulse: AudioBuffer | null = null;
function getReverbImpulse(ctx: AudioContext): AudioBuffer {
  if (reverbImpulse) return reverbImpulse;
  const duration = 1.4;
  const length = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      const t = i / length;
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2.5);
    }
  }
  reverbImpulse = buffer;
  return buffer;
}

let sharedReverb: ConvolverNode | null = null;
let sharedReverbGain: GainNode | null = null;
let sharedDry: GainNode | null = null;

export function getMasterChain(ctx: AudioContext, destination: AudioNode) {
  if (!sharedReverb) {
    sharedReverb = ctx.createConvolver();
    sharedReverb.buffer = getReverbImpulse(ctx);
    sharedReverbGain = ctx.createGain();
    sharedReverbGain.gain.value = 0.16;
    sharedReverb.connect(sharedReverbGain);
    sharedReverbGain.connect(destination);

    sharedDry = ctx.createGain();
    sharedDry.gain.value = 1;
    sharedDry.connect(destination);
  }
  return { dry: sharedDry!, wet: sharedReverb };
}

export function playBolSound(
  ctx: AudioContext,
  time: number,
  spec: MembraneSpec,
  destination: AudioNode
) {
  const { dry, wet } = getMasterChain(ctx, destination);

  const voice = ctx.createGain();
  voice.gain.value = spec.outputGain;
  voice.connect(dry);
  voice.connect(wet);

  // Body resonance: layered inharmonic partials, each its own decaying sine.
  for (let i = 0; i < spec.partialCount; i++) {
    const ratio = MEMBRANE_PARTIALS[i];
    const osc = ctx.createOscillator();
    osc.type = "sine";

    const startFreq =
      spec.pitchBendSemitones !== 0
        ? spec.fundamental * ratio
        : spec.fundamental * ratio * 1.015;
    osc.frequency.setValueAtTime(startFreq, time);

    if (spec.pitchBendSemitones !== 0) {
      const bentFreq = spec.fundamental * ratio * Math.pow(2, spec.pitchBendSemitones / 12);
      osc.frequency.exponentialRampToValueAtTime(bentFreq, time + spec.pitchBendTime);
    } else {
      osc.frequency.exponentialRampToValueAtTime(spec.fundamental * ratio, time + 0.05);
    }

    const partialDecay = spec.decay / (1 + i * 0.6);
    const partialAmp = 1 / (1 + i * 1.3);

    const partialGain = ctx.createGain();
    partialGain.gain.setValueAtTime(partialAmp, time);
    partialGain.gain.exponentialRampToValueAtTime(0.001, time + partialDecay);

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = spec.fundamental * 3.2 + 800;

    osc.connect(lowpass);
    lowpass.connect(partialGain);
    partialGain.connect(voice);

    osc.start(time);
    osc.stop(time + partialDecay + 0.08);
  }

  // Strike transient: filtered noise burst for the finger/hand contact attack.
  if (spec.strikeNoiseAmt > 0) {
    const noise = ctx.createBufferSource();
    noise.buffer = getNoiseBuffer(ctx);
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = spec.strikeNoiseFreq;
    bandpass.Q.value = 1.8;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(spec.strikeNoiseAmt, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + spec.strikeNoiseDecay);

    noise.connect(bandpass);
    bandpass.connect(noiseGain);
    noiseGain.connect(voice);

    noise.start(time);
    noise.stop(time + spec.strikeNoiseDecay + 0.03);
  }
}
