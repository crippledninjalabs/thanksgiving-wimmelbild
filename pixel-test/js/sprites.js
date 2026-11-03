// Hand-placed sprites. Walk cycles keep the planted foot on a fixed
// world pixel: each frame the contact foot sits `stride` pixels further
// left while the scene moves the sprite `stride` pixels right.

import { C } from './palette.js';
import { Pix, spr } from './pix.js';

const E = {
  '.': 0, o: C.ink, H: C.hairK, s: C.skin, S: C.skin2, d: C.skin3,
  e: C.black, b: C.black, n: C.navy, k: C.black, w: C.white, c: C.cream,
};

const O = {
  '.': 0, o: C.ink, w: C.opti, s: C.opti2, j: C.joint, c: C.cyan,
  k: C.steelK, e: C.black, h: C.steelL,
};

const T = {
  '.': 0, o: C.ink, b: C.turk, d: C.turk2, l: C.turk3, w: C.wattle,
  k: C.beak, e: C.black, y: C.white, n: C.napkin, f: C.gold,
};

const P = {
  '.': 0, o: C.ink, r: C.roast, d: C.roast2, k: C.roast3, p: C.plate,
  g: C.veg, w: C.white, y: C.gold, c: C.crust, f: C.pie, b: C.berry,
  m: C.mash, n: C.corn, v: C.veg, s: C.skin, a: C.gravy,
};

function bake(w, h, draw) {
  const p = new Pix(w, h);
  draw(p);
  return p.toSprite();
}

function stamp(p, rows, map, dx, dy) {
  p.blit(spr(rows, map), dx, dy);
}

function line(p, x0, y0, x1, y1, c) {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let i = 0; i <= steps; i++) {
    const x = Math.round(x0 + ((x1 - x0) * i) / steps);
    const y = Math.round(y0 + ((y1 - y0) * i) / steps);
    p.set(x, y, c);
    p.set(x + 1, y, c);
    p.set(x, y + 1, c);
  }
}

function shoe(p, x, y) {
  p.set(x, y - 1, C.ink2);
  p.set(x + 1, y - 1, C.black);
  p.set(x + 2, y - 1, C.black);
  p.set(x + 3, y - 1, C.ink);
  p.set(x, y, C.black);
  p.set(x + 1, y, C.black);
  p.set(x + 2, y, C.black);
  p.set(x + 3, y, C.ink2);
}

function leg(p, hipX, hipY, kneeX, kneeY, footX, footY, color) {
  line(p, hipX, hipY, kneeX, kneeY, color);
  line(p, kneeX, kneeY, footX, footY, C.navy);
  p.set(kneeX, kneeY, C.ink);
  p.set(kneeX + 1, kneeY, C.navy);
  shoe(p, footX, footY);
}

const ELON_HEAD = [
  '...oooooo...',
  '..oHHHHHHo..',
  '..oHHHHHHo..',
  '.oHHsseesso.',
  '.oHHHssnnno.',
  '.oHHHsssso..',
  '..oHHssso...',
  '...osssso...',
  '....ooooo...',
];

const ELON_HEAD_BLINK = [
  '..oooooo..',
  '.oHHHHHHo.',
  '.oHHHHHHo.',
  '.oHHsHHHo.',
  '.oHHssnno.',
  '.oHHssso..',
  '..oHssso..',
  '...ossso..',
  '....ooo...',
];

// 8-frame walk. Planted shoe-left sits at PLANT[f]; scene stride is 3.
// Frames 0–3 plant the lead foot, 4–7 plant the other. Bob is in the torso.
const PLANT = [14, 11, 8, 5, 14, 11, 8, 5];
const KNEE_P = [
  [12, 20], [11, 21], [10, 19], [9, 20],
  [12, 20], [11, 21], [10, 19], [9, 20],
];
const SWING = [2, 4, 8, 12, 2, 4, 8, 12];
const SWING_Y = [27, 24, 19, 23, 27, 24, 19, 23];
const KNEE_S = [
  [6, 21], [7, 19], [9, 17], [11, 18],
  [6, 21], [7, 19], [9, 17], [11, 18],
];
const BOB = [0, 1, 0, -1, 0, 1, 0, -1];
const NEAR_PLANT = [1, 1, 1, 0, 0, 0, 0, 1];

