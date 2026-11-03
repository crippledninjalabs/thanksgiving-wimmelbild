// Thanksgiving banquet hall, one cutaway room at the final pixel density.
// Time is an integer tick, 24 ticks per second, 480 ticks in the 20s loop.
// Every cycle length divides 480, so tick 480 matches tick 0 exactly.

import { C, PAL, WARM } from './palette.js';
import { Pix } from './pix.js';
import { drawText } from './font.js';
import {
  ELON_WALK, ELON_TYPE,
  OPT_WALK, OPT_CARRY, OPT_SERVE,
  TURKEY_WALK, TURKEY_SIT, TURKEY_STAND,
  CLOCHE, PLATTER, ROAST, PIE_PUMPKIN, PIE_BERRY,
  BOWL_MASH, BOWL_MASH_GRAVY, CORN, ROLLS, BEANS, GRAVY_BOAT,
  CANDLE, EGG, EGG_FLAT,
  DINER_SHORT, DINER_BUN, DINER_SHORT_CHEW, DINER_BUN_CHEW,
  CAT, CAT_ALERT, DOG, DOG_LOOK, GROK, GROK_PLATE,
  TREE, OVEN_ROAST,
} from './sprites.js';

export const W = 384;
export const H = 216;
export const LOOP = 480;
export const HZ = 24;
export const HERO_TICK = 236;

const HALL_TOP = 34;
const FLOOR = 164;
const SLAB2 = 174;

const TABLE_L = 62;
const TABLE_R = 250;
const TABLE_TOP = 152;

const CLIP = 268;
const ELON_X0 = 246;
const ELON_STRIDE = 3;
const WALK_END_INDEX = 16;
const IN0 = 18;
const IN1 = 69;
const OUT0 = 411;
const OUT1 = 462;
const STAND_X = ELON_X0 + WALK_END_INDEX * ELON_STRIDE;

const SERVE_X = 36;
const CARRY_X0 = 36;
const CARRY_IDX = 17;

export function mod(t, n) {
  return ((t % n) + n) % n;
}

function line(p, x0, y0, x1, y1, c) {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let i = 0; i <= steps; i++) {
    const x = Math.round(x0 + ((x1 - x0) * i) / steps);
    const y = Math.round(y0 + ((y1 - y0) * i) / steps);
    p.set(x, y, c);
  }
}

function shadow(p, x, y, w) {
  for (let i = 1; i < w - 1; i++) {
    const c = p.get(x + i, y);
    if (c === C.wood || c === C.woodL || c === C.woodD) p.set(x + i, y, C.woodK);
  }
}

const TSEG = buildSegs([
  ['rise', 30],
  ['elbow', 12],
  ['cloche', 12],
  ['down', 30],
  ['carry', 54],
  ['reveal', 20],
  ['hop', 12],
  ['sit', 84],
  ['hopdown', 12],
  ['waddle', 150],
  ['drop', 24],
  ['belt', 40],
]);

function buildSegs(list) {
  const out = [];
  let t = 0;
  for (const [mode, dur] of list) {
    out.push({ mode, t0: t, t1: t + dur });
    t += dur;
  }
  if (t !== LOOP) throw new Error(`turkey segments sum to ${t}, not ${LOOP}`);
  return out;
}

function segAt(phase) {
  for (const s of TSEG) if (phase >= s.t0 && phase < s.t1) return s;
  return TSEG[0];
}

