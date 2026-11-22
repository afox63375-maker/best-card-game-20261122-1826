// Ember Court — shared tuning and suit table.
// One place holds every number the rest of the game reads, so a balance
// change never means hunting through the renderer or the AI.

export const VIEW_W = 1280;
export const VIEW_H = 800;

export const START_LIFE = 30;
export const START_HAND = 5;
export const MAX_HAND = 7;
export const MAX_EMBER = 10;
export const DECK_COPIES = 2;
export const CHAIN_BONUS = 2;

// The suit cycle: Flame burns Leaf, Leaf drinks Tide, Tide douses Flame.
// A card whose suit beats the defender's ward suit deals double damage;
// a card of the same suit as the ward is blocked for half damage.
export const SUITS = {
  flame: { key: 'flame', name: 'Flame', beats: 'leaf', color: '#ff6b35', dark: '#c33d12', glyph: 'triangle' },
  tide: { key: 'tide', name: 'Tide', beats: 'flame', color: '#35a7ff', dark: '#1668b8', glyph: 'drop' },
  leaf: { key: 'leaf', name: 'Leaf', beats: 'tide', color: '#58c24a', dark: '#2e7d26', glyph: 'leaf' },
};

export const SUIT_KEYS = ['flame', 'tide', 'leaf'];

/** The suit that `suit` beats, or null for an unknown suit. */
export function beatsSuit(suit) {
  const s = SUITS[suit];
  return s ? s.beats : null;
}

/** True when an attacker of `attackSuit` strikes a ward of `wardSuit` for double damage. */
export function isAdvantage(attackSuit, wardSuit) {
  if (!wardSuit) return false;
  return beatsSuit(attackSuit) === wardSuit;
}

// Card art palette per suit, used by the renderer for faces and backs.
export const CARD_W = 132;
export const CARD_H = 188;
export const HAND_Y = 560;
export const FOE_Y = 96;
