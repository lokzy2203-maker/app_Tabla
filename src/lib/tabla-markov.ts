// A small, genuinely-trainable generative model for tabla bol sequences.
//
// This is an n-gram Markov chain, not a neural network: given the model's
// vocabulary size (a few dozen bols) and the size of a realistic training
// corpus (a handful of theka patterns and user compositions), a Markov
// chain is the right-sized tool - it trains instantly server-side with no
// GPU, and it's a real, classic generative sequence model rather than a
// neural net we'd have no meaningful training signal for.

const START_TOKEN = "<S>";
const KEY_SEPARATOR = "\n";

export type Transitions = Record<string, Record<string, number>>;

export type TablaMarkovModel = {
  order: number;
  transitions: Transitions;
};

export function tokenizeForTraining(notation: string): string[] {
  return notation
    .replace(/\|/g, " | ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
    .map((t) => (t === "|" || t === "-" || t === "_" ? t : t.toLowerCase()));
}

function buildKey(context: string[], order: number): string {
  return context.slice(-order).join(KEY_SEPARATOR);
}

export function trainMarkovModel(corpora: string[], order = 2): TablaMarkovModel {
  const transitions: Transitions = {};

  for (const notation of corpora) {
    const tokens = tokenizeForTraining(notation);
    if (tokens.length === 0) continue;

    const context: string[] = Array(order).fill(START_TOKEN);
    for (const token of tokens) {
      const key = buildKey(context, order);
      transitions[key] ??= {};
      transitions[key][token] = (transitions[key][token] ?? 0) + 1;
      context.push(token);
    }
  }

  return { order, transitions };
}

function weightedSample(options: Record<string, number>): string {
  const entries = Object.entries(options);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);
  let roll = Math.random() * total;
  for (const [token, count] of entries) {
    roll -= count;
    if (roll <= 0) return token;
  }
  return entries[entries.length - 1][0];
}

export function generateFromModel(model: TablaMarkovModel, length: number): string[] {
  const { order, transitions } = model;
  const allTokens = new Set<string>();
  for (const options of Object.values(transitions)) {
    for (const token of Object.keys(options)) allTokens.add(token);
  }
  const fallbackPool = [...allTokens].filter((t) => t !== "|");

  const context: string[] = Array(order).fill(START_TOKEN);
  const output: string[] = [];

  for (let i = 0; i < length; i++) {
    const key = buildKey(context, order);
    const options = transitions[key];

    let next: string;
    if (options && Object.keys(options).length > 0) {
      next = weightedSample(options);
    } else if (fallbackPool.length > 0) {
      next = fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
    } else {
      break;
    }

    output.push(next);
    context.push(next);
  }

  return output;
}

export function formatGeneratedTokens(tokens: string[]): string {
  return tokens
    .map((t) => (t === "|" || t === "-" ? t : t.charAt(0).toUpperCase() + t.slice(1)))
    .join(" ")
    .replace(/\s*\|\s*/g, " | ")
    .trim();
}
