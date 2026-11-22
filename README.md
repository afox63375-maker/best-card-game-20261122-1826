[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/afox63375-maker/best-card-game-20261122-1826/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/afox63375-maker/best-card-game-20261122-1826/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

# Ember Court

A 1v1 card duel against a readable AI rival, built for the make.fun best card game bounty. Pure Canvas 2D — no libraries, no network, all art drawn in code, sounds synthesized with WebAudio.

## How to play

- You and the rival each have **30 life**. Reduce the rival to 0 to win.
- **Ember** is your mana: it grows as the duel goes on (+1 every other turn, up to 10) and refills at the start of your turn. Every card costs ember.
- Cards have a **cost**, a **power**, and a **suit**: Flame, Tide or Leaf.
  - **Flame burns Leaf, Leaf drinks Tide, Tide douses Flame.**
  - Attacking with the suit that beats the defender's **ward** (the suit of the last card they played) deals **double damage**.
  - Attacking with the same suit as the ward is blocked for **half damage**.
  - Playing two or more cards of the same suit in one turn builds a **chain**: each chained card deals +2 bonus damage.
- The rival plays at most two cards a turn, always spending what it can and preferring the suit that counters your ward — watch its ward and answer with the counter-suit.
- Draw one card at the start of your turn; hands hold at most 7 cards.

## Controls

- **Click a card** (or press **1–7**) to play it.
- **Space / Enter** ends your turn (also starts the game).
- **R** plays again after a win or loss. **M** mutes the sound.

## Run it

Serve `game/` with any static server and open `game/index.html` in desktop Chrome. No build step, no network requests.

```sh
npx serve game
```

Deterministic screenshot scenes: open `game/index.html?shot=title|table|win|loss&seed=1`.

## Files

- `game/index.html`, `game/style.css` — the page.
- `game/src/config.js` — tuning and the suit cycle.
- `game/src/rng.js` — seeded random source.
- `game/src/deck.js` — the 18 original court cards and the deck.
- `game/src/ai.js` — the rival's readable heuristic.
- `game/src/state.js` — match state and turn rules (pure logic).
- `game/src/render.js` — all Canvas 2D drawing.
- `game/src/input.js` — mouse and keyboard.
- `game/src/sound.js` — WebAudio blips, generated in code.
- `game/src/shots.js` — deterministic screenshot scenes.
- `game/src/main.js` — bootstrap and frame loop.
- `main.ts` — hands the entry in (copies `game/` + `screenshots/` and writes `dossier.json`).

## Play on make.fun

https://make.fun/r/1hh4a8y6
