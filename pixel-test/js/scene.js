// One still of the banquet hall. No clock, no basement, no side shafts.
// Internal 640×216 was too short for 60px people, so the room fills 640×360.

import { C, PAL, WARM } from './palette.js';
import { Pix } from './pix.js';
import { drawText } from './font.js';
import {
  ELON, DINERS, OPTIMUS, CLOCHE, TURKEY, ROAST, PIE, MASH, BOAT, CAT, DOG, TREE,
} from './sprites.js';

export const W = 640;
export const H = 360;

const FLOOR = 312;
const TABLE_L = 78;
const TABLE_R = 430;
const TABLE_TOP = 214;

// Where Elon is blitted. The export crop uses this.
export const ELON_POS = { x: 456, y: FLOOR - ELON.h };

function edge(p, x, y, w, c) {
  p.hline(x, y, w, c);
}
function vedge(p, x, y, h, c) {
  p.vline(x, y, h, c);
}

export function renderPix() {
  const p = new Pix(W, H);
  p.clear(C.plaster);

  // Upper wall, chair rail, wood wainscot. Side edges are the cut through
  // the plaster, not columns.
  p.fill(0, 0, W, 8, C.woodK);
  edge(p, 0, 8, W, C.woodD);
  p.fill(0, 168, W, FLOOR - 168, C.wood);
  for (let x = 16; x < W - 8; x += 22) vedge(p, x, 172, FLOOR - 176, C.woodD);
  p.fill(0, 164, W, 5, C.woodL);
  edge(p, 0, 164, W, C.cream);
  p.fill(0, FLOOR - 6, W, 6, C.woodD);

  // Floor planks and the slab under them. The slab is a solid deck.
  p.fill(0, FLOOR, W, 4, C.woodL);
  for (let x = 4; x < W; x += 16) p.set(x, FLOOR + 2, C.woodK);
  p.fill(0, FLOOR + 4, W, 18, C.plaster3);
  edge(p, 0, FLOOR + 4, W, C.woodK);
  edge(p, 0, FLOOR + 12, W, C.plaster2);
  p.fill(0, FLOOR + 22, W, H - (FLOOR + 22), C.woodK);

  // Cut faces at the left and right of the slice. Warm plaster, one dark line.
  p.fill(0, 8, 10, FLOOR - 8, C.plaster2);
  vedge(p, 10, 8, FLOOR - 8, C.ink);
  p.fill(W - 10, 8, 10, FLOOR - 8, C.plaster3);
  vedge(p, W - 11, 8, FLOOR - 8, C.ink);

  drawWindow(p);
  drawBunting(p);
  drawLamps(p);
  p.rect(300, 78, 62, 18, C.steelL, C.ink);
  drawText(p, 'SPACEX', 306, 84, C.ink2);

  // People sit behind the table. The table is drawn over their laps.
  const seats = [168, 230, 292, 354];
  DINERS.forEach((spr, i) => {
    p.blit(spr, seats[i], TABLE_TOP - 40);
  });

  // Low chair back, behind the turkey and not crossing its body.
  edge(p, 100, 188, 28, C.woodD);
  vedge(p, 100, 188, 18, C.woodK);
  vedge(p, 127, 188, 18, C.woodK);
  p.blit(TURKEY, 90, TABLE_TOP - TURKEY.h + 4);

  drawTable(p);
  p.blit(ROAST, 148, TABLE_TOP - ROAST.h);
  p.blit(MASH, 196, TABLE_TOP - MASH.h);
  p.blit(PIE, 250, TABLE_TOP - PIE.h);
  p.blit(BOAT, 188, TABLE_TOP - BOAT.h - 2);
  // A few gravy pixels already on the potatoes, boat resting on its side.
  p.set(204, TABLE_TOP - 8, C.gravy);
  p.set(206, TABLE_TOP - 6, C.roast3);
  p.set(200, TABLE_TOP - 4, C.gravy);

  // Candles, unanimated.
  candle(p, 178, TABLE_TOP - 12);
  candle(p, 236, TABLE_TOP - 12);

  // Foreground, all on the same floor line. Nothing overlaps the faces.
  p.blit(OPTIMUS, 18, FLOOR - OPTIMUS.h);
  p.blit(CLOCHE, 36, FLOOR - OPTIMUS.h + 16);
  // Shelf on the plaster, so the orange cat is not lost on the wood.
  p.fill(330, 150, 34, 4, C.woodL);
  edge(p, 330, 153, 34, C.woodK);
  p.blit(CAT, 334, 150 - CAT.h);
  p.fill(378, FLOOR - 6, 40, 6, C.sand);
  p.blit(DOG, 384, FLOOR - DOG.h);

  drawTerminal(p);
  p.blit(ELON, ELON_POS.x, ELON_POS.y);

  // Contact shadows on the floor line only.
  for (const [x, w] of [[30, 16], [124, 14], [400, 16], [468, 18]]) {
    for (let i = 0; i < w; i++) if (p.get(x + i, FLOOR) === C.woodL) p.set(x + i, FLOOR, C.woodD);
  }

  p.warmDisc(250, 70, 28, WARM);
  p.warmDisc(140, 48, 10, WARM);
  p.warmDisc(360, 48, 10, WARM);
  return p;
}

