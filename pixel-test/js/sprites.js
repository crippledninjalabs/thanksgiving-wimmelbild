// Large still-frame cast. Humans are about 60px tall so a face can hold
// a hairline, brows, eyes, nose and mouth. No walk cycles.

import { C } from './palette.js';
import { Pix } from './pix.js';

function bake(w, h, draw) {
  const p = new Pix(w, h);
  draw(p);
  return outline(p.toSprite(), C.ink);
}

function outline(sprite, color) {
  // Outer contour only, so gaps inside a drawing are not stroked.
  const { w, h, pix } = sprite;
  const out = pix.slice();
  const outside = new Uint8Array(w * h);
  const stack = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const i = y * w + x;
    if (outside[i] || pix[i]) return;
    outside[i] = 1;
    stack.push(x, y);
  };
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
  while (stack.length) {
    const y = stack.pop();
    const x = stack.pop();
    push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
  }
  for (let y = 0; y < h - 1; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (!outside[i]) continue;
      const edge = (x > 0 && pix[i - 1]) || (x + 1 < w && pix[i + 1])
        || (y > 0 && pix[i - w]) || (y + 1 < h && pix[i + w]);
      if (edge) out[i] = color;
    }
  }
  return { w, h, pix: out };
}

function h(p, x, y, w, c) {
  for (let i = 0; i < w; i++) p.set(x + i, y, c);
}

/** Elon, front view, standing at a keyboard. 48×64. */
export const ELON = bake(48, 64, (p) => {
  const S = C.skinF;
  const D = C.skinF2;
  const K = C.skinF3;
  const H = C.hairK;

  // Short black hair on top only. The forehead is tall and the temples are bare.
  h(p, 19, 0, 10, C.black);
  h(p, 17, 1, 14, C.black);
  h(p, 16, 2, 16, H);
  h(p, 17, 3, 14, H);
  h(p, 18, 4, 4, H); h(p, 22, 4, 6, S); h(p, 28, 4, 3, H);

  // Long face: wide cheeks, narrow chin.
  for (let y = 5; y <= 16; y++) h(p, 16, y, 16, S);
  h(p, 17, 17, 14, S);
  h(p, 18, 18, 12, S);
  h(p, 19, 19, 10, S);
  h(p, 20, 20, 8, S);
  h(p, 21, 21, 6, S);
  h(p, 22, 22, 4, D);

  // Small ears, not balloons. Tops level with the brows.
  for (let y = 9; y <= 14; y++) {
    p.set(14, y, D); p.set(15, y, K);
    p.set(32, y, K); p.set(33, y, D);
  }
  p.set(15, 11, S); p.set(32, 11, S);

  // Low straight brows, close to narrow dark eyes.
  h(p, 18, 10, 4, C.black);
  h(p, 26, 10, 4, C.black);
  p.set(18, 11, C.ink2); p.set(19, 11, C.black); p.set(20, 11, C.white); p.set(21, 11, C.black);
  p.set(19, 12, K); p.set(20, 12, D);
  p.set(26, 11, C.ink2); p.set(27, 11, C.black); p.set(28, 11, C.white); p.set(29, 11, C.black);
  p.set(27, 12, K); p.set(28, 12, D);
  // Right-cheek shade, kept off the eye row.
  for (let y = 13; y <= 17; y++) { p.set(29, y, D); p.set(30, y, K); }
  h(p, 21, 20, 6, D);

  // Nose, long enough to catch the likeness. Bridge, tip, two nostrils.
  p.set(23, 12, D); p.set(24, 12, S);
  p.set(23, 13, D); p.set(24, 13, S);
  p.set(23, 14, K); p.set(24, 14, D);
  h(p, 22, 15, 4, S); p.set(23, 15, C.cream);
  p.set(22, 16, K); p.set(23, 16, D); p.set(25, 16, K);

  // Narrow closed mouth.
  h(p, 21, 18, 6, C.lip);
  p.set(21, 18, K); p.set(26, 18, K);
  p.set(23, 18, K);
  h(p, 22, 19, 4, D);

  // Neck, narrower than the jaw.
  for (let y = 23; y <= 27; y++) {
    h(p, 20, y, 8, S);
    p.set(25, y, D); p.set(26, y, K);
  }

  // Shoulders slope out of the neck into a black t-shirt.
  h(p, 18, 28, 12, C.black);
  h(p, 15, 29, 18, C.black);
  h(p, 12, 30, 24, C.black);
  h(p, 10, 31, 28, C.ink2);
  for (let y = 32; y <= 45; y++) h(p, 12, y, 24, C.black);
  // Small X on the chest.
  p.set(18, 36, C.steelL); p.set(22, 36, C.steelL);
  p.set(20, 37, C.steel);
  p.set(18, 38, C.steelL); p.set(22, 38, C.steelL);

  // Left arm hangs. Right arm bends at the elbow toward the keyboard.
  for (let y = 32; y <= 48; y++) h(p, 7, y, 4, C.black);
  h(p, 7, 49, 4, S);
  h(p, 7, 50, 4, D);
  for (let y = 32; y <= 40; y++) h(p, 36, y, 4, C.black);
  h(p, 36, 40, 4, C.ink2);
  for (let y = 41; y <= 46; y++) h(p, 39, y, 4, C.ink2);
  h(p, 41, 46, 5, S);
  h(p, 41, 47, 5, D);

  // Straight jeans and shoes. A gap keeps the legs from becoming one block.
  for (let y = 46; y <= 59; y++) {
    h(p, 14, y, 7, C.blue);
    h(p, 26, y, 7, C.navy);
    p.set(14, y, C.navy);
    p.set(32, y, C.ink2);
  }
  h(p, 13, 60, 9, C.black);
  h(p, 25, 60, 9, C.black);
  h(p, 13, 61, 9, C.ink2);
  h(p, 25, 61, 9, C.ink2);
  h(p, 14, 62, 7, C.black);
  h(p, 26, 62, 7, C.black);
});

