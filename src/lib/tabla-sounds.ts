export type BolProfile = {
  hasBoom: boolean;
  boomFreq: number;
  boomDecay: number;
  hasClick: boolean;
  clickFreq: number;
  clickQ: number;
  clickDecay: number;
  gain: number;
};

const PROFILES: Record<string, BolProfile> = {
  dha: { hasBoom: true, boomFreq: 95, boomDecay: 0.55, hasClick: true, clickFreq: 2200, clickQ: 4, clickDecay: 0.12, gain: 1 },
  dhin: { hasBoom: true, boomFreq: 90, boomDecay: 0.6, hasClick: true, clickFreq: 1600, clickQ: 6, clickDecay: 0.5, gain: 1 },
  dhage: { hasBoom: true, boomFreq: 100, boomDecay: 0.3, hasClick: true, clickFreq: 2400, clickQ: 4, clickDecay: 0.1, gain: 0.9 },
  dhere: { hasBoom: true, boomFreq: 110, boomDecay: 0.22, hasClick: true, clickFreq: 2600, clickQ: 4, clickDecay: 0.08, gain: 0.7 },
  ge: { hasBoom: true, boomFreq: 85, boomDecay: 0.5, hasClick: false, clickFreq: 0, clickQ: 0, clickDecay: 0, gain: 0.9 },
  ga: { hasBoom: true, boomFreq: 85, boomDecay: 0.5, hasClick: false, clickFreq: 0, clickQ: 0, clickDecay: 0, gain: 0.9 },
  ka: { hasBoom: true, boomFreq: 140, boomDecay: 0.08, hasClick: false, clickFreq: 0, clickQ: 0, clickDecay: 0, gain: 0.6 },
  ki: { hasBoom: false, boomFreq: 0, boomDecay: 0, hasClick: true, clickFreq: 3200, clickQ: 3, clickDecay: 0.06, gain: 0.55 },
  ke: { hasBoom: false, boomFreq: 0, boomDecay: 0, hasClick: true, clickFreq: 3000, clickQ: 3, clickDecay: 0.06, gain: 0.55 },
  ta: { hasBoom: false, boomFreq: 0, boomDecay: 0, hasClick: true, clickFreq: 2800, clickQ: 3, clickDecay: 0.08, gain: 0.7 },
  na: { hasBoom: false, boomFreq: 0, boomDecay: 0, hasClick: true, clickFreq: 2000, clickQ: 5, clickDecay: 0.35, gain: 0.75 },
  ti: { hasBoom: false, boomFreq: 0, boomDecay: 0, hasClick: true, clickFreq: 3400, clickQ: 3, clickDecay: 0.06, gain: 0.5 },
  ra: { hasBoom: false, boomFreq: 0, boomDecay: 0, hasClick: true, clickFreq: 3100, clickQ: 3, clickDecay: 0.06, gain: 0.5 },
  kit: { hasBoom: false, boomFreq: 0, boomDecay: 0, hasClick: true, clickFreq: 3300, clickQ: 3, clickDecay: 0.06, gain: 0.5 },
  tin: { hasBoom: false, boomFreq: 0, boomDecay: 0, hasClick: true, clickFreq: 1500, clickQ: 6, clickDecay: 0.55, gain: 0.8 },
  tu: { hasBoom: false, boomFreq: 0, boomDecay: 0, hasClick: true, clickFreq: 1700, clickQ: 6, clickDecay: 0.4, gain: 0.7 },
  tra: { hasBoom: false, boomFreq: 0, boomDecay: 0, hasClick: true, clickFreq: 1900, clickQ: 5, clickDecay: 0.3, gain: 0.7 },
  kat: { hasBoom: false, boomFreq: 0, boomDecay: 0, hasClick: true, clickFreq: 2600, clickQ: 4, clickDecay: 0.1, gain: 0.65 },
};

const DEFAULT_PROFILE: BolProfile = PROFILES.ta;

function normalize(token: string): string {
  return token.trim().toLowerCase().replace(/[^a-z]/g, "");
}

export function getBolProfile(token: string): BolProfile | null {
  const key = normalize(token);
  if (!key || key === "-" || key === "_") return null;
  if (PROFILES[key]) return PROFILES[key];

  // tirakita / tirikit / similar 4-syllable rolls: treat the whole token as one bright click cluster
  if (key.startsWith("tira") || key.startsWith("tiri") || key.includes("kita")) {
    return PROFILES.ki;
  }

  // try to match by longest known prefix (handles compound bols like "dhati", "gena", etc.)
  const known = Object.keys(PROFILES).sort((a, b) => b.length - a.length);
  for (const k of known) {
    if (key.startsWith(k)) return PROFILES[k];
  }

  return DEFAULT_PROFILE;
}

let noiseBuffer: AudioBuffer | null = null;

function getNoiseBuffer(ctx: AudioContext): AudioBuffer {
  if (noiseBuffer) return noiseBuffer;
  const length = ctx.sampleRate * 1;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  noiseBuffer = buffer;
  return buffer;
}

export function playBolSound(
  ctx: AudioContext,
  time: number,
  profile: BolProfile,
  destination: AudioNode
) {
  const master = ctx.createGain();
  master.gain.value = profile.gain;
  master.connect(destination);

  if (profile.hasBoom) {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    const boomGain = ctx.createGain();
    osc.frequency.setValueAtTime(profile.boomFreq * 1.8, time);
    osc.frequency.exponentialRampToValueAtTime(profile.boomFreq, time + 0.04);
    boomGain.gain.setValueAtTime(0.9, time);
    boomGain.gain.exponentialRampToValueAtTime(0.001, time + profile.boomDecay);
    osc.connect(boomGain);
    boomGain.connect(master);
    osc.start(time);
    osc.stop(time + profile.boomDecay + 0.05);
  }

  if (profile.hasClick) {
    const noise = ctx.createBufferSource();
    noise.buffer = getNoiseBuffer(ctx);
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = profile.clickFreq;
    bandpass.Q.value = profile.clickQ;
    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(0.8, time);
    clickGain.gain.exponentialRampToValueAtTime(0.001, time + profile.clickDecay);
    noise.connect(bandpass);
    bandpass.connect(clickGain);
    clickGain.connect(master);
    noise.start(time);
    noise.stop(time + profile.clickDecay + 0.05);
  }
}