function turkeyState(phase) {
  const s = segAt(phase);
  const k = phase - s.t0;
  const dur = s.t1 - s.t0;
  if (s.mode === 'rise') {
    return { mode: s.mode, layer: 'shaft', x: 40, y: 184 - k * 6, frame: 0, cloche: false };
  }
  if (s.mode === 'elbow') {
    return { mode: s.mode, layer: 'kitchen', x: 40 - k * 2, y: 18, frame: 0, cloche: k > 6 };
  }
  if (s.mode === 'cloche') {
    return { mode: s.mode, layer: 'kitchen', x: 16, y: 16, frame: 0, cloche: true };
  }
  if (s.mode === 'down') {
    return { mode: s.mode, layer: 'shaft', x: 16, y: 20 + k * 4, frame: 0, cloche: true };
  }
  if (s.mode === 'carry') {
    const idx = Math.min(CARRY_IDX, Math.floor(k / 3));
    return { mode: s.mode, layer: 'carry', x: CARRY_X0 + idx * 3, y: 0, frame: idx % 6, cloche: true };
  }
  if (s.mode === 'reveal') {
    return { mode: s.mode, layer: 'table', x: 88, y: 132, frame: 0, cloche: true, lift: k };
  }
  if (s.mode === 'hop') {
    const x = 100 - Math.round((k * 24) / dur);
    const y = 118 + Math.round((k * 14) / dur);
    return { mode: s.mode, layer: 'table', x, y, frame: 0, cloche: false, hop: k };
  }
  if (s.mode === 'sit') {
    return { mode: s.mode, layer: 'table', x: 76, y: 132, frame: Math.floor(phase / 10) % 2, cloche: false };
  }
  if (s.mode === 'hopdown') {
    return { mode: s.mode, layer: 'floor', x: 76, y: 132 + k, frame: k % 6, cloche: false };
  }
  if (s.mode === 'waddle') {
    const step = Math.floor(k / 2);
    return { mode: s.mode, layer: 'floor', x: 76 + step * 4, y: FLOOR - 18, frame: step % 6, cloche: false };
  }
  if (s.mode === 'drop') {
    return { mode: s.mode, layer: 'shaft', x: 358, y: 146 + k * 2, frame: 0, cloche: false };
  }
  // belt, riding back toward the left riser. Feet rest on the belt.
  return { mode: 'belt', layer: 'base', x: 350 - k * 8, y: 184, frame: Math.floor(phase / 4) % 6, cloche: false };
}

function optimusState(tick) {
  for (const off of [0, 240]) {
    const phase = mod(tick + off, LOOP);
    if (phase >= 84 && phase < 138) {
      const st = turkeyState(phase);
      return { mode: 'carry', x: st.x, frame: st.frame };
    }
    if (phase >= 138 && phase < 170) {
      return { mode: 'reveal', x: CARRY_X0 + CARRY_IDX * 3, frame: 0, lift: phase >= 138 && phase < 158 ? phase - 138 : 20 };
    }
    if (phase >= 170 && phase < 224) {
      const k = phase - 170;
      const idx = Math.min(17, Math.floor(k / 3));
      return { mode: 'return', x: CARRY_X0 + CARRY_IDX * 3 - idx * 3, frame: idx % 6 };
    }
  }
  const bob = Math.floor(tick / 12) % 2;
  return { mode: 'serve', x: SERVE_X, frame: bob };
}

function elonState(tick) {
  if (tick < IN0 || tick >= OUT1) return { mode: 'hidden', x: ELON_X0, frame: 0, face: 1 };
  if (tick < IN1) {
    const idx = Math.min(WALK_END_INDEX, Math.floor((tick - IN0) / 3));
    return { mode: 'walk', x: ELON_X0 + idx * ELON_STRIDE, frame: idx % 8, face: 1 };
  }
  if (tick < OUT0) {
    const blink = tick % 96 < 3;
    const hand = Math.floor(tick / 3) % 2;
    return { mode: 'type', x: STAND_X, frame: hand, face: 1, blink };
  }
  const idx = Math.min(WALK_END_INDEX, Math.floor((tick - OUT0) / 3));
  return { mode: 'walk', x: STAND_X - idx * ELON_STRIDE, frame: idx % 8, face: -1 };
}

function drawShell(p, tick) {
  p.clear(C.plaster);
  // roof lip and kitchen
  p.fill(0, 0, W, 3, C.ink2);
  p.fill(0, 3, W, 23, C.plaster3);
  p.fill(0, 26, W, 8, C.steelD);
  p.hline(0, 26, W, C.steelL);
  p.hline(0, 33, W, C.ink);
  // hall plaster already clear-filled; wainscot
  // Chair rail sits just above the table, so heads read against plaster.
  p.fill(0, 142, W, FLOOR - 142, C.wood);
  for (let x = 8; x < W; x += 18) p.vline(x, 144, FLOOR - 148, C.woodD);
  p.fill(0, 140, W, 3, C.woodL);
  p.hline(0, 140, W, C.cream);
  p.fill(0, FLOOR - 5, W, 5, C.woodD);
  p.hline(0, FLOOR - 5, W, C.woodK);
  // floor deck
  p.fill(0, FLOOR, W, 3, C.woodL);
  for (let x = 0; x < W; x += 14) p.set(x, FLOOR + 1, C.woodK);
  p.fill(0, FLOOR + 3, W, SLAB2 - (FLOOR + 3), C.steelD);
  p.hline(0, SLAB2 - 1, W, C.ink);
  // side walls
  p.fill(0, HALL_TOP, 6, FLOOR - HALL_TOP, C.woodK);
  p.fill(W - 6, HALL_TOP, 6, FLOOR - HALL_TOP, C.woodK);
  // crown
  p.fill(0, HALL_TOP, W, 3, C.woodD);
  p.hline(0, HALL_TOP, W, C.woodK);

  drawWindow(p, tick);
  drawBunting(p, tick);
  drawLamps(p);
  drawPlaque(p);
  drawDoor(p);
  drawShaftBacks(p);
  drawKitchen(p, tick);
  drawBasementShell(p, tick);
}