function drawElonBody(p, frame, blink) {
  const bob = BOB[frame];
  const y0 = bob > 0 ? 1 : 0;
  stamp(p, blink ? ELON_HEAD_BLINK : ELON_HEAD, E, 4, y0);

  const hy = 10 + (bob > 0 ? 1 : 0);
  // torso
  for (let y = hy; y < hy + 7; y++) {
    for (let x = 7; x <= 13; x++) p.set(x, y, C.black);
    p.set(6, y, C.ink);
    p.set(14, y, C.ink2);
  }
  p.set(8, hy + 2, C.ink2);
  p.set(9, hy + 3, C.ink2);
  // near arm
  const armFwd = frame >= 4;
  if (armFwd) {
    line(p, 13, hy + 1, 17, hy + 5, C.black);
    p.set(17, hy + 5, C.skin);
    p.set(18, hy + 5, C.skin2);
    p.set(18, hy + 6, C.ink);
    line(p, 7, hy + 2, 4, hy + 6, C.ink2);
    p.set(4, hy + 6, C.skin2);
  } else {
    line(p, 7, hy + 1, 3, hy + 6, C.black);
    p.set(3, hy + 6, C.skin);
    p.set(2, hy + 6, C.skin2);
    p.set(2, hy + 7, C.ink);
    line(p, 13, hy + 2, 16, hy + 5, C.ink2);
    p.set(16, hy + 5, C.skin2);
  }

  const hipY = 16 + (bob > 0 ? 1 : 0);
  const plant = () => leg(p, 11, hipY, KNEE_P[frame][0], KNEE_P[frame][1] + (bob > 0 ? 1 : 0), PLANT[frame], 27, C.navy);
  const swing = () => {
    const fy = SWING_Y[frame];
    line(p, 10, hipY, KNEE_S[frame][0], KNEE_S[frame][1], C.ink2);
    line(p, KNEE_S[frame][0], KNEE_S[frame][1], SWING[frame], fy, C.navy);
    if (fy >= 26) shoe(p, SWING[frame], 27);
    else {
      p.set(SWING[frame], fy, C.black);
      p.set(SWING[frame] + 1, fy, C.black);
      p.set(SWING[frame] + 2, fy, C.ink);
    }
  };
  if (NEAR_PLANT[frame]) {
    swing();
    plant();
  } else {
    plant();
    swing();
  }
}

export const ELON_WALK = Array.from({ length: 8 }, (_, f) => bake(22, 28, (p) => drawElonBody(p, f, false)));
export const ELON_WALK_BLINK = bake(22, 28, (p) => drawElonBody(p, 0, true));

// Standing / typing, facing right. Two hand heights.
function drawElonType(p, hand) {
  stamp(p, ELON_HEAD, E, 3, 0);
  for (let y = 10; y < 17; y++) {
    for (let x = 6; x <= 12; x++) p.set(x, y, C.black);
    p.set(5, y, C.ink);
    p.set(13, y, C.ink2);
  }
  // both arms reach toward the keyboard on the right
  const hy = 14 + hand;
  line(p, 12, 11, 18, hy, C.black);
  line(p, 11, 12, 17, hy + 1, C.ink2);
  p.set(18, hy, C.skin);
  p.set(19, hy, C.skin);
  p.set(19, hy + 1, C.skin2);
  p.set(17, hy + 1, C.skin2);
  // quiet stance, feet under the hips
  line(p, 8, 16, 7, 24, C.navy);
  line(p, 11, 16, 12, 24, C.navy);
  shoe(p, 5, 27);
  shoe(p, 11, 27);
}
export const ELON_TYPE = [0, 1].map((h) => bake(22, 28, (p) => drawElonType(p, h)));

function botLimb(p, x0, y0, x1, y1, fill, edge) {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let i = 0; i <= steps; i++) {
    const x = Math.round(x0 + ((x1 - x0) * i) / steps);
    const y = Math.round(y0 + ((y1 - y0) * i) / steps);
    p.set(x, y, edge);
    p.set(x + 1, y, fill);
    p.set(x + 2, y, fill);
  }
}

