// Floor 5 — Model Y bottom half, E -> W, 12 s pitch (FACTORY-MAP §2 floor 5). The finished floor-6 body comes down
// the L65 table into 5E at tau 10.9 and rolls off; 5E glass + headlamps, 5D seats, 5C wheels, 5B battery pack from
// the PB paternoster, 5A computer + screen; the BL cage picks the finished car up at 5A (tau 7.9 / 19.9 of 24).
// Station time s = (t - 10.9) mod 12: every car is at its station for s 1.0 .. 9.5 and moves 9.5 .. 13.
(function (G) {
  const TF = G.TF, TF3 = G.TF3, RG = TF3.rig, R = TF.R, L = TF.layout, D = TF.draw, K = TF.kit, A = TF.act, M = TF.M, X = TF.mx, S = TF.supply;
  const F = 5, yF = L.floorY(F), hY = (m) => yF - m * M, ceil = L.ceilY(F), ln = TF.line6, IT = S.items;
  const ST = { lift: 3620, E: 3360, D: 2900, C: 2440, B: 1960, A: 1475, BL: 1225 };
  const sOf = (t) => TF.mod(t - 10.9, 12);
  const base = Object.assign({}, ln.state(ln.LIFE - 1e-6), { drop: 0 });
  const xAt = (a) => TF.keys(a, KEYS);
  const KEYS = [[0, ST.lift], [0.2, ST.lift], [1.6, ST.E], [9.5, ST.E], [13, ST.D], [21.5, ST.D], [25, ST.C], [33.5, ST.C], [37, ST.B], [45.5, ST.B], [49, ST.A], [57, ST.A], [57.7, ST.BL]];
  const chain = (TF.line5 = TF.chain({ id: 'F5', period: 12, t0: 10.9, life: 57.7, keys: KEYS,
    lift: [[25.2, 0], [26.0, -12], [32.8, -12], [33.5, 0]],
    extra: (a) => ({ glass: a >= 3.5, roofGlass: a >= 6.9, lit: a >= 8.7, seats: a >= 17.0, wheelF: a >= 29.0, wheelR: a >= 30.5, pack: a >= 40.5,
      screen: a >= 56.4 ? 1 : a >= 51.0 ? 0.3 : 0, wheelAng: a > 33.5 ? (xAt(33.5) - xAt(a)) / (0.37 * M) : 0 }) }));
  const rollAng = (t) => { const n = Math.floor((t - 10.9) / 12), s = sOf(t); return Math.PI * 4 * (n + TF.ramp(s, 9.5, 12) + TF.ramp(s, 0.2, 1.0)); };
  // cars (drawn once for the whole floor; the 5A end is clipped at the BL gate, where the cage draws the rest)
  TF.transport({ id: 'F5-cars', owner: '5E', period: 12, layer: 'main', box: { x: L.X0, y: ceil, w: L.X1 - L.X0, h: 320 },
    draw(ctx, t, theme, lod) {
      ctx.save(); ctx.beginPath(); ctx.rect(L.X0, ceil, L.X1 - L.X0, yF - ceil + 2); ctx.clip();
      for (const c of chain.cars(t)) TF.biw.drawBody(ctx, c.x, yF + c.dy, Object.assign({}, base, c), lod);
      // the floor-6 car coming down the L65 shaft (below the 6E slab it is in 5E)
      for (const c of ln.cars(t)) if (c.drop > 16) { ctx.save(); ctx.beginPath(); ctx.rect(3480, L.floorY(6) + L.slab, 280, 300); ctx.clip(); ln.drawBody(ctx, c.x, L.floorY(6) + c.drop, c, lod); ctx.restore(); }
      ctx.restore();
    } });
  const station = (ctx, x0, x1, t, lod, slat) => slat ? X.belt(ctx, x0, x1, yF, 0.08, -TF.mod(t, 12) * 10, lod) : TF.rollers.draw(ctx, x0, x1, yF - 0.33 * M, yF, rollAng(t), lod);

  // ================= 5E glass + headlamps =================
  const SCX = 3405;   // scissor lift + glazier
  const scissorH = (s) => 0.5 * (TF.ramp(s, 3.6, 4.6) - TF.ramp(s, 5.8, 6.8));
  const gz = (() => { const pane = (h, f) => A.reach([f, h], [f - 0.15, h + 0.02], { gripN: 0.9, gripF: 0.9, head: 0.1 });
    const rack = A.reach([0.55, 1.45], [0.4, 1.5], { lean: 0.15, gripN: 0.3, gripF: 0.3 });
    const segs = [A.turn(0.3, SCX, -1), A.keyed(0.6, SCX, 1, [[0, A.stand()], [1, rack]]), A.turn(0.3, SCX, 1, () => pane(1.25, 0.4)),
      A.keyed(1.2, SCX, -1, [[0, pane(1.25, 0.4)], [0.6, pane(1.3, 0.5)], [1, A.stand()]]),                 // 1.2 .. 2.4 side glass
      A.turn(0.3, SCX, -1), A.keyed(0.6, SCX, 1, [[0, A.stand()], [1, rack]]), A.turn(0.3, SCX, 1, () => pane(1.1, 0.35)),
      A.hold(1.0, SCX, -1, () => pane(1.1, 0.35)), A.keyed(1.2, SCX, -1, [[0, pane(1.1, 0.35)], [0.6, pane(1.15, 0.45)], [1, A.stand()]]),   // up on the scissor, roof glass
      A.hold(1.0, SCX, -1, (tl) => Object.assign(A.idle(tl), { head: 0.3 })),                               // ride down
      A.keyed(1.5, SCX, -1, [[0, A.stand()], [0.5, A.reach([0.45, 1.0], null, { lean: 0.2, gripN: 0.5 })], [1, A.reach([0.25, 1.0], null, { lean: 0.15, gripN: 0.5 })]]),   // check the seals
      A.turn(0.3, SCX, -1), A.hold(1.5, SCX, 1, (tl) => A.reach([0.5 + 0.06 * Math.sin(tl * 6), 1.55], null, { gripN: 0.7, head: -0.1 }))];   // wipe the next pane on the rack
    segs.push(A.turn(12 - A.total(segs), SCX, 1));
    return (t) => A.run(segs, sOf(t)); })();
  const lampArm = (s) => { const k = TF.pulse(s, 5.6, 7.8, 0.7); return [TF.lerp(3548, ST.E + 2.25 * M, k), TF.lerp(hY(1.55), hY(0.74), k)]; };
  TF.room({ id: '5E', period: 12, box: L.roomById('5E').box,
    ports: { L65: 'in', D5DE: 'out', F5R: 'both', 'PT-5': 'pass' },
    actors: ['5E.glazier', '5E.lampArm', '5E.scissor'],
    flows: [{ item: 'Model Y (top half done)', from: '6E', via: ['L65'], to: '5E', sink: 'glazed + lights' },
      { item: 'glass panes (basket)', from: '1C', via: ['F1R', 'W3-1', 'W3-5', 'F5R'], to: '5E', sink: 'set in the car' },
      { item: 'headlamp modules (window drone)', from: 'LAWN', via: ['O5E'], to: '5E', sink: 'fitted' },
      { item: 'glazed car', from: '5E', via: ['D5DE'], to: '5D', sink: 'continues' }],
    back(ctx, t, theme, lod) {
      station(ctx, 3280, 3740, t, lod);
      // L65 guides continue from 6E; the table comes down to this floor
      for (const x of [3491, 3743]) D.rect(ctx, x - 3, ceil, 5, yF - ceil, '#9aa3ab');
      const d = TF.debug6E.liftDrop(t), py = L.floorY(6) - 0.33 * M + d + 9;
      ctx.save(); ctx.beginPath(); ctx.rect(3480, L.floorY(6) + L.slab, 280, 300); ctx.clip();
      D.rect(ctx, 3497, py, 246, 8, '#e0a43a', '#9a6b1c', 1); ctx.restore();
      X.upper(ctx, yF, ceil, t, lod, { duct: [3290, 3470, 3.9], fans: [3330], tray: [3290, 3470, 3.3], lamps: [3330, 3420] });
      // glass rack (panes from the shuttle), lamp receiver + inserter arm, light-test screen
      D.rect(ctx, 3430, hY(2.1), 40, 3, '#8a939b'); D.rect(ctx, 3432, hY(2.1), 3, 2.1 * M, '#8a939b'); D.rect(ctx, 3430, hY(1.2), 40, 3, '#8a939b'); D.rect(ctx, 3428, yF - 3, 12, 3, '#8a939b');
      if (lod !== 'far') for (let i = 0; i < 2 + Math.floor(TF.mod(t - 10.9, 24) / 12); i++) IT.pane(ctx, 3445 + i * 8, hY(1.2));
      D.rect(ctx, 3532, hY(1.75), 18, 16, '#dfe4e8', '#7b848c', 1);
      if (lod !== 'far') { const lamps = 4 - Math.floor(TF.mod(t - (R.lamps.arrive(0) + 0.3), 48) / 12); for (let i = 0; i < lamps; i++) IT.lamp(ctx, 3541, hY(1.75) - 2 - i * 5); }
      const s = sOf(t), tip = lampArm(s);
      K.arm(ctx, [3560, yF], tip, { l1: 34, l2: 30, toolAng: Math.PI - 0.3, bend: -1, tool: 8 });
      if (s >= 5.6 && s < 6.9 && lod !== 'far') IT.lamp(ctx, tip[0], tip[1] + 3);
      D.screen(ctx, 3290, hY(2.6), 30, 16, (x, y, w, h) => { const c = chain.inWindow(t, 1.0, 9.5); if (c && c.lit) { D.circle(ctx, x + 8, y + 8, 3, '#fde68a'); D.circle(ctx, x + 22, y + 8, 3, '#f87171'); } });
      K.cabinet(ctx, 3300, yF - 48, 20, 48, t, 21, lod);
    },
    draw() {},
    front(ctx, t, theme, lod) {
      const s = sOf(t), h = scissorH(s), yP = yF - h * M;
      X.liftTable(ctx, SCX, yF, 0.8, h + 0.15, lod, '#9aa3ab');
      if (lod === 'far') return;
      const st = gz(t), fig = A.draw(ctx, st, yP - 7);
      const carrying = (s >= 0.9 && s < 2.4) || (s >= 3.3 && s < 5.8);
      if (carrying) { const w = fig.w(fig.sk.wristN); IT.pane(ctx, w[0], w[1] + 6); }
    } });

  // ================= 5D seats =================
  // seat ownership at the stock shelf (drone stop floor 5, x 2980, REST_H 1.0): drone gripper -> shelf (2 seats at 2975.5 / 2984.5) -> hoist hook, one owner per frame
  const SEAT_Y = hY(1.0) + 1, SEAT_L = 2975.5, SEAT_R = 2984.5, st0 = TF.mod(TF.R.seats.window(0, 0)[0] + 0.6 + 0.5, 24);
  const takes = [13.2, 25.2].map((a) => TF.mod(a - st0, 24)).sort((a, b) => a - b);   // hoist grabs at s 2.3 (tau 10.9 + 2.3, +12)
  const seatsAt = (tt) => { const d = TF.mod(tt - st0, 24); return 2 - (d >= takes[0] ? 1 : 0) - (d >= takes[1] ? 1 : 0); };
  const pickX = (s, t) => seatsAt(t - s + 2.3 - 0.01) >= 2 ? SEAT_R : SEAT_L;
  const HOIST = (s, P) => TF.keys(s, [[1.2, 3010], [1.8, P], [2.4, P], [3.2, ST.D + 8], [5.2, ST.D + 8], [6.0, 3010]]);
  const hook = (s) => TF.keys(s, [[1.2, hY(2.6)], [1.8, hY(1.4)], [2.3, SEAT_Y - 14], [2.4, SEAT_Y - 14], [2.8, hY(2.6)], [3.3, hY(2.6)], [4.3, hY(1.2)], [5.0, hY(1.2)], [5.6, hY(2.6)]]);
  TF.room({ id: '5D', period: 12, box: L.roomById('5D').box,
    ports: { D5DE: 'in', D5CD: 'out', F5R: 'both' },
    actors: ['5D.seatHoist', 'peek.shiba5D'],
    flows: [{ item: 'seats (basket)', from: '9D', via: ['F9R', 'W3-9', 'W3-5', 'F5R'], to: '5D', sink: 'in the car' },
      { item: 'car with seats', from: '5D', via: ['D5CD'], to: '5C', sink: 'continues' }],
    back(ctx, t, theme, lod) {
      station(ctx, 2800, 3270, t, lod);
      X.upper(ctx, yF, ceil, t, lod, { duct: [2810, 2950, 4.0], fans: [2850], pipes: [3050, 3260, 3.4], valves: [3120, 3220], lamps: [2860, 3150] });
      D.rect(ctx, 3088, hY(4.55), 10, hY(4.06) - 7 - hY(4.55), '#e3e7eb', '#9aa3ab', 0.8);
      D.rect(ctx, 3080, hY(4.06) - 7, 26, 9, '#c9d0d6', '#7b848c', 1);                               // vent box (Shiba peek)
      // seat stock rack (refilled from the seats basket), overhead seat hoist on its beam
      const s = sOf(t), hx = HOIST(s, pickX(s, t)), hy = hook(s), nSeat = TF.R.seats.grip(t, 0) ? 0 : seatsAt(t);
      X.rack(ctx, 2960, yF, 0.8, 1.0, 1, 0, null, lod);   // frame only; the seats are drawn below at the drone's rest spot
      if (lod !== 'far') { if (nSeat >= 1) IT.seat(ctx, SEAT_L, SEAT_Y); if (nSeat >= 2) IT.seat(ctx, SEAT_R, SEAT_Y); }
      X.hoist(ctx, hx, hY(2.7), hy, 2860, 3040);
      if (s >= 2.3 && s < 5.0 && lod !== 'far') { if (s >= 4.3) { ctx.save(); ctx.beginPath(); ctx.rect(hx - 40, hY(1.55), 80, 30); ctx.clip(); IT.seat(ctx, hx, hy + 14); ctx.restore(); } else IT.seat(ctx, hx, hy + 14); }
      K.cabinet(ctx, 3220, yF - 48, 22, 48, t, 23, lod);
    },
    draw() {}, front() {} });

  // ================= 5C wheels =================
  const ARMF = [ST.C + 2.45 * M, yF], ARMR = [ST.C - 2.6 * M, yF];
  const wheelArm = (s, base, hub, t0) => { const pick = [base[0] + (base[0] > ST.C ? 18 : -18), hY(0.75)];
    const k1 = TF.ramp(s, t0, t0 + 0.6), k2 = TF.ramp(s, t0 + 0.8, t0 + 1.4), k3 = TF.ramp(s, t0 + 1.5, t0 + 2.0);
    const p = k1 < 1 ? [TF.lerp(base[0], pick[0], k1), TF.lerp(hY(1.0), pick[1], k1)] : k3 > 0 ? [TF.lerp(hub[0], base[0], k3), TF.lerp(hub[1], hY(1.0), k3)] : [TF.lerp(pick[0], hub[0], k2), TF.lerp(pick[1], hub[1], k2)];
    return { p, carry: s >= t0 + 0.6 && s < t0 + 1.4 }; };
  TF.room({ id: '5C', period: 12, box: L.roomById('5C').box,
    ports: { D5CD: 'in', D5BC: 'out', F5R: 'both' },
    actors: ['5C.wheelArmF', '5C.wheelArmR', '5C.liftTable', 'peek.hardhat5C'],
    flows: [{ item: 'wheel totes (basket)', from: '3A', via: ['F3R', 'W3-3', 'W3-5', 'F5R'], to: '5C', sink: 'wheels on hubs; empty tote back to 3A' },
      { item: 'car on wheels', from: '5C', via: ['D5BC'], to: '5B', sink: 'continues' }],
    back(ctx, t, theme, lod) {
      station(ctx, 2320, 2790, t, lod);
      X.upper(ctx, yF, ceil, t, lod, { pipes: [2320, 2500, 3.6], valves: [2400], tray: [2620, 2780, 3.4], duct: [2330, 2480, 4.3], fans: [2380], lamps: [2400, 2700] });
      const s = sOf(t), lt = 0.24 * (TF.ramp(s, 1.2, 2.0) - TF.ramp(s, 8.8, 9.5));
      X.liftTable(ctx, ST.C, yF, 2.2, 0.33 + lt, lod);
      for (const x of [ARMF[0] + 20, ARMR[0] - 20]) { D.rect(ctx, x - 0.37 * M - 2, hY(0.6), 0.74 * M + 4, 0.6 * M, '#2f6fb0', '#1d4570', 1); if (lod !== 'far') IT.wheels(ctx, x, hY(0.6)); }
      K.cabinet(ctx, 2700, yF - 46, 20, 46, t, 25, lod);
    },
    draw() {},
    front(ctx, t, theme, lod) {
      if (lod === 'far') return;
      const s = sOf(t), car = chain.inWindow(t, 24, 36), cx = car ? car.x : ST.C, dy = car ? car.dy : 0;
      for (const [base, ax, t0] of [[ARMF, 1.455, 3.0], [ARMR, -1.435, 4.5]]) {
        const hub = [cx + ax * M, yF + dy - 0.37 * M], r = wheelArm(s, base, hub, t0);
        K.arm(ctx, base, r.p, { l1: 34, l2: 30, toolAng: base[0] > ST.C ? Math.PI : 0, bend: base[0] > ST.C ? 1 : -1, tool: 10 });
        if (r.carry) IT.tireAt(ctx, r.p[0], r.p[1], 0.37 * M);
      }
    } });

  // ================= 5B battery marriage + 5A computer (one Optimus for both, §10) =================
  const pb5 = [TF.PB.trip('5B-a'), TF.PB.trip('5B-b')];
  const packX = (t) => { for (const p of pb5) { const u = TF.mod(t - p.te, 24); if (u < 3.0) return { x: TF.lerp(TF.PB.XU + 30, ST.B, TF.ramp(u, 0.1, 1.0)), up: TF.ramp(u, 1.5, 3.0) }; } return null; };
  const OB = ST.B + 0.9 * M, OA = ST.A + 1.2 * M;
  const ob = (() => {
    const under = (k) => A.reach([0.25 + 0.15 * k, 0.32], [0.1, 0.42], { lean: 0.6, hipY: 0.62, head: 0.5, gripN: 1 });
    const segs = [A.keyed(1.4, OB, -1, [[0, A.stand()], [0.4, under(0)], [1, under(0.4)]]),                      // 0.0 .. 1.4 guide the pack off the PB
      A.hold(2.0, OB, -1, (tl) => Object.assign(under(0.5), { head: 0.3 })),                                     // 1.4 .. 3.4 watch it rise
      A.hold(2.2, OB, -1, (tl) => { const p = under(0.2 + 0.6 * TF.mod(tl, 1.1) / 1.1); p.handN[1] += 0.005 * Math.sin(tl * 40); return p; }),   // 3.4 .. 5.6 bolt
      A.keyed(0.4, OB, -1, [[0, under(0.6)], [1, A.stand()]]),
      A.walk(2.4, OB, OA, { step: 0.62 }),                                                                       // 6.0 .. 8.4 to 5A
      A.keyed(0.6, OA, -1, [[0, A.stand()], [0.5, A.reach([0.55, 1.0], null, { lean: 0.25, gripN: 0.8 })], [1, A.reach([0.45, 1.05], null, { gripN: 0.4 })]]),   // plug the harness
      A.turn(0.3, OA, -1), A.walk(2.4, OA, OB, { step: 0.62 })];
    segs.push(A.turn(12 - A.total(segs), OB, 1));
    return (t) => A.run(segs, TF.mod(sOf(t) - 0.0, 12)); })();
  TF.room({ id: '5B', period: 24, box: L.roomById('5B').box,
    ports: { D5BC: 'in', D5AB: 'out', PB: 'in', F5R: 'pass' },
    actors: ['5B.packOptimus', '5B.liftTable'],
    flows: [{ item: 'car pack (paternoster)', from: '3B', via: ['PB'], to: '5B', sink: 'bolted into the car' },
      { item: 'car with pack', from: '5B', via: ['D5AB'], to: '5A', sink: 'continues' }],
    back(ctx, t, theme, lod) {
      station(ctx, 1840, 2310, t, lod, true);
      X.upper(ctx, yF, ceil, t, lod, { duct: [1960, 2290, 3.8], fans: [2240], tray: [1960, 2290, 3.2], lamps: [2050, 2200] });
      const p = packX(t), lt = p ? p.up : 0;
      X.liftTable(ctx, ST.B, yF, 2.0, 0.08 + 0.2 * lt, lod);
      if (p) D.rect(ctx, p.x - 52, yF - (0.13 + 0.2 * lt) * M, 104, 5, '#2a2e33', '#111', 0.6);
      K.cabinet(ctx, 2240, yF - 48, 22, 48, t, 27, lod);
    },
    draw() {},
    front(ctx, t, theme, lod) { if (lod === 'far') return; A.draw(ctx, ob(t), yF); } });

  TF.room({ id: '5A', period: 24, box: L.roomById('5A').box,
    ports: { D5AB: 'in', 'BL-5': 'out', 'PT-5': 'in', F5R: 'pass', 'W3-5': 'pass', 'SS-5': 'spare' },
    actors: ['5A.screenTest'],
    flows: [{ item: 'computer (capsule)', from: '9B', via: ['PT-5'], to: '5A', sink: 'in the car' },
      { item: 'Model Y (finished)', from: '5A', via: ['BL-5'], to: '1A', sink: 'final test' }],
    back(ctx, t, theme, lod) {
      station(ctx, 1360, 1830, t, lod, true);
      X.upper(ctx, yF, ceil, t, lod, { pipes: [1620, 1820, 3.5], valves: [1700, 1790], duct: [1620, 1820, 4.2], fans: [1760], lamps: [1500, 1700] });
      // computer receiver (PT from 9B) and the slide-in rail to the dash; screen test display
      D.rect(ctx, 1550, hY(1.75), 20, 16, '#dfe4e8', '#7b848c', 1);
      const s = sOf(t);
      if (lod !== 'far' && s >= 1.5 && s < 3.0) { const k = TF.ramp(s, 2.0, 3.0); IT.computer(ctx, TF.lerp(1560, ST.A + 0.9 * M, k), TF.lerp(hY(1.6), hY(1.05), k)); }
      D.line(ctx, [[1560, hY(1.6)], [ST.A + 0.9 * M, hY(1.05)]], '#9aa3ab', 1.5);
      D.screen(ctx, 1640, hY(2.4), 32, 20, (x, y, w, h) => { const c = chain.inWindow(t, 48, 57.7); if (c && c.screen) { D.rect(ctx, x + 3, y + 3, (w - 6) * c.screen, h - 6, '#0ea5e9'); D.tLogo(ctx, x + w / 2, y + h / 2, 8, '#ffffff'); } });
      K.cabinet(ctx, 1600, yF - 48, 20, 48, t, 29, lod);
    },
    draw() {}, front() {} });

  TF.peek({ id: 'shiba5D', owner: '5D', kind: 'shiba', P: 97, offset: 9, dur: 5, x: 3093, y: hY(4.06) - 7, face: 1 });
  TF.peek({ id: 'hardhat5C', owner: '5C', kind: 'hardhat', P: 101, offset: 21, dur: 3.5, x: 2440, y: hY(3.6) - 3 });
})(typeof window !== 'undefined' ? window : globalThis);
