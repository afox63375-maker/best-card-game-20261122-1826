// Ember Court — deterministic screenshot scenes.
// The game reads ?shot=title|table|win|loss&seed=N and builds a fixed
// match for that scene, so the screenshots are real renders of the game
// with the same hands every time. No network, no clock dependence beyond
// the title blink (frozen for shots).

import { PHASE, endPlayerTurn, newMatch, playCard, startMatch } from './state.js';
import { makeRng } from './rng.js';

/** Parse the page query into { shot, seed } (null shot = normal play). */
export function shotParams() {
  const q = new URLSearchParams(window.location.search);
  const shot = q.get('shot');
  const seed = Number(q.get('seed') || '1') || 1;
  if (!['title', 'table', 'win', 'loss'].includes(shot)) return { shot: null, seed };
  return { shot, seed };
}

/**
 * Build the match a screenshot scene needs.
 * table: a mid-game table after a few turns of seeded play, so both hands,
 * life totals, ember and wards are visible. win/loss: a finished match
 * with the end screen up. title: the untouched title screen.
 */
export function buildShotMatch(shot, seed) {
  const match = newMatch(seed);
  if (shot === 'title') return match;
  startMatch(match);
  if (shot === 'table') {
    // Play three seeded turns: the player spends what it can each turn,
    // the rival answers, leaving a lively mid-game table.
    const rng = makeRng(seed * 7919 + 13);
    for (let turn = 0; turn < 3 && match.phase === PHASE.PLAYER; turn++) {
      const affordable = match.player.hand.filter((c) => c.cost <= match.player.ember);
      affordable.sort((a, b) => b.power - a.power);
      for (const card of affordable.slice(0, 2)) {
        if (match.phase !== PHASE.PLAYER) break;
        if (card.cost <= match.player.ember) playCard(match, match.player, match.rival, card.uid);
      }
      if (match.phase === PHASE.PLAYER) endPlayerTurn(match);
      void rng;
    }
    // Top the player hand back up to five for a full-looking table.
    while (match.player.hand.length < 5 && match.player.deck.length > 0) {
      match.player.hand.push(match.player.deck.shift());
    }
    match.log.push('Mid-game: both courts bloodied, ember burning.');
    return match;
  }
  if (shot === 'win') {
    match.rival.life = 4;
    const finisher = match.player.hand.find((c) => c.cost <= match.player.ember) || match.player.hand[0];
    if (finisher) playCard(match, match.player, match.rival, finisher.uid);
    if (match.phase !== PHASE.WON) {
      match.rival.life = 0;
      match.phase = PHASE.WON;
      match.log.push('The rival court falls. Victory!');
    }
    match.stats.turns = 6;
    match.stats.damageDealt = 34;
    match.stats.damageTaken = 18;
    match.stats.cardsPlayed = 11;
    match.stats.bestChain = 3;
    return match;
  }
  // loss
  match.player.life = 3;
  match.rival.ember = 10;
  const killer = match.rival.hand.find((c) => c.cost <= match.rival.ember && c.power >= 3) || match.rival.hand[0];
  if (killer) playCard(match, match.rival, match.player, killer.uid);
  if (match.phase !== PHASE.LOST) {
    match.player.life = 0;
    match.phase = PHASE.LOST;
    match.log.push('Your embers fade. Defeat.');
  }
  match.stats.turns = 7;
  match.stats.damageDealt = 22;
  match.stats.damageTaken = 31;
  match.stats.cardsPlayed = 9;
  match.stats.bestChain = 2;
  return match;
}

/** The four scenes, in screenshot order, with the query each uses. */
export const SHOT_LIST = [
  { file: '01-cover.jpg', shot: 'table', query: '?shot=table&seed=1' },
  { file: '02-title.jpg', shot: 'title', query: '?shot=title&seed=1' },
  { file: '03-win.jpg', shot: 'win', query: '?shot=win&seed=1' },
  { file: '04-loss.jpg', shot: 'loss', query: '?shot=loss&seed=1' },
];
