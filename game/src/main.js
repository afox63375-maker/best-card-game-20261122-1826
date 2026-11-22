// Ember Court — bootstrap and the frame loop.
// Owns the canvas, the animation loop and the transient effects (a played
// card flying to the middle, floating damage numbers). The rules live in
// state.js, the drawing in render.js, the events in input.js.

import { VIEW_H, VIEW_W } from './config.js';
import { PHASE, newMatch } from './state.js';
import { drawScene } from './render.js';
import { bindInput } from './input.js';
import { buildShotMatch, shotParams } from './shots.js';
import { muteSounds } from './sound.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = VIEW_W;
canvas.height = VIEW_H;

const { shot, seed } = shotParams();
let match = shot ? buildShotMatch(shot, seed) : newMatch((Date.now() % 2147483647) || 1);

const ui = { handRects: [], endTurnRect: null, hoverCard: -1, hoverEndTurn: false };
const fx = [];

/** A played card flies from its hand slot to the centre; damage floats up. */
function onStrike(strike, rect) {
  if (rect) {
    fx.push({ kind: 'played', card: strike.card, fromX: rect.x, fromY: rect.y, born: Date.now() });
  }
  const targetX = 640;
  const targetY = strike.advantage ? 300 : 320;
  fx.push({ kind: 'damage', amount: strike.damage, advantage: strike.advantage, x: targetX, y: targetY, born: Date.now() });
  // Drop effects older than a second so the list never grows.
  const now = Date.now();
  for (let i = fx.length - 1; i >= 0; i--) {
    if (now - fx[i].born > 1200) fx.splice(i, 1);
  }
}

// Read-only hook for automated play-testing (and curious players).
window.emberCourt = {
  phase: () => match.phase,
  turn: () => match.turn,
  life: () => ({ you: match.player.life, rival: match.rival.life }),
  ember: () => match.player.ember,
  hand: () => match.player.hand.map((c) => ({ uid: c.uid, cost: c.cost, power: c.power, suit: c.suit })),
  ward: () => match.rival.ward,
  // Start a fresh match with a given seed (play-testing hook).
  reseed: (seed) => {
    match = newMatch((seed >>> 0) || 1);
    return match.phase;
  },
  handRects: () => ui.handRects,
  endTurnRect: () => ui.endTurnRect,
};

bindInput(canvas, {
  getMatch: () => match,
  setMatch: (m) => {
    match = m;
  },
  ui,
  fx,
  onStrike,
  onMuteKey: () => muteSounds(),
});

function frame() {
  drawScene(ctx, match, ui, fx);
  if (match.phase === PHASE.TITLE || match.phase === PHASE.WON || match.phase === PHASE.LOST) {
    // Blink prompts redraw on a slow timer instead of every frame.
    setTimeout(() => requestAnimationFrame(frame), 250);
  } else {
    requestAnimationFrame(frame);
  }
}

// Screenshot scenes render once, frozen, so the capture is identical
// every run; live play runs the loop.
if (shot) {
  // Freeze the clock so blinking prompts render the same way on every
  // capture, and frame the canvas edge to edge in the 1280x800 viewport.
  const frozenNow = 1000;
  Date.now = () => frozenNow;
  document.querySelector('.hint')?.remove();
  const stage = document.querySelector('.stage');
  if (stage) stage.style.cssText = 'padding:0;gap:0;min-height:0;';
  canvas.style.width = '1280px';
  canvas.style.height = '800px';
  drawScene(ctx, match, ui, fx);
  document.title = `Ember Court — ${shot}`;
} else {
  document.title = 'Ember Court — a duel of flame, tide and leaf';
  requestAnimationFrame(frame);
}