function drawWindow(p, tick) {
  const x = 108;
  const y = 48;
  const w = 78;
  const h = 52;
  for (let yy = 0; yy < h; yy++) {
    const band = yy < 16 ? C.sky : yy < 34 ? C.sky2 : C.sky3;
    p.hline(x, y + yy, w, band);
  }
  // tree, swaying one pixel on a 48-tick cycle
  const sway = [0, 0, 1, 1, 0, 0, -1, -1][Math.floor(tick / 6) % 8];
  p.blit(TREE, x + 30 + sway, y + 8);
  // a few light shafts
  for (const ox of [8, 22, 40, 58]) {
    for (let yy = 4; yy < h - 2; yy += 3) p.set(x + ox, y + yy, C.glow);
  }
  // falling leaves inside the panes
  for (let i = 0; i < 4; i++) {
    const age = (tick + i * 60) % 240;
    const ly = y + 4 + Math.floor((age * (h - 8)) / 240);
    const lx = x + 10 + ((i * 18 + Math.floor(age / 8)) % (w - 16));
    p.set(lx, ly, i % 2 ? C.leaf : C.gold);
    p.set(lx + 1, ly, C.leafD);
  }
  // frame and mullions (border only — rect() would wipe the panes)
  p.hline(x - 2, y - 2, w + 4, C.woodL);
  p.hline(x - 2, y + h + 1, w + 4, C.woodK);
  p.vline(x - 2, y - 2, h + 4, C.woodD);
  p.vline(x + w + 1, y - 2, h + 4, C.woodK);
  p.vline(x + (w >> 1), y, h, C.woodK);
  p.hline(x, y + (h >> 1), w, C.woodK);
  // sill
  p.fill(x - 4, y + h + 2, w + 8, 3, C.woodL);
  p.hline(x - 4, y + h + 4, w + 8, C.woodK);
}

function drawBunting(p, tick) {
  const colors = [C.rust, C.gold, C.olive, C.burg, C.cream, C.pumpkin];
  const y0 = 40;
  p.hline(16, y0, W - 32, C.ink);
  for (let i = 0, x = 18; x < W - 24; x += 12, i++) {
    const sway = [0, 0, 1, 1, 0, -1][Math.floor((tick + i * 8) / 5) % 6];
    const c = colors[i % colors.length];
    for (let row = 0; row < 8; row++) {
      const inset = row >> 1;
      const yy = y0 + 1 + row + (row > 3 ? sway : 0);
      p.hline(x + inset, yy, 9 - inset * 2, c);
      p.set(x + inset, yy, C.ink);
      p.set(x + 8 - inset, yy, C.ink);
    }
  }
}

function drawLamps(p) {
  for (const x of [96, 210]) {
    for (let i = 0; i < 10; i++) p.set(x, 38 + i, i % 2 ? C.ink : C.steelD);
    p.fill(x - 4, 48, 9, 5, C.goldD);
    p.hline(x - 3, 48, 7, C.gold);
    p.set(x, 53, C.flame);
    p.set(x, 54, C.flame2);
  }
}

function drawPlaque(p) {
  p.rect(196, 62, 52, 16, C.steelL, C.ink);
  drawText(p, 'SPACEX', 200, 68, C.ink2);
  // tiny rocket stamp to the left of the plaque
  p.vline(186, 64, 10, C.steelL);
  p.set(185, 64, C.steel);
  p.set(187, 64, C.steel);
  p.set(185, 74, C.pumpkin);
  p.set(187, 74, C.ledA);
  p.set(186, 75, C.flame);
}

