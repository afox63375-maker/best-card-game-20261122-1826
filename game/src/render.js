// Ember Court — every pixel the player sees.
// Pure Canvas 2D: the table, the cards, the title and the end screens are
// all drawn in code. Suits are told apart by colour AND shape, never by
// text alone: Flame is a red triangle, Tide a blue drop, Leaf a green leaf.

import { CARD_H, CARD_W, HAND_Y, START_LIFE, SUITS, VIEW_H, VIEW_W } from './config.js';
import { PHASE } from './state.js';

const FONT = (px, bold = false) => `${bold ? 'bold ' : ''}${px}px Georgia, 'Times New Roman', serif`;
const SANS = (px, bold = false) => `${bold ? 'bold ' : ''}${px}px Verdana, sans-serif`;

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function suitGlyph(ctx, suit, cx, cy, size, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  if (suit === 'flame') {
    ctx.beginPath();
    ctx.moveTo(cx, cy - size);
    ctx.lineTo(cx + size * 0.9, cy + size * 0.7);
    ctx.lineTo(cx - size * 0.9, cy + size * 0.7);
    ctx.closePath();
    ctx.fill();
  } else if (suit === 'tide') {
    ctx.beginPath();
    ctx.moveTo(cx, cy - size);
    ctx.bezierCurveTo(cx + size * 0.9, cy - size * 0.1, cx + size * 0.8, cy + size * 0.8, cx, cy + size * 0.8);
    ctx.bezierCurveTo(cx - size * 0.8, cy + size * 0.8, cx - size * 0.9, cy - size * 0.1, cx, cy - size);
    ctx.fill();
  } else {
    // leaf: two arcs meeting at a point, with a stem
    ctx.beginPath();
    ctx.moveTo(cx, cy - size);
    ctx.quadraticCurveTo(cx + size, cy - size * 0.2, cx, cy + size * 0.85);
    ctx.quadraticCurveTo(cx - size, cy - size * 0.2, cx, cy - size);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.moveTo(cx, cy - size * 0.7);
    ctx.lineTo(cx, cy + size * 1.15);
    ctx.stroke();
  }
  ctx.restore();
}

