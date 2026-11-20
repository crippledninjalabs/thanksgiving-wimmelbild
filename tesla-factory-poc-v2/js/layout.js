// Building layout: one 1600x1000 cutaway. All numbers are world pixels.
// Rooms tile a 3x3 grid separated by 12px wall slabs and 14px floor slabs.
(function () {
  const COLS = [{ x: 14, w: 500 }, { x: 526, w: 548 }, { x: 1086, w: 500 }];
  const ROWS = [{ y: 74, h: 292 }, { y: 380, h: 292 }, { y: 686, h: 300 }];
  TF.GRID = { COLS, ROWS, top: 60, bottom: 1000, wall: 12, slab: 14, outer: 14 };

  // Adding a room = new js/rooms/<id>.js + one entry here.
  TF.LAYOUT = [
    { id: 'casting', col: 0, row: 0 }, { id: 'body', col: 1, row: 0 }, { id: 'paint', col: 2, row: 0 },
    { id: 'assembly', col: 0, row: 1 }, { id: 'battery', col: 1, row: 1 }, { id: 'optimus', col: 2, row: 1 },
    { id: 'cybertruck', col: 0, row: 2 }, { id: 'test', col: 1, row: 2 }, { id: 'shipping', col: 2, row: 2 },
  ];
  TF.LAYOUT.forEach((e) => { const c = COLS[e.col], r = ROWS[e.row]; e.x = c.x; e.y = r.y; e.w = c.w; e.h = r.h; });

  // Openings cut in the structure. v: vertical walls (x = left edge, w), list of [y0,y1] gaps.
  // h: floor slabs (y = top, h), list of [x0,x1] holes.
  // Interior walls are 22 px solid slabs; only door-, slot- and deck-sized openings.
  TF.WALLS = {
    v: [
      { x: 0, w: 14, y0: 60, y1: 986, open: [[902, 986]] },                       // left outer: Cybertruck garage door
      { x: 1586, w: 14, y0: 60, y1: 986, open: [[898, 986]] },                    // right outer: shipping garage door
      { x: 509, w: 22, y0: 74, y1: 366, open: [[92, 122], [134, 186], [306, 366]] }, // belt slot, hoist rail hole, car line + door
      { x: 1069, w: 22, y0: 74, y1: 366, open: [[92, 122], [306, 366]] },
      { x: 509, w: 22, y0: 380, y1: 672, open: [[414, 464], [524, 566], [614, 672]] }, // deck, wheel hook line, door + pack belt
      { x: 1069, w: 22, y0: 380, y1: 672, open: [[414, 464], [524, 552], [614, 672]] },
      { x: 509, w: 22, y0: 686, y1: 986, open: [[790, 838], [928, 986]] },
      { x: 1069, w: 22, y0: 686, y1: 986, open: [[722, 750], [928, 986]] },
    ],
    h: [
      { y: 60, h: 14, x0: 0, x1: 1600, open: [] },
      { y: 366, h: 14, x0: 0, x1: 1600, open: [[1444, 1558], [1562, 1582]] },
      { y: 672, h: 14, x0: 0, x1: 1600, open: [[42, 158], [1032, 1050], [1500, 1534]] },
      { y: 986, h: 14, x0: 0, x1: 1600, open: [] },
    ],
  };


  // ---- main car line: one car's journey; cars follow each other P seconds apart ----
  // [x, y, dwell, move, via?]  (dwell at this slot, then move to the next slot)
  const CAR_SLOTS = [
    [205, 346, 2.4, 1.6],        // 0 giga press (hidden under the die)
    [395, 346, 2.4, 1.6],        // 1 trim + quench
    [615, 346, 2.4, 1.6],        // 2 weld
    [800, 346, 2.4, 1.6],        // 3 body shell lowered by hoist
    [975, 346, 2.4, 1.6],        // 4 weld
    [1185, 346, 2.4, 1.6],       // 5 spray booth 1
    [1335, 346, 2.4, 1.6],       // 6 spray booth 2
    [1500, 346, 0.3, 1.2],       // 7 lift top (paint)
    [1500, 452, 0.3, 1.6],       // 8 lift bottom = deck, row 1
    [1270, 452, 2.0, 2.0],       // 9
    [960, 452, 2.0, 2.0],        // 10
    [700, 452, 0.8, 3.2, [[420, 452]]], // 11 -> down the column lift
    [420, 642, 2.4, 1.6],        // 12 battery marriage
    [250, 642, 2.0, 1.6],        // 13 wheels on
    [100, 642, 0.3, 1.4],        // 14 lift top (assembly)
    [100, 826, 0.3, 1.6],        // 15 lift bottom = deck, row 2
    [330, 826, 2.0, 2.0],        // 16
    [640, 826, 0.3, 1.2],        // 17 lift top (test)
    [640, 966, 0.3, 1.4],        // 18 rollers
    [820, 966, 2.4, 1.6],        // 19 dyno
    [990, 966, 2.4, 1.6],        // 20 scanner
    [1210, 966, 2.4, 1.6],       // 21 charger A
    [1400, 966, 2.4, 2.0],       // 22 charger B -> out the door
    [1760, 966, 0, 0],           // 23 outside (hidden)
  ];
  TF.CAR = TF.buildChain(CAR_SLOTS, 4);

  // ---- themed payload routes (world coords). k = items per loop (multiple of 12), s = spacing ----
  TF.ROUTES = [
    { pts: [[470, 110], [1572, 110], [1572, 560]], k: 24, s: 44, seed: 0 },       // top belt -> chute into Optimus room
    { pts: [[1440, 540], [1041, 540], [1041, 770]], k: 24, s: 40, seed: 1 },       // Optimus -> battery -> chute to test
    { pts: [[930, 742], [1250, 742]], k: 12, s: 46, seed: 2 },                     // test -> shipping
    { pts: [[1490, 730], [1300, 730]], k: 12, s: 40, seed: 3 },                    // shipping tote tray (upper right)
    { pts: [[226, 416], [350, 416]], k: 12, s: 34, seed: 1 },                      // assembly cable tray with totes
  ];
  // Pipes: blobs flow along; drawn over the walls (they run through them).
  TF.PIPES = [
    { pts: [[0, 84], [1600, 84]], w: 7 },
    { pts: [[0, 390], [1600, 390]], w: 6 },
    { pts: [[0, 696], [1600, 696]], w: 6 },
  ];

  // ---- walkers: keys [time, x], y fixed; copies spaced period/n apart (period/n must divide 16) ----
  TF.WALKERS = [
    { kind: 'optimus', y: 672, period: 64, n: 8,
      keys: [[0, 1568], [2, 1470], [4.5, 1470], [30, 460], [34, 460], [64, 1568]] },
    { kind: 'worker', y: 366, period: 16, n: 1, shirt: '#4a90d9', box: true,
      keys: [[0, 300], [7, 700], [8, 700], [15, 300], [16, 300]] },
    { kind: 'worker', y: 366, period: 16, n: 1, shirt: '#2e9e6a',
      keys: [[0, 1300], [1.5, 1300], [8, 900], [9.5, 900], [16, 1300]] },
    { kind: 'worker', y: 672, period: 16, n: 2, shirt: '#e67e22', cart: true,
      keys: [[0, 640], [7, 1000], [8, 1000], [15, 640], [16, 640]] },
    { kind: 'worker', y: 986, period: 16, n: 1, shirt: '#8e44ad',
      keys: [[0, 1300], [7, 1500], [8, 1500], [15, 1300], [16, 1300]] },
    { kind: 'optimus', y: 986, period: 16, n: 1,
      keys: [[0, 420], [1, 420], [7.5, 760], [8.5, 760], [15, 420], [16, 420]] },
    // two Optimus carry a box from the dispenser (Optimus room) through the doorway into the battery-room bin
    { kind: 'carrier', y: 672, period: 16, n: 2,
      keys: [[0, 1205], [2.6, 1205], [8.2, 958], [9.6, 958], [15.4, 1205], [16, 1205]],
      carry: { slide: [0.2, 1.3], pick: [1.6, 2.3], drop: [8.3, 9.3], ledge: [1219, 633], bin: [940, 640] } },
    // Elon: watches the activation pad (row 1), rides the glass lift down to the shipping mezzanine, back up
    { kind: 'elon', y: 672, period: 16, n: 1, front: true, draw: (...a) => TF.elonLift(...a),
      keys: [[0, 1505, 672], [3, 1505, 672], [3.5, 1517, 672], [3.8, 1517, 672], [5.6, 1517, 836], [5.8, 1517, 836],
        [8.3, 1360, 836], [11.6, 1360, 836], [13.7, 1517, 836], [13.9, 1517, 836], [15.4, 1517, 672], [16, 1505, 672]] },
  ];
})();
