// Ember Court — a small seeded random source.
// Every shuffle and AI coin-flip in the game draws from here, so a given
// seed always deals the same hands. The live game seeds from the clock;
// screenshot scenes seed from a fixed number.

/** Mulberry32: a tiny deterministic PRNG with a full 32-bit state. */
export function makeRng(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Integer in [0, n). */
export function rollInt(rng, n) {
  return Math.floor(rng() * n);
}

/** Fisher-Yates shuffle that returns a new array, leaving the input alone. */
export function shuffle(rng, items) {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = rollInt(rng, i + 1);
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}