function drawTable(ctx) {
  const g = ctx.createRadialGradient(640, 380, 80, 640, 400, 760);
  g.addColorStop(0, '#3a2a1c');
  g.addColorStop(0.55, '#2a1e14');
  g.addColorStop(1, '#17100a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // Felt oval in the middle of the table.
  ctx.save();
  ctx.fillStyle = '#274d33';
  ctx.strokeStyle = '#c9a227';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(640, 400, 560, 210, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  // Ember glow dots along the felt rim.
  ctx.save();
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const x = 640 + Math.cos(a) * 560;
    const y = 400 + Math.sin(a) * 210;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,107,53,0.55)' : 'rgba(255,190,80,0.4)';
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawLifeBar(ctx, x, y, w, life, label, alignRight = false) {
  ctx.save();
  ctx.font = SANS(15, true);
  ctx.fillStyle = '#f5e9d0';
  ctx.textAlign = alignRight ? 'right' : 'left';
  ctx.fillText(label, alignRight ? x + w : x, y - 8);
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  roundRect(ctx, x, y, w, 22, 11);
  ctx.fill();
  const frac = Math.max(0, life / START_LIFE);
  const grad = ctx.createLinearGradient(x, y, x + w, y);
  grad.addColorStop(0, '#ff5a3c');
  grad.addColorStop(1, '#ffb347');
  ctx.fillStyle = grad;
  if (frac > 0) {
    roundRect(ctx, x + 2, y + 2, Math.max(10, (w - 4) * frac), 18, 9);
    ctx.fill();
  }
  ctx.font = SANS(14, true);
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.fillText(`${life} / ${START_LIFE}`, x + w / 2, y + 17);
  ctx.restore();
}

function drawEmberOrbs(ctx, x, y, ember, emberMax, label) {
  ctx.save();
  ctx.font = SANS(14, true);
  ctx.fillStyle = '#f5e9d0';
  ctx.textAlign = 'left';
  ctx.fillText(label, x, y - 10);
  for (let i = 0; i < emberMax; i++) {
    const cx = x + 14 + i * 28;
    ctx.beginPath();
    ctx.arc(cx, y + 10, 11, 0, Math.PI * 2);
    if (i < ember) {
      const g = ctx.createRadialGradient(cx - 3, y + 6, 2, cx, y + 10, 12);
      g.addColorStop(0, '#ffe08a');
      g.addColorStop(1, '#ff6b35');
      ctx.fillStyle = g;
    } else {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
    }
    ctx.fill();
    ctx.strokeStyle = '#c9a227';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  ctx.restore();
}

function drawWardBadge(ctx, x, y, ward, who) {
  ctx.save();
  ctx.font = SANS(13, true);
  ctx.fillStyle = '#d8c9a8';
  ctx.textAlign = 'center';
  ctx.fillText(`${who} ward`, x, y - 8);
  if (!ward) {
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    roundRect(ctx, x - 52, y, 104, 34, 8);
    ctx.fill();
    ctx.fillStyle = '#9c8f74';
    ctx.fillText('— none —', x, y + 22);
  } else {
    const s = SUITS[ward];
    ctx.fillStyle = s.dark;
    roundRect(ctx, x - 52, y, 104, 34, 8);
    ctx.fill();
    suitGlyph(ctx, ward, x - 30, y + 17, 9, s.color);
    ctx.fillStyle = '#fff';
    ctx.font = SANS(14, true);
    ctx.textAlign = 'left';
    ctx.fillText(s.name, x - 16, y + 22);
  }
  ctx.restore();
}

export function drawCardFace(ctx, card, x, y, opts = {}) {
  const { hover = false, playable = false, dim = false, scale = 1 } = opts;
  const w = CARD_W * scale;
  const h = CARD_H * scale;
  const s = SUITS[card.suit];
  ctx.save();
  if (dim) ctx.globalAlpha = 0.45;
  if (hover) ctx.translate(0, -14);
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  roundRect(ctx, x + 4, y + 6, w, h, 12);
  ctx.fill();
  // Face
  const face = ctx.createLinearGradient(x, y, x, y + h);
  face.addColorStop(0, '#fdf6e3');
  face.addColorStop(1, '#efe3c2');
  ctx.fillStyle = face;
  roundRect(ctx, x, y, w, h, 12);
  ctx.fill();
  ctx.lineWidth = playable ? 4 : 2;
  ctx.strokeStyle = playable ? '#ffd24a' : s.dark;
  ctx.stroke();
  // Suit band (cost orb sits on its left end, so the name starts past it)
  ctx.fillStyle = s.color;
  roundRect(ctx, x + 6, y + 6, w - 12, 30, 8);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = SANS(13 * scale, true);
  ctx.textAlign = 'left';
  ctx.fillText(s.name.toUpperCase(), x + 36, y + 26);
  // Glyph
  suitGlyph(ctx, card.suit, x + w / 2, y + 84 * scale, 28 * scale, s.color);
  // Name
  ctx.fillStyle = '#2a1e14';
  ctx.font = FONT(16 * scale, true);
  ctx.textAlign = 'center';
  wrapText(ctx, card.name, x + w / 2, y + 126 * scale, w - 16, 17 * scale);
  // Flavor, one line, truncated to fit — the bottom-right corner is the power's.
  ctx.fillStyle = '#6b5b43';
  ctx.font = `italic ${12 * scale}px Georgia, serif`;
  let flavor = card.flavor;
  while (flavor.length > 3 && ctx.measureText(flavor).width > w - 16) {
    flavor = flavor.slice(0, -4) + '…';
  }
  ctx.fillText(flavor, x + w / 2, y + 152 * scale);
  // Cost orb
  ctx.beginPath();
  ctx.arc(x + 16, y + 16, 15, 0, Math.PI * 2);
  ctx.fillStyle = '#ff6b35';
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = SANS(16 * scale, true);
  ctx.textAlign = 'center';
  ctx.fillText(String(card.cost), x + 16, y + 22);
  // Power, big, bottom-right (flavor keeps to one line above it)
  ctx.fillStyle = s.dark;
  ctx.font = FONT(28 * scale, true);
  ctx.textAlign = 'right';
  ctx.fillText(String(card.power), x + w - 12, y + h - 10);
  ctx.restore();
}

function wrapText(ctx, text, cx, y, maxW, lineH) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  lines.forEach((l, i) => ctx.fillText(l, cx, y + i * lineH));
}

export function drawCardBack(ctx, x, y, scale = 1) {
  const w = CARD_W * scale;
  const h = CARD_H * scale;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  roundRect(ctx, x + 4, y + 6, w, h, 12);
  ctx.fill();
  const back = ctx.createLinearGradient(x, y, x + w, y + h);
  back.addColorStop(0, '#5a2d18');
  back.addColorStop(1, '#2e160c');
  ctx.fillStyle = back;
  roundRect(ctx, x, y, w, h, 12);
  ctx.fill();
  ctx.strokeStyle = '#c9a227';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(201,162,39,0.7)';
  roundRect(ctx, x + 10, y + 10, w - 20, h - 20, 8);
  ctx.stroke();
  suitGlyph(ctx, 'flame', x + w / 2, y + h / 2 - 6, 26 * scale, '#ff6b35');
  ctx.fillStyle = '#c9a227';
  ctx.font = SANS(11 * scale, true);
  ctx.textAlign = 'center';
  ctx.fillText('EMBER COURT', x + w / 2, y + h - 22);
  ctx.restore();
}

/** Hand layout: centered row of card rects, overlapping when many. `cx` is the row centre, `scale` the card scale. */
export function handRects(hand, y, maxW = 900, cx = 640, scale = 1) {
  const n = hand.length;
  const cw = CARD_W * scale;
  const step = Math.min(CARD_W + 14, n > 1 ? (maxW - cw) / (n - 1) : 0);
  const total = cw + step * (n - 1);
  const x0 = cx - total / 2;
  return hand.map((card, i) => ({ card, x: x0 + i * step, y, w: cw, h: CARD_H * scale }));
}

function drawButton(ctx, rect, label, enabled, hot = false) {
  ctx.save();
  ctx.fillStyle = enabled ? (hot ? '#ff8c42' : '#c96a1e') : '#5a4a38';
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 10);
  ctx.fill();
  ctx.strokeStyle = '#ffd24a';
  ctx.lineWidth = enabled ? 2 : 1;
  ctx.stroke();
  ctx.fillStyle = enabled ? '#fff' : '#b8a888';
  ctx.font = SANS(17, true);
  ctx.textAlign = 'center';
  ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2 + 6);
  ctx.restore();
}