function drawDoor(p) {
  p.fill(242, 116, 30, FLOOR - 116, C.woodD);
  p.fill(246, 120, 22, FLOOR - 120, C.ink2);
  p.vline(242, 116, FLOOR - 116, C.woodL);
  p.vline(271, 116, FLOOR - 116, C.woodK);
  p.set(266, 140, C.gold);
}

function drawShaftBacks(p) {
  const paint = (x, y0, y1) => {
    p.fill(x, y0, 16, y1 - y0, C.steelK);
    p.vline(x, y0, y1 - y0, C.ink);
    p.vline(x + 15, y0, y1 - y0, C.steel);
  };
  paint(12, 6, SLAB2);
  paint(32, 6, SLAB2);
  paint(360, 6, SLAB2);
}

function shaftFront(p, x, y0, y1) {
  for (let y = y0 + 4; y < y1; y += 9) p.hline(x, y, 16, C.steel);
  p.vline(x, y0, y1 - y0, C.steelL);
  p.vline(x + 15, y0, y1 - y0, C.ink);
}

function drawKitchen(p, tick) {
  // oven
  p.rect(214, 8, 40, 16, C.steelD, C.ink);
  p.fill(218, 11, 22, 10, C.pumpkin);
  for (let y = 11; y < 21; y += 2) p.hline(218, y, 22, C.rust);
  p.blit(OVEN_ROAST, 224, 13);
  p.vline(240, 11, 10, C.steelL);
  const led = tick % 40 < 10;
  p.set(248, 10, led ? C.ledA : C.burg);
  p.set(250, 10, tick % 24 < 8 ? C.ledG : C.oliveD);
  // pot
  p.rect(176, 16, 14, 8, C.steel, C.ink);
  p.hline(178, 16, 10, C.steelL);
  steam(p, 182, 15, tick, 4, 3);
  // counter pie
  p.blit(PIE_PUMPKIN, 148, 16);
  // chute mouth down into the hall rail
  p.fill(168, 24, 8, 10, C.steelK);
  p.vline(168, 24, 10, C.steelL);
  p.vline(175, 24, 10, C.ink);
  drawArm(p, tick);
}

function drawArm(p, tick) {
  // Default: baste the oven. During a cloche beat, reach the left chute.
  let cloche = false;
  for (const off of [0, 240]) {
    const phase = mod(tick + off, LOOP);
    if (phase >= 42 && phase < 58) cloche = true;
  }
  if (cloche) {
    line(p, 70, 6, 40, 10, C.steelL);
    line(p, 40, 10, 24, 16, C.steel);
    p.set(40, 10, C.ledA);
    p.set(24, 16, C.joint);
    p.set(25, 17, C.cloche);
  } else {
    const u = tick % 120;
    const a = u < 60 ? u : 120 - u;
    const x2 = 230 + Math.floor(a / 10);
    line(p, 200, 6, 220, 8, C.steelL);
    line(p, 220, 8, x2, 14, C.steel);
    p.set(220, 8, C.ledA);
    p.set(x2, 14, C.joint);
    p.set(x2, 15, C.gold);
  }
}

function drawBasementShell(p, tick) {
  p.fill(0, SLAB2, W, H - SLAB2, C.ink2);
  // pipes along the ceiling of the basement
  p.fill(8, SLAB2 + 2, W - 16, 3, C.steelD);
  p.hline(8, SLAB2 + 2, W - 16, C.steel);
  for (let x = 20; x < W; x += 28) {
    p.vline(x, SLAB2 + 2, 6, C.steelK);
    p.set(x, SLAB2 + 7, tick % 30 < 8 ? C.ledG : C.oliveD);
  }
  // conveyor bed
  const roll = Math.floor(tick / 2) % 6;
  p.fill(20, 196, 340, 6, C.steelK);
  p.hline(20, 196, 340, C.steel);
  for (let x = 24 + roll; x < 356; x += 8) {
    p.set(x, 198, C.steelL);
    p.set(x, 200, C.steelD);
  }
  // egg chute outlet
  p.fill(96, SLAB2, 10, 16, C.woodD);
  p.vline(96, SLAB2, 18, C.woodK);
  p.hline(96, 192, 18, C.woodL);
  // gear
  const g = Math.floor(tick / 4) % 4;
  p.fill(300, 188, 9, 9, C.steelD);
  p.set(304, 188 + (g % 2), C.gold);
  p.set(300 + g, 192, C.steelL);
  // status plate
  p.rect(324, 186, 22, 12, C.steelK, C.ink);
  p.set(328, 190, tick % 20 < 6 ? C.ledG : C.oliveD);
  p.set(332, 190, tick % 16 < 4 ? C.ledR : C.burg);
  p.set(336, 190, tick % 24 < 10 ? C.ledA : C.woodK);
  drawText(p, 'OK', 328, 192, C.ledG);
}