function drawWindow(p) {
  const x = 168;
  const y = 36;
  const w = 150;
  const h = 86;
  for (let row = 0; row < h; row++) {
    const c = row < 28 ? C.sky : row < 58 ? C.sky2 : C.sky3;
    p.hline(x, y + row, w, c);
  }
  p.blit(TREE, x + 40, y + 16);
  for (const ox of [16, 46, 90, 120]) {
    for (let row = 6; row < h - 4; row += 4) p.set(x + ox, y + row, C.glow);
  }
  edge(p, x - 3, y - 3, w + 6, C.woodL);
  edge(p, x - 3, y + h + 2, w + 6, C.woodK);
  vedge(p, x - 3, y - 3, h + 6, C.woodD);
  vedge(p, x + w + 2, y - 3, h + 6, C.woodK);
  vedge(p, x + (w >> 1), y, h, C.woodK);
  edge(p, x, y + (h >> 1), w, C.woodK);
  p.fill(x - 6, y + h + 4, w + 12, 4, C.woodL);
  edge(p, x - 6, y + h + 7, w + 12, C.woodK);
}

function drawBunting(p) {
  const colors = [C.rust, C.gold, C.olive, C.burg, C.cream, C.pumpkin];
  edge(p, 24, 16, W - 48, C.ink);
  for (let i = 0, x = 28; x < W - 36; x += 16, i++) {
    const c = colors[i % colors.length];
    for (let row = 0; row < 10; row++) {
      const inset = row >> 1;
      p.hline(x + inset, 18 + row, 12 - inset * 2, c);
      p.set(x + inset, 18 + row, C.ink);
      p.set(x + 11 - inset, 18 + row, C.ink);
    }
  }
}

function drawLamps(p) {
  for (const x of [120, 400]) {
    for (let i = 0; i < 14; i++) p.set(x, 14 + i, i % 2 ? C.ink : C.woodD);
    p.fill(x - 6, 28, 13, 6, C.goldD);
    edge(p, x - 5, 28, 11, C.gold);
    p.set(x, 34, C.flame);
    p.set(x, 35, C.flame2);
  }
}

function drawTable(p) {
  p.fill(TABLE_L, TABLE_TOP, TABLE_R - TABLE_L, 6, C.woodL);
  edge(p, TABLE_L, TABLE_TOP, TABLE_R - TABLE_L, C.cream);
  p.fill(TABLE_L, TABLE_TOP + 6, TABLE_R - TABLE_L, 8, C.burg);
  for (let x = TABLE_L + 6; x < TABLE_R; x += 14) {
    p.set(x, TABLE_TOP + 14, C.gold);
    p.set(x + 1, TABLE_TOP + 15, C.cream);
  }
  for (const lx of [96, 160, 230, 300, 370, 420]) {
    p.fill(lx, TABLE_TOP + 10, 4, FLOOR - TABLE_TOP - 16, C.woodD);
    vedge(p, lx, TABLE_TOP + 10, FLOOR - TABLE_TOP - 16, C.woodK);
  }
}

function drawTerminal(p) {
  const x = 520;
  const y = 214;
  p.rect(x, y, 78, 70, C.steelD, C.ink);
  p.fill(x + 6, y + 6, 58, 36, C.screen);
  edge(p, x + 6, y + 6, 58, C.cyanD);
  drawText(p, '>POUR', x + 10, y + 12, C.text);
  drawText(p, 'GRAVY', x + 10, y + 20, C.ledA);
  p.fill(x + 8, y + 46, 62, 8, C.ink);
  edge(p, x + 8, y + 46, 62, C.steel);
  for (let k = 0; k < 10; k++) p.set(x + 12 + k * 5, y + 49, C.steelD);
  p.fill(x + 64, y + 8, 8, 8, C.ink);
  p.set(x + 67, y + 11, C.ledG);
  p.set(x + 66, y + 10, C.white);
  p.fill(x + 10, y + 64, 6, FLOOR - (y + 64), C.steelK);
  p.fill(x + 60, y + 64, 6, FLOOR - (y + 64), C.steelK);
}

function candle(p, x, y) {
  p.set(x, y, C.flame2);
  p.set(x, y + 1, C.flame);
  p.fill(x - 1, y + 2, 3, 4, C.gold);
  edge(p, x - 1, y + 5, 3, C.goldD);
}

export function renderRGBA() {
  return renderPix().toRGBA(PAL);
}