function drawOptimus(p, frame, carry) {
  // frame 0..5 walk (stride 3), or -1 standing.
  const bob = frame < 0 ? 0 : [0, 1, 0, 0, 1, 0][frame];
  const y = bob;
  for (let yy = 1 + y; yy <= 8 + y; yy++) {
    for (let x = 6; x <= 14; x++) p.set(x, yy, C.opti);
    p.set(5, yy, C.ink);
    p.set(15, yy, C.ink);
  }
  p.hline(6, 1 + y, 9, C.ink);
  for (let x = 7; x <= 13; x++) p.set(x, 4 + y, C.joint);
  p.set(8, 4 + y, C.cyan);
  p.set(9, 4 + y, C.white);
  p.set(12, 4 + y, C.cyan);
  p.set(7, 2 + y, C.opti2);
  p.set(13, 3 + y, C.opti2);
  const ty = 9 + y;
  for (let yy = ty; yy <= 17 + y; yy++) {
    for (let x = 5; x <= 15; x++) p.set(x, yy, C.opti);
    p.set(4, yy, C.ink);
    p.set(16, yy, C.ink);
  }
  p.hline(6, ty, 9, C.opti2);
  p.set(9, ty + 4, C.joint);
  p.set(10, ty + 4, C.joint);
  p.set(11, ty + 4, C.cyanD);
  p.set(10, ty + 5, C.cyan);
  if (carry) {
    botLimb(p, 4, ty + 2, 1, ty + 6, C.opti, C.ink);
    botLimb(p, 15, ty + 2, 18, ty + 6, C.opti, C.ink);
    p.set(1, ty + 6, C.joint);
    p.set(19, ty + 6, C.joint);
  } else if (frame < 0) {
    botLimb(p, 4, ty + 2, 2, ty + 8, C.opti, C.ink);
    botLimb(p, 15, ty + 2, 19, ty + 5, C.opti, C.ink);
    p.set(2, ty + 8, C.joint);
    p.set(20, ty + 5, C.joint);
    p.set(21, ty + 5, C.opti2);
  } else if (frame >= 3) {
    botLimb(p, 15, ty + 2, 19, ty + 6, C.opti, C.ink);
    botLimb(p, 4, ty + 2, 2, ty + 7, C.opti2, C.ink);
  } else {
    botLimb(p, 4, ty + 2, 1, ty + 6, C.opti, C.ink);
    botLimb(p, 15, ty + 2, 18, ty + 7, C.opti2, C.ink);
  }
  const plantX = frame < 0 ? 6 : [12, 9, 6, 12, 9, 6][frame];
  const swingX = frame < 0 ? 12 : [3, 6, 10, 3, 6, 10][frame];
  const lift = frame < 0 ? 0 : [0, 3, 5, 0, 3, 5][frame];
  const hip = 18 + y;
  botLimb(p, 8, hip, plantX, 28, C.opti, C.ink);
  botLimb(p, 12, hip, swingX, 28 - lift, lift ? C.opti2 : C.opti, C.ink);
  p.set(plantX + 1, 24, C.joint);
  p.set(swingX + 1, 24, C.joint);
  shoe(p, plantX, 31);
  if (!lift) shoe(p, swingX, 31);
  else {
    p.set(swingX, 30 - lift, C.joint);
    p.set(swingX + 1, 30 - lift, C.steelK);
    p.set(swingX + 2, 30 - lift, C.steelK);
  }
}

export const OPT_WALK = Array.from({ length: 6 }, (_, f) => bake(22, 32, (p) => drawOptimus(p, f, false)));
export const OPT_CARRY = Array.from({ length: 6 }, (_, f) => bake(22, 32, (p) => drawOptimus(p, f, true)));
export const OPT_SERVE = [0, 1].map(() => bake(22, 32, (p) => drawOptimus(p, -1, false)));

