// Ember Court — the rival's brain.
// The AI is deliberately readable: it spends what it can, prefers the suit
// that beats your ward, and saves nothing. A player who watches its ward
// can always answer with the counter-suit.

import { isAdvantage } from './config.js';

/**
 * Pick the AI's plays for one turn.
 * `hand` is the AI hand, `ember` its ember this turn, `playerWard` the suit
 * the player's last card left standing. Returns an ordered list of cards
 * to play; the caller removes them from the hand as they are played.
 * Pure: it never mutates the hand.
 */
export function choosePlays(hand, ember, playerWard) {
  const affordable = hand.filter((c) => c.cost <= ember);
  // Rank: suit advantage first, then raw power, then cheap cost as tiebreak.
  const ranked = affordable.slice().sort((a, b) => {
    const aAdv = isAdvantage(a.suit, playerWard) ? 1 : 0;
    const bAdv = isAdvantage(b.suit, playerWard) ? 1 : 0;
    if (aAdv !== bAdv) return bAdv - aAdv;
    if (a.power !== b.power) return b.power - a.power;
    return a.cost - b.cost;
  });
  const plays = [];
  let left = ember;
  for (const card of ranked) {
    // The rival never dumps its whole hand: two strikes a turn, then it
    // holds the rest. A player who counts its hand can plan around that.
    if (plays.length >= 2) break;
    if (card.cost <= left) {
      plays.push(card);
      left -= card.cost;
    }
  }
  return plays;
}

/** A one-line read of what the AI is thinking, shown in the table log. */
export function aiIntentText(plays, playerWard) {
  if (plays.length === 0) return 'The rival holds its ember close…';
  const advantaged = plays.filter((c) => isAdvantage(c.suit, playerWard));
  if (advantaged.length > 0) return `The rival answers your ward with ${advantaged.length} counter-suit strike${advantaged.length > 1 ? 's' : ''}!`;
  return `The rival plays ${plays.length} card${plays.length > 1 ? 's' : ''}.`;
}
