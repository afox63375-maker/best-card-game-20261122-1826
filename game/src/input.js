// Ember Court — mouse and keyboard.
// The input layer only translates events into game calls; it never holds
// rules. Coordinates are converted from page pixels into the 1280×800
// view space the renderer draws in.

import { PHASE, endPlayerTurn, playCard, restartMatch, startMatch } from './state.js';
import { sfx } from './sound.js';

/** Is point (x, y) inside rect? */
export function inside(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

/**
 * Wire the canvas to a match. `hooks` supplies the live objects:
 *   getMatch() / setMatch(m) — the current match
 *   ui — shared hover/button state the renderer reads
 *   fx — transient effect list the renderer draws
 *   onStrike(strike) — called after a card is played (for sounds/effects)
 */
export function bindInput(canvas, hooks) {
  const toView = (event) => {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - r.left) / r.width) * 1280,
      y: ((event.clientY - r.top) / r.height) * 800,
    };
  };

  const tryPlay = (index) => {
    const match = hooks.getMatch();
    if (match.phase !== PHASE.PLAYER) return;
    const card = match.player.hand[index];
    if (!card) return;
    if (card.cost > match.player.ember) {
      match.log.push(`Not enough ember for ${card.name} (${card.cost}).`);
      return;
    }
    const rect = hooks.ui.handRects?.[index];
    const strike = playCard(match, match.player, match.rival, card.uid);
    if (strike) {
      hooks.onStrike(strike, rect);
      if (strike.advantage) sfx.advantage();
      else if (strike.chain > 0) sfx.chain();
      else sfx.playCard();
      if (match.phase === PHASE.WON) sfx.win();
    }
  };

  const endTurn = () => {
    const match = hooks.getMatch();
    if (match.phase !== PHASE.PLAYER) return;
    sfx.turn();
    endPlayerTurn(match);
    if (match.phase === PHASE.LOST) sfx.lose();
  };

  canvas.addEventListener('mousemove', (event) => {
    const { x, y } = toView(event);
    const ui = hooks.ui;
    ui.hoverCard = -1;
    ui.hoverEndTurn = false;
    const match = hooks.getMatch();
    if (match.phase === PHASE.PLAYER && ui.handRects) {
      ui.handRects.forEach((r, i) => {
        if (inside(x, y, r)) ui.hoverCard = i;
      });
    }
    if (ui.endTurnRect && inside(x, y, ui.endTurnRect)) ui.hoverEndTurn = true;
  });

  canvas.addEventListener('click', (event) => {
    const { x, y } = toView(event);
    const match = hooks.getMatch();
    const ui = hooks.ui;
    if (match.phase === PHASE.TITLE) {
      startMatch(match);
      sfx.turn();
      return;
    }
    if (match.phase === PHASE.WON || match.phase === PHASE.LOST) {
      hooks.setMatch(restartMatch(match));
      sfx.turn();
      return;
    }
    if (ui.endTurnRect && inside(x, y, ui.endTurnRect)) {
      endTurn();
      return;
    }
    if (match.phase === PHASE.PLAYER && ui.handRects) {
      for (let i = 0; i < ui.handRects.length; i++) {
        if (inside(x, y, ui.handRects[i])) {
          tryPlay(i);
          return;
        }
      }
    }
  });

  window.addEventListener('keydown', (event) => {
    const match = hooks.getMatch();
    if (event.key >= '1' && event.key <= '7') {
      tryPlay(Number(event.key) - 1);
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (match.phase === PHASE.TITLE) {
        startMatch(match);
        sfx.turn();
      } else if (match.phase === PHASE.WON || match.phase === PHASE.LOST) {
        hooks.setMatch(restartMatch(match));
        sfx.turn();
      } else {
        endTurn();
      }
      return;
    }
    if (event.key === 'r' || event.key === 'R') {
      if (match.phase === PHASE.WON || match.phase === PHASE.LOST) {
        hooks.setMatch(restartMatch(match));
        sfx.turn();
      }
    }
    if (event.key === 'm' || event.key === 'M') {
      // Mute is handled by main.js through the exposed hook.
      hooks.onMuteKey?.();
    }
  });
}