function turkeyBody(p, bob, peck, tail, napkin) {
  const y = bob;
  // tail fan, clearly separate from the body
  p.set(0 + tail, 4 + y, C.ink);
  p.set(1 + tail, 3 + y, C.turk3);
  p.set(2 + tail, 2 + y, C.turk);
  p.set(3 + tail, 3 + y, C.turk3);
  p.set(1, 5 + y, C.turk2);
  p.set(2, 6 + y, C.goldD);
  p.set(0, 7 + y, C.turk3);
  p.set(1, 7 + y, C.ink);
  // rounded body
  const body = [[6, 8, 11], [7, 6, 12], [8, 5, 13], [9, 5, 13], [10, 6, 12], [11, 7, 11]];
  for (const [yy, x0, x1] of body) {
    for (let x = x0; x <= x1; x++) p.set(x, yy + y, C.turk);
    p.set(x0, yy + y, C.ink);
    p.set(x1, yy + y, C.ink);
  }
  p.set(7, 8 + y, C.turk3);
  p.set(9, 9 + y, C.turk2);
  p.set(11, 10 + y, C.turk2);
  // head, up and to the right so it is not part of the body mass
  const hy = (peck ? 4 : 2) + y;
  p.set(13, hy, C.ink);
  p.set(14, hy, C.turk3);
  p.set(15, hy, C.ink);
  p.set(13, hy + 1, C.turk);
  p.set(14, hy + 1, C.white);
  p.set(15, hy + 1, C.black);
  p.set(16, hy + 1, C.beak);
  p.set(17, hy + 1, C.beak);
  p.set(13, hy + 2, C.wattle);
  p.set(14, hy + 2, C.wattle);
  p.set(15, hy + 2, C.wattle);
  p.set(14, hy + 3, C.wattle);
  p.set(12, hy + 1, C.ink);
  p.set(12, hy + 2, C.turk2);
  if (napkin) {
    p.set(8, 6 + y, C.white);
    p.set(9, 6 + y, C.napkin);
    p.set(10, 6 + y, C.white);
    p.set(9, 7 + y, C.napkin);
    p.set(10, 7 + y, C.cream);
  }
}

function turkeyFeet(p, frame) {
  // Stride 4. The planted foot retreats by 4 so a +4 sprite move keeps it planted.
  const plantX = [12, 8, 4, 12, 8, 4][frame];
  const swingX = [2, 5, 9, 2, 5, 9][frame];
  const lift = [0, 2, 3, 0, 2, 3][frame];
  const nearPlant = frame < 3;
  const drawF = (x, liftY, c) => {
    const y = 17 - liftY;
    p.set(x, 14, c);
    p.set(x, 15, c);
    p.set(x, y, C.goldD);
    p.set(x + 1, y, C.beak);
    p.set(x + (liftY ? 0 : 2), y, C.goldD);
    if (liftY) p.set(x, y - 1, c);
  };
  if (nearPlant) {
    drawF(swingX, lift, C.turk2);
    drawF(plantX, 0, C.turk);
  } else {
    drawF(plantX, 0, C.turk2);
    drawF(swingX, lift, C.turk);
  }
}

export const TURKEY_WALK = Array.from({ length: 6 }, (_, f) => bake(20, 18, (p) => {
  turkeyBody(p, [0, 1, 0, 0, 1, 0][f], false, [0, 1, 0, 0, -1, 0][f], false);
  turkeyFeet(p, f);
}));

export const TURKEY_SIT = [0, 1].map((peck) => bake(20, 18, (p) => {
  turkeyBody(p, 1, peck === 1, 0, true);
  p.set(6, 16, C.beak);
  p.set(7, 16, C.goldD);
  p.set(8, 16, C.ink);
  p.set(11, 16, C.beak);
  p.set(12, 16, C.goldD);
  p.set(13, 16, C.ink);
}));

export const TURKEY_STAND = bake(20, 18, (p) => {
  turkeyBody(p, 0, false, 0, false);
  turkeyFeet(p, 0);
});

export const CLOCHE = spr([
  '....oooo....',
  '...oHHHHo...',
  '..oHHHHHHo..',
  '..oHHwwHHo..',
  '.oHHHHHHHHo.',
  '.oHHHHHHHHo.',
  'oooooooooooo',
  '.oPPPPPPPPo.',
  '..oooooooo..',
], {
  '.': 0, o: C.ink, H: C.cloche, w: C.white, P: C.steelL,
});

