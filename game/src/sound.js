// Ember Court — tiny WebAudio blips, generated in code.
// No audio files: every sound is an oscillator shaped by a gain envelope.
// The game plays fine muted; a failed AudioContext never breaks a turn.

let ctx = null;
let muted = false;

function audio() {
  if (muted) return null;
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** Silence all blips (and keep them silent). */
export function muteSounds() {
  muted = true;
}

/** One short tone: frequency in Hz, length in seconds, kind of wave. */
export function blip(freq, seconds = 0.12, kind = 'sine', volume = 0.08) {
  const ac = audio();
  if (!ac) return;
  try {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = kind;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + seconds);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + seconds);
  } catch {
    // Sound is garnish; a failure here must never stop the game.
  }
}

export const sfx = {
  playCard() {
    blip(520, 0.1, 'triangle', 0.09);
    setTimeout(() => blip(780, 0.12, 'triangle', 0.07), 60);
  },
  advantage() {
    blip(660, 0.1, 'sine', 0.09);
    setTimeout(() => blip(990, 0.16, 'sine', 0.08), 70);
  },
  chain() {
    blip(440, 0.08, 'square', 0.05);
    setTimeout(() => blip(660, 0.08, 'square', 0.05), 50);
    setTimeout(() => blip(880, 0.12, 'square', 0.05), 100);
  },
  turn() {
    blip(330, 0.12, 'sine', 0.06);
  },
  win() {
    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => blip(f, 0.22, 'triangle', 0.09), i * 120));
  },
  lose() {
    [392, 330, 262, 196].forEach((f, i) => setTimeout(() => blip(f, 0.25, 'sine', 0.08), i * 140));
  },
};