function drawTable(p) {
  p.fill(TABLE_L, TABLE_TOP, TABLE_R - TABLE_L, 4, C.woodL);
  p.hline(TABLE_L, TABLE_TOP, TABLE_R - TABLE_L, C.cream);
  p.fill(TABLE_L, TABLE_TOP + 4, TABLE_R - TABLE_L, 3, C.burg);
  for (let x = TABLE_L + 4; x < TABLE_R; x += 12) {
    p.set(x, TABLE_TOP + 7, C.gold);
    p.set(x + 1, TABLE_TOP + 7, C.cream);
    p.set(x + 2, TABLE_TOP + 8, C.burg);
  }
  for (const lx of [70, 120, 168, 214, 242]) {
    p.fill(lx, TABLE_TOP + 6, 3, FLOOR - (TABLE_TOP + 6), C.woodD);
    p.vline(lx, TABLE_TOP + 6, FLOOR - (TABLE_TOP + 6), C.woodK);
  }
}

function drawFood(p, tick) {
  const gravyOn = tick >= 248 && tick < 340;
  p.blit(ROAST, 104, TABLE_TOP - ROAST.h);
  steam(p, 112, TABLE_TOP - ROAST.h, tick, 3, 1);
  p.blit(gravyOn ? BOWL_MASH_GRAVY : BOWL_MASH, 150, TABLE_TOP - BOWL_MASH.h);
  p.blit(PIE_PUMPKIN, 128, TABLE_TOP - PIE_PUMPKIN.h);
  p.blit(PIE_BERRY, 196, TABLE_TOP - PIE_BERRY.h);
  p.blit(CORN, 176, TABLE_TOP - CORN.h);
  p.blit(ROLLS, 214, TABLE_TOP - ROLLS.h);
  p.blit(BEANS, 228, TABLE_TOP - BEANS.h);
  // candles
  const c0 = Math.floor(tick / 4) % 4;
  p.blit(CANDLE[(c0 + 1) % 4], 118, TABLE_TOP - 8);
  p.blit(CANDLE[c0], 188, TABLE_TOP - 8);
}

function drawDiners(p, tick) {
  const specs = [
    { x: 124, spr: DINER_SHORT, chew: DINER_SHORT_CHEW, flip: false, tint: { [C.hairB]: C.hairA, [C.sweater]: C.sweater }, off: 0 },
    { x: 160, spr: DINER_SHORT, chew: DINER_SHORT_CHEW, flip: true, tint: { [C.hairB]: C.hairK, [C.sweater]: C.blue }, off: 6 },
    { x: 198, spr: DINER_BUN, chew: DINER_BUN_CHEW, flip: false, tint: { [C.hairB]: C.hairL, [C.sweater]: C.green }, off: 12 },
    { x: 226, spr: DINER_BUN, chew: DINER_BUN_CHEW, flip: true, tint: { [C.hairB]: C.ink2, [C.sweater]: C.yellow }, off: 18 },
  ];
  const pass = tick >= 36 && tick < 84;
  for (const d of specs) {
    const bob = [0, 0, 1, 1, 0, 0, 0, -1][Math.floor((tick + d.off * 4) / 6) % 8];
    const chewing = Math.floor((tick + d.off) / 10) % 2 === 1;
    const sprite = chewing ? d.chew : d.spr;
    const y = FLOOR - sprite.h + bob;
    p.blit(sprite, d.x, y, { flip: d.flip, tint: d.tint });
    shadow(p, d.x + 2, FLOOR, 10);
  }
  if (pass) {
    const k = tick - 36;
    const x = 136 + Math.round((k * 22) / 48);
    const arc = [0, 2, 3, 4, 5, 5, 4, 3, 2, 0];
    const y = 146 - arc[Math.min(9, Math.floor((k * 10) / 48))];
    p.blit(ROLLS, x, y);
  }
}