export const PLATTER = spr([
  '..oooooooo..',
  '.oPPPPPPPPo.',
  '..oOOOOOOOo.',
  '...ooooooo..',
], {
  '.': 0, o: C.ink, P: C.plate, O: C.steel,
});

export const ROAST = spr([
  '.....ooo..oD....',
  '....orrrroDD....',
  '...orrrrrroD....',
  '..orrrrrrrro....',
  '.orrrrrrrrrro...',
  'orrrddrrrrrrro..',
  '.orrrrrrrrrro...',
  '..opppppppppo...',
  '...ooooooooo....',
], {
  '.': 0, o: C.ink, r: C.roast, d: C.roast2, D: C.roast3, p: C.plate,
});

export const PIE_PUMPKIN = spr([
  '.ooooooo.',
  'occccccco',
  'ocfffffco',
  'ocfffffco',
  'ocyyyyyco',
  '.ooooooo.',
], { '.': 0, o: C.ink, c: C.crust, f: C.pie, y: C.goldD });

export const PIE_BERRY = spr([
  '.ooooooo.',
  'occccccco',
  'ocbbbbbco',
  'ocbwwwbco',
  'ocyyyyyc.',
  '.ooooooo.',
], { '.': 0, o: C.ink, c: C.crust, b: C.berry, w: C.white, y: C.goldD });

export const BOWL_MASH = spr([
  '.oooooo.',
  'ommmmmmo',
  'ommmmmo.',
  'owwwwwwo',
  '.oooooo.',
], { '.': 0, o: C.ink, m: C.mash, w: C.white });

export const BOWL_MASH_GRAVY = spr([
  '.oooooo.',
  'ommmmmmo',
  'ommaammo',
  'owwwwwwo',
  '.oooooo.',
], { '.': 0, o: C.ink, m: C.mash, a: C.gravy, w: C.white });

export const CORN = spr([
  '.oooo.',
  'onyyyo',
  'oyyyyo',
  'onyyyo',
  '.oGGo.',
  '..oo..',
], { '.': 0, o: C.ink, n: C.goldD, y: C.corn, G: C.greenD });

export const ROLLS = spr([
  '.oo.oo.',
  'occcoco',
  'ocycoco',
  '.oo.oo.',
], { '.': 0, o: C.ink, c: C.crust, y: C.gold });

export const BEANS = spr([
  '.ooooo.',
  'ovvvvvo',
  'ovvgvvo',
  'owwwww.',
  '.ooooo.',
], { '.': 0, o: C.ink, v: C.veg, g: C.greenD, w: C.white });

export const GRAVY_BOAT = spr([
  '..oooo..',
  '.oaaaao.',
  'oaaaaaao',
  'owwwwwwo',
  '.oooooo.',
], { '.': 0, o: C.ink, a: C.gravy, w: C.plate });

export const CANDLE = [
  spr(['.y.', '.f.', 'oco', 'ooo'], { '.': 0, y: C.flame2, f: C.flame, o: C.goldD, c: C.gold }),
  spr(['y..', '.f.', 'oco', 'ooo'], { '.': 0, y: C.flame2, f: C.flame, o: C.goldD, c: C.white }),
  spr(['.y.', '.f.', 'oco', 'ooo'], { '.': 0, y: C.white, f: C.flame, o: C.goldD, c: C.gold }),
  spr(['..y', '.f.', 'oco', 'ooo'], { '.': 0, y: C.flame2, f: C.gold, o: C.goldD, c: C.gold }),
];

export const EGG = [
  spr(['.ooo.', 'oeeeo', 'oeeeo', '.ooo.'], { '.': 0, o: C.ink, e: C.egg }),
  spr(['..ooo', '.oeeo', 'oeeeo', '.ooo.'], { '.': 0, o: C.ink, e: C.egg }),
  spr(['.ooo.', 'oeeeo', 'oeEeo', '.ooo.'], { '.': 0, o: C.ink, e: C.egg, E: C.egg2 }),
  spr(['ooo..', 'oeeo.', 'oeeeo', '.ooo.'], { '.': 0, o: C.ink, e: C.egg }),
];