function diner(hair, shirt, shirt2, bun) {
  return bake(40, 56, (p) => {
    const S = C.skin;
    const D = C.skin2;
    if (bun) {
      h(p, 22, 0, 6, hair);
      h(p, 21, 1, 8, hair);
      h(p, 22, 2, 6, hair);
    }
    h(p, 12, 4, 14, hair);
    h(p, 10, 5, 18, hair);
    h(p, 9, 6, 20, hair);
    h(p, 9, 7, 6, hair); h(p, 15, 7, 8, S); h(p, 23, 7, 6, hair);
    h(p, 8, 8, 4, hair); h(p, 12, 8, 14, S); h(p, 26, 8, 4, hair);
    for (let y = 9; y <= 20; y++) h(p, 11, y, 16, S);
    h(p, 12, 21, 14, S);
    h(p, 14, 22, 10, D);
    h(p, 12, 11, 4, hair); h(p, 22, 11, 4, hair);
    h(p, 12, 13, 4, C.white); p.set(14, 13, C.black);
    h(p, 21, 13, 4, C.white); p.set(23, 13, C.black);
    p.set(18, 16, D); p.set(19, 16, D);
    h(p, 16, 18, 6, C.lip);
    h(p, 16, 24, 6, S);
    for (let y = 26; y <= 46; y++) h(p, 8, y, 22, shirt);
    h(p, 6, 26, 26, shirt);
    h(p, 4, 28, 6, shirt);
    h(p, 28, 28, 6, shirt2);
    for (let y = 30; y <= 40; y++) { p.set(5, y, shirt2); p.set(32, y, shirt); }
    h(p, 4, 41, 5, S); h(p, 29, 41, 5, S);
    // arms rest forward, toward the table
    h(p, 10, 44, 18, shirt2);
    h(p, 12, 48, 6, S);
    h(p, 22, 48, 6, D);
  });
}

export const DINERS = [
  diner(C.hairA, C.sweater, C.rust, false),
  diner(C.hairK, C.blue, C.navy, false),
  diner(C.hairL, C.green, C.greenD, true),
  diner(C.hairB, C.yellow, C.goldD, false),
];

