// Floor 2 — Cybertruck E -> W (24 s pitch) + Tesla Semi on the L21 table (FACTORY-MAP §2 floor 2).
// 2E stamps the floor sled + 4 stainless panels from the coil (AGV dolly brings it from the 2A gate), 2D: two robots
// set the panels on the sled and weld the exoskeleton, 2C: ONE Optimus sets the glass, throws the steel ball (crack),
// swaps the pane and bins the scrap, 2B: pack from the PB paternoster + wheels, 2A: the L21 table takes the CT down to
// 1A, comes back and carries the Semi that ONE Optimus builds on it (kit from the BL cage, pack by roller from 2B).
// Station time s = t mod 24. L21 table: CT down 2.9-3.9, up 6.6-7.6, Semi built 7.6-20.1, down 20.1-21.1, up 22-23.
(function (G) {
  const TF = G.TF, TF3 = G.TF3, RG = TF3.rig, L = TF.layout, D = TF.draw, K = TF.kit, A = TF.act, M = TF.M, X = TF.mx, S = TF.supply, IT = S.items, V = TF.bodies, R = TF.R;
  const F = 2, yF = L.floorY(F), hY = (m) => yF - m * M, ceil = L.ceilY(F), yF1 = L.floorY(1);
  const s24 = (t) => TF.mod(t, 24);
  const ST = { E: 3500, D: 3030, C: 2550, B: 2070, T: 1610 };
  const TBL = [1430, 1790];
  const tableD = (t) => { const s = s24(t); return TF.keys(s, [[2.9, 0], [3.9, 300], [6.6, 300], [7.6, 0], [20.1, 0], [21.1, 300], [22.0, 300], [23.0, 0]]); };

  // ---------- Cybertruck chain ----------
  const KEYS = [[0, ST.E], [20, ST.E], [24, ST.D], [44, ST.D], [48, ST.C], [68, ST.C], [72, ST.B], [95, ST.B], [96.6, ST.T], [98.9, ST.T]];
  const ct = (TF.line2ct = TF.chain({ id: 'F2-CT', period: 24, t0: 0, life: 99.9, keys: KEYS, lift: [[98.9, 0], [99.9, 300]],
    extra: (a) => { const placed = (a >= 27) + (a >= 30) + (a >= 33) + (a >= 36);
      return { floor: a >= 1.5, stack: Math.max(0, (a >= 5) + (a >= 9) + (a >= 13) + (a >= 17) - placed), front: a >= 27, side: a >= 30, bed: a >= 33, roof: a >= 36,
        beads: TF.lin(a, 37, 43), glass: a >= 51 && !(a >= 57.6 && a < 63.1), crack: a >= 55.3 && a < 57.6, wheels: a >= 82, pack: a >= 88.8, lit: a >= 96,
        wheelAng: a > 82 ? -(TF.keys(a, KEYS) - ST.B) / (0.44 * M) : 0 }; } }));
  // ---------- Semi chain (built on the table; t0 7.6) ----------
  const semi = (TF.line2semi = TF.chain({ id: 'F2-Semi', period: 24, t0: 7.6, life: 16.6, keys: [[0, ST.T], [14.0, ST.T], [16.6, ST.T - 650]], lift: [[12.5, 0], [13.5, 300]],
    extra: (a) => ({ frame: a >= 0.6, motors: a >= 3.5, pack: a >= 7.0, cab: a >= 10.5, lit: a >= 12, wheels: a >= 0.6, wheelAng: a > 14 ? (16.6 - a) * 0 + (ST.T - TF.keys(a, [[14, ST.T], [16.6, ST.T - 650]])) / (0.52 * M) : 0 }) }));
  // vehicles of floor 2 (and their descent on L21 into 1A, below the slab)
  TF.transport({ id: 'F2-vehicles', owner: '2A', period: 24, layer: 'main', box: { x: L.X0, y: ceil, w: L.X1 - L.X0, h: 640 },
    draw(ctx, t, theme, lod) {
      const both = (fn) => { ctx.save(); ctx.beginPath(); ctx.rect(L.X0, ceil, L.X1 - L.X0, yF - ceil + 2); ctx.clip(); fn(); ctx.restore();
        ctx.save(); ctx.beginPath(); ctx.rect(TBL[0] - 10, yF + L.slab, TBL[1] - TBL[0] + 20, 300); ctx.clip(); fn(); ctx.restore(); };
      both(() => { for (const c of ct.cars(t)) V.ct(ctx, c.x, yF + c.dy, c, lod); for (const c of semi.cars(t)) if (c.age < 13.6) V.semi(ctx, c.x, yF + c.dy, c, lod); });
      // L21 table (above and below the slab)
      const d = tableD(t);
      both(() => { D.rect(ctx, TBL[0], yF + d - 6, TBL[1] - TBL[0], 6, '#e0a43a', '#9a6b1c', 1); });
      D.rect(ctx, TBL[0], yF, TBL[1] - TBL[0], L.slab, d > 2 ? '#3a3f45' : '#e0a43a');
    } });
  const rollAng = (t) => { const n = Math.floor(t / 24), s = s24(t); return Math.PI * 4 * (n + TF.ramp(s, 20, 24)); };
  const rollers = (ctx, x0, x1, t, lod) => TF.rollers.draw(ctx, x0, x1, yF - 0.33 * M, yF, rollAng(t), lod);

  // coil: BL stop F2 slides it out into 2A (1.4-2.0); AGV dolly to the 2E uncoiler
  const coilX = (s) => TF.keys(s, [[1.4, 1247], [2.0, 1497], [2.5, 1497], [8.5, 3610], [9.0, 3680]]);
  const dollyX = (s) => TF.keys(s, [[2.0, 1497], [2.5, 1497], [8.5, 3610], [9.2, 3610], [15.2, 1497]]);
  TF.transport({ id: 'F2-coil-dolly', owner: '2A', period: 24, layer: 'front', box: { x: L.X0, y: ceil, w: L.X1 - L.X0, h: 320 },
    draw(ctx, t, theme, lod) {
      const s = s24(t), dx = dollyX(s);
      D.rect(ctx, dx - 16, yF - 9, 32, 7, '#f2c230', '#9c7a12', 0.8); D.circle(ctx, dx - 10, yF - 2, 2.5, '#1d1f22'); D.circle(ctx, dx + 10, yF - 2, 2.5, '#1d1f22');
      if (lod !== 'far') K.beacon(ctx, dx + 12, yF - 12, t, s >= 2.5 && s < 15.2);
      if (s >= 1.4 && s < 9.0) { ctx.save(); ctx.beginPath(); ctx.rect(L.X0, ceil, 3660 - L.X0, 330); ctx.clip();
        const y = yF - (s >= 2.5 ? 9 : 0) - 19; D.circle(ctx, coilX(s), y, 19, '#b9c0c7', '#6d757d', 1.5); D.circle(ctx, coilX(s), y, 7, '#ffffff', '#6d757d', 1); ctx.restore(); }
    } });

  // ================= 2E stainless panels =================
  const strokes = [[0.5, 1.5], [4.5, 5.5], [8.5, 9.5], [12.5, 13.5], [16.5, 17.5]];
  TF.room({ id: '2E', period: 24, box: L.roomById('2E').box,
    ports: { D2DE: 'out', F2R: 'pass', RISER: 'in' },
    actors: ['2E.uncoiler', '2E.bendPress'],
    flows: [{ item: 'CT steel coil (BL + AGV dolly)', from: 'DOCK', via: ['BL-2', 'D2AB', 'D2BC', 'D2CD', 'D2DE'], to: '2E', sink: 'stainless panels' },
      { item: 'coolant', from: 'BA', via: ['RISER'], to: '2E', sink: 'closed loop' },
      { item: 'floor sled + panel stack', from: '2E', via: ['D2DE'], to: '2D', sink: 'welded' }],
    back(ctx, t, theme, lod) {
      const s = s24(t);
      rollers(ctx, 3280, 3640, t, lod);
      X.upper(ctx, yF, ceil, t, lod, { duct: [3290, 3600, 4.2], fans: [3540], tray: [3290, 3600, 3.4], pipes: [3620, 3740, 3.8], valves: [3680], lamps: [3360, 3520] });
      const r = (0.5 - 0.3 * TF.mod(s - 9.0, 24) / 24) * M, ang = t * Math.PI;
      D.circle(ctx, 3700, hY(1.0), r, '#b9c0c7', '#6d757d', 1.5); D.circle(ctx, 3700, hY(1.0), 6, '#4a5056');
      if (lod !== 'far') D.line(ctx, [[3700, hY(1.0)], [3700 + Math.cos(ang) * r, hY(1.0) + Math.sin(ang) * r]], '#e5e7eb', 1);
      D.line(ctx, [[3700, hY(1.0) - r], [3640, hY(0.9)], [3610, hY(0.9)]], '#c9ccd0', 2.5);
      X.press(ctx, 3610, yF, 1.0, 2.4, Math.max(...strokes.map(([a, b]) => TF.pulse(s, a, b, 0.35))), lod);
      D.rect(ctx, 3720, hY(0.3), 20, 0.3 * M, '#5b8fc9');
      K.cabinet(ctx, 3290, hY(1.0), 20, 48, t, 51, lod);
    },
    draw() {}, front() {} });

  // ================= 2D exoskeleton weld =================
  const RF = [ST.D + 2.95 * M, yF], RG2 = [ST.D - 1.0 * M, hY(2.9)];
  const PLACE = { front: [26, 27, [2.2, 0.8]], side: [29, 30, [0.45, 0.9]], bed: [32, 33, [-1.7, 0.9]], roof: [35, 36, [0.25, 1.6]] };
  TF.room({ id: '2D', period: 24, box: L.roomById('2D').box,
    ports: { D2DE: 'in', D2CD: 'out', F2R: 'pass' },
    actors: ['2D.robotFloor', '2D.robotGantry', 'peek.shiba2D'],
    flows: [{ item: 'panels on the sled', from: '2E', via: ['D2DE'], to: '2D', sink: 'welded exoskeleton' }, { item: 'CT body', from: '2D', via: ['D2CD'], to: '2C', sink: 'glass' }],
    back(ctx, t, theme, lod) {
      rollers(ctx, 2800, 3270, t, lod);
      X.upper(ctx, yF, ceil, t, lod, { duct: [3120, 3260, 4.1], fans: [3200], pipes: [2810, 3100, 3.9], valves: [2900, 3050], lamps: [2900, 3150] });
      D.rect(ctx, 3210, hY(4.1) - 20, 26, 9, '#c9d0d6', '#7b848c', 1);                                  // vent box (Shiba peek)
      D.rect(ctx, ST.D - 2.6 * M, hY(2.9) - 6, 4.6 * M, 6, '#9aa3ab', '#6d757d', 1);
      for (const x of [ST.D - 2.6 * M, ST.D + 2.0 * M]) D.rect(ctx, x, hY(2.9), 6, 2.9 * M, '#b3bac1');
      K.cabinet(ctx, 2810, hY(1.0), 20, 48, t, 53, lod);
    },
    draw() {},
    front(ctx, t, theme, lod) {
      if (lod === 'far') return;
      const car = ct.inWindow(t, 24, 44), a = car ? car.age : 30, cx = car ? car.x : ST.D;
      const w = (p) => [cx + p[0] * M, yF - p[1] * M], stack = w([-0.35, 0.75]);
      const tipFor = (keys, rest) => { for (const k of keys) { const [a0, a1, p] = PLACE[k]; if (a >= a0 - 1 && a < a1 + 0.3) { const u = TF.ramp(a, a0 - 1, a0 - 0.3), v = TF.ramp(a, a0, a1);
        return u < 1 ? [TF.lerp(rest[0], stack[0], u), TF.lerp(rest[1], stack[1], u)] : [TF.lerp(stack[0], w(p)[0], v), TF.lerp(stack[1], w(p)[1], v)]; } } return null; };
      let tf = tipFor(['front', 'side'], [RF[0] - 20, hY(1.3)]) || [RF[0] - 20, hY(1.3)], tg = tipFor(['bed', 'roof'], [RG2[0], hY(2.0)]) || [RG2[0], hY(2.0)];
      let on = false;
      if (car && a >= 37 && a < 43) { const u = TF.lin(a, 37, 43), j = Math.min(3, Math.floor(u * 4)), p = TF.track.path(V.CT.seams[j]), q = p.at(p.total * TF.clamp(u * 4 - j, 0, 1));
        if (j % 2 === 0) tf = w(q); else tg = w(q); on = true; }
      K.arm(ctx, RG2, tg, { l1: 40, l2: 36, hang: true, bend: -1, toolAng: Math.PI / 2 });
      K.arm(ctx, RF, tf, { l1: 52, l2: 48, bend: 1, toolAng: Math.PI - 0.3 });
      if (on) K.sparks(ctx, (Math.floor(TF.lin(a, 37, 43) * 4) % 2 ? tg : tf)[0], (Math.floor(TF.lin(a, 37, 43) * 4) % 2 ? tg : tf)[1], t, lod, 0.8);
    } });

  // ================= 2C glass + steel-ball test: ONE Optimus =================
  const GX = 2620, BX = 2740, RACK = 2765, BUCKET = 2712;
  const glassP = (k) => A.reach([0.5, 1.4 + 0.05 * k], [0.35, 1.45], { gripN: 0.9, gripF: 0.9, head: -0.1 });
  const opt2c = (() => {
    const rack = A.reach([0.45, 1.0], [0.3, 1.05], { lean: 0.15, gripN: 0.9, gripF: 0.9 });
    const segs = [A.keyed(0.5, BX, 1, [[0, A.stand()], [1, rack]]), A.turn(0.3, BX, 1, () => rack), A.walk(1.0, BX, GX, { step: 0.5, carry: [0.32, 1.1], carryW: 0.25 }),
      A.keyed(1.2, GX, -1, [[0, rack], [1, glassP(1)]]), A.turn(0.3, GX, -1), A.walk(1.0, GX, BX, { step: 0.5 }), A.turn(0.3, BX, 1),   // 0 .. 4.6 glass in
      A.keyed(1.0, BX, -1, [[0, A.stand()], [0.5, A.reach([0.5, 0.45], null, { lean: 0.4, hipY: 0.8, gripN: 1 })], [1, A.reach([-0.2, 1.3], null, { gripN: 1, head: 0.1 })]]),   // pick the ball
      A.keyed(1.0, BX, -1, [[0, A.reach([-0.2, 1.3], null, { gripN: 1 })], [1, A.reach([-0.35, 1.5], null, { gripN: 1, lean: -0.1 })]]),   // wind up
      A.keyed(0.4, BX, -1, [[0, A.reach([-0.35, 1.5], null, { gripN: 1 })], [1, A.reach([0.55, 1.35], null, { gripN: 0, lean: 0.25 })]]),  // throw (7.0)
      A.hold(1.0, BX, -1, (tl) => Object.assign(A.reach([0.4, 1.2], null, { gripN: 0 }), { head: 0.1 })),
      A.walk(1.0, BX, GX, { step: 0.5 }), A.keyed(1.0, GX, -1, [[0, A.stand()], [1, glassP(0)]]),                                  // 8 .. 10 take out the cracked pane
      A.turn(0.3, GX, -1, () => glassP(0)), A.walk(1.0, GX, BX, { step: 0.5, carry: [0.32, 1.1], carryW: 0.25 }),
      A.keyed(1.3, BX, 1, [[0, rack], [0.4, A.reach([0.45, 0.6], null, { lean: 0.3, gripN: 0 })], [1, rack]]),                  // scrap tote, new pane
      A.turn(0.3, BX, 1, () => rack), A.walk(1.0, BX, GX, { step: 0.5, carry: [0.32, 1.1], carryW: 0.25 }),
      A.keyed(1.2, GX, -1, [[0, rack], [1, glassP(1)]]),                                                                          // 13.9 .. 15.1 new pane
      A.turn(0.3, GX, -1), A.walk(0.8, GX, 2700, { step: 0.5 }),
      A.keyed(0.8, 2700, 1, [[0, A.stand()], [0.5, A.reach([0.3, 0.35], null, { lean: 0.5, hipY: 0.75, gripN: 1 })], [1, A.stand()]]),   // pick the ball up again
      A.walk(0.4, 2700, BX, { step: 0.4 }), A.turn(0.3, BX, 1),
      A.hold(2.4, BX, -1, (tl) => A.reach([0.35 + 0.1 * Math.sin(tl * 6), 0.35], null, { lean: 0.5, hipY: 0.75, gripN: 0.6, head: 0.5 }))];   // sweep up the shards
    segs.push(A.keyed(24 - A.total(segs), BX, -1, [[0, A.stand()], [0.5, A.reach([-0.1, 1.6], null, { gripN: 0.3, head: -0.4 })], [1, A.stand()]]));   // unload the shuttle basket overhead
    return (t) => A.run(segs, s24(t)); })();
  const ball = (s) => { if (s >= 7.0 && s < 7.3) { const k = (s - 7.0) / 0.3; return [TF.lerp(BX + 15, 2595, k), TF.lerp(hY(1.6), hY(1.45), k) - 12 * Math.sin(Math.PI * k)]; }
    if (s >= 7.3 && s < 16.4) { const k = TF.ramp(s, 7.3, 8.5); return [TF.lerp(2595, 2700, k), TF.lerp(hY(1.45), hY(0.08), Math.min(1, k * 2))]; }
    if (s >= 16.4 || s < 5.6) return [BUCKET, hY(0.3)]; return null; };
  TF.room({ id: '2C', period: 24, box: L.roomById('2C').box,
    ports: { D2CD: 'in', D2BC: 'out', F2R: 'both' },
    actors: ['2C.glassOptimus'],
    flows: [{ item: 'glass panes (basket)', from: '1C', via: ['F1R', 'W3-1', 'W3-2', 'F2R'], to: '2C', sink: 'in the truck' },
      { item: 'cracked pane (scrap tote)', from: '2C', via: ['F2R', 'W3-2', 'W3-1'], to: 'DOCK', sink: 'parts-truck backload' },
      { item: 'glazed truck', from: '2C', via: ['D2BC'], to: '2B', sink: 'pack + wheels' }],
    back(ctx, t, theme, lod) {
      rollers(ctx, 2320, 2790, t, lod);
      X.upper(ctx, yF, ceil, t, lod, { duct: [2330, 2600, 4.1], fans: [2380], pipes: [2330, 2600, 3.5], valves: [2450], lamps: [2420, 2680] });
      X.rack(ctx, RACK - 10, yF, 0.5, 1.2, 2, 2, (c, x, y) => IT.pane(c, x + 4, y), lod);
      D.rect(ctx, 2755, hY(0.35), 22, 0.35 * M, '#6b7280', '#374151', 0.8);
      D.rect(ctx, BUCKET - 8, hY(0.3), 16, 0.3 * M, '#9aa3ab', '#5d656d', 0.8);
      K.cabinet(ctx, 2330, hY(1.0), 20, 48, t, 55, lod);
    },
    draw() {},
    front(ctx, t, theme, lod) {
      if (lod === 'far') return;
      const s = s24(t), st = opt2c(t), fig = A.draw(ctx, st, yF), w = fig.w(fig.sk.wristN);
      if ((s >= 0.3 && s < 3.0) || (s >= 9.0 && s < 11.6) || (s >= 12.3 && s < 15.1)) IT.pane(ctx, w[0], w[1] + 8);
      const b = ball(s); if (b) D.circle(ctx, b[0], b[1], 3, '#6b737b', '#2b2f34', 0.6);
      if (s >= 5.6 && s < 7.0) D.circle(ctx, w[0], w[1], 3, '#6b737b', '#2b2f34', 0.6);
    } });

  // ================= 2B pack + wheels =================
  const pbCT = TF.PB.trip('2B-ct'), pbS = TF.PB.trip('2B-semi');
  TF.room({ id: '2B', period: 24, box: L.roomById('2B').box,
    ports: { D2BC: 'in', D2AB: 'out', PB: 'in', F2R: 'both' },
    actors: ['2B.liftTable', '2B.wheelArm', '2B.packRoller'],
    flows: [{ item: 'CT + Semi packs (paternoster)', from: '3B', via: ['PB'], to: '2B', sink: 'CT pack here; Semi pack by roller to 2A' },
      { item: 'wheel totes (basket)', from: '3A', via: ['F3R', 'W3-3', 'W3-2', 'F2R'], to: '2B', sink: 'on the truck; empty tote back' },
      { item: 'CT + Semi pack', from: '2B', via: ['D2AB'], to: '2A', sink: 'L21' }],
    back(ctx, t, theme, lod) {
      const s = s24(t);
      rollers(ctx, 1840, 2310, t, lod);
      X.upper(ctx, yF, ceil, t, lod, { duct: [1960, 2290, 4.0], fans: [2230], tray: [1960, 2290, 3.3], lamps: [2000, 2200] });
      const u = TF.mod(s - pbCT.te, 24), k = TF.ramp(u, 1.1, 2.1);
      X.liftTable(ctx, ST.B, yF, 2.0, 0.08 + 0.26 * k, lod);
      if (u < 2.2) D.rect(ctx, TF.lerp(TF.PB.XU + 30, ST.B, TF.ramp(u, 0.1, 1.0)) - 60, yF - (0.13 + 0.26 * k) * M, 120, 5, '#2a2e33', '#111', 0.6);
      // Semi pack: waits on the exit table, then the roller carries it through D2AB to the table in 2A (12.0-12.6)
      D.rect(ctx, 1880, hY(0.45), 60, 4, '#7b848c');
      const us = TF.mod(s - pbS.te, 24); if (us < TF.mod(12.0 - pbS.te, 24)) D.rect(ctx, 1882, hY(0.45) - 10, 56, 10, '#2a2e33', '#111', 0.6);
      D.rect(ctx, 2262 - 0.44 * M - 2, hY(0.6), 0.44 * M + 14, 0.6 * M, '#2f6fb0', '#1d4570', 1); if (lod !== 'far') IT.wheels(ctx, 2262, hY(0.6), 0.44 * M);
      K.cabinet(ctx, 2280, hY(1.7), 18, 30, t, 57, lod);
    },
    draw() {},
    front(ctx, t, theme, lod) {
      if (lod === 'far') return;
      const s = s24(t), car = ct.inWindow(t, 72, 95), cx = car ? car.x : ST.B, pick = [2262, hY(0.8)], home = [2230, hY(1.1)];
      const hub = (ax) => [cx + ax * M, hY(0.44)], go = (a, b, k) => [TF.lerp(a[0], b[0], k), TF.lerp(a[1], b[1], k)];
      let p = home, carry = false;
      if (s >= 6 && s < 8.2) { p = s < 6.5 ? go(home, pick, TF.ramp(s, 6, 6.5)) : go(pick, hub(1.91), TF.ramp(s, 6.8, 8.0)); carry = s >= 6.5 && s < 8.0; }
      else if (s >= 8.2 && s < 10.5) { p = s < 8.7 ? go(hub(1.91), pick, TF.ramp(s, 8.2, 8.7)) : go(pick, hub(-1.9), TF.ramp(s, 9.0, 10.2)); carry = s >= 8.7 && s < 10.2; }
      else if (s >= 10.5 && s < 11.2) p = go(hub(-1.9), home, TF.ramp(s, 10.5, 11.2));
      K.arm(ctx, [2236, yF], p, { l1: 50, l2: 46, toolAng: Math.PI, bend: 1, tool: 8 });
      if (carry) IT.tireAt(ctx, p[0], p[1], 0.44 * M);
    } });

  // ================= 2A Semi build + L21: ONE Optimus =================
  const KIT = 1397, HX = (s) => TF.keys(s, [[6.4, KIT], [7.0, KIT], [7.6, ST.T], [8.3, ST.T], [14.6, KIT], [15.2, KIT], [16.4, ST.T + 1.2 * M], [18.1, ST.T + 1.2 * M], [19.0, KIT]]);
  const HY = (s) => TF.keys(s, [[6.4, hY(3.1)], [7.0, hY(1.0)], [7.2, hY(2.6)], [7.6, hY(2.6)], [8.0, hY(1.2)], [8.3, hY(3.1)], [14.6, hY(3.1)], [15.2, hY(1.4)], [15.6, hY(4.2)], [16.4, hY(4.2)], [18.1, hY(3.7)], [18.6, hY(4.3)]]);
  const opt2a = (() => {
    const low = (f) => A.reach([f, 0.5], [f - 0.15, 0.6], { lean: 0.45, hipY: 0.78, head: 0.4, gripN: 1, gripF: 1 });
    const up = A.reach([0.4, 1.75], [0.25, 1.7], { gripN: 0.9, gripF: 0.9, head: -0.35 });
    const segs = [A.hold(2.6, 1520, 1, (tl) => low(0.45 + 0.08 * Math.sin(tl * 5))),                                   // 0 chock + strap the CT on the table
      A.turn(0.3, 1520, 1), A.walk(0.6, 1520, 1450, { step: 0.4 }),
      A.keyed(3.9, 1450, -1, [[0, A.stand()], [0.3, low(0.5)], [0.5, A.reach([0.3, 1.0], null, { gripN: 1 })], [0.75, low(0.5)], [1, A.reach([0.3, 1.0], null, { gripN: 1 })]]),   // unpack motors
      A.turn(0.3, 1450, -1), A.walk(1.2, 1450, 1500, { step: 0.3 }),
      A.hold(2.2, 1500, 1, (tl) => { const p = low(0.5 + 0.4 * TF.mod(tl, 1.1) / 1.1); p.handN[1] += 0.004 * Math.sin(tl * 40); return p; }),   // 8.9 .. 11.1 motors on
      A.walk(1.5, 1500, 1650, { step: 0.5 }), A.hold(2.2, 1650, 1, (tl) => low(0.35)),                                    // 11.1 .. 14.8 guide the pack up
      A.keyed(1.2, 1650, 1, [[0, low(0.35)], [1, up]]), A.hold(2.1, 1650, 1, () => up),                                  // 14.8 .. 18.1 guide the cab down
      A.walk(0.4, 1650, 1700, { step: 0.4 }), A.hold(1.3, 1700, 1, (tl) => { const p = A.reach([0.4, 1.15], null, { gripN: 1 }); p.handN[1] += 0.004 * Math.sin(tl * 40); return p; }),   // bolt the cab
      A.keyed(0.3, 1700, 1, [[0, A.stand()], [1, Object.assign(A.stand(), { head: -0.2 })]]), A.turn(0.3, 1700, 1),
      A.walk(1.6, 1700, 1520, { step: 0.55 }), A.turn(0.3, 1520, -1)];
    segs.push(A.keyed(24 - A.total(segs), 1520, 1, [[0, A.stand()], [0.5, A.reach([0.45, 1.3], [0.2, 1.3], { gripN: 0 })], [1, A.stand()]]));   // wave the CT onto the table
    return (t) => A.run(segs, s24(t)); })();
  TF.room({ id: '2A', period: 24, box: L.roomById('2A').box,
    ports: { D2AB: 'in', 'BL-2': 'both', L21: 'out', 'W3-2': 'pass', 'PT-2': 'pass', 'SS-2': 'spare' },
    actors: ['2A.semiOptimus', '2A.kitHoist', '2A.liftL21', 'peek.hardhat2A'],
    flows: [{ item: 'Semi kit + CT coil (BL)', from: 'DOCK', via: ['BL-2'], to: '2A', sink: 'Semi built here; coil to 2E; folded crate back down the BL' },
      { item: 'Cybertruck + Semi', from: '2A', via: ['L21'], to: '1A', sink: 'final test' }],
    back(ctx, t, theme, lod) {
      const s = s24(t);
      X.upper(ctx, yF, ceil, t, lod, { pipes: [1360, 1820, 3.9], valves: [1450, 1750], tray: [1500, 1820, 4.3], lamps: [1500, 1700] });
      for (const x of [TBL[0] - 6, TBL[1]]) D.rect(ctx, x, hY(2.4), 6, 2.4 * M, '#9aa3ab');
      // kit crate: full from the BL at 2.0, frame / motors / cab come out, folded flat at 20.5, back into the cage at 1.45
      const kitIn = s >= 2.0, flat = s >= 20.5 || s < 1.45;
      if (flat && s < 2.0) { ctx.save(); ctx.beginPath(); ctx.rect(L.X0, ceil, 500, 320); ctx.clip(); D.rect(ctx, s >= 1.45 ? TF.lerp(KIT, KIT - 250, TF.ramp(s, 1.45, 2.0)) - 34 : KIT - 34, yF - 6, 68, 6, '#b98b52', '#7d5a2c', 1); ctx.restore(); }
      if (kitIn && !flat) { const lvl = 1 - 0.3 * (s >= 7.0) - 0.3 * (s >= 7.4) - 0.3 * (s >= 15.2); ctx.save(); ctx.beginPath(); ctx.rect(L.X0, ceil, 500, 320); ctx.clip();
        D.rect(ctx, KIT - 34, yF - 46 * Math.max(0.15, lvl), 68, 46 * Math.max(0.15, lvl), '#c99b5f', '#7d5a2c', 1.2); ctx.restore(); }
      // kit hoist on its beam: frame 6.4-8.3, cab 14.6-18.6
      const hx = HX(s), hy = HY(s);
      X.hoist(ctx, hx, hY(3.2), hy, 1370, 1810);
      if (s >= 7.0 && s < 7.9 && lod !== 'far') D.rect(ctx, hx - 60, hy + 4, 120, 6, '#d3d9df', '#5d656d', 0.8);
      if (s >= 15.2 && s < 18.1 && lod !== 'far') { const P = G.TF3.paint; P.begin(ctx, hx - 2.2 * M, hy + 3.7 * M, M, 1); P.poly(ctx, V.SEMI.cab, '#eef0f2', '#6b737b', 1.2); P.poly(ctx, V.SEMI.win, '#22292f', null); P.end(ctx); }
      // Semi pack: roller from 2B (12.0-12.6), lift into the frame 13.6-14.6
      if (s >= 12.0 && s < 14.6) { const x = TF.lerp(1900, ST.T, TF.ramp(s, 12.0, 12.6)), y = TF.lerp(hY(0.45), hY(0.86), TF.ramp(s, 13.6, 14.6)); D.rect(ctx, x - 40, y - 32, 80, 32, '#2a2e33', '#111', 0.8); }
      D.screen(ctx, 1770, hY(2.3), 26, 16, (x, y, w, h) => { const d = tableD(t); D.rect(ctx, x + 3, y + 3 + (h - 6) * d / 300, w - 6, 3, '#fbbf24'); });
      K.cabinet(ctx, 1365, hY(2.4), 18, 30, t, 59, lod);
      D.rect(ctx, 1795, hY(3.2) - 4, 20, 5, '#7b848c');
    },
    draw() {},
    front(ctx, t, theme, lod) { if (lod === 'far') return; A.draw(ctx, opt2a(t), yF); } });

  TF.peek({ id: 'shiba2D', owner: '2D', kind: 'shiba', P: 131, offset: 13, dur: 5, x: 3223, y: hY(4.1) - 20, face: -1 });
  TF.peek({ id: 'hardhat2A', owner: '2A', kind: 'hardhat', P: 137, offset: 29, dur: 3.5, x: 1805, y: hY(3.2) - 5 });
})(typeof window !== 'undefined' ? window : globalThis);