export const EGG_FLAT = spr(['oooooo', 'oeeeoo'], { '.': 0, o: C.ink, e: C.egg });

const DINER_A = [
  '....oooo......',
  '...oHHHHo.....',
  '..oHHHsHHo....',
  '..oHseessHo...',
  '..oHsssnHo....',
  '..oHssssHo....',
  '...osssso.....',
  '....oooo......',
  '...osbbbo.....',
  '..osbbbbbo....',
  '..ssbbbbbo....',
  '...sbbbbo.....',
  '....bbbbo.....',
  '...onnnno.....',
  '..on....no....',
  '..o.....no....',
  '..o.....no....',
  '..o.....n.....',
  '..oo....n.....',
  '.......on.....',
  '.......oo.....',
  '......o.o.....',
  '......o.o.....',
  '......ooo.....',
];

const DINER_B = [
  '.....oooo.....',
  '....oHHHHo....',
  '...oHHHHHHo...',
  '..oHHHsHHHo...',
  '..oHseessHo...',
  '...oHssnHo....',
  '....osssso....',
  '.ooo.oooo.....',
  'oHHHo.sbbbo...',
  '.ooo.sbbbbbo..',
  '....ssbbbbbo..',
  '.....sbbbbo...',
  '.....bbbb.....',
  '....onnnno....',
  '...on...no....',
  '...o....no....',
  '...o....no....',
  '...o....n.....',
  '...oo...n.....',
  '.......on.....',
  '.......oo.....',
  '......o.o.....',
  '......ooo.....',
];

const DMAP = {
  '.': 0, o: C.ink, H: C.hairB, s: C.skin, S: C.skin2, e: C.black,
  n: C.navy, b: C.sweater,
};

export const DINER_SHORT = spr(DINER_A, DMAP);
export const DINER_BUN = spr(DINER_B, DMAP);
export const DINER_SHORT_CHEW = spr(DINER_A.map((row, i) => (i === 4 ? '..oHsOOsHo....' : row)), {
  ...DMAP, O: C.skin3,
});
export const DINER_BUN_CHEW = spr(DINER_B.map((row, i) => (i === 5 ? '...oHOOnHo....' : row)), {
  ...DMAP, O: C.burg,
});

const CATMAP = { '.': 0, o: C.ink, C: C.cat, D: C.cat2, w: C.white, e: C.black };
export const CAT = [
  spr([
    'oo...oo....',
    'oCo.oCo....',
    'oCweCCCo...',
    '.oCCCCCo...',
    '..oCCCCo.o.',
    '...oCCCoCo.',
    '....oCCo.o.',
    '.....oCo...',
    '....oCDo...',
    '...oCDo....',
    '..oCDo.....',
    '.oCo.......',
  ], CATMAP),
  spr([
    'oo...oo....',
    'oCo.oCo....',
    'oCeeCCCo...',
    '.oCCCCCo...',
    '..oCCCCo...',
    '...oCCCo.o.',
    '....oCCCoo.',
    '.....oCo.o.',
    '......oo...',
    '...oCD.....',
    '..oC.......',
    '.oC........',
  ], CATMAP),
]

export const CAT_ALERT = spr([
  '.oo...oo.o..',
  'oCCo.oCCoo..',
  'oCweoCCCoo..',
  '.oCCCCCCo...',
  '..oCCCCo....',
  '...oCCCo....',
  '....oCCo....',
  '.....oo.....',
  '....oCDo....',
  '...oCDo.....',
  '..oCDo......',
  '.oCDo.......',
  'oCo.........',
  'oC..........',
], CATMAP);

const DOGMAP = { '.': 0, o: C.ink, D: C.dog, K: C.dog2, w: C.white, e: C.black, n: C.wattle };
export const DOG = [
  spr([
    '...oooo.......',
    '..oDDDDo......',
    '.oDwwweDo.....',
    '.oDDDDDDo.....',
    '..oDDDDooooo..',
    '...oDDo....o..',
    '....oD.....o..',
    '....oo........',
    '...oDo........',
    '..oDDDo.......',
    '.oDDDDDo......',
    '.oDDDDDo......',
    '..ooooo.......',
  ], DOGMAP),
  spr([
    '...oooo.......',
    '..oDDDDo......',
    '.oDwwweDo.....',
    '.oDDDDDDo.....',
    '..oDDDDoo.....',
    '...oDDo..ooo..',
    '....oD...oDo..',
    '....oo....oo..',
    '...oDo........',
    '..oDDDo.......',
    '.oDDDDDo......',
    '.oDDDDDo......',
    '..ooooo.......',
  ], DOGMAP),
];