/** Tesla Optimus: white shell, black joints, glossy blank faceplate. 40×76. */
export const OPTIMUS = bake(40, 76, (p) => {
  // Faceplate. No features, one gloss streak.
  for (let y = 2; y <= 16; y++) h(p, 12, y, 16, C.black);
  h(p, 14, 1, 12, C.black);
  h(p, 14, 17, 12, C.ink2);
  h(p, 16, 4, 2, C.steelL);
  h(p, 18, 5, 3, C.white);
  h(p, 21, 6, 2, C.steel);
  p.set(15, 12, C.steelK); p.set(24, 12, C.steelK);

  // Neck and torso.
  for (let y = 18; y <= 22; y++) h(p, 16, y, 8, C.ink2);
  for (let y = 23; y <= 44; y++) h(p, 11, y, 18, C.opti);
  h(p, 8, 23, 24, C.opti);
  h(p, 13, 28, 4, C.joint);
  p.set(18, 32, C.steelK); p.set(19, 32, C.steelD);
  // Shoulder sockets.
  h(p, 6, 24, 4, C.joint); h(p, 30, 24, 4, C.joint);

  // Slim arms. The right one holds the lifted cloche.
  for (let y = 26; y <= 40; y++) { h(p, 4, y, 4, C.opti); h(p, 32, y, 4, C.opti); }
  h(p, 4, 34, 4, C.joint); h(p, 32, 34, 4, C.joint);
  for (let y = 36; y <= 48; y++) h(p, 4, y, 3, C.opti2);
  h(p, 33, 36, 3, C.opti);
  h(p, 34, 30, 3, C.opti);
  h(p, 35, 24, 3, C.opti);
  h(p, 36, 18, 3, C.joint);
  h(p, 3, 49, 4, C.ink2);

  // Hips, knees, calves.
  for (let y = 45; y <= 52; y++) h(p, 13, y, 14, C.opti);
  for (let y = 53; y <= 64; y++) {
    h(p, 13, y, 5, C.opti);
    h(p, 22, y, 5, C.opti2);
  }
  h(p, 13, 58, 5, C.joint);
  h(p, 22, 58, 5, C.joint);
  for (let y = 60; y <= 70; y++) {
    h(p, 13, y, 5, C.opti);
    h(p, 22, y, 5, C.steel);
  }
  h(p, 12, 71, 7, C.ink2);
  h(p, 21, 71, 7, C.ink2);
  h(p, 12, 72, 7, C.black);
  h(p, 21, 72, 7, C.black);
  h(p, 13, 73, 5, C.steelK);
  h(p, 22, 73, 5, C.steelK);
});

export const CLOCHE = bake(22, 16, (p) => {
  h(p, 8, 0, 6, C.steelL);
  h(p, 6, 1, 10, C.cloche);
  h(p, 4, 2, 14, C.cloche);
  h(p, 3, 3, 16, C.white);
  for (let y = 4; y <= 10; y++) h(p, 2, y, 18, C.cloche);
  h(p, 4, 6, 4, C.white);
  h(p, 1, 11, 20, C.cloche2);
  h(p, 0, 12, 22, C.steel);
  h(p, 2, 14, 18, C.steelL);
});

/** Live turkey sitting up, napkin on, looking at the roast. */
export const TURKEY = bake(46, 40, (p) => {
  // Tail fan.
  p.set(2, 10, C.turk3); p.set(4, 8, C.turk); p.set(6, 6, C.goldD);
  p.set(3, 14, C.turk2); p.set(5, 12, C.turk); p.set(7, 16, C.turk3);
  p.set(1, 18, C.ink); h(p, 2, 18, 8, C.turk2);
  // Body.
  h(p, 14, 16, 16, C.turk);
  h(p, 12, 18, 20, C.turk);
  h(p, 11, 20, 22, C.turk);
  h(p, 11, 22, 22, C.turk2);
  h(p, 12, 24, 20, C.turk);
  h(p, 14, 26, 16, C.turk2);
  p.set(16, 20, C.turk3); p.set(22, 22, C.goldD);
  // Napkin.
  h(p, 18, 16, 8, C.white);
  h(p, 19, 17, 6, C.napkin);
  h(p, 20, 18, 4, C.cream);
  // Neck and head.
  h(p, 28, 12, 4, C.turk);
  h(p, 28, 10, 6, C.turk3);
  h(p, 27, 8, 8, C.turk);
  h(p, 30, 6, 6, C.turk3);
  h(p, 32, 7, 3, C.white); p.set(33, 7, C.black);
  h(p, 36, 8, 5, C.beak);
  h(p, 37, 9, 3, C.gold);
  h(p, 29, 11, 5, C.wattle);
  p.set(31, 13, C.wattle); p.set(32, 14, C.wattle);
  // Feet tucked on the chair.
  h(p, 16, 34, 4, C.beak); h(p, 24, 34, 4, C.goldD);
  h(p, 15, 36, 6, C.gold); h(p, 23, 36, 6, C.beak);
});

export const ROAST = bake(36, 24, (p) => {
  h(p, 22, 1, 4, C.roast3);
  h(p, 20, 2, 6, C.roast2);
  h(p, 18, 3, 4, C.roast);
  h(p, 10, 6, 14, C.roast);
  h(p, 8, 8, 18, C.roast);
  h(p, 6, 10, 22, C.roast2);
  h(p, 5, 12, 24, C.roast);
  h(p, 6, 14, 22, C.roast3);
  h(p, 4, 17, 26, C.plate);
  h(p, 2, 19, 30, C.white);
  h(p, 4, 21, 26, C.steel);
});