function drawRailAndGravy(p, tick) {
  // back-wall rail from the kitchen chute to the potatoes
  p.hline(150, 126, 40, C.steelD);
  p.hline(150, 127, 40, C.steel);
  for (let x = 154; x < 188; x += 6) p.set(x, 128, C.steelK);
  const travel0 = 190;
  const travel1 = 228;
  const tip1 = 252;
  if (tick >= travel0 && tick < tip1) {
    let x;
    let rot = 0;
    if (tick < travel1) {
      const k = tick - travel0;
      x = 188 - Math.round((k * 36) / (travel1 - travel0));
    } else {
      x = 150;
      rot = Math.min(6, Math.floor((tick - travel1) / 4));
    }
    p.blit(GRAVY_BOAT, x, 118 - rot);
    if (tick >= travel1) {
      const pour = tick - travel1;
      for (let i = 0; i < 10; i++) {
        const yy = 118 + ((pour * 2 + i * 3) % 34);
        if (yy < TABLE_TOP) {
          p.set(x + 3, yy, C.gravy);
          p.set(x + 4, yy, C.roast2);
        }
      }
    }
  }
  // servo arm beside the mash
  const tip = tick >= 228 && tick < 260;
  const ax = 156;
  const ay = 132;
  line(p, ax, ay, ax + (tip ? -2 : 2), ay - (tip ? 8 : 4), C.steelL);
  p.set(ax, ay, C.joint);
  p.set(ax + (tip ? -2 : 2), ay - (tip ? 8 : 4), C.ledA);
}

function drawCat(p, tick) {
  const react = tick >= 244 && tick < 300;
  const flick = Math.floor((tick + 4) / 6) % 2;
  const spr = react ? CAT_ALERT : CAT[flick];
  // On the floor by the door, clear of the table.
  p.blit(spr, 252, FLOOR - spr.h - (react ? 1 : 0));
}

function drawDog(p, tick) {
  const react = tick >= 244 && tick < 310;
  const frame = react ? Math.floor(tick / 2) % 2 : Math.floor(tick / 5) % 2;
  const spr = react && frame === 0 ? DOG_LOOK : DOG[frame];
  p.blit(spr, 276, FLOOR - spr.h);
  shadow(p, 280, FLOOR, 10);
}

function drawGrok(p, tick) {
  const period = 160;
  const half = 80;
  const t = tick % period;
  const goingRight = t < half;
  const u = goingRight ? t : period - t;
  const step = Math.floor(u / 2);
  const x = 156 + step;
  const frame = step % 4;
  const spr = goingRight ? GROK[frame] : GROK_PLATE[frame];
  p.blit(spr, x, FLOOR - spr.h, { flip: !goingRight });
  shadow(p, x + 2, FLOOR, 8);
  // bin he delivers plates into, at the left end of his patrol
  p.rect(146, FLOOR - 10, 12, 10, C.steelD, C.ink);
  p.hline(148, FLOOR - 8, 8, C.plate);
}

function drawTerminal(p, tick) {
  const x = 306;
  const y = 124;
  p.rect(x, y, 46, 40, C.steelD, C.ink);
  p.fill(x + 3, y + 3, 34, 22, C.screen);
  p.hline(x + 3, y + 3, 34, C.cyanD);
  const clip = { x: x + 4, y: y + 6, w: 32, h: 16 };
  const code = '>POUR();BOT.TIP();OK....';
  if (code.length !== 24) throw new Error('code width');
  const scroll = tick % 96;
  const showCmd = tick >= 200 && tick < 280;
  if (showCmd) {
    drawText(p, '>POUR', x + 5, y + 8, C.text, clip);
    drawText(p, 'GRAVY', x + 5, y + 14, C.ledA, clip);
  } else {
    drawText(p, code + code, x + 5 - scroll, y + 8, C.text, clip);
    drawText(p, 'READY READY READY ', x + 5 - (tick % 80), y + 14, C.cyan, clip);
  }
  // cursor
  if (Math.floor(tick / 8) % 2 === 0 && !showCmd) p.fill(x + 6, y + 19, 3, 1, C.text);
  // keyboard
  p.fill(x - 8, y + 28, 40, 5, C.ink);
  p.hline(x - 8, y + 28, 40, C.steel);
  for (let k = 0; k < 8; k++) p.set(x - 6 + k * 4, y + 30, C.steelD);
  // signal lamp
  const green = tick >= 200 && tick < 300;
  const on = green || tick % 30 < 10;
  p.fill(x + 38, y + 4, 5, 5, C.ink);
  p.set(x + 40, y + 6, on ? (green ? C.ledG : C.ledA) : C.woodK);
  p.set(x + 39, y + 5, on ? C.white : C.ink2);
  // feet of the console
  p.fill(x + 4, y + 36, 4, FLOOR - (y + 36), C.steelK);
  p.fill(x + 36, y + 36, 4, FLOOR - (y + 36), C.steelK);
}

