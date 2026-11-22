// Ember Court — the match state and the turn rules.
// Pure logic: no canvas, no DOM, no sound. The browser wires this to the
// renderer and the input; Node can import it to simulate a whole match.

import { CHAIN_BONUS, MAX_EMBER, MAX_HAND, START_HAND, START_LIFE, isAdvantage } from './config.js';
import { buildDeck, drawCards } from './deck.js';
import { choosePlays } from './ai.js';

export const PHASE = {
  TITLE: 'title',
  PLAYER: 'player',
  RIVAL: 'rival',
  WON: 'won',
  LOST: 'lost',
};

/** Ember a side holds on turn `turn` (turns start at 1, capped at 10). */
export function emberForTurn(turn) {
  return Math.min(1 + Math.floor((turn - 1) / 2), MAX_EMBER);
}

function makeSide(deck, rng) {
  const hand = [];
  drawCards(deck, hand, START_HAND, MAX_HAND);
  return { life: START_LIFE, ember: 1, emberMax: 1, hand, deck, ward: null, playedThisTurn: [] };
}

/** A fresh match. `seed` drives both decks through one shared RNG. */
export function newMatch(seed) {
  let state = seed >>> 0;
  const rng = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const player = makeSide(buildDeck(rng), rng);
  const rival = makeSide(buildDeck(rng), rng);
  return {
    seed,
    phase: PHASE.TITLE,
    turn: 1,
    player,
    rival,
    log: ['Welcome to Ember Court. Press Enter or click to begin.'],
    lastDamage: null,
    stats: { turns: 0, damageDealt: 0, damageTaken: 0, cardsPlayed: 0, bestChain: 0 },
  };
}

/** Move the match from the title screen into the player's first turn. */
export function startMatch(match) {
  match.phase = PHASE.PLAYER;
  match.player.emberMax = emberForTurn(match.turn);
  match.player.ember = match.player.emberMax;
  match.log.push('Your move — play cards, then end your turn.');
  return match;
}

/** Damage a card deals, before it lands: power, doubled on suit advantage, plus chain bonus. */
export function cardDamage(card, defenderWard, chainCount) {
  let dmg = card.power;
  if (isAdvantage(card.suit, defenderWard)) dmg *= 2;
  else if (defenderWard && card.suit === defenderWard) dmg = Math.max(1, Math.ceil(dmg / 2));
  if (chainCount > 0) dmg += CHAIN_BONUS * chainCount;
  return dmg;
}

/**
 * Play one card from `side`'s hand against `foe`.
 * Returns the strike { card, damage, advantage, chain } or null when the
 * card cannot be played (not in hand, not enough ember, wrong phase).
 */
export function playCard(match, side, foe, cardUid) {
  const card = side.hand.find((c) => c.uid === cardUid);
  if (!card) return null;
  if (card.cost > side.ember) return null;
  side.hand.splice(side.hand.indexOf(card), 1);
  side.ember -= card.cost;
  const sameSuit = side.playedThisTurn.filter((c) => c.suit === card.suit).length;
  const damage = cardDamage(card, foe.ward, sameSuit);
  foe.life = Math.max(0, foe.life - damage);
  side.ward = card.suit;
  side.playedThisTurn.push(card);
  if (sameSuit + 1 > match.stats.bestChain && side === match.player) {
    match.stats.bestChain = sameSuit + 1;
  }
  if (side === match.player) {
    match.stats.damageDealt += damage;
    match.stats.cardsPlayed += 1;
  } else {
    match.stats.damageTaken += damage;
  }
  const advantage = isAdvantage(card.suit, foe.ward);
  match.lastDamage = { amount: damage, advantage, chain: sameSuit, by: side === match.player ? 'player' : 'rival' };
  match.log.push(
    `${side === match.player ? 'You play' : 'Rival plays'} ${card.name} — ${damage} damage${isAdvantage(card.suit, foe.ward) ? ' (suit advantage ×2!)' : ''}${sameSuit > 0 ? ` (chain +${CHAIN_BONUS * sameSuit})` : ''}.`,
  );
  if (foe.life <= 0) {
    match.phase = side === match.player ? PHASE.WON : PHASE.LOST;
    match.log.push(side === match.player ? 'The rival court falls. Victory!' : 'Your embers fade. Defeat.');
  }
  return { card, damage, advantage: isAdvantage(card.suit, foe.ward), chain: sameSuit };
}

/** End the player's turn: the rival plays, then a new player turn begins. */
export function endPlayerTurn(match) {
  if (match.phase !== PHASE.PLAYER) return match;
  match.phase = PHASE.RIVAL;
  match.player.playedThisTurn = [];
  const rival = match.rival;
  rival.emberMax = emberForTurn(match.turn);
  rival.ember = rival.emberMax;
  drawCards(rival.deck, rival.hand, 1, MAX_HAND);
  const plays = choosePlays(rival.hand, rival.ember, match.player.ward);
  for (const card of plays) {
    if (match.phase !== PHASE.RIVAL) break;
    playCard(match, rival, match.player, card.uid);
  }
  if (match.phase === PHASE.RIVAL) {
    match.rival.playedThisTurn = [];
    match.turn += 1;
    match.stats.turns = match.turn - 1;
    match.player.emberMax = emberForTurn(match.turn);
    match.player.ember = match.player.emberMax;
    drawCards(match.player.deck, match.player.hand, 1, MAX_HAND);
    match.phase = PHASE.PLAYER;
    match.log.push(`Turn ${match.turn} — ${match.player.ember} ember. Your move.`);
  }
  return match;
}

/** Restart the match with the same seed (fresh decks, same shuffle). */
export function restartMatch(match) {
  const fresh = newMatch(match.seed);
  fresh.phase = PHASE.PLAYER;
  fresh.player.emberMax = emberForTurn(1);
  fresh.player.ember = 1;
  return fresh;
}
