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
      D.rect(ctx, RX - 18, hY(1.3) + 4, 4, yF - (hY(1.3) + 4), '#8a939b');
      D.rect(ctx, RX + 14, hY(1.3) + 4, 4, yF - (hY(1.3) + 4), '#8a939b');
      D.rect(ctx, RX - 22, hY(1.3), 44, 4, '#9aa3ab');
      if (u >= 15.4) IT.chip(ctx, RX, TF.lerp(hY(4.4), hY(1.3), (u - 15.4) / 0.6)); else if (u < 0.6) IT.chip(ctx, RX, hY(1.3));
      if (lod !== 'far') { if (u >= 15.4) { const k = (u - 15.4) / 0.6; IT.box(ctx, TF.lerp(RX, RX + 22, k), TF.lerp(hY(4.4), hY(1.3), k)); } else if (u < 4.1) IT.box(ctx, RX + 22, hY(1.3)); }   // R3-core-f9: the parcel drops out of the capsule with the chip
      D.rect(ctx, FLAT + 38, hY(0.45), 34, 0.45 * M, '#c8a15a', '#7c5a1e', 1);
      // flasher with its progress bar
      D.rect(ctx, FL - 22, hY(1.0), 44, 1.0 * M, '#5f6b77', '#3f4851', 1); D.rect(ctx, FL - 16, hY(1.7), 32, 0.6 * M, '#1f2937');
      if (u >= 2.6 && u < 7.0) { D.rect(ctx, FL - 14, hY(1.45), 28 * TF.lin(u, 3.0, 6.2), 4, '#4ade80'); IT.chip(ctx, FL, hY(1.0)); }
      K.cabinet(ctx, 1380, yF - 46, 18, 46, t, 91, lod);
    },
    draw() {},
    front(ctx, t, theme, lod) { if (lod === 'far') return; const u = s16(t), f = A.draw(ctx, intake(t), yF), w = f.w(f.sk.wristN);
      if (u >= 0.6 && u < 1.0) { const k = 1 - TF.lin(u, 0.6, 1.0); IT.chip(ctx, TF.lerp(w[0], RX, k), TF.lerp(w[1] + 3, hY(1.3), k)); }   // R3-core-f9: lifted off the tray
      else if ((u >= 1.0 && u < 2.6) || (u >= 7.0 && u < 9.5)) IT.chip(ctx, w[0], w[1] + 3);
      if (u >= 4.1 && u < 4.3) { const k = 1 - TF.lin(u, 4.1, 4.3); IT.box(ctx, TF.lerp(w[0], RX + 22, k), TF.lerp(w[1] + 3, hY(1.3), k)); }   // parcel taken off the tray
      else if (u >= 4.3 && u < 5.5) D.rect(ctx, w[0] - 8, w[1], 16, 2, '#c8a15a');
      else if (u >= 5.5 && u < 5.9) { const k = TF.lin(u, 5.5, 5.9); D.rect(ctx, TF.lerp(w[0] - 8, FLAT + 55 - 8, k), TF.lerp(w[1], hY(0.45), k), 16, 2, '#c8a15a'); } } });   // flat parcel dropped into the return basket

  // ================= 9B computer lab (pick-place arm builds + tests; the intake Optimus loads the feeder) =================
  const SEND = [[1960, 5.0], [2020, 9.0], [1990, 15.5], [1960, 17.0], [2020, 21.0]];
  // park until the chip is on the feeder; pick, place on the board, then carry the closed computer to the 1960 sender
  const armX = (u) => TF.keys(u, [[0, 40], [10.5, 40], [11.5, 12], [12.2, 12], [13.0, 40], [13.8, 40], [14.6, 40], [15.2, 88], [16, 88]]);
  const armY = (u) => TF.keys(u, [[0, 36], [10.5, 36], [11.5, 4], [12.2, 4], [13.0, 28], [13.8, 6], [14.4, 6], [14.8, 8], [15.2, 8], [16, 36]]);
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
      if (u >= 9.5 && u < 11.5) IT.chip(ctx, BENCH + 12, ty - 3);
      // board: open + green circuit while building, case closed afterwards; test light red -> amber -> green
      D.rect(ctx, BENCH + 28, ty - 5, 24, 5, done ? '#475569' : '#14532d', '#1e293b', 1);
      if (u >= 13.8 && u < 14.5) { IT.chip(ctx, BENCH + 40, ty - 5); D.line(ctx, [[BENCH + 28, ty - 5], [BENCH + 28 + 24 * TF.lin(u, 13.8, 14.4), ty - 5 - 8 * (1 - TF.lin(u, 13.8, 14.4))]], '#94a3b8', 2); }
      else if (!done) D.line(ctx, [[BENCH + 28, ty - 5], [BENCH + 28, ty - 13]], '#94a3b8', 2);
      if (u >= 14.0 && u < 14.5) IT.computer(ctx, BENCH + 40, TF.lerp(ty - 14, ty - 2, TF.lin(u, 14.0, 14.4)));   // R3-core-f9: the housing lowers over the placed chip -> computer
      // R3-core-f9: staging shelf (the computers wait here; the arm sets each new one on it), chutes down-slope to the three PT senders
      D.rect(ctx, BENCH + 78, ty - 3, 20, 3, '#9aa3ab', '#6d757d', 1); D.rect(ctx, BENCH + 86, ty, 4, yF - ty, '#6d757d');
      IT.computer(ctx, BENCH + 88, ty - 4);
      for (const x of [1960, 1990, 2020]) D.line(ctx, [[BENCH + 88, ty - 5], [x, hY(1.6) + 8]], '#b6bec6', 1.5);
      D.circle(ctx, BENCH + 58, ty - 9, 3, done ? '#4ade80' : (u >= 11 ? '#f59e0b' : '#ef4444'));
      D.rect(ctx, BENCH + 31, hY(1.9) + 16, 4, (hY(0.95)) - (hY(1.9) + 16), '#7b848c');
      D.rect(ctx, BENCH + 25, hY(0.95) - 2, 16, 2, '#7b848c');
      if (lod !== 'far') { D.rect(ctx, BENCH + 20, hY(1.9), 26, 16, '#0f172a', '#475569', 1); D.rect(ctx, BENCH + 22, hY(1.9) + 2, 22 * (0.5 + 0.5 * Math.sin(t * Math.PI)), 3, '#60a5fa'); }
      for (const x of [1960, 1990, 2020]) D.rect(ctx, x - 7, hY(1.6) - 3, 14, 22, '#dfe4e8', '#7b848c', 1);   // PT senders
      for (const [x, tm] of SEND) D.circle(ctx, x, hY(1.6) + 2, 2, TF.pulse(s, tm - 0.6, tm + 0.6, 0.2) > 0.5 ? '#4ade80' : '#475569');
      // burn-in test rack: computers with blinking status
      D.rect(ctx, 2140, hY(2.2), 120, 2.2 * M, '#e8ecef', '#9aa3ab', 1);
      for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { const y = hY(0.4 + r * 0.65), x = 2160 + c * 28; IT.computer(ctx, x, y);
        if (lod !== 'far') D.circle(ctx, x + 8, y - 6, 1.5, TF.mod(Math.floor(t * 2) + r * 3 + c * 5, 8) < 2 ? '#4ade80' : '#14532d'); }
      K.cabinet(ctx, 2080, yF - 46, 18, 46, t, 93, lod);
    },
    draw() {},
    front(ctx, t, theme, lod) { if (lod === 'far') return; const u = s16(t), s = s24(t), ty = hY(0.95), tx = BENCH + armX(u), tyy = ty - armY(u);
      K.arm(ctx, [BENCH + 66, ty], [tx, tyy], { l1: 36, l2: 32, toolAng: Math.PI / 2, bend: 1, tool: 4 });
      if (u >= 11.5 && u < 13.8) IT.chip(ctx, tx, tyy + 4);
      if (u >= 14.5 && u < 15.2) IT.computer(ctx, tx, tyy + 4);   // lands on the staging shelf (drawn in back) at 15.2
      // at each capsule departure, a tested computer slides from the staging slot into that sender
      for (const [x, tm] of SEND) { const k = TF.lin(TF.mod(s - (tm - 0.6) + 24, 24), 0, 0.6); if (k > 0 && k < 1) IT.computer(ctx, TF.lerp(BENCH + 88, x, k), TF.lerp(ty - 4, hY(1.6) + 8, k)); }
      for (const [x, tm] of SEND) { D.rect(ctx, x - 7, hY(1.6) - 3, 14, 22, '#dfe4e8', '#7b848c', 1); D.circle(ctx, x, hY(1.6) + 2, 2, TF.pulse(s, tm - 0.6, tm + 0.6, 0.2) > 0.5 ? '#4ade80' : '#475569'); }   // sender face drawn over the computer: it slides in behind it
    } });

  // ================= 9C solar room (roof panels -> inverters -> battery -> building bus) =================
  TF.room({ id: '9C', period: 48, box: L.roomById('9C').box,
    ports: { H9C: 'in', D9BC: 'out', D9CD: 'out', F9R: 'pass' },
    actors: ['9C.inverters', '9C.battery', '9C.cellTester', 'peek.shiba9C'],
    flows: [{ item: 'solar DC (roof)', from: 'ROOF', via: ['H9C'], to: '9C', sink: 'inverters + battery' },
      { item: 'building power', from: '9C', via: ['D9BC', 'D9CD'], to: '9D', sink: 'floor-9 bus' }],
    back(ctx, t, theme, lod) {
      X.upper(ctx, yF, ceil, t, lod, { pipes: [2330, 2780, 4.5], valves: [2600], duct: [2600, 2770, 3.9], fans: [2700], lamps: [2450, 2650] });
      D.rect(ctx, 2390, ceil, 14, hY(2.4) - ceil, '#f59e0b', '#b45309', 1);                                   // DC riser from the roof hatch
      D.rect(ctx, 2483, hY(4.55), 10, hY(4.2) - 20 - hY(4.55), '#e3e7eb', '#9aa3ab', 0.8);   // collar up to the floor trunk
      D.rect(ctx, 2475, hY(4.2) - 20, 26, 9, '#c9d0d6', '#7b848c', 1);                                       // vent box (Shiba peek)
      D.rect(ctx, 2608, ceil, 2, (hY(3.6)) - ceil, '#9aa3ab');
      D.rect(ctx, 2636, ceil, 2, (hY(3.6)) - ceil, '#9aa3ab');
      D.screen(ctx, 2600, hY(3.6), 44, 26, (x, y, w, h) => { for (let i = 0; i < 5; i++) D.rect(ctx, x + 4 + i * 8, y + h - 3 - (6 + 10 * (0.5 + 0.5 * Math.sin(t * Math.PI / 6 + i * 1.3))), 5, 6 + 10 * (0.5 + 0.5 * Math.sin(t * Math.PI / 6 + i * 1.3)), '#4ade80'); });   // inverter screen (controller checks it)
      for (let i = 0; i < 3; i++) { const x = 2360 + i * 50; D.rect(ctx, x + 4, hY(1.0), 4, yF - (hY(1.0)), '#7b848c'); D.rect(ctx, x + 32, hY(1.0), 4, yF - (hY(1.0)), '#7b848c'); }
      for (let i = 0; i < 3; i++) { const x = 2360 + i * 50; D.rect(ctx, x, hY(2.4), 40, 1.4 * M, '#e8ecef', '#7b848c', 1);
        D.rect(ctx, x + 6, hY(2.2), 28, 10, '#0f172a'); if (lod !== 'far') D.line(ctx, [[x + 8, hY(2.2) + 5], [x + 32, hY(2.2) + 5 + 3 * Math.sin(t * Math.PI * 2 + i)]], '#4ade80', 1); }
      for (let i = 0; i < 4; i++) { const x = 2540 + i * 34, lvl = 0.55 + 0.35 * Math.sin(t * Math.PI / 12 + i * 0.8);
        D.rect(ctx, x, hY(1.6), 26, 1.6 * M, '#d1d5db', '#6b7280', 1); D.rect(ctx, x + 4, yF - 4 - lvl * (1.6 * M - 8), 18, lvl * (1.6 * M - 8), '#22c55e'); }
      // cell tester: small arm lays a cell under the flash lamp (12 s)
      const u = TF.mod(t, 12), lamp = TF.pulse(u, 5, 6.5, 0.1);
      D.rect(ctx, 2704, hY(0.9) + 5, 4, yF - (hY(0.9) + 5), '#7b848c');
      D.rect(ctx, 2762, hY(0.9) + 5, 4, yF - (hY(0.9) + 5), '#7b848c');
      D.rect(ctx, 2752, hY(1.9), 4, (hY(0.9)) - (hY(1.9)), '#7b848c');
      D.rect(ctx, 2737, hY(1.9), 19, 3, '#7b848c');
      D.rect(ctx, 2700, hY(0.9), 70, 5, '#9aa3ab'); D.rect(ctx, 2725, hY(1.9), 24, 8, '#7b848c');
      if (lamp > 0) { ctx.globalAlpha = 0.35 * lamp; D.poly(ctx, [[2727, hY(1.9) + 8], [2747, hY(1.9) + 8], [2756, hY(0.9)], [2718, hY(0.9)]], '#fef9c3'); ctx.globalAlpha = 1; }
      if (u >= 4.8 && u < 6.5) D.rect(ctx, 2728, hY(0.9) - 3, 18, 3, '#1e3a8a');
      for (let i = 0; i < 3; i++) D.rect(ctx, 2690, yF - 4 - i * 5, 18, 3, '#1e3a8a');   // cell stock the arm picks from
      if (u >= 8.6 || u < 1.0) D.rect(ctx, 2668, hY(0.9) - 3, 18, 3, '#1e3a8a');         // just-tested cell in the pass tray
      K.cabinet(ctx, 2340, yF - 46, 18, 46, t, 95, lod);
    },
    draw() {},
    front(ctx, t, theme, lod) {
      if (lod === 'far') return;
      const u = TF.mod(t, 12);
      let tip;
      if (u < 1 || u >= 9) tip = [2696, hY(0.9) - 8];
      else if (u < 2.2) tip = [2696, hY(0.5)];
      else if (u < 4.8) tip = [TF.lerp(2696, 2737, TF.lin(u, 2.2, 4.8)), hY(0.9) - 8];
      else if (u < 6.5) tip = [2737, hY(0.9) - 8];
      else tip = [TF.lerp(2737, 2676, TF.lin(u, 6.5, 8.8)), hY(0.9) - 8];
      K.arm(ctx, [2690, hY(0.9)], tip, { l1: 30, l2: 28, toolAng: Math.PI / 2, bend: 1, tool: 4 });
      if ((u >= 1.5 && u < 4.8) || (u >= 6.5 && u < 8.6)) D.rect(ctx, tip[0] - 9, tip[1] + 2, 18, 3, '#1e3a8a');
    } });

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
      D.rect(ctx, SEW + 4, hY(0.95) + 5, 4, yF - (hY(0.95) + 5), '#6d757d');
      D.rect(ctx, SEW + 52, hY(0.95) + 5, 4, yF - (hY(0.95) + 5), '#6d757d');
      D.rect(ctx, SEW, hY(0.95), 60, 5, '#9aa3ab', '#6d757d', 1); D.rect(ctx, SEW + 20, hY(1.25), 24, 0.3 * M, '#e5e7eb', '#6b7280', 1);   // sewing machine
      if (lod !== 'far') D.line(ctx, [[SEW + 26, hY(1.0)], [SEW + 26, hY(1.0) - 3 + 2 * Math.sin(t * Math.PI * 8)]], '#111', 1);
      D.rect(ctx, FRAME + 4, hY(0.6) + 4, 4, yF - (hY(0.6) + 4), '#4a5560');
      D.rect(ctx, FRAME + 38, hY(0.6) + 4, 4, yF - (hY(0.6) + 4), '#4a5560');
      D.rect(ctx, FRAME, hY(0.6), 46, 4, '#5f6b77');
      if (c >= 17.5 || c < 6) IT.box(ctx, FRAME + 20, hY(0.6));                                                      // foam on the frame
      else { const g = TF.lin(c, 6, 9);
        ctx.save(); ctx.beginPath(); ctx.rect(FRAME + 8, hY(0.6) - 8 * (1 - g), 24, 8 * (1 - g) + 1); ctx.clip(); IT.box(ctx, FRAME + 20, hY(0.6)); ctx.restore();   // R3-core-f9: foam is pressed down as the cover is sewn on ...
        if (g < 1) D.rect(ctx, FRAME + 20 - 12 * (1 - g), hY(0.6) - 8 * (1 - g) - 2, 24 * (1 - g), 2, '#3d3935');
        ctx.save(); ctx.beginPath(); ctx.rect(FRAME - 10, hY(0.6) - 14 * g, 80, 14 * g + 2); ctx.clip(); IT.seat(ctx, FRAME + 20, hY(0.6)); ctx.restore();   // ... and the seat grows out of it
        if (c >= 14.8) D.circle(ctx, FRAME + 30, hY(0.6) - 14, 2.5, '#4ade80'); }                                    // inspected tag
      if (c >= 4.8 && c < 6) { const k = TF.lin(c, 4.8, 5.8); D.rect(ctx, FRAME + 8, TF.lerp(hY(0.6) - 36, hY(0.6) - 10, k), 24, 2, '#3d3935'); }   // R3-core-f9: cover fabric brought down by the sewing arm
      D.rect(ctx, 2862, hY(1.0) + 1, 36, 4, '#9aa3ab'); D.rect(ctx, 2866, hY(1.0) + 5, 4, yF - hY(1.0) - 5, '#8a939b'); D.rect(ctx, 2890, hY(1.0) + 5, 4, yF - hY(1.0) - 5, '#8a939b');   // R3-core-f9: foam shelf; the basket sets its two boxes exactly here
      for (const x of [2875.5, 2884.5]) IT.box(ctx, x, hY(1.0) + 1);                                                       // foam stock
      // seat lift: up with the seat 12.3-13.6, back down 14.0-15.2 (r24)
      const h = 1.0 + 3.0 * (TF.ramp(r, 12.3, 13.6) - TF.ramp(r, 14.0, 15.2));
      X.liftTable(ctx, LIFT, yF, 0.7, h, lod); if (r >= 10.4 && r < 22 && !TF.R.seats.holding(t)) IT.seat(ctx, LIFT, hY(h));   // seat rides the lift until the seats drone's gripper takes it (supply.js held())
      K.cabinet(ctx, 3240, yF - 46, 18, 46, t, 97, lod);   // east of the arm pedestal, clear of the 9D east wall (3260)
    },
    draw() {},
    front(ctx, t, theme, lod) { if (lod === 'far') return; const c = s24(t), k = TF.pulse(c, 1, 5.5, 0.8), u = TF.mod(c, 1.5) / 1.5;   // sewing arm works the covers on the frame
      D.rect(ctx, FRAME + 54, hY(0.6) - 2, 8, yF - (hY(0.6) - 2), '#4a5560', '#2f3740', 0.8); D.rect(ctx, FRAME + 50, yF - 3, 16, 3, '#5f6b77');   // floor-planted pedestal
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
  // 9E drafting board (world px): tilted board on the bench; Starship sketch paths in board coords (s along, r up)
  const BD = (() => { const yb = () => hY(0.75), th = 0.2, c = Math.cos(th), sn = Math.sin(th), W = 28, H = 16;
    const org = () => [BEN + 16, yb() - 1], u = [W * c, -W * sn], v = [-H * sn, -H * c];
    const P = (s, r) => { const o = org(); return [o[0] + u[0] * s + v[0] * r, o[1] + u[1] * s + v[1] * r]; };
    const paths = [[[.38, .12], [.38, .78], [.5, .96], [.62, .78], [.62, .12], [.38, .12]], [[.38, .3], [.24, .1], [.38, .14]], [[.62, .3], [.76, .1], [.62, .14]],
      [[.42, .12], [.42, .05]], [[.5, .12], [.5, .04]], [[.58, .12], [.58, .05]]];
    let tot = 0; const segs = paths.map((pp) => pp.slice(1).map((q, k) => { const a = pp[k], l = Math.hypot((q[0] - a[0]) * W, (q[1] - a[1]) * H); tot += l; return [a, q, l]; }));
    const prog = (t) => sketchProg(tourG(t));   // sketch redraws while he is seated; see sketchProg
    // visit drawn geometry up to fraction f; cb(a,b) per (partial) segment; returns the current stroke point in board coords
    const walk = (f, cb) => { let rem = f * tot, last = [.5, .5]; for (const sg of segs) for (const [a, b, l] of sg) { if (rem <= 0) return last; const k = Math.min(1, rem / l), e = [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]; if (cb) cb(a, e); rem -= l; last = e; } return last; };
    return { P, org, u, v, prog, walk }; })();
  const y9 = yF, y8 = L.floorY(8), y7 = L.floorY(7);
  // spiral slide 9E -> 7E (zig-zag chute, x 3440..3510) and the S89 stair (8E -> 9E); both cut real slab openings
  const SLX = [3440, 3510], SLP = TF.track.path((() => { const p = []; for (let k = 0; k <= 8; k++) p.push([SLX[k % 2 ? 0 : 1], y9 + 75 * k]); return p; })());
  const S89X = [3540, 3638];
  const s89y = (x) => TF.lerp(y8, y9, TF.clamp((x - S89X[0]) / (S89X[1] - S89X[0]), 0, 1));
  const s78y = (x) => TF.lerp(y7, y8, TF.clamp((x - 3598) / 100, 0, 1));
  { const c = L.conById('S89'); if (c) Object.assign(c, { type: 'stair', a: '8E', b: '9E', hole: { x: 3602, y: y9, w: 42, h: L.slab } });
    L.connectors.push({ id: 'SL97', type: 'slide', a: '9E', b: '7E', holes: [y9, y8].map((y) => ({ x: 3488, y, w: 34, h: L.slab })) }); }
  const slidePose = () => { const p = A.stand('elon'); p.hip = [0, 0.42]; p.lean = -0.25; p.head = 0.35; p.handN = [0.35, 0.75]; p.handF = [0.2, 0.8]; p.gripN = 0.5; p.gripF = 0.4; return p; };
  // ================= Elon's 192 s tour =================
  // g = mod(t - offset, P). Beats are {d, f(u, tl) -> {x, y, face, pose, ...}}; A.run cross-fades poses at every joint. Stops have fixed lengths;
  // every walk shares ONE speed solved below so the whole tour sums to exactly P (g = 0 and g = P are the same seated pose). All sway uses
  // integer multiples of 2*pi/P, so the idle motion also wraps seamlessly. Windows (WIN) feed at7C/at7E/at8E/at8D/at9C/atMeal/playing.
  const tourG = (t) => TF.mod(t - diablo.offset, diablo.P);
  const P = diablo.P, FY = (f) => L.floorY(f), HY7 = L.hY(7, 1.0);
    const X7C = 2412, X9C = [2690, 2656, 2622], X7E = 3540, X8E = 3680, X8D = 3006, XF = 3080, SITH = 12.0, SITD = 0.6;
  let GG = 0;
  const wv = (n) => 2 * Math.PI * n * GG / P;
  const live = (p, a = 1) => {   // always-moving layer: weight shift, breathing, head drift, hand micro-motion
    if (p.hip) p.hip = [p.hip[0] + 0.012 * a * Math.sin(wv(58)), p.hip[1] + 0.005 * a * Math.sin(wv(95))];
    p.lean = (p.lean || 0) + 0.02 * a * Math.sin(wv(40) + 1); p.head = (p.head || 0) + 0.05 * a * Math.sin(wv(52));
    if (p.handN) p.handN = [p.handN[0] + 0.012 * a * Math.sin(wv(71)), p.handN[1] + 0.012 * a * Math.cos(wv(89))];
    if (p.handF) p.handF = [p.handF[0] + 0.012 * a * Math.sin(wv(77) + 2), p.handF[1] + 0.012 * a * Math.cos(wv(83))];
    return p; };
  // the bench sketch redraws while he sits (reset when he sits down, complete when he stands); g = P and g = 0 give the same value
  const T0 = P - SITD, sketchProg = (g) => (g >= T0 ? (g - T0) / (SITD + SITH) : g < SITH ? (g + SITD) / (SITD + SITH) : 1);
  const elonSit = (play) => { const p = A.stand('elon'); p.hip = [0, 0.5]; p.lean = 0.15; p.head = play ? 0.05 : 0.3;
    p.handN = play ? [0.42, 0.95 + 0.02 * Math.sin(GG * Math.PI * 6)] : (() => { const q = BD.P(...BD.walk(sketchProg(GG))); return [(q[0] - BEN) / M, (yF - q[1]) / M + 0.02 + 0.01 * Math.sin(wv(276))]; })();
    p.gripN = 0.6; p.handF = [0.32, 0.92]; p.gripF = 0.5; return live(p, play ? 0.5 : 0.6); };
  // 9E meal: seated, fork plate -> mouth every 2.2 s, head dips to the plate and chews, far hand steadies the table
  const eatPose = () => { const e = TF.smooth(0.5 - 0.5 * Math.cos(2 * Math.PI * GG / 2.2)), p = A.stand('elon');
    p.hip = [0, 0.5]; p.lean = 0.12 + 0.05 * (1 - e); p.head = 0.32 - 0.22 * e + 0.03 * e * Math.sin(GG * 11);
    p.handN = [TF.lerp(0.46, 0.22, e), TF.lerp(0.92, 1.2, e)]; p.gripN = 0.7; p.handF = [0.36, 0.9 + 0.02 * Math.sin(GG * 3)]; p.gripF = 0.4; return live(p, 0.5); };
  const stand0 = () => live(A.stand('elon'), 0.4);
  // keyframed work pose: keys [[u, {hn, hf, gn, gf, head, lean}]] eased; live() keeps everything moving between keys
  const KD = { hn: [0.08, 0.82], hf: [0.06, 0.82], gn: 0.5, gf: 0.5, head: 0.1, lean: 0.1 }, key = (u, o) => [u, Object.assign({}, KD, o)];
  const kf = (keys, amp = 0.8, add) => (u) => {
    let k = 1; while (k < keys.length - 1 && u > keys[k][0]) k++;
    const [u0, a] = keys[k - 1], [u1, b] = keys[k], e = RG.easeInOut((u - u0) / (u1 - u0)), l = (x, y) => x + (y - x) * e, v = (x, y) => [l(x[0], y[0]), l(x[1], y[1])];
    const p = A.stand('elon'); p.handN = v(a.hn, b.hn); p.handF = v(a.hf, b.hf); p.gripN = l(a.gn, b.gn); p.gripF = l(a.gf, b.gf); p.head = l(a.head, b.head); p.lean = l(a.lean, b.lean);
    if (add) add(p, u); return live(p, amp); };
  const stop = (d, x, y, face, pf, extra) => ({ d, f: (u, tl) => Object.assign({ x, y, face, pose: pf(u, tl) }, extra ? extra(u, tl) : null) });
  const sitTo = (d, x, y, face, from, to) => ({ d, f: (u) => ({ x, y, face, pose: RG.blend(from(), to(), RG.easeInOut(u)) }) });
  const turn = (d, x, from, y0, y1 = y0) => { const s = A.turn(d, x, from, () => stand0()); return { d, f: (u, tl) => Object.assign(s.f(u, tl), { y: TF.lerp(y0, y1, u) }) }; };

  const beats = [], WIN = {};
  const fixed = (tags, b) => { beats.push(Object.assign({ kind: 'fixed', tags: [].concat(tags) }, b)); };
  const walk = (tags, x0, x1, yf, o = {}) => { const y = typeof yf === 'function' ? yf : () => yf; beats.push(Object.assign({ kind: 'walk', tags: [].concat(tags), x0, x1, y, step: Math.abs(x1 - x0) > 300 ? 1.0 : 0.65, len: Math.abs(x1 - x0) }, o)); };
  const y7f = FY(7), TURN = 0.25, STT = 0.15;
  const S78L = 58 + Math.hypot(100, 300), S89L = (S89X[0] - XF) + Math.hypot(S89X[1] - S89X[0], y8 - y9);

  // ---- 9E bench -> slide (g 0 .. ~19) ----
  fixed('sit', { d: SITH, f: stop(SITH, BEN, y9, 1, () => elonSit(false)).f });                                    // C1 board + pencil
  fixed('', { d: SITD, f: sitTo(SITD, BEN, y9, 1, () => elonSit(false), stand0).f });
  fixed('', { d: TURN, f: turn(TURN, BEN, 1, y9).f });
  walk('', BEN, SLX[1], y9);
  fixed('', { d: TURN, f: turn(TURN, SLX[1], -1, y9).f });
  fixed('', { d: 6.0, f: (u, tl) => { const p = SLP.at(SLP.total * TF.smooth(u)), off = -4 * TF.smooth(TF.lin(tl, 0, 0.4)) * (1 - TF.smooth(TF.lin(tl, 5.6, 6))); return { x: p[0], y: p[1] + off, face: 1, pose: live(slidePose(), 0.5), slide: true }; } });
  fixed('', { d: TURN, f: turn(TURN, SLX[1], 1, y7f).f });
  // ---- 7C: inspect one blue tote on the tote-bench table, put it back in the SAME slot (left tote, x 2445) ----
  walk('', SLX[1], X7C, y7f);
  fixed('', { d: 0.3, f: turn(0.3, X7C, -1, y7f).f });
  const c7 = kf([key(0, { hn: [0.25, 0.95], hf: [0.2, 0.95], head: 0.2 }), key(0.14, { hn: [0.48, 1.12], hf: [0.42, 1.14], gn: 0.4, gf: 0.4, head: 0.35, lean: 0.25 }),
    key(0.32, { hn: [0.42, 1.5], hf: [0.5, 1.45], gn: 0.9, gf: 0.9, head: 0.1 }), key(0.52, { hn: [0.32, 1.42], hf: [0.44, 1.32], gn: 0.9, gf: 0.9, head: 0.45, lean: 0.22 }),
    key(0.64, { hn: [0.34, 1.42], hf: [0.5, 1.56], gn: 0.9, gf: 0.5, head: 0.4 }), key(0.74, { hn: [0.4, 1.5], hf: [0.5, 1.46], gn: 0.9, gf: 0.9, head: -0.05 }),
    key(0.88, { hn: [0.48, 1.12], hf: [0.42, 1.14], gn: 0.9, gf: 0.9, head: 0.3, lean: 0.25 }), key(1, { hn: [0.3, 0.95], hf: [0.2, 0.95], gn: 0.2, gf: 0.2 })], 0.7);
  fixed('7C', { d: 9.0, f: stop(9.0, X7C, y7f, 1, c7, (u) => ({ held: u >= 0.14 && u <= 0.88 ? Math.min(TF.smooth(TF.lin(u, 0.14, 0.32)), 1 - TF.smooth(TF.lin(u, 0.8, 0.88))) : -1 })).f });
  fixed('', { d: 0.3, f: turn(0.3, X7C, 1, y7f).f });
  // ---- 7E tube console ----
  walk('', X7C, X7E, y7f);
  fixed('7E', { d: 8.0, f: stop(8.0, X7E, y7f, 1, kf([key(0, { hn: [0.3, 1.1], hf: [0.2, 1.0] }), key(0.15, { hn: [0.5, 1.4], head: -0.15 }), key(0.45, { hn: [0.62, 1.4], head: 0.2 }),
    key(0.6, { hn: [0.5, 1.4], hf: [0.52, 1.12], gf: 0.9 }), key(0.78, { hn: [0.5, 1.38], hf: [0.55, 0.85], gf: 0.9, head: 0.15 }), key(1, { hn: [0.45, 1.35], hf: [0.55, 0.9], gf: 0.9 })], 0.8,
    (p, u) => { const a = 1 - TF.lin(u, 0.45, 0.6); p.handN = [p.handN[0] + 0.04 * a * Math.sin(GG * 16), p.handN[1] + 0.025 * a * Math.abs(Math.sin(GG * 8))]; })).f });   // button taps, then the lever pull
  // ---- up S78 (floor-7 start moved to the 7E stop), sky-bridge pedestal ----
  walk('', X7E, 3698, s78y, { len: S78L, step: 0.5 });
  fixed('', { d: TURN, f: turn(TURN, 3698, 1, y8).f });
  walk('', 3698, X8E, y8);
  fixed('', { d: TURN, f: turn(TURN, X8E, -1, y8).f });
  fixed('8E', { d: 8.0, f: stop(8.0, X8E, y8, 1, kf([key(0, { hn: [0.25, 1.0], hf: [0.1, 0.9] }), key(0.2, { hn: [0.46, 1.38], head: -0.1, gn: 0.9 }), key(0.45, { hn: [0.5, 1.05], head: -0.25, gn: 0.9 }),
    key(0.62, { hn: [0.5, 1.05], head: 0.25, gn: 0.9 }), key(0.8, { hn: [0.46, 1.38], head: -0.1, gn: 0.9 }), key(1, { hn: [0.3, 1.1], head: 0.1 })], 0.8)).f });   // lever pull + head turns, never frozen
  fixed('', { d: TURN, f: turn(TURN, X8E, 1, y8).f });
  // ---- 8D Raptor pedestal ----
  walk('', X8E, X8D, y8);
  // 8D stop (8.0 s, all tagged '8D'): lever (pedestal gauge) 2.2 s, turn, walk to the downed tech 2.0 s, reseat its chest cable 3.55 s; the exit walk starts from XF (no snap back to 3006)
  fixed('8D', { d: 2.2, f: stop(2.2, X8D, y8, -1, kf([key(0, { hn: [0.25, 1.0] }), key(0.15, { hn: [0.42, 1.2], head: 0.1, gn: 0.9 }), key(0.35, { hn: [0.45, 1.28], head: 0.15, gn: 0.9 }),
    key(0.55, { hn: [0.4, 1.12], head: -0.1, gn: 0.9 }), key(0.75, { hn: [0.45, 1.25], head: 0.1, gn: 0.9 }), key(1, { hn: [0.25, 1.0], head: 0.3 })], 0.8,
    (p, u) => { const a = TF.smooth(TF.lin(u, 0.1, 0.25)) * (1 - TF.smooth(TF.lin(u, 0.8, 0.95))); p.handN = [p.handN[0], p.handN[1] + 0.04 * a * Math.sin(GG * 11)]; })).f });
  fixed('8D', { d: TURN, f: turn(TURN, X8D, -1, y8).f });
  { const w8 = A.walk(2.0, X8D, XF, { who: 'elon', step: 0.65 }); fixed('8D', { d: 2.0, f: (u, tl) => Object.assign(w8.f(u, tl), { y: y8 }) }); }
  fixed('8D', { d: 3.55, f: stop(3.55, XF, y8, 1, kf([key(0, { hn: [0.25, 1.0] }), key(0.2, { hn: [0.44, 1.1], hf: [0.4, 0.95], gn: 0.9, gf: 0.9, head: 0.35, lean: 0.25 }), key(0.45, { hn: [0.46, 1.05], hf: [0.38, 0.9], gn: 0.9, gf: 0.9, head: 0.4, lean: 0.28 }),
    key(0.6, { hn: [0.44, 1.12], hf: [0.4, 0.97], gn: 0.9, gf: 0.9, head: 0.3, lean: 0.25 }), key(0.8, { hn: [0.35, 1.1], hf: [0.3, 0.95], head: -0.05, lean: 0.1 }), key(1, { hn: [0.25, 1.0], head: -0.1 })], 0.8,
    (p, u) => { const a = TF.smooth(TF.lin(u, 0.25, 0.4)) * (1 - TF.smooth(TF.lin(u, 0.55, 0.65))); p.handF = [p.handF[0] + 0.03 * a * Math.sin(GG * 13), p.handF[1] + 0.02 * a * Math.cos(GG * 17)]; })).f });
  // ---- S89 up to 9E, 9C battery check, Diablo, home ----
  walk('', XF, S89X[1], s89y, { len: S89L, step: 0.65 });
  fixed('', { d: TURN, f: turn(TURN, S89X[1], 1, y9).f });
  walk('', S89X[1], X9C[0], y9);
  const tapP = kf([key(0, { hn: [0.3, 1.0], hf: [0.33, 0.98] }), key(0.4, { hn: [0.55, 1.15], hf: [0.33, 0.98], head: 0.2 }), key(0.55, { hn: [0.56, 1.15], hf: [0.33, 0.98], head: 0.2 }), key(1, { hn: [0.35, 1.05], hf: [0.33, 0.98] })], 0.7);
  const tab = () => ({ tab: true });
  for (let i = 0; i < 3; i++) { fixed('9C', { d: 1.2, f: stop(1.2, X9C[i], y9, -1, tapP, tab).f }); if (i < 2) walk('9C', X9C[i], X9C[i + 1], y9, { extra: { tab: true } }); }
  fixed('9C', { d: 0.4, f: stop(0.4, X9C[2], y9, -1, kf([key(0, { hn: [0.35, 1.05], hf: [0.33, 0.98] }), key(1, { hn: [0.1, 0.8], hf: [0.12, 0.78] })], 0.5), (u) => (u < 0.75 ? { tab: true } : null)).f });
  fixed('', { d: TURN, f: turn(TURN, X9C[2], -1, y9).f });
  // ---- lunch at the 9E bench table (plate on the east end), then Diablo ----
  walk('', X9C[2], BEN, y9);
  fixed(['meal'], { d: 0.9, f: sitTo(0.9, BEN, y9, 1, stand0, eatPose).f });
  fixed(['meal', 'eat'], { d: 10.0, f: stop(10.0, BEN, y9, 1, eatPose).f });
  fixed(['meal'], { d: 0.9, f: sitTo(0.9, BEN, y9, 1, eatPose, stand0).f });
  fixed('', { d: TURN, f: turn(TURN, BEN, 1, y9).f });
  walk('', BEN, DESK, y9);
  fixed('', { d: 0.4, f: sitTo(0.4, DESK, y9, 1, stand0, () => elonSit(true)).f });
  fixed('play', { d: 8.0, f: stop(8.0, DESK, y9, 1, () => elonSit(true)).f });
  fixed('', { d: 0.4, f: sitTo(0.4, DESK, y9, 1, () => elonSit(true), stand0).f });
  fixed('', { d: TURN, f: turn(TURN, DESK, 1, y9).f });
  walk('', DESK, BEN, y9);
  fixed('', { d: TURN, f: turn(TURN, BEN, -1, y9).f });
  fixed('', { d: SITD, f: sitTo(SITD, BEN, y9, 1, stand0, () => elonSit(false)).f });
  // solve the common walking speed V (px/s): short walks are clamped to a minimum step time, the rest share what is left
  for (const b of beats) if (b.kind === 'walk') { const n = Math.max(2, Math.ceil(Math.abs(b.x1 - b.x0) / M / b.step) + 1); b.dmin = 0.36 * (n + 0.05); }
  let V = 100;
  for (let i = 0; i < 16; i++) { let fx = 0, free = 0; for (const b of beats) { if (b.kind === 'fixed') fx += b.d; else if (b.len / V < b.dmin) fx += b.dmin; else free += b.len; } V = Math.max(30, free / (P - fx)); }
  let tot = 0, freeLen = 0; for (const b of beats) { b.d = b.kind === 'fixed' ? b.d : Math.max(b.len / V, b.dmin); tot += b.d; if (b.kind === 'walk' && b.len / V > b.dmin) freeLen += b.len; }
  for (const b of beats) if (b.kind === 'walk' && b.len / V > b.dmin) b.d += (P - tot) * b.len / freeLen;   // absorb rounding so the sum is exactly P
  const segs = []; let tc = 0;
  for (const b of beats) {
    if (b.kind === 'walk') { const w = A.walk(b.d, b.x0, b.x1, { who: 'elon', step: b.step }); segs.push({ d: b.d, f: (u, tl) => { const st = w.f(u, tl); st.y = b.y(st.x); if (b.extra) Object.assign(st, b.extra); return st; } }); }
    else segs.push({ d: b.d, f: b.f });
    for (const g of b.tags) if (g) { const w = WIN[g] || (WIN[g] = [tc, tc]); w[0] = Math.min(w[0], tc); w[1] = Math.max(w[1], tc + b.d); }
    tc += b.d; }
  const inW = (t, k) => { const g = tourG(t), w = WIN[k]; return g >= w[0] && g < w[1]; };
  const playing = (t) => inW(t, 'play');
  const elon = (t) => { GG = tourG(t); const st = A.run(segs, GG); st.id = 'elon'; return st; };
  // at7E / at8E / at8D keep driving the floor-7 lamps + lever, the 8E beacon pedestal and the 8D Raptor gauge; at7C / atMeal / at9C are for the rooms to react to him
  TF.elonTour = { g: tourG, playing, win: WIN, at7C: (t) => inW(t, '7C'), at7E: (t) => inW(t, '7E'), at8E: (t) => inW(t, '8E'), at8D: (t) => inW(t, '8D'), at9C: (t) => inW(t, '9C'), atMeal: (t) => inW(t, 'meal'), at1E: (t) => inW(t, 'meal'),
    holding7C: (t) => elon(t).held >= 0, meal1E: (t) => 1 - TF.lin(tourG(t), WIN.eat[0], WIN.eat[1]), mealK: (t) => 1 - TF.lin(tourG(t), WIN.eat[0], WIN.eat[1]) };   // meal1E / mealK: plate left 1 -> 0
  TF.room({ id: '9E', period: 48, box: L.roomById('9E').box,
    ports: { O9E: 'in', S89: 'out', SL97: 'pass', D9DE: 'pass', F9R: 'pass' },
    actors: ['9E.controller', '9E.elon', '9E.diabloDesk', 'peek.drone9E'],
    flows: [{ item: 'ship telemetry (fibre)', from: 'TOWER', via: ['O9E'], to: '9E', sink: 'flight consoles' },
      { item: 'go signal (cable)', from: '9E', via: ['S89'], to: '8E', sink: 'bridge door + trolley' }],
    back(ctx, t, theme, lod) {
      const s = s24(t), play = playing(t);
      X.upper(ctx, yF, ceil, t, lod, { tray: [3290, 3720, 4.5], fans: [3620], lamps: [3400, 3620] });
      D.rect(ctx, CON + 8, hY(1.0), 50, 1.0 * M, '#334155', '#1e293b', 1);                                   // flight console
      for (let i = 0; i < 3; i++) D.rect(ctx, CON + 12 + i * 18, hY(1.75) + 22, 4, (hY(1.0)) - (hY(1.75) + 22), '#475569');
      for (let i = 0; i < 3; i++) { D.rect(ctx, CON + 6 + i * 18, hY(1.75), 16, 22, '#0f172a', '#475569', 1);
        if (lod !== 'far') D.rect(ctx, CON + 8 + i * 18, hY(1.75) + 4 + i * 3, 12, 2, i === 1 && (s >= 23 || s < 1) ? '#4ade80' : '#38bdf8'); }
      D.rect(ctx, 3452, ceil, 2, (hY(3.6)) - ceil, '#64748b');
      D.rect(ctx, 3518, ceil, 2, (hY(3.6)) - ceil, '#64748b');
      D.rect(ctx, 3440, hY(3.6), 90, 1.3 * M, '#0f172a', '#475569', 1);                                     // wall screen: ship silhouette
      D.rect(ctx, 3482, hY(3.45), 6, 0.95 * M, '#cbd5e1');
      // Elon's bench + sketch pad
      D.rect(ctx, BEN + 10, hY(0.75), 50, 4, '#a16207'); D.rect(ctx, BEN - 14, hY(0.48), 24, 4, '#7c2d12');
      D.rect(ctx, BEN + 12, hY(0.75) + 4, 4, yF - hY(0.75) - 4, '#78350f'); D.rect(ctx, BEN + 54, hY(0.75) + 4, 4, yF - hY(0.75) - 4, '#78350f');
      D.rect(ctx, BEN - 12, hY(0.48) + 4, 3, yF - hY(0.48) - 4, '#5b210d'); D.rect(ctx, BEN + 5, hY(0.48) + 4, 3, yF - hY(0.48) - 4, '#5b210d');
      D.rect(ctx, BEN - 14, hY(0.48) - 30, 4, 34, '#7c2d12');
      { const A0 = BD.P(0, 0), B0 = BD.P(1, 0), C0 = BD.P(1, 1), D0 = BD.P(0, 1), m = BD.P(0.5, 0);   // tilted drafting board: prop + slab + sketch
        D.line(ctx, [[m[0] + 1, m[1]], [m[0] + 5, hY(0.75)]], '#64748b', 1.2);
        ctx.beginPath(); ctx.moveTo(A0[0], A0[1]); ctx.lineTo(B0[0], B0[1]); ctx.lineTo(C0[0], C0[1]); ctx.lineTo(D0[0], D0[1]); ctx.closePath();
        ctx.fillStyle = '#f8fafc'; ctx.fill(); ctx.lineWidth = 1.4; ctx.strokeStyle = '#64748b'; ctx.stroke();
        D.line(ctx, [A0, B0], '#475569', 2);
        if (lod !== 'far') { D.line(ctx, [BD.P(0.04, 0.96), BD.P(0.96, 0.96), BD.P(0.96, 0.04)], '#e2e8f0', 1);
          BD.walk(BD.prog(t), (p, q) => D.line(ctx, [BD.P(p[0], p[1]), BD.P(q[0], q[1])], '#334155', 0.9)); } }
      // DIABLO corner: desk, chair, PC tower + screen (dark unless the gag runs), the sign panel (lit only during the gag)
      D.rect(ctx, DESK + 10, hY(0.75), 50, 4, '#1f2937'); D.rect(ctx, DESK - 14, hY(0.48), 24, 4, '#111827');
      D.rect(ctx, DESK + 12, hY(0.75) + 4, 4, yF - hY(0.75) - 4, '#111827'); D.rect(ctx, DESK + 54, hY(0.75) + 4, 4, yF - hY(0.75) - 4, '#111827');
      D.rect(ctx, DESK - 4, hY(0.48) + 4, 4, yF - hY(0.48) - 4, '#0b0f14'); D.rect(ctx, DESK - 12, yF - 3, 20, 3, '#0b0f14');   // chair pedestal + base
      D.rect(ctx, DESK - 14, hY(0.48) - 34, 5, 38, '#1f2937', '#dc2626', 0.6);                                                      // gaming-chair backrest
      D.rect(ctx, DESK + 29, hY(1.35) + 16, 4, hY(0.75) - hY(1.35) - 16, '#374151');                                                // monitor neck
      D.rect(ctx, DESK + 22, hY(0.75) - 2, 18, 2, '#374151');                                                                       // stand foot
      D.rect(ctx, DESK + 16, hY(0.75) - 2, 18, 2, '#475569'); D.rect(ctx, DESK + 36, hY(0.75) - 3, 5, 3, '#64748b');               // keyboard + mouse
      D.rect(ctx, DESK + 46, hY(1.15), 12, 0.4 * M, '#111827', play ? '#dc2626' : '#374151', 1); D.rect(ctx, DESK + 49, hY(1.15) + 4, 3, 3, play ? '#22c55e' : '#14532d');
      D.rect(ctx, DESK + 18, hY(1.35), 26, 16, '#0b0f14', '#374151', 1);
      if (play) { const cx = DESK + 31, cy = hY(1.35) + 8, pu = 0.85 + 0.15 * Math.sin(t * Math.PI * 4);   // original demon-face icon, only while playing
        D.rect(ctx, DESK + 20, hY(1.35) + 2, 22, 12, '#2a0a0a');
        if (lod !== 'far') { ctx.save(); ctx.globalAlpha = pu; ctx.fillStyle = '#ef4444';
          ctx.beginPath(); ctx.ellipse(cx, cy + 1, 5, 5.5, 0, 0, 7); ctx.fill();
          for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(cx + d * 3, cy - 3); ctx.lineTo(cx + d * 7.5, cy - 7); ctx.lineTo(cx + d * 1.5, cy - 4.5); ctx.fill(); }
          ctx.fillStyle = '#fde047'; for (const d of [-1, 1]) { ctx.beginPath(); ctx.arc(cx + d * 2, cy, 0.9, 0, 7); ctx.fill(); }
          ctx.strokeStyle = '#450a0a'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(cx - 2, cy + 3.5); ctx.lineTo(cx, cy + 4.3); ctx.lineTo(cx + 2, cy + 3.5); ctx.stroke(); ctx.restore(); }
        else D.rect(ctx, cx - 4, cy - 3, 8, 8, '#ef4444'); }
      else if (lod !== 'far') D.rect(ctx, DESK + 20, hY(1.35) + 2, 22, 12, '#0f1722');
      if (lod !== 'far' && TF.elonTour && TF.elonTour.atMeal(t)) TF.slot(theme, 'elonMeal')(ctx, BEN + 44, hY(0.75), TF.elonTour.mealK(t));   // Elon's lunch plate on the bench table (bites vanish while he eats)
      K.cabinet(ctx, 3300, yF - 46, 16, 46, t, 99, lod);
    },
    draw() {},
    front(ctx, t, theme, lod) { if (lod === 'far') return; const c = s24(t), f = A.draw(ctx, ctrl(t), yF), w = f.w(f.sk.wristN); if (c >= 17.5 && c < 19.5) IT.seat(ctx, w[0], w[1] + 3); } });

  TF.transport({ id: 'Elon-stairs', owner: '9E', period: 48, layer: 'back',
    box: { x: 3400, y: y9 - 60, w: 260, h: y7 - y9 + 80 },
    draw(ctx, t, theme, lod) {
      // spiral slide: trough + rail + posts, mouth at the 9E floor, runs through both slab openings to the 7E floor
      const P = SLP.pts;
      D.line(ctx, P.map((p) => [p[0], p[1] + 5]), '#64748b', 9);
      D.line(ctx, P, '#e9d9a8', 7);
      if (lod !== 'far') {
        D.line(ctx, P.map((p) => [p[0], p[1] - 34]), '#9aa3ab', 1.5);
        P.forEach((p, i) => { if (i % 2 === 0 || i === P.length - 1) D.line(ctx, [[p[0], p[1] - 34], [p[0], p[1] - 4]], '#9aa3ab', 1.5); });
        D.rect(ctx, SLX[1] - 4, y9 - 3, 14, 3, '#9aa3ab');
      }
      // stair S89 (8E -> 9E) through its slab opening, with a handrail
      for (let i = 0; i <= 10; i++) { const k = i / 10; D.rect(ctx, TF.lerp(S89X[0] - 8, S89X[1] - 8, k), TF.lerp(y8, y9, k) - 2, 16, 3, '#9aa3ab'); }
      D.line(ctx, [[S89X[0] - 8, y8], [S89X[1] + 6, y9]], '#7b848c', 2);
      if (lod !== 'far') D.line(ctx, [[S89X[0] - 8, y8 - 38], [S89X[1] + 6, y9 - 38]], '#9aa3ab', 1.5); } });

  TF.transport({ id: 'Elon-tour', owner: '9E', period: 48, layer: 'front',
    box: { x: 2340, y: L.ceilY(9) - 20, w: 1440, h: L.floorY(7) - L.ceilY(9) + 50 },
    draw(ctx, t, theme, lod) { if (lod === 'far') return; const st = elon(t), f = A.draw(ctx, st, st.y, 'elon');
      if (st.held >= 0) { const w = f.w(f.sk.wristN), k = st.held; IT.tote(ctx, TF.lerp(2445, w[0] + 9 * st.face, k), TF.lerp(HY7, w[1] + 6, k)); }   // 7C tote: leaves / returns to the left table slot (2445)
      if (st.tab) { const w = f.w(f.sk.wristF); D.rect(ctx, w[0] - 4, w[1] - 7, 8, 11, '#0f172a', '#38bdf8', 0.8); D.rect(ctx, w[0] - 2.5, w[1] - 5.5, 5, 6, '#22c55e'); } } });   // 9C battery-check tablet

  TF.peek({ id: 'shiba9C', owner: '9C', kind: 'shiba', P: 179, offset: 19, dur: 5, x: 2488, y: hY(4.2) - 20, face: 1 });
  TF.peek({ id: 'hardhat9D', owner: '9D', kind: 'hardhat', P: 181, offset: 31, dur: 3.5, x: 3200, y: hY(3.9) - 4 });
  TF.peek({ id: 'drone9E', owner: '9E', kind: 'drone', P: 191, offset: 41, dur: 4, x: 3720, y: hY(3.8), face: -1 });
})(typeof window !== 'undefined' ? window : globalThis);
