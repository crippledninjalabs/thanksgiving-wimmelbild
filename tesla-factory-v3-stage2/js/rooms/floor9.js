// Floor 9 — brains + people, W -> E (FACTORY-MAP §2 floor 9). 9A takes the roof-drone chip capsule (16 s), flashes the
// chip and the ONE intake Optimus carries it to the 9B feeder; the 9B pick-place arm builds + tests computers for 5A, 4C, 7C;
// 9C turns the roof solar into building power; 9D sews seats from DOCK foam (arm); the 9C-9E controller tags + lifts them; 9E is
// flight control (the controller presses "go" for the 8E sky-bridge at 0 / 24), Elon sketching at his bench, and the
// dark DIABLO corner (stage-3 gag hook 'diablo', P 157: Elon walks over and plays, sign lit only then).
(function (G) {
  const TF = G.TF, TF3 = G.TF3, RG = TF3.rig, L = TF.layout, D = TF.draw, K = TF.kit, A = TF.act, M = TF.M, X = TF.mx, S = TF.supply, IT = S.items, R = TF.R;
  const F = 9, yF = L.floorY(F), hY = (m) => yF - m * M, ceil = L.ceilY(F);
  const s24 = (t) => TF.mod(t, 24);

  // ================= 9A-9B ONE intake Optimus (16 s, phase = roof capsule arrival): parcel -> flasher -> flatten parcel -> chip to the 9B feeder =================
  const RX = 1650, ARR = TF.mod(S.roofCapsule.arrive(0), 16) + 0.9, s16 = (t) => TF.mod(t - ARR, 16);   // chip on the tray at s16 = 0
  const FL = 1760, FX = 1858 + 0.5 * M, BENCH = FX - 12, FLAT = 1640;
  const intake = (() => {
    const tray = A.reach([0.45, 1.25], null, { gripN: 1 }), hand = A.reach([0.4, 1.1], [0.28, 1.08], { gripN: 1, gripF: 0.8 });
    const press = (a) => A.reach([0.45, a], [0.35, a], { gripN: 1, gripF: 1, head: 0.3, lean: 0.15 });
    const segs = [A.keyed(1.0, 1612, 1, [[0, A.stand()], [0.6, tray], [1, hand]]), A.walk(1.0, 1612, 1722, { step: 0.5, carry: [0.4, 1.1], carryW: 0.25 }),
      A.keyed(1.0, 1722, 1, [[0, hand], [1, A.reach([0.5, 1.0], null, { gripN: 0 })]]),                                       // chip into the flasher (2-3)
      A.walk(0.9, 1722, FLAT, { step: 0.5 }), A.keyed(1.6, FLAT, 1, [[0, A.stand()], [0.35, press(1.25)], [0.7, press(1.0)], [1, A.reach([0.5, 1.0], null, { gripN: 0 })]]),   // flatten the empty parcel into the return basket (3.9-5.5)
      A.walk(0.9, FLAT, 1722, { step: 0.5 }), A.keyed(1.0, 1722, 1, [[0, A.stand()], [0.6, A.reach([0.5, 1.0], null, { gripN: 1 })], [1, hand]]),   // take the flashed chip (6.4-7.4)
      A.walk(1.4, 1722, 1858, { step: 0.5, carry: [0.4, 1.1], carryW: 0.25 }), A.keyed(1.2, 1858, 1, [[0, hand], [0.6, A.reach([0.5, 1.0], null, { gripN: 0 })], [1, A.stand()]]),   // onto the 9B feeder (8.8-10)
      A.turn(0.3, 1858, 1), A.walk(2.3, 1858, 1612, { step: 0.5 })];
    segs.push(A.hold(16 - A.total(segs), 1612, 1, (tl) => A.reach([0.3 + 0.05 * Math.sin(tl * 3), 1.9], [0.2, 1.0], { head: -0.4, gripN: 0.5 })));   // check the receiver flap
    return (t) => A.run(segs, s16(t)); })();
  TF.room({ id: '9A', period: 48, box: L.roomById('9A').box,
    ports: { H9: 'in', D9AB: 'out', 'W3-9': 'pass', 'PT-9': 'pass', 'SS-9': 'spare', F9R: 'pass' },
    actors: ['9A.receiver', '9A.flasher', '9A.intakeOptimus'],
    flows: [{ item: 'chips (roof drone -> capsule)', from: 'ROOF', via: ['H9'], to: '9A', sink: 'flashed' },
      { item: 'flashed chips (carried)', from: '9A', via: ['D9AB'], to: '9B', sink: 'computers' }],
    back(ctx, t, theme, lod) {
      const u = s16(t);
      X.upper(ctx, yF, ceil, t, lod, { duct: [1380, 1560, 4.4], fans: [1430], pipes: [1700, 1820, 4.0], valves: [1760], lamps: [1500, 1760] });
      // receiver under the roof capsule, drop chute to the tray; opened parcel on the tray, return basket beside it
      D.rect(ctx, RX - 12, hY(4.6), 24, 14, '#dfe4e8', '#7b848c', 1); D.rect(ctx, RX - 5, hY(4.6) + 14, 10, hY(1.3) - hY(4.6) - 14, '#e8ecef', '#9aa3ab', 1);
      D.rect(ctx, RX - 22, hY(1.3), 44, 4, '#9aa3ab');
      if (u >= 15.4) IT.chip(ctx, RX, TF.lerp(hY(4.4), hY(1.3), (u - 15.4) / 0.6)); else if (u < 0.6) IT.chip(ctx, RX, hY(1.3));
      if (lod !== 'far' && (u >= 0.6 && u < 4.4)) IT.box(ctx, RX + 22, hY(1.3));
      D.rect(ctx, FLAT + 38, hY(0.45), 34, 0.45 * M, '#c8a15a', '#7c5a1e', 1);
      // flasher with its progress bar
      D.rect(ctx, FL - 22, hY(1.0), 44, 1.0 * M, '#5f6b77', '#3f4851', 1); D.rect(ctx, FL - 16, hY(1.7), 32, 0.6 * M, '#1f2937');
      if (u >= 2.8 && u < 6.4) { D.rect(ctx, FL - 14, hY(1.45), 28 * TF.lin(u, 3.0, 6.2), 4, '#4ade80'); IT.chip(ctx, FL, hY(1.0)); }
      K.cabinet(ctx, 1380, hY(1.8), 18, 30, t, 91, lod);
    },
    draw() {},
    front(ctx, t, theme, lod) { if (lod === 'far') return; const u = s16(t), f = A.draw(ctx, intake(t), yF), w = f.w(f.sk.wristN);
      if ((u >= 0.6 && u < 2.6) || (u >= 7.0 && u < 9.4)) IT.chip(ctx, w[0], w[1] + 3);
      else if (u >= 4.3 && u < 5.5) D.rect(ctx, w[0] - 8, w[1], 16, 2, '#c8a15a'); } });

  // ================= 9B computer lab (pick-place arm builds + tests; the intake Optimus loads the feeder) =================
  const SEND = [[1960, 5.0], [2020, 9.0], [1990, 15.5], [1960, 17.0], [2020, 21.0]];
  const armX = (u) => TF.keys(u, [[0, 40], [10.5, 40], [11.5, 14], [12, 14], [12.8, 38], [13.4, 38], [14.2, 40], [16, 40]]);
  const armY = (u) => TF.keys(u, [[0, 40], [10.5, 40], [11.5, 6], [12, 30], [12.8, 30], [13.4, 8], [14.2, 34], [15, 40], [16, 40]]);
  TF.room({ id: '9B', period: 48, box: L.roomById('9B').box,
    ports: { D9AB: 'in', D9BC: 'in', F9R: 'pass' },
    actors: ['9B.testRack', '9B.senders', '9B.pickPlaceArm'],
    flows: [{ item: 'flashed chips (carried)', from: '9A', via: ['D9AB'], to: '9B', sink: 'computers' },
      { item: 'computers (capsules)', from: '9B', via: ['PT-9', 'PT-7', 'PT-5', 'PT-4'], to: '5A', sink: 'cars, cabs, robots (5A, 4C, 7C)' },
      { item: 'building power', from: '9C', via: ['D9BC'], to: '9B', sink: 'lab bus' }],
    back(ctx, t, theme, lod) {
      const s = s24(t), u = s16(t), ty = hY(0.95), done = u >= 14.5 || u < 10;
      X.upper(ctx, yF, ceil, t, lod, { tray: [1850, 2290, 4.4], fans: [2200], duct: [2120, 2290, 3.9], lamps: [1950, 2200] });
      D.rect(ctx, BENCH + 5, ty, 60, 5, '#9aa3ab', '#6d757d', 1); D.rect(ctx, BENCH + 10, ty + 5, 4, 0.95 * M - 5, '#6d757d'); D.rect(ctx, BENCH + 56, ty + 5, 4, 0.95 * M - 5, '#6d757d');
      D.rect(ctx, BENCH + 4, ty - 3, 16, 3, '#e5e7eb', '#9aa3ab', 1);                                               // feeder tray
      if (u >= 10.0 && u < 11.5) IT.chip(ctx, BENCH + 12, ty - 3);
      // board: open + green circuit while building, case closed afterwards; test light red -> amber -> green
      D.rect(ctx, BENCH + 28, ty - 5, 24, 5, done ? '#475569' : '#14532d', '#1e293b', 1);
      if (u >= 13.0 && u < 14.5) { IT.chip(ctx, BENCH + 40, ty - 5); D.line(ctx, [[BENCH + 28, ty - 5], [BENCH + 28 + 24 * TF.lin(u, 13.4, 14.4), ty - 5 - 8 * (1 - TF.lin(u, 13.4, 14.4))]], '#94a3b8', 2); }
      else if (!done) D.line(ctx, [[BENCH + 28, ty - 5], [BENCH + 28, ty - 13]], '#94a3b8', 2);
      D.circle(ctx, BENCH + 58, ty - 9, 3, done ? '#4ade80' : (u >= 11 ? '#f59e0b' : '#ef4444'));
      if (lod !== 'far') { D.rect(ctx, BENCH + 20, hY(1.9), 26, 16, '#0f172a', '#475569', 1); D.rect(ctx, BENCH + 22, hY(1.9) + 2, 22 * (0.5 + 0.5 * Math.sin(t * Math.PI)), 3, '#60a5fa'); }
      for (const x of [1960, 1990, 2020]) D.rect(ctx, x - 7, hY(1.6) - 3, 14, 22, '#dfe4e8', '#7b848c', 1);   // PT senders
      for (const [x, tm] of SEND) D.circle(ctx, x, hY(1.6) + 2, 2, TF.pulse(s, tm - 0.6, tm + 0.6, 0.2) > 0.5 ? '#4ade80' : '#475569');
      // burn-in test rack: computers with blinking status
      D.rect(ctx, 2140, hY(2.2), 120, 2.2 * M, '#e8ecef', '#9aa3ab', 1);
      for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { const y = hY(0.4 + r * 0.65), x = 2160 + c * 28; IT.computer(ctx, x, y);
        if (lod !== 'far') D.circle(ctx, x + 8, y - 6, 1.5, TF.mod(Math.floor(t * 2) + r * 3 + c * 5, 8) < 2 ? '#4ade80' : '#14532d'); }
      K.cabinet(ctx, 2080, hY(1.0), 18, 46, t, 93, lod);
    },
    draw() {},
    front(ctx, t, theme, lod) { if (lod === 'far') return; const u = s16(t), ty = hY(0.95), tx = BENCH + armX(u), tyy = ty - armY(u);
      K.arm(ctx, [BENCH + 66, ty], [tx, tyy], { l1: 30, l2: 28, toolAng: Math.PI / 2, bend: 1, tool: 4 });
      if (u >= 11.5 && u < 13.4) IT.chip(ctx, tx, tyy + 4); } });

  // ================= 9C solar room (roof panels -> inverters -> battery -> building bus) =================
  TF.room({ id: '9C', period: 48, box: L.roomById('9C').box,
    ports: { H9C: 'in', D9BC: 'out', D9CD: 'out', F9R: 'pass' },
    actors: ['9C.inverters', '9C.battery', '9C.cellTester', 'peek.shiba9C'],
    flows: [{ item: 'solar DC (roof)', from: 'ROOF', via: ['H9C'], to: '9C', sink: 'inverters + battery' },
      { item: 'building power', from: '9C', via: ['D9BC', 'D9CD'], to: '9D', sink: 'floor-9 bus' }],
    back(ctx, t, theme, lod) {
      X.upper(ctx, yF, ceil, t, lod, { pipes: [2330, 2780, 4.5], valves: [2600], duct: [2600, 2770, 3.9], fans: [2700], lamps: [2450, 2650] });
      D.rect(ctx, 2390, ceil, 14, hY(2.4) - ceil, '#f59e0b', '#b45309', 1);                                   // DC riser from the roof hatch
      D.rect(ctx, 2475, hY(4.2) - 20, 26, 9, '#c9d0d6', '#7b848c', 1);                                       // vent box (Shiba peek)
      D.screen(ctx, 2600, hY(3.6), 44, 26, (x, y, w, h) => { for (let i = 0; i < 5; i++) D.rect(ctx, x + 4 + i * 8, y + h - 3 - (6 + 10 * (0.5 + 0.5 * Math.sin(t * Math.PI / 6 + i * 1.3))), 5, 6 + 10 * (0.5 + 0.5 * Math.sin(t * Math.PI / 6 + i * 1.3)), '#4ade80'); });   // inverter screen (controller checks it)
      for (let i = 0; i < 3; i++) { const x = 2360 + i * 50; D.rect(ctx, x, hY(2.4), 40, 1.4 * M, '#e8ecef', '#7b848c', 1);
        D.rect(ctx, x + 6, hY(2.2), 28, 10, '#0f172a'); if (lod !== 'far') D.line(ctx, [[x + 8, hY(2.2) + 5], [x + 32, hY(2.2) + 5 + 3 * Math.sin(t * Math.PI * 2 + i)]], '#4ade80', 1); }
      for (let i = 0; i < 4; i++) { const x = 2540 + i * 34, lvl = 0.55 + 0.35 * Math.sin(t * Math.PI / 12 + i * 0.8);
        D.rect(ctx, x, hY(1.6), 26, 1.6 * M, '#d1d5db', '#6b7280', 1); D.rect(ctx, x + 4, yF - 4 - lvl * (1.6 * M - 8), 18, lvl * (1.6 * M - 8), '#22c55e'); }
      // cell tester: small arm lays a cell under the flash lamp (12 s)
      const u = TF.mod(t, 12), lamp = TF.pulse(u, 5, 6.5, 0.1);
      D.rect(ctx, 2700, hY(0.9), 70, 5, '#9aa3ab'); D.rect(ctx, 2725, hY(1.9), 24, 8, '#7b848c');
      if (lamp > 0) { ctx.globalAlpha = 0.35 * lamp; D.poly(ctx, [[2727, hY(1.9) + 8], [2747, hY(1.9) + 8], [2756, hY(0.9)], [2718, hY(0.9)]], '#fef9c3'); ctx.globalAlpha = 1; }
      D.rect(ctx, 2728, hY(0.9) - 3, 18, 3, '#1e3a8a');
      K.cabinet(ctx, 2340, hY(1.0), 18, 46, t, 95, lod);
    },
    draw() {},
    front(ctx, t, theme, lod) { if (lod === 'far') return; const u = TF.mod(t, 12), k = TF.pulse(u, 1, 9, 1.5);
      K.arm(ctx, [2690, hY(0.9)], [TF.lerp(2700, 2737, k), hY(0.9) - 10 - 12 * Math.sin(Math.PI * TF.lin(u, 1, 9))], { l1: 30, l2: 28, toolAng: Math.PI / 2, bend: 1, tool: 4 }); } });

  // ================= 9D seat shop (sewing arm + seat grows; the 9C-9E controller tags the seat and lifts it; foam basket stop tau24 9.0) =================
  const FOAM = 2880, SEW = 3080, FRAME = 3165, LIFT = 3005, r24 = (t) => TF.mod(t - 9, 24);
  TF.room({ id: '9D', period: 48, box: L.roomById('9D').box,
    ports: { D9CD: 'in', F9R: 'both', D9DE: 'pass' },
    actors: ['9D.sewing', '9D.seatLift', '9D.sewingArm', 'peek.hardhat9D'],
    flows: [{ item: 'foam + fabric (basket)', from: 'DOCK', via: ['W3-9', 'F9R'], to: '9D', sink: 'seats' },
      { item: 'seats (basket)', from: '9D', via: ['F9R', 'W3-9'], to: '5D', sink: 'cars (5D) and cabs (4C)' },
      { item: 'building power', from: '9C', via: ['D9CD'], to: '9D', sink: 'sewing machines' }],
    back(ctx, t, theme, lod) {
      const r = r24(t), c = s24(t);
      X.upper(ctx, yF, ceil, t, lod, { duct: [2810, 2960, 4.3], fans: [2860], pipes: [3080, 3250, 3.9], valves: [3200], lamps: [2900, 3150] });
      D.rect(ctx, SEW, hY(0.95), 60, 5, '#9aa3ab', '#6d757d', 1); D.rect(ctx, SEW + 20, hY(1.25), 24, 0.3 * M, '#e5e7eb', '#6b7280', 1);   // sewing machine
      if (lod !== 'far') D.line(ctx, [[SEW + 26, hY(1.0)], [SEW + 26, hY(1.0) - 3 + 2 * Math.sin(t * Math.PI * 8)]], '#111', 1);
      D.rect(ctx, FRAME, hY(0.6), 46, 4, '#5f6b77');
      if (c >= 17.5 || c < 6) IT.box(ctx, FRAME + 20, hY(0.6));                                                      // foam on the frame
      else { const g = TF.lin(c, 6, 9); ctx.save(); ctx.beginPath(); ctx.rect(FRAME - 10, hY(0.6) - 1.2 * M * g, 80, 1.3 * M * g + 2); ctx.clip(); IT.seat(ctx, FRAME + 20, hY(0.6)); ctx.restore();
        if (c >= 14.8) D.circle(ctx, FRAME + 30, hY(0.6) - 14, 2.5, '#4ade80'); }                                    // inspected tag
      for (const [i, x] of [2850, 2862].entries()) IT.box(ctx, x, yF - i * 8);                                                     // foam stock
      // seat lift: up with the seat 12.3-13.6, back down 14.0-15.2 (r24)
      const h = 1.0 + 3.0 * (TF.ramp(r, 12.3, 13.6) - TF.ramp(r, 14.0, 15.2));
      X.liftTable(ctx, LIFT, yF, 0.7, h, lod); if (r >= 10.7 && r < 13.8) IT.seat(ctx, LIFT, hY(h));
      K.cabinet(ctx, 3230, hY(1.0), 18, 46, t, 97, lod);
    },
    draw() {},
    front(ctx, t, theme, lod) { if (lod === 'far') return; const c = s24(t), k = TF.pulse(c, 1, 5.5, 0.8), u = TF.mod(c, 1.5) / 1.5;   // sewing arm works the covers on the frame
      K.arm(ctx, [FRAME + 58, hY(0.6) - 2], [FRAME + 30 - 14 * k * u, hY(0.6) - 36 - 10 * k * Math.abs(Math.sin(c * 9))], { l1: 30, l2: 28, toolAng: Math.PI / 2, bend: 1, tool: 4 }); } });

  // ================= 9E flight control + Elon's bench + the DIABLO corner =================
  const CON = 3360, BEN = 3535, DESK = 3670, diablo = TF.gagHooks.find((g) => g.id === 'diablo');
  const SCR = 2660, TAG = FRAME - 20, LFT = LIFT + 20;
  const ctrl = (() => {   // 24 s: go at 23-24; D9DE -> 9D (seat) ; 9C inverter screen; seat tag + lift; back for the next go
    const type = (tl) => A.reach([0.45, 1.05 + 0.02 * Math.sin(tl * 11)], [0.35, 1.05 + 0.02 * Math.cos(tl * 13)], { gripN: 0.3, gripF: 0.3, head: 0.2 });
    const segs = [A.hold(0.7, CON, 1, type), A.walk(6.4, CON, SCR, { step: 0.5 }), A.hold(1.5, SCR, 1, (tl) => A.reach([0.3, 1.7], null, { head: -0.15, gripN: 0.6 })),
      A.walk(4.4, SCR, TAG, { step: 0.5 }), A.hold(2.5, TAG, 1, (tl) => A.reach([0.45, 1.0 + 0.03 * Math.sin(tl * 5)], [0.35, 0.95], { gripN: 1, gripF: 1, head: 0.3, lean: 0.15 })),   // check + tag the seat
      A.hold(2.0, TAG, 1, (tl) => A.reach([0.45, 0.9 + 0.1 * Math.sin(tl * 3)], [0.35, 0.85], { lean: 0.25, gripN: 1, gripF: 1 })),
      A.walk(1.2, TAG, LFT, { step: 0.6, carry: [0.36, 1.12], carryW: 0.4 }), A.keyed(1.0, LFT, -1, [[0, A.carry(A.stand())], [1, A.reach([0.45, 1.0], null, { gripN: 0 })]]),   // seat onto the lift (-> 19.7)
      A.turn(0.3, LFT, 1), A.walk(2.8, LFT, CON, { step: 0.5 })];
    segs.push(A.keyed(24 - A.total(segs), CON, 1, [[0, A.stand()], [0.6, A.reach([0.5, 1.15], null, { gripN: 0 })], [1, A.stand()]]));   // press go (23 .. 24)
    return (t) => A.run(segs, s24(t)); })();
  const elonSit = (t, play) => { const p = A.stand('elon'); p.hip = [0, 0.5]; p.lean = 0.15; p.head = play ? 0.05 : 0.3;
    p.handN = play ? [0.42, 0.95 + 0.02 * Math.sin(t * Math.PI * 6)] : [0.42 + 0.05 * Math.sin(t * Math.PI), 0.92]; p.gripN = 0.6; p.handF = [0.32, 0.92]; p.gripF = 0.5; return p; };
  const EWALK = [A.walk(2.5, BEN, DESK, { who: 'elon', step: 0.6 }), A.walk(2.5, DESK, BEN, { who: 'elon', step: 0.6 })];
  const elon = (t) => { const g = TF.mod(t - diablo.offset, diablo.P), on = g < 24 * diablo.cycles;   // gag: walk over 0-2.5, play, walk back at the end
    if (!on) return { x: BEN, face: 1, pose: elonSit(t, false) };
    if (g < 2.5) return EWALK[0].f(g / 2.5, g); const e = 24 * diablo.cycles;
    if (g >= e - 2.5) return EWALK[1].f((g - e + 2.5) / 2.5, g - e + 2.5);
    return { x: DESK, face: 1, pose: elonSit(t, true) }; };
  TF.room({ id: '9E', period: 48, box: L.roomById('9E').box,
    ports: { O9E: 'in', S89: 'out', D9DE: 'pass', F9R: 'pass' },
    actors: ['9E.controller', '9E.elon', '9E.diabloDesk', 'peek.drone9E'],
    flows: [{ item: 'ship telemetry (fibre)', from: 'TOWER', via: ['O9E'], to: '9E', sink: 'flight consoles' },
      { item: 'go signal (cable)', from: '9E', via: ['S89'], to: '8E', sink: 'bridge door + trolley' }],
    back(ctx, t, theme, lod) {
      const s = s24(t), gag = TF.gagActive(diablo, t);
      X.upper(ctx, yF, ceil, t, lod, { tray: [3290, 3720, 4.5], fans: [3620], lamps: [3400, 3620] });
      D.rect(ctx, CON + 8, hY(1.0), 50, 1.0 * M, '#334155', '#1e293b', 1);                                   // flight console
      for (let i = 0; i < 3; i++) { D.rect(ctx, CON + 6 + i * 18, hY(1.75), 16, 22, '#0f172a', '#475569', 1);
        if (lod !== 'far') D.rect(ctx, CON + 8 + i * 18, hY(1.75) + 4 + i * 3, 12, 2, i === 1 && (s >= 23 || s < 1) ? '#4ade80' : '#38bdf8'); }
      D.rect(ctx, 3440, hY(3.6), 90, 1.3 * M, '#0f172a', '#475569', 1);                                     // wall screen: ship silhouette
      D.rect(ctx, 3482, hY(3.45), 6, 0.95 * M, '#cbd5e1');
      // Elon's bench + sketch pad
      D.rect(ctx, BEN + 10, hY(0.75), 50, 4, '#a16207'); D.rect(ctx, BEN - 14, hY(0.48), 24, 4, '#7c2d12');
      if (lod !== 'far') { D.rect(ctx, BEN + 18, hY(0.75) - 2, 16, 2, '#f8fafc'); if (!gag) D.line(ctx, [[BEN + 20, hY(0.75) - 3], [BEN + 20 + 10 * TF.mod(t / 6, 1), hY(0.75) - 3]], '#334155', 0.6); }
      // DIABLO corner: desk, chair, PC tower + screen (dark unless the gag runs), the sign panel (lit only during the gag)
      D.rect(ctx, DESK + 10, hY(0.75), 50, 4, '#1f2937'); D.rect(ctx, DESK - 14, hY(0.48), 24, 4, '#111827');
      D.rect(ctx, DESK + 46, hY(1.15), 12, 0.4 * M, '#111827', gag ? '#dc2626' : '#374151', 1);
      D.rect(ctx, DESK + 18, hY(1.35), 26, 16, '#0b0f14', '#374151', 1);
      if (gag && lod !== 'far') { ctx.globalAlpha = 0.6 + 0.3 * Math.sin(t * Math.PI * 4); D.rect(ctx, DESK + 20, hY(1.35) + 2, 22, 12, '#b91c1c'); ctx.globalAlpha = 1; }
      D.rect(ctx, DESK - 10, hY(3.3), 80, 22, '#1c1917', '#292524', 1);
      if (gag) { ctx.save(); ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 10; D.sign(ctx, 'DIABLO', DESK + 30, hY(3.3) + 16, 15, '#ef4444', 'center', '800'); ctx.restore(); }
      K.cabinet(ctx, 3300, hY(2.0), 16, 30, t, 99, lod);
    },
    draw() {},
    front(ctx, t, theme, lod) { if (lod === 'far') return; const c = s24(t), f = A.draw(ctx, ctrl(t), yF), w = f.w(f.sk.wristN); if (c >= 17.5 && c < 19.5) IT.seat(ctx, w[0], w[1] + 3); A.draw(ctx, elon(t), yF, 'elon'); } });

  TF.peek({ id: 'shiba9C', owner: '9C', kind: 'shiba', P: 179, offset: 19, dur: 5, x: 2488, y: hY(4.2) - 20, face: 1 });
  TF.peek({ id: 'hardhat9D', owner: '9D', kind: 'hardhat', P: 181, offset: 31, dur: 3.5, x: 3200, y: hY(3.9) - 4 });
  TF.peek({ id: 'drone9E', owner: '9E', kind: 'drone', P: 191, offset: 41, dur: 4, x: 3720, y: hY(3.8), face: -1 });
})(typeof window !== 'undefined' ? window : globalThis);