export const PIE = bake(22, 14, (p) => {
  h(p, 2, 2, 18, C.crust);
  h(p, 1, 4, 20, C.pie);
  h(p, 1, 6, 20, C.gold);
  h(p, 2, 8, 18, C.crust);
  h(p, 4, 10, 14, C.goldD);
});

export const MASH = bake(22, 14, (p) => {
  h(p, 3, 2, 16, C.mash);
  h(p, 2, 4, 18, C.cream);
  h(p, 6, 3, 6, C.gravy);
  h(p, 8, 5, 4, C.roast3);
  h(p, 2, 8, 18, C.white);
  h(p, 4, 10, 14, C.steel);
});

export const BOAT = bake(18, 10, (p) => {
  h(p, 2, 2, 12, C.gravy);
  h(p, 1, 4, 14, C.roast3);
  h(p, 0, 6, 16, C.plate);
  h(p, 2, 8, 12, C.steel);
});

export const CAT = bake(28, 26, (p) => {
  // Ears.
  p.set(6, 0, C.ink); p.set(7, 1, C.cat); p.set(8, 2, C.cat);
  p.set(12, 0, C.ink); p.set(11, 1, C.cat); p.set(10, 2, C.cat);
  h(p, 6, 3, 8, C.cat);
  h(p, 5, 5, 10, C.cat);
  h(p, 5, 7, 10, C.cat2);
  p.set(7, 6, C.white); p.set(8, 6, C.black);
  p.set(11, 6, C.white); p.set(12, 6, C.black);
  p.set(9, 8, C.wattle); p.set(10, 8, C.wattle);
  h(p, 6, 10, 12, C.cat);
  h(p, 5, 12, 14, C.cat2);
  h(p, 6, 14, 12, C.cat);
  h(p, 8, 16, 8, C.cat3);
  // Tail curls out to the right.
  h(p, 16, 12, 4, C.cat);
  h(p, 19, 10, 3, C.cat2);
  h(p, 21, 8, 3, C.cat);
  p.set(23, 7, C.cat3);
  h(p, 7, 20, 3, C.ink); h(p, 14, 20, 3, C.ink);
  h(p, 6, 22, 4, C.cat2); h(p, 13, 22, 4, C.cat2);
});

export const DOG = bake(36, 34, (p) => {
  // Floppy ear and head.
  h(p, 8, 2, 10, C.dog2);
  h(p, 6, 4, 14, C.dog);
  h(p, 5, 6, 16, C.dog);
  h(p, 4, 8, 8, C.dog2); // ear
  h(p, 4, 10, 6, C.dog3);
  h(p, 12, 8, 10, C.dog);
  p.set(14, 7, C.white); p.set(15, 7, C.black);
  h(p, 18, 9, 6, C.dog); // snout
  p.set(22, 10, C.black); p.set(23, 10, C.black);
  h(p, 18, 12, 5, C.wattle);
  // Chest and body.
  h(p, 8, 14, 16, C.dog);
  h(p, 10, 16, 12, C.cream);
  h(p, 7, 18, 18, C.dog2);
  h(p, 8, 22, 14, C.dog);
  // Tail.
  h(p, 22, 16, 6, C.dog);
  h(p, 26, 14, 4, C.dog2);
  h(p, 28, 12, 3, C.gold);
  h(p, 8, 28, 5, C.dog3); h(p, 16, 28, 5, C.dog3);
  h(p, 7, 30, 6, C.ink2); h(p, 15, 30, 6, C.ink2);
});

export const TREE = bake(70, 48, (p) => {
  h(p, 30, 28, 8, C.woodK);
  h(p, 28, 36, 12, C.woodD);
  h(p, 18, 4, 32, C.leafD);
  h(p, 12, 8, 44, C.leaf);
  h(p, 8, 14, 52, C.leaf);
  h(p, 6, 20, 56, C.leafD);
  h(p, 12, 26, 44, C.pumpkin);
  p.set(22, 12, C.gold); p.set(40, 18, C.goldD); p.set(30, 22, C.leafD);
});

export function visibleHeight(sprite) {
  let min = sprite.h;
  let max = -1;
  for (let y = 0; y < sprite.h; y++) {
    for (let x = 0; x < sprite.w; x++) {
      if (!sprite.pix[y * sprite.w + x]) continue;
      if (y < min) min = y;
      if (y > max) max = y;
    }
  }
  return max - min + 1;
}
