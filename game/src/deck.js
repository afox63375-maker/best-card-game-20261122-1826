// Ember Court — the card pool and the deck.
// Eighteen original court cards, two copies of each in a deck of thirty-six.
// A card is a plain object: { id, name, suit, cost, power, flavor }.

import { DECK_COPIES } from './config.js';
import { shuffle } from './rng.js';

export const CARD_POOL = [
  { id: 'ember-sprite', name: 'Ember Sprite', suit: 'flame', cost: 1, power: 2, flavor: 'A spark that learned to dance.' },
  { id: 'ash-wisp', name: 'Ash Wisp', suit: 'flame', cost: 1, power: 2, flavor: 'It hums where the fire died.' },
  { id: 'cinder-fox', name: 'Cinder Fox', suit: 'flame', cost: 2, power: 3, flavor: 'Its tail leaves a trail of coals.' },
  { id: 'bonfire-knight', name: 'Bonfire Knight', suit: 'flame', cost: 3, power: 4, flavor: 'Sworn to the hearth, blade alight.' },
  { id: 'phoenix-herald', name: 'Phoenix Herald', suit: 'flame', cost: 4, power: 5, flavor: 'It announces the dawn in flame.' },
  { id: 'volcano-heart', name: 'Volcano Heart', suit: 'flame', cost: 5, power: 6, flavor: 'The mountain, given a pulse.' },
  { id: 'dew-nymph', name: 'Dew Nymph', suit: 'tide', cost: 1, power: 2, flavor: 'She gathers mornings in a cup.' },
  { id: 'mist-eel', name: 'Mist Eel', suit: 'tide', cost: 2, power: 3, flavor: 'You see it only after it bites.' },
  { id: 'river-otter', name: 'River Otter', suit: 'tide', cost: 2, power: 4, flavor: 'The current is its playground.' },
  { id: 'coral-guard', name: 'Coral Guard', suit: 'tide', cost: 3, power: 4, flavor: 'A reef that learned to stand.' },
  { id: 'stormcaller', name: 'Stormcaller', suit: 'tide', cost: 4, power: 5, flavor: 'Rain answers when it sings.' },
  { id: 'leviathan-pup', name: 'Leviathan Pup', suit: 'tide', cost: 5, power: 6, flavor: 'Small now. The sea is patient.' },
  { id: 'sproutling', name: 'Sproutling', suit: 'leaf', cost: 1, power: 2, flavor: 'First green after the long ash.' },
  { id: 'moss-sprite', name: 'Moss Sprite', suit: 'leaf', cost: 1, power: 3, flavor: 'Soft feet on old stone.' },
  { id: 'thorn-hare', name: 'Thorn Hare', suit: 'leaf', cost: 2, power: 3, flavor: 'Quick as a bramble snapping shut.' },
  { id: 'grove-warden', name: 'Grove Warden', suit: 'leaf', cost: 3, power: 4, flavor: 'Every root in the court obeys.' },
  { id: 'vine-serpent', name: 'Vine Serpent', suit: 'leaf', cost: 4, power: 5, flavor: 'It coils where the light falls.' },
  { id: 'ancient-oak', name: 'Ancient Oak', suit: 'leaf', cost: 5, power: 6, flavor: 'Older than the court itself.' },
];

/** A fresh 36-card deck (two copies of every pool card), shuffled by `rng`. */
export function buildDeck(rng) {
  const cards = [];
  for (let copy = 0; copy < DECK_COPIES; copy++) {
    for (const c of CARD_POOL) cards.push({ ...c, uid: `${c.id}-${copy}` });
  }
  return shuffle(rng, cards);
}

/** Draw up to `n` cards from the front of `deck` into `hand`. Returns what was drawn. */
export function drawCards(deck, hand, n, maxHand) {
  const drawn = [];
  while (drawn.length < n && deck.length > 0 && hand.length < maxHand) {
    const card = deck.shift();
    hand.push(card);
    drawn.push(card);
  }
  return drawn;
}

/** Find a card in a hand by its uid. */
export function findInHand(hand, uid) {
  return hand.find((c) => c.uid === uid) || null;
}