function drawElon(p, tick) {
  const s = elonState(tick);
  if (s.mode === 'hidden') return;
  const spr = s.mode === 'type' ? ELON_TYPE[s.frame] : ELON_WALK[s.frame];
  p.blit(spr, s.x, FLOOR - spr.h, {
    flip: s.face < 0,
    clip: { x: CLIP, y: 0, w: W - CLIP, h: H },
  });
  if (s.x + 4 >= CLIP) shadow(p, Math.max(CLIP, s.x + 4), FLOOR, 12);
}

function drawOptimus(p, tick) {
  const s = optimusState(tick);
  let spr;
  if (s.mode === 'carry') spr = OPT_CARRY[s.frame];
  else if (s.mode === 'return') spr = OPT_WALK[s.frame];
  else spr = OPT_SERVE[s.frame];
  const y = FLOOR - spr.h;
  p.blit(spr, s.x, y);
  shadow(p, s.x + 4, FLOOR, 12);
  if (s.mode === 'carry') {
    p.blit(CLOCHE, s.x + 8, y + 8);
  } else if (s.mode === 'reveal') {
    const lift = Math.min(16, (s.lift || 0));
    p.blit(PLATTER, s.x + 8, y + 14);
    if (lift > 8) p.blit(TURKEY_STAND, s.x + 8, y + 4);
    p.blit(CLOCHE, s.x + 8, y + 8 - lift);
  }
}

function drawTurkey(p, phase) {
  const s = turkeyState(phase);
  if (s.layer === 'carry' || s.layer === 'table' && s.mode === 'reveal') return;
  let spr = TURKEY_WALK[s.frame % 6];
  if (s.mode === 'sit') spr = TURKEY_SIT[s.frame];
  else if (s.mode === 'hop' || s.mode === 'hopdown') spr = TURKEY_STAND;
  if (s.cloche && (s.mode === 'down' || s.mode === 'cloche' || s.mode === 'elbow')) {
    p.blit(CLOCHE, s.x, s.y);
    return;
  }
  if (s.mode === 'rise' || s.mode === 'elbow') {
    p.blit(TURKEY_WALK[Math.floor(phase / 4) % 6], s.x, s.y);
    return;
  }
  p.blit(spr, s.x, s.y);
}

function drawHopTurkey(p, phase) {
  const s = turkeyState(phase);
  if (s.mode === 'hop') p.blit(TURKEY_STAND, s.x, s.y);
  if (s.mode === 'sit') p.blit(TURKEY_SIT[s.frame], s.x, s.y);
  if (s.mode === 'reveal') {
    // drawn with Optimus
  }
}

function drawEgg(p, tick) {
  if (tick < 190 || tick >= 250) return;
  const k = tick - 190;
  if (k < 16) {
    const x = 78 + k * 2;
    const y = 156;
    p.blit(EGG[Math.floor(k / 2) % 4], x, y);
  } else if (k < 28) {
    const y = 156 + (k - 16) * 3;
    p.blit(EGG[k % 4], 110, y);
  } else if (k < 32) {
    p.blit(EGG_FLAT, 108, 196);
  } else {
    const x = 108 - (k - 32) * 3;
    const bounce = k === 34 || k === 40 ? -2 : 0;
    p.blit(EGG[(k >> 1) % 4], x, 198 + bounce);
  }
}

function steam(p, x, y, tick, n, seed) {
  const life = 20;
  for (let i = 0; i < n; i++) {
    const age = (tick + seed + i * 7) % life;
    if (age > 16) continue;
    const wob = [0, 0, 1, 1, 0, -1, -1, 0, 1, 0, -1, 1, 0, 0, 1, -1, 0, 1, 0, -1][age];
    const px = x + wob;
    const py = y - age;
    if ((age + i) % 2 === 0) p.set(px, py, age < 8 ? C.cream : C.steam);
    if (age < 6) p.set(px + 1, py, C.steam);
  }
}