export const DOG_LOOK = spr([
  '..oooo........',
  '.oDDDDo.......',
  'oDwwweDo......',
  'oDDDDDDo......',
  '.oDDDDooooo...',
  '..oDDo....o...',
  '...oD......o..',
  '...oo.........',
  '..oDo.........',
  '.oDDDo........',
  'oDDDDDo.......',
  'oDDDDDo.......',
  '.ooooo........',
], DOGMAP);

function drawGrok(p, frame, plate) {
  const bob = frame % 2;
  // antenna
  p.set(6, bob, C.cyan);
  p.set(6, 1 + bob, C.steelD);
  // head
  for (let y = 2 + bob; y <= 7 + bob; y++) {
    for (let x = 3; x <= 9; x++) p.set(x, y, C.grok);
    p.set(2, y, C.ink);
    p.set(10, y, C.ink2);
  }
  p.hline(3, 2 + bob, 7, C.ink);
  // face screen
  for (let x = 4; x <= 8; x++) {
    p.set(x, 4 + bob, C.screen);
    p.set(x, 5 + bob, C.screen);
    p.set(x, 6 + bob, C.cyanD);
  }
  p.set(5, 5 + bob, C.cyan);
  p.set(7, 5 + bob, C.cyan);
  // body
  for (let y = 8 + bob; y <= 11 + bob; y++) {
    for (let x = 4; x <= 8; x++) p.set(x, y, C.steelK);
  }
  if (plate) {
    p.set(9, 9 + bob, C.plate);
    p.set(10, 9 + bob, C.white);
    p.set(11, 9 + bob, C.plate);
    p.set(10, 8 + bob, C.crust);
  }
  // legs / little stride of 1px, 4-frame cycle stored as 4 bakes with frame 0..3
  const lx = [3, 4, 5, 4][frame];
  const rx = [8, 7, 6, 7][frame];
  p.set(lx, 12 + bob, C.ink);
  p.set(lx, 13, C.cyanD);
  p.set(lx + 1, 13, C.ink);
  p.set(rx, 12 + bob, C.ink);
  p.set(rx, 13, C.cyanD);
  p.set(rx + 1, 13, C.ink);
}

export const GROK = Array.from({ length: 4 }, (_, f) => bake(14, 14, (p) => drawGrok(p, f, false)));
export const GROK_PLATE = Array.from({ length: 4 }, (_, f) => bake(14, 14, (p) => drawGrok(p, f, true)));

export const TREE = spr([
  '.....oooooo.....',
  '...ooLLLLLooo...',
  '..oLLDDLLLDDLo..',
  '.oLDDLLLLLDDDLo.',
  'oLLDDLLLLLLDDDLo',
  'oLDDLLLwLLLDDDLo',
  '.oLLDDLLLLLDDLo.',
  '..oLDDDLLDDDLo..',
  '...oooLLLooo....',
  '......oKKo......',
  '......oKKo......',
  '.....oKKKKo.....',
], {
  '.': 0, o: C.ink, L: C.leaf, D: C.leafD, w: C.gold, K: C.woodK,
});

export const OVEN_ROAST = spr([
  '..ooo..',
  '.orrro.',
  'ordddro',
  '.orrro.',
  '..ooo..',
], { '.': 0, o: C.roast3, r: C.roast, d: C.gold });

export function visibleBounds(s) {
  let minX = s.w, minY = s.h, maxX = -1, maxY = -1;
  for (let y = 0; y < s.h; y++) {
    for (let x = 0; x < s.w; x++) {
      if (!s.pix[y * s.w + x]) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  return { minX, minY, maxX, maxY, vh: maxY - minY + 1, vw: maxX - minX + 1 };
}