function drawLog(ctx, match) {
  ctx.save();
  const lines = match.log.slice(-3);
  ctx.font = SANS(15);
  ctx.textAlign = 'center';
  lines.forEach((line, i) => {
    ctx.fillStyle = i === lines.length - 1 ? '#ffe9b0' : 'rgba(245,233,208,0.6)';
    ctx.fillText(line, 640, 330 + i * 22);
  });
  ctx.restore();
}

function drawFloatingDamage(ctx, fx) {
  ctx.save();
  ctx.textAlign = 'center';
  for (const f of fx) {
    if (f.kind !== 'damage') continue;
    const age = (Date.now() - f.born) / 900;
    if (age >= 1) continue;
    const y = f.y - age * 70;
    ctx.globalAlpha = 1 - age;
    ctx.font = FONT(44, true);
    ctx.fillStyle = f.advantage ? '#ffd24a' : '#ff5a3c';
    ctx.fillText(`-${f.amount}`, f.x, y);
    if (f.advantage) {
      ctx.font = SANS(15, true);
      ctx.fillStyle = '#ffe9b0';
      ctx.fillText('SUIT ADVANTAGE ×2', f.x, y + 24);
    }
  }
  ctx.restore();
}

function drawTitle(ctx, match) {
  drawTable(ctx);
  ctx.save();
  // Ember glow behind the title
  const glow = ctx.createRadialGradient(640, 300, 20, 640, 300, 320);
  glow.addColorStop(0, 'rgba(255,107,53,0.35)');
  glow.addColorStop(1, 'rgba(255,107,53,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(200, 0, 880, 600);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd24a';
  ctx.font = FONT(74, true);
  ctx.fillText('EMBER COURT', 640, 300);
  ctx.fillStyle = '#f5e9d0';
  ctx.font = FONT(28);
  ctx.fillText('A duel of flame, tide and leaf', 640, 350);
  // Suit legend: colour + shape, never text alone
  const legend = [
    ['flame', 'Flame burns Leaf'],
    ['tide', 'Tide douses Flame'],
    ['leaf', 'Leaf drinks Tide'],
  ];
  legend.forEach(([suit, text], i) => {
    const x = 640 - 260 + i * 260;
    suitGlyph(ctx, suit, x - 90, 415, 16, SUITS[suit].color);
    ctx.fillStyle = '#f5e9d0';
    ctx.font = SANS(17);
    ctx.textAlign = 'left';
    ctx.fillText(text, x - 66, 421);
  });
  ctx.fillStyle = '#ffe9b0';
  ctx.font = SANS(20, true);
  ctx.textAlign = 'center';
  const blink = Math.floor(Date.now() / 500) % 2 === 0;
  if (blink) ctx.fillText('Click or press Enter to play', 640, 500);
  ctx.fillStyle = '#d8c9a8';
  ctx.font = SANS(15);
  ctx.fillText('30 life · ember grows as the duel goes on · same-suit chains deal bonus damage', 640, 545);
  ctx.fillText('Keys 1–7 play a card · Space ends your turn', 640, 572);
  // Fan of three sample cards under the title
  const samples = [
    { name: 'Bonfire Knight', suit: 'flame', cost: 3, power: 4, flavor: 'Sworn to the hearth.' },
    { name: 'Stormcaller', suit: 'tide', cost: 4, power: 5, flavor: 'Rain answers when it sings.' },
    { name: 'Ancient Oak', suit: 'leaf', cost: 5, power: 6, flavor: 'Older than the court.' },
  ];
  samples.forEach((c, i) => drawCardFace(ctx, c, 640 - 200 + i * 150 - 10, 610, { scale: 0.62 }));
  ctx.restore();
}

function drawEndScreen(ctx, match, won) {
  drawTable(ctx);
  ctx.save();
  ctx.fillStyle = 'rgba(10,6,3,0.72)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.textAlign = 'center';
  ctx.fillStyle = won ? '#ffd24a' : '#9fb6c9';
  ctx.font = FONT(88, true);
  ctx.fillText(won ? 'VICTORY' : 'DEFEAT', 640, 300);
  ctx.fillStyle = '#f5e9d0';
  ctx.font = FONT(26);
  ctx.fillText(
    won ? 'The rival court falls — the embers are yours.' : 'Your embers fade — the rival keeps the court.',
    640,
    352,
  );
  const s = match.stats;
  ctx.font = SANS(19);
  const rows = [
    `Turns played: ${s.turns + 1}`,
    `Damage dealt: ${s.damageDealt}`,
    `Damage taken: ${s.damageTaken}`,
    `Cards played: ${s.cardsPlayed}`,
    `Best chain: ${s.bestChain > 0 ? `×${s.bestChain}` : '—'}`,
  ];
  rows.forEach((row, i) => ctx.fillText(row, 640, 420 + i * 30));
  ctx.fillStyle = '#ffe9b0';
  ctx.font = SANS(18, true);
  const blink = Math.floor(Date.now() / 500) % 2 === 0;
  if (blink) ctx.fillText('Press R or click to play again', 640, 645);
  ctx.restore();
}

/**
 * Draw the whole scene for `match` plus transient effects `fx`.
 * `ui` carries hover info and the End Turn button rect for the input layer.
 */
export function drawScene(ctx, match, ui, fx) {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  if (match.phase === PHASE.TITLE) {
    drawTitle(ctx, match);
    return;
  }
  if (match.phase === PHASE.WON) {
    drawEndScreen(ctx, match, true);
    return;
  }
  if (match.phase === PHASE.LOST) {
    drawEndScreen(ctx, match, false);
    return;
  }
  drawTable(ctx);
  const { player, rival } = match;

  // Rival portrait + life (top left column; the hand lives to its right)
  ctx.save();
  ctx.fillStyle = '#2e160c';
  ctx.beginPath();
  ctx.arc(88, 120, 52, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c9a227';
  ctx.lineWidth = 3;
  ctx.stroke();
  suitGlyph(ctx, 'flame', 88, 118, 26, '#ff6b35');
  ctx.fillStyle = '#f5e9d0';
  ctx.font = SANS(16, true);
  ctx.textAlign = 'center';
  ctx.fillText('RIVAL', 88, 196);
  ctx.restore();
  drawLifeBar(ctx, 170, 96, 220, rival.life, 'Rival life');
  drawEmberOrbs(ctx, 170, 150, rival.ember, rival.emberMax, 'Rival ember');
  drawWardBadge(ctx, 260, 195, rival.ward, 'Rival');

  // Rival hand, face down (top right, clear of the life column)
  const foeRects = handRects(rival.hand, 76, 700, 760, 0.62);
  foeRects.forEach((r) => drawCardBack(ctx, r.x, r.y, 0.62));

  // Deck counts
  ctx.save();
  ctx.fillStyle = '#d8c9a8';
  ctx.font = SANS(14);
  ctx.textAlign = 'center';
  ctx.fillText(`Rival deck: ${rival.deck.length}`, 1150, 130);
  ctx.fillText(`Your deck: ${player.deck.length}`, 1150, 772);
  ctx.restore();

  // Turn banner + log
  ctx.save();
  ctx.fillStyle = '#ffe9b0';
  ctx.font = FONT(24, true);
  ctx.textAlign = 'center';
  ctx.fillText(
    match.phase === PHASE.PLAYER ? `Your turn — Turn ${match.turn}` : 'Rival is thinking…',
    640,
    300,
  );
  ctx.restore();
  drawLog(ctx, match);

  // Player portrait + life (bottom left column)
  ctx.save();
  ctx.fillStyle = '#1d3a24';
  ctx.beginPath();
  ctx.arc(88, 655, 48, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c9a227';
  ctx.lineWidth = 3;
  ctx.stroke();
  suitGlyph(ctx, 'leaf', 88, 653, 26, '#58c24a');
  ctx.fillStyle = '#f5e9d0';
  ctx.font = SANS(16, true);
  ctx.textAlign = 'center';
  ctx.fillText('YOU', 88, 724);
  ctx.restore();
  drawLifeBar(ctx, 170, 615, 220, player.life, 'Your life');
  drawEmberOrbs(ctx, 170, 662, player.ember, player.emberMax, 'Your ember');
  drawWardBadge(ctx, 280, 700, player.ward, 'Your');

  // End Turn button (above the hand, clear of the cards)
  const btn = { x: 1070, y: 500, w: 170, h: 54 };
  ui.endTurnRect = btn;
  drawButton(ctx, btn, match.phase === PHASE.PLAYER ? 'END TURN ⏎' : 'RIVAL…', match.phase === PHASE.PLAYER, ui.hoverEndTurn);

  // Player hand (centred right of the life column)
  const rects = handRects(player.hand, HAND_Y, 700, 760, 1);
  ui.handRects = rects;
  rects.forEach((r, i) => {
    const playable = match.phase === PHASE.PLAYER && r.card.cost <= player.ember;
    drawCardFace(ctx, r.card, r.x, r.y, {
      hover: ui.hoverCard === i,
      playable,
      dim: match.phase !== PHASE.PLAYER,
    });
  });

  // Keyboard hints
  ctx.save();
  ctx.fillStyle = 'rgba(245,233,208,0.65)';
  ctx.font = SANS(13);
  ctx.textAlign = 'left';
  ctx.fillText('Click a card or press 1–7 to play · Space ends turn', 170, 780);
  ctx.restore();

  // Played-card flight + floating damage
  for (const f of fx) {
    if (f.kind === 'played' && f.card) {
      const age = (Date.now() - f.born) / 600;
      if (age < 1) {
        const x = f.fromX + (640 - CARD_W / 2 - f.fromX) * age;
        const y = f.fromY + (360 - f.fromY) * age;
        ctx.save();
        ctx.globalAlpha = 1 - age * 0.4;
        drawCardFace(ctx, f.card, x, y, { scale: 0.8 });
        ctx.restore();
      }
    }
  }
  drawFloatingDamage(ctx, fx);
}