function drawLights(p, tick) {
  const pulse = [0, 0, 1, 1, 1, 0, 0, 1][Math.floor(tick / 6) % 8];
  p.warmDisc(96, 56, 8 + pulse, WARM);
  p.warmDisc(210, 56, 7 + pulse, WARM);
  p.warmDisc(146, 78, 16, WARM);
  p.warmDisc(120, TABLE_TOP, 6 + (tick % 16 < 4 ? 1 : 0), WARM);
  p.warmDisc(190, TABLE_TOP, 6 + (tick % 16 >= 8 && tick % 16 < 12 ? 1 : 0), WARM);
  // oven glow
  p.warmDisc(230, 16, 6, WARM);
}

function drawActors(p, tick) {
  drawOptimus(p, tick);
  drawDog(p, tick);
  drawGrok(p, tick);
  for (const off of [0, 240]) {
    const phase = mod(tick + off, LOOP);
    const s = turkeyState(phase);
    if (s.layer === 'floor' && s.mode === 'waddle') drawTurkey(p, phase);
    if (s.mode === 'hopdown') drawTurkey(p, phase);
  }
}

export function renderPix(tick) {
  const t = mod(tick, LOOP);
  const p = new Pix(W, H);
  drawShell(p, t);
  drawDiners(p, t);
  drawTable(p);
  drawFood(p, t);
  drawRailAndGravy(p, t);
  drawCat(p, t);
  for (const off of [0, 240]) {
    const phase = mod(t + off, LOOP);
    const s = turkeyState(phase);
    if (s.layer === 'kitchen' || s.layer === 'shaft') drawTurkey(p, phase);
    if (s.mode === 'hop' || s.mode === 'sit') drawHopTurkey(p, phase);
  }
  drawActors(p, t);
  drawTerminal(p, t);
  // Elon is drawn before the terminal so his hands can be covered by the
  // keyboard edge; redraw him in front of the desk but the screen stays put.
  // (Terminal already includes the keyboard. Redraw Elon above the desk top.)
  drawElon(p, t);
  shaftFront(p, 12, 6, SLAB2);
  shaftFront(p, 32, 6, SLAB2);
  shaftFront(p, 360, 6, SLAB2);
  for (const off of [0, 240]) {
    const phase = mod(t + off, LOOP);
    const s = turkeyState(phase);
    if (s.layer === 'base') drawTurkey(p, phase);
  }
  drawEgg(p, t);
  steam(p, 104, TABLE_TOP - 10, t, 3, 11);
  drawLights(p, t);
  // outer margin so the cutaway reads as a slice of building
  p.fill(0, 0, W, 2, C.ink2);
  return p;
}

export function renderRGBA(tick) {
  return renderPix(tick).toRGBA(PAL);
}

export function statusLine(tick) {
  const t = mod(tick, LOOP);
  const e = elonState(t);
  const a = turkeyState(t);
  const b = turkeyState(mod(t + 240, LOOP));
  const elon = e.mode === 'walk' ? (e.face > 0 ? 'Elon walks in' : 'Elon walks out')
    : e.mode === 'type' ? 'Elon types' : 'doorway';
  let chain = 'terminal idle';
  if (t >= 190 && t < 228) chain = 'gravy boat slides';
  else if (t >= 228 && t < 252) chain = 'arm tips the boat';
  else if (t >= 244 && t < 300) chain = 'cat and dog notice';
  else if (t >= 200 && t < 190) chain = 'command';
  if (t >= 200 && t < 228) chain = 'POUR GRAVY';
  return `${(t / HZ).toFixed(2)}s · ${elon} · turkey ${a.mode} · turkey ${b.mode} · ${chain}`;
}

export function renderSheet() {
  const p = new Pix(W, H);
  p.clear(C.plaster2);
  p.hline(0, 40, W, C.woodK);
  for (let i = 0; i < 8; i++) {
    p.blit(ELON_WALK[i], 8 + i * 24, 40 - 28);
    p.vline(8 + i * 24 + 14, 36, 8, C.ledR);
  }
  p.hline(0, 100, W, C.woodK);
  for (let i = 0; i < 6; i++) {
    p.blit(TURKEY_WALK[i], 8 + i * 22, 100 - 16);
  }
  for (let i = 0; i < 6; i++) {
    p.blit(OPT_WALK[i], 8 + i * 26, 160 - 32);
  }
  p.blit(TURKEY_SIT[0], 200, 70);
  p.blit(ROAST, 230, 78);
  p.blit(DINER_SHORT, 260, 70);
  p.blit(CAT[0], 300, 80);
  p.blit(DOG[0], 320, 78);
  p.blit(CLOCHE, 200, 100);
  return p.toRGBA(PAL);
}
