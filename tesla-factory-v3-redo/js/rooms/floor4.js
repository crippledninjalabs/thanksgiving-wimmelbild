// Floor 4 — Cybercab (GOLD), E -> W, 24 s pitch (FACTORY-MAP §2 floor 4). 4E casts front + rear castings and the
// cabin ring from the BL ingot (an AGV dolly brings it from the 4A gate), 4D welds the ring to the castings and sprays
// gold (doors on their own paint fixture), 4C: one Optimus hangs + bolts the butterfly door, opens it to fit seats,
// computer and cabin screen, 4B: pack from the PB paternoster + wheels with aero covers, 4A: test drive + door
// cycle, then the BL cage picks it up (tau 13.45). Station time s = t mod 24 (every cab: s 0 .. 20 at its station).
(function (G) {
  const TF = G.TF, L = TF.layout, D = TF.draw, K = TF.kit, A = TF.act, M = TF.M, X = TF.mx, S = TF.supply, IT = S.items, V = TF.bodies;
  const F = 4, yF = L.floorY(F), hY = (m) => yF - m * M, ceil = L.ceilY(F);
  const ST = { E: 3500, D: 3030, C: 2550, B: 2070, A: 1475, BL: 1225 };
  const sOf = (t) => TF.mod(t, 24);
  const KEYS = [[0, ST.E], [20, ST.E], [24, ST.D], [44, ST.D], [48, ST.C], [68, ST.C], [72, ST.B], [92, ST.B], [96, ST.A], [97, ST.A], [99.5, 1700], [104.5, 1700], [107, ST.A], [109.45, ST.A], [110.2, ST.BL]];
  const xAt = (a) => TF.keys(a, KEYS);
  const dOpen = (a) => Math.max(TF.pulse(a, 53.8, 54.6, 0.3), TF.pulse(a, 63.2, 66.8, 0.4), TF.pulse(a, 100.5, 103.5, 0.6));
  const chain = (TF.line4 = TF.chain({ id: 'F4', period: 24, t0: 0, life: 110.2, keys: KEYS,
    extra: (a) => ({ castF: a >= 4.5, castR: a >= 9.5, ring: a >= 14.5, beads: TF.lin(a, 26, 32), paint: TF.lin(a, 33, 41), door: a >= 52.1, doorOpen: dOpen(a),
      seats: a >= 65, screen: a >= 99 ? 1 : a >= 66.5 ? 0.3 : 0, pack: a >= 78, wheels: a >= 85, lit: a >= 97,
      wheelAng: a > 85 ? -(xAt(a) - ST.B) / (0.4 * M) : 0 }) }));
  TF.transport({ id: 'F4-cabs', owner: '4E', period: 24, layer: 'main', box: { x: L.X0, y: ceil, w: L.X1 - L.X0, h: 320 },
    draw(ctx, t, theme, lod) {
      ctx.save(); ctx.beginPath(); ctx.rect(L.X0, ceil, L.X1 - L.X0, yF - ceil + 2); ctx.clip();
      for (const c of chain.cars(t)) { if (c.age < 3.0) continue; V.cab(ctx, c.x, yF, c, lod); }
      ctx.restore();
    } });
  const rollAng = (t) => { const n = Math.floor(t / 24), s = sOf(t); return Math.PI * 4 * (n + TF.ramp(s, 20, 24)); };
  const rollers = (ctx, x0, x1, t, lod) => TF.rollers.draw(ctx, x0, x1, yF - 0.33 * M, yF, rollAng(t), lod);

  // ingot: BL stop F4 3.1-3.7 slides it out into 4A; an AGV dolly carries it along the front lane to the 4E furnace
  const ingotX = (s) => TF.keys(s, [[3.15, 1287], [3.65, 1400], [4.2, 1400], [10.0, 3610], [10.6, 3680]]);
  const dollyX = (s) => TF.keys(s, [[3.6, 1400], [4.2, 1400], [10.0, 3610], [10.8, 3610], [16.8, 1400]]);
  TF.transport({ id: 'F4-ingot-dolly', owner: '4A', period: 24, layer: 'front', box: { x: L.X0, y: ceil, w: L.X1 - L.X0, h: 320 },
    draw(ctx, t, theme, lod) {
      const s = sOf(t), dx = dollyX(s);
      D.rect(ctx, dx - 16, yF - 9, 32, 7, '#f2c230', '#9c7a12', 0.8); D.circle(ctx, dx - 10, yF - 2, 2.5, '#1d1f22'); D.circle(ctx, dx + 10, yF - 2, 2.5, '#1d1f22');
      if (lod !== 'far') K.beacon(ctx, dx + 12, yF - 12, t, s >= 4.2 && s < 16.8);
      if (s >= 3.15 && s < 10.6) { ctx.save(); ctx.beginPath(); ctx.rect(L.X0, ceil, 3640 - L.X0, 330); ctx.clip(); TF.parts.ingot(ctx, ingotX(s), yF - (s >= 4.2 ? 9 : 0), lod, 0); ctx.restore(); }
    } });

  // ================= 4E castings =================
  const PRESS = 3680, strokes = [[2.8, 4.4], [7.8, 9.4], [12.8, 14.4], [16.6, 18.2]];
  const ram = (s) => Math.max(...strokes.map(([a, b]) => TF.pulse(s, a, b, 0.5)));
  const melt = (s) => 0.5 + 0.35 * TF.ramp(s, 10.6, 12) - 0.35 * TF.lin(s, 12, 24) + 0.35 * (s < 10.6 ? 1 - TF.lin(s + 24, 12, 24) : 0) * 0;
  TF.room({ id: '4E', period: 24, box: L.roomById('4E').box,
    ports: { D4DE: 'out', F4R: 'pass', RISER: 'in', O4E: 'in' },
    actors: ['4E.castingPress', '4E.transferArm', 'peek.wave4E'],
    flows: [{ item: 'ingot (BL + AGV dolly)', from: 'DOCK', via: ['BL-4', 'D4AB', 'D4BC', 'D4CD', 'D4DE'], to: '4E', sink: 'melted -> castings' },
      { item: 'coolant', from: 'BA', via: ['RISER'], to: '4E', sink: 'closed loop' },
      { item: 'castings on the body cart', from: '4E', via: ['D4DE'], to: '4D', sink: 'welded' }],
    back(ctx, t, theme, lod) {
      const s = sOf(t);
      rollers(ctx, 3280, 3610, t, lod);
      X.upper(ctx, yF, ceil, t, lod, { duct: [3290, 3560, 4.1], fans: [3330], tray: [3290, 3520, 3.4], lamps: [3360, 3480] });
      // catwalk for the press maintenance (wave peek hatch)
      D.rect(ctx, 3570, ceil, 2, (hY(3.2)) - ceil, '#9aa3ab');
      D.rect(ctx, 3730, ceil, 2, (hY(3.2)) - ceil, '#9aa3ab');
      D.rect(ctx, 3560, hY(3.2), 180, 5, '#9aa3ac', '#6d757d', 1); D.line(ctx, [[3560, hY(3.2) - 22], [3740, hY(3.2) - 22]], '#9aa3ac', 1.5);
      for (let x = 3562; x <= 3740; x += 24) D.line(ctx, [[x, hY(3.2) - 22], [x, hY(3.2)]], '#b9c0c7', 1);
      // holding furnace (melt rises when the dolly tips the ingot in) + coolant pipe
      D.rect(ctx, 3700, hY(1.6), 38, 1.6 * M, '#7d4b3a', '#4a2a20', 1.2);
      const lv = TF.clamp(0.45 + 0.3 * TF.ramp(s, 10.6, 12) - 0.3 * TF.lin(s, 12, 24) + (s < 10.6 ? 0.3 * (1 - 1) : 0), 0.1, 0.9);
      D.rect(ctx, 3708, hY(1.4), 22, 1.1 * M, '#2b1b16'); D.rect(ctx, 3708, hY(1.4) + 1.1 * M * (1 - lv), 22, 1.1 * M * lv, '#ff7a2a');
      K.pipe(ctx, [[3745, hY(0.2)], [3640, hY(0.2)]], '#5b8fc9', 4, t * 30, lod);
      X.press(ctx, PRESS - 30, yF, 1.3, 2.6, ram(s), lod);
      K.cabinet(ctx, 3290, yF - 48, 20, 48, t, 31, lod);
    },
    draw() {},
    front(ctx, t, theme, lod) {
      if (lod === 'far') return;
      const s = sOf(t), out = [PRESS - 60, hY(0.8)];
      const tg = [[ST.E + 1.6 * M, hY(0.7)], [ST.E - 1.6 * M, hY(0.85)], [ST.E - 0.2 * M, hY(1.2)], [3330, hY(0.75)]];
      let tip = [3600, hY(1.6)], carry = -1;
      strokes.forEach(([a, b], i) => { if (s >= b && s < b + 1.6) { const k = TF.ramp(s, b + 0.2, b + 1.4); tip = [TF.lerp(out[0], tg[i][0], k), TF.lerp(out[1], tg[i][1], k) - 20 * Math.sin(Math.PI * k)]; carry = i; } });
      K.arm(ctx, [3600, yF], tip, { l1: 52, l2: 48, toolAng: Math.PI / 2, bend: -1, tool: 8 });
      if (carry === 3) { ctx.save(); ctx.translate(tip[0], tip[1] + 10); D.rect(ctx, -22, -6, 44, 10, '#c9d0d6', '#7b848c', 0.8); ctx.restore(); }
      else if (carry >= 0) { D.rect(ctx, tip[0] - 20, tip[1] + 4, 40, 10, '#c9d0d6', '#7b848c', 0.8); }
    } });

  // ================= 4D weld + gold paint =================
  const FIX = 2830, headX = (s) => s < 9 ? 2.4 : s < 17 ? 2.25 - 4.5 * TF.lin(s, 9, 17) : TF.lerp(-2.25, 2.4, TF.ramp(s, 17, 19));
  const doorPaint = (s) => TF.lin(s, 17.2, 18.6);
  TF.room({ id: '4D', period: 24, box: L.roomById('4D').box,
    ports: { D4DE: 'in', D4CD: 'out', F4R: 'pass' },
    actors: ['4D.weldArm', '4D.goldSpray', '4D.doorFixture'],
    flows: [{ item: 'gold body', from: '4D', via: ['D4CD'], to: '4C', sink: 'fit-out' }, { item: 'castings', from: '4E', via: ['D4DE'], to: '4D', sink: 'joined' }],
    back(ctx, t, theme, lod) {
      const s = sOf(t);
      rollers(ctx, 2800, 3270, t, lod);
      X.booth(ctx, 2905, 3160, yF, 2.6, '#e0b85a', 0.08);
      X.upper(ctx, yF, ceil, t, lod, { duct: [2905, 3160, 3.3], fans: [3100], pipes: [2810, 3260, 4.0], valves: [2880, 3200], lamps: [2950, 3110] });
      // gantry gold spray head over the booth (follows its paint edge)
      const xl = headX(s), wx = ST.D + xl * M;
      D.line(ctx, [[2910, hY(2.55)], [3155, hY(2.55)]], '#6f7983', 3); D.rect(ctx, wx - 8, hY(2.55) - 4, 16, 8, '#4f5861'); D.line(ctx, [[wx, hY(2.55)], [wx, hY(1.85)]], '#dfe4e8', 7);
      if (s >= 9 && s < 17 && lod !== 'far') { ctx.globalAlpha = 0.3; D.poly(ctx, [[wx - 2, hY(1.85)], [wx + 2, hY(1.85)], [wx + 12, hY(1.55)], [wx - 12, hY(1.55)]], '#e0b85a'); ctx.globalAlpha = 1; }
      // door paint fixture (raw door hung by the Optimus at 10-12, painted 17.2-18.6, taken at 0) + raw door stock from 4E
      D.rect(ctx, FIX - 2, hY(1.6), 4, 1.6 * M, '#8a939b'); D.rect(ctx, FIX - 14, hY(1.6), 28, 3, '#8a939b');
      const onFix = s < 0.4 || s >= 12.0;
      if (onFix) { const g = s >= 12.0 && s < 17.2 ? 0 : s >= 17.2 ? doorPaint(s) : 1; doorShape(ctx, FIX, hY(0.95), g); }
      D.rect(ctx, 2814, hY(0.55) + 4, 3, yF - (hY(0.55) + 4), '#6d757d');
      D.rect(ctx, 2832, hY(0.55) + 4, 3, yF - (hY(0.55) + 4), '#6d757d');
      D.rect(ctx, 2810, hY(0.55), 30, 4, '#7b848c'); if (lod !== 'far') for (let i = 0; i < (s >= 18.2 || s < 10 ? 2 : 1); i++) D.rect(ctx, 2812, hY(0.55) - 4 - i * 4, 26, 3, '#c9d0d6', '#7b848c', 0.5);
      K.cabinet(ctx, 3200, yF - 48, 20, 48, t, 33, lod);
    },
    draw() {},
    front(ctx, t, theme, lod) {
      if (lod === 'far') return;
      const s = sOf(t), car = chain.inWindow(t, 24, 44), cx = car ? car.x : ST.D, seams = V.CAB.seams;
      let tip = [3150, hY(1.2)], on = false;
      if (s >= 1.6 && s < 8.4) { const u = TF.lin(s, 2, 8), j = Math.min(2, Math.floor(u * 3)), p = TF.track.path(seams[j]).at(TF.track.path(seams[j]).total * TF.clamp(u * 3 - j, 0, 1)); tip = [cx + p[0] * M, yF - p[1] * M]; on = s >= 2 && s < 8; }
      K.arm(ctx, [3150, yF], tip, { l1: 52, l2: 48, toolAng: Math.PI / 2 + 0.5, bend: 1 });
      if (on) K.sparks(ctx, tip[0], tip[1], t, lod, 0.8);
    } });
  // butterfly door drawn standalone (fixture / carried): gold level g 0..1
  function doorShape(ctx, cx, cy, g) { const P = G.TF3.paint; P.begin(ctx, cx - 0.28 * M, cy + 0.95 * M, M, 1);
    P.poly(ctx, V.CAB.door, g > 0.5 ? V.GOLD.panelTop : '#d3d9df', '#5d656d', 1); ctx.globalAlpha = 0.8; P.poly(ctx, V.CAB.win, '#22292f', null); ctx.globalAlpha = 1; P.end(ctx); }

  // ================= 4C fit-out: ONE Optimus for door, seats, computer, cabin screen (§10) =================
  const OC = 2575, OF = 2852;
  const opt4 = (() => {
    const door = A.reach([0.3, 1.1], [0.15, 1.15], { gripN: 0.9, gripF: 0.9 }), up = A.reach([0.5, 1.45], [0.35, 1.4], { gripN: 0.9, gripF: 0.9, head: -0.2 });
    const low = A.reach([0.45, 0.75], [0.3, 0.8], { lean: 0.35, hipY: 0.84, head: 0.35, gripN: 0.9, gripF: 0.9 });
    const segs = [A.keyed(0.5, OF, -1, [[0, A.stand()], [1, door]]), A.walk(2.6, OF, OC, { step: 0.62, carry: [0.32, 1.1], carryW: 0.25 }),   // 0 .. 3.4
      A.keyed(1.0, OC, -1, [[0, door], [1, up]]),                                                                // hang the door at the roof hinge
      A.hold(1.2, OC, -1, (tl) => { const p = A.reach([0.5, 1.43], null, { gripN: 1, head: -0.25 }); p.handN[1] += 0.004 * Math.sin(tl * 40); return p; }),   // bolt
      A.keyed(1.2, OC, -1, [[0, A.stand()], [0.5, A.reach([0.4, 1.2], null, { gripN: 0.6 })], [1, A.stand()]]),  // swing check
      A.turn(0.3, OC, -1), A.walk(2.6, OC, OF, { step: 0.62 }), A.turn(0.3, OF, 1),                               // 6.8 .. 10.0 back to 4D
      A.keyed(1.5, OF, -1, [[0, A.stand()], [0.4, low], [1, door]]), A.keyed(1.0, OF, -1, [[0, door], [1, A.reach([0.4, 1.0], null, { gripN: 0.2 })]]),   // raw door -> fixture
      A.walk(2.6, OF, OC, { step: 0.62 }),                                                                         // 12.2 .. 14.8
      A.keyed(2.0, OC, -1, [[0, A.stand()], [0.3, low], [0.6, A.reach([0.55, 0.9], null, { gripN: 0.9 })], [1, low]]),   // seats in through the open door
      A.keyed(1.2, OC, -1, [[0, low], [0.5, A.reach([0.5, 1.05], null, { gripN: 0.9 })], [1, up]]),               // computer + cabin screen
      A.turn(0.3, OC, -1), A.walk(2.6, OC, OF, { step: 0.62 }), A.turn(0.3, OF, 1)];                              // 18.0 .. 21.2
    segs.push(A.keyed(24 - A.total(segs), OF, -1, [[0, A.stand()], [0.5, A.reach([0.45, 1.0], null, { head: 0.3, gripN: 0.4 })], [1, A.stand()]]));   // inspect the drying door
    return (t) => A.run(segs, sOf(t)); })();
  TF.room({ id: '4C', period: 24, box: L.roomById('4C').box,
    ports: { D4CD: 'in', D4BC: 'out', F4R: 'both', 'PT-4': 'in' },
    actors: ['4C.fitOptimus'],
    flows: [{ item: 'seats (basket)', from: '9D', via: ['F9R', 'W3-9', 'W3-4', 'F4R'], to: '4C', sink: 'in the cab' },
      { item: 'glass pane (basket)', from: '1C', via: ['F1R', 'W3-1', 'W3-4', 'F4R'], to: '4C', sink: 'butterfly-door glazing stock' },
      { item: 'computer (capsule)', from: '9B', via: ['PT-4'], to: '4C', sink: 'in the cab' },
      { item: 'cabin screen (window drone)', from: 'LAWN', via: ['O4E'], to: '4C', sink: 'fitted in the dash' },
      { item: 'fitted cab', from: '4C', via: ['D4BC'], to: '4B', sink: 'pack + wheels' }],
    back(ctx, t, theme, lod) {
      rollers(ctx, 2320, 2790, t, lod);
      X.upper(ctx, yF, ceil, t, lod, { pipes: [2320, 2470, 3.5], valves: [2400], tray: [2600, 2780, 3.3], duct: [2600, 2780, 4.2], fans: [2700], lamps: [2450, 2700] });
      X.rack(ctx, 2420, yF, 0.8, 1.2, 2, 2, (c, x, y) => IT.seat(c, x, y), lod);
      D.rect(ctx, 2330, hY(1.85), 20, 16, '#dfe4e8', '#7b848c', 1); D.rect(ctx, 2370, hY(2.35), 20, 16, '#dfe4e8', '#7b848c', 1);
      K.cabinet(ctx, 2740, yF - 48, 20, 48, t, 35, lod);
    },
    draw() {},
    front(ctx, t, theme, lod) {
      if (lod === 'far') return;
      const s = sOf(t), st = opt4(t);
      const fig = A.draw(ctx, st, yF);
      if (s >= 0.4 && s < 4.1) { const w = fig.w(fig.sk.wristN); doorShape(ctx, w[0] - st.face * 6, w[1] + 4, 1); }
      if (s >= 10.3 && s < 12.0) { const w = fig.w(fig.sk.wristN); doorShape(ctx, w[0], w[1] + 4, 0); }
      if (s >= 16.8 && s < 18.0) { const w = fig.w(fig.sk.wristN); IT.cabScreen(ctx, w[0], w[1] + 3); }
    } });

  // ================= 4B pack + wheels =================
  const pb4 = TF.PB.trip('4B');
  TF.room({ id: '4B', period: 24, box: L.roomById('4B').box,
    ports: { D4BC: 'in', D4AB: 'out', PB: 'in', F4R: 'both' },
    actors: ['4B.liftTable', '4B.wheelArm', 'peek.shiba4B'],
    flows: [{ item: 'cab pack (paternoster)', from: '3B', via: ['PB'], to: '4B', sink: 'in the cab' },
      { item: 'wheel totes (basket)', from: '3A', via: ['F3R', 'W3-3', 'W3-4', 'F4R'], to: '4B', sink: 'on the hubs; empty tote back' },
      { item: 'cab on wheels', from: '4B', via: ['D4AB'], to: '4A', sink: 'test' }],
    back(ctx, t, theme, lod) {
      const s = sOf(t);
      rollers(ctx, 1840, 2310, t, lod);
      X.upper(ctx, yF, ceil, t, lod, { duct: [1960, 2290, 3.9], fans: [2230], tray: [1960, 2140, 3.3], lamps: [2000, 2200] });
      D.rect(ctx, 2158, hY(4.55), 10, hY(3.95) - 7 - hY(4.55), '#e3e7eb', '#9aa3ab', 0.8);
      D.rect(ctx, 2150, hY(3.95) - 7, 26, 9, '#c9d0d6', '#7b848c', 1);                                  // vent box (Shiba peek)
      const u = TF.mod(t - pb4.te, 24), on = u < 3.4, k = TF.ramp(u, 1.6, 3.2);
      X.liftTable(ctx, ST.B, yF, 1.6, 0.08 + 0.22 * k, lod);
      if (on) D.rect(ctx, TF.lerp(TF.PB.XU + 30, ST.B, TF.ramp(u, 0.1, 1.2)) - 42, yF - (0.13 + 0.22 * k) * M, 84, 5, '#2a2e33', '#111', 0.6);
      D.rect(ctx, 2262 - 0.4 * M - 2, hY(0.6), 0.4 * M + 14, 0.6 * M, '#2f6fb0', '#1d4570', 1); if (lod !== 'far') IT.wheels(ctx, 2262, hY(0.6), 0.4 * M);
      K.cabinet(ctx, 2280, yF - 46, 18, 46, t, 37, lod);
    },
    draw() {},
    front(ctx, t, theme, lod) {
      if (lod === 'far') return;
      const s = sOf(t), car = chain.inWindow(t, 72, 92), cx = car ? car.x : ST.B, pick = [2262, hY(0.8)];
      const hub = (ax) => [cx + ax * M, hY(0.4)];
      const go = (a, b, k) => [TF.lerp(a[0], b[0], k), TF.lerp(a[1], b[1], k)];
      let p = [2230, hY(1.1)], carry = false;
      if (s >= 8 && s < 10.5) { p = s < 8.6 ? go([2230, hY(1.1)], pick, TF.ramp(s, 8, 8.6)) : go(pick, hub(1.32), TF.ramp(s, 8.9, 10.2)); carry = s >= 8.6 && s < 10.2; }
      else if (s >= 10.5 && s < 13.3) { p = s < 11.1 ? go(hub(1.32), pick, TF.ramp(s, 10.5, 11.1)) : go(pick, hub(-1.18), TF.ramp(s, 11.4, 12.9)); carry = s >= 11.1 && s < 12.9; }
      else if (s >= 13.3 && s < 14) p = go(hub(-1.18), [2230, hY(1.1)], TF.ramp(s, 13.3, 14));
      K.arm(ctx, [2236, yF], p, { l1: 48, l2: 44, toolAng: Math.PI, bend: 1, tool: 8 });
      if (carry) IT.tireAt(ctx, p[0], p[1], 0.4 * M, { rim: '#e4c286', cover: true });
    } });

  // ================= 4A test drive + BL =================
  TF.room({ id: '4A', period: 24, box: L.roomById('4A').box,
    ports: { D4AB: 'in', 'BL-4': 'both', 'W3-4': 'pass', 'PT-4': 'pass', 'SS-4': 'spare' },
    actors: ['4A.testGate'],
    flows: [{ item: 'Cybercab (finished)', from: '4A', via: ['BL-4'], to: '1A', sink: 'final test + carrier' }, { item: 'cab', from: '4B', via: ['D4AB'], to: '4A', sink: 'tested' }],
    back(ctx, t, theme, lod) {
      const s = sOf(t);
      D.rect(ctx, 1360, yF - 3, 460, 3, '#c3c9d0');
      if (lod !== 'far') for (let x = 1380; x < 1810; x += 40) D.rect(ctx, x, yF - 2, 20, 2, '#f2c230');
      X.upper(ctx, yF, ceil, t, lod, { pipes: [1400, 1800, 3.6], valves: [1500, 1700], duct: [1400, 1800, 4.25], fans: [1620], lamps: [1500, 1700] });
      // light gate arch (scans the cab when it drives through), test screen
      D.line(ctx, [[1620, yF], [1620, hY(2.1)], [1660, hY(2.1)], [1660, yF]], '#9aa3ab', 3);
      const scan = (s >= 1.5 && s < 3.5) || (s >= 8.5 && s < 10.5);
      if (scan && lod !== 'far') { ctx.globalAlpha = 0.25; D.rect(ctx, 1622, hY(2.05), 36, 2.05 * M, '#4ade80'); ctx.globalAlpha = 1; }
      D.screen(ctx, 1720, hY(2.4), 30, 18, (x, y, w, h) => { D.circle(ctx, x + w / 2, y + h / 2, 4, s >= 11 && s < 14.2 ? '#4ade80' : '#334155'); });
      K.cabinet(ctx, 1770, yF - 48, 20, 48, t, 39, lod);
    },
    draw() {}, front() {} });

  TF.peek({ id: 'wave4E', owner: '4E', kind: 'wave', P: 103, offset: 15, dur: 5.5, x: 3650, y: hY(3.2), face: -1 });
  TF.peek({ id: 'shiba4B', owner: '4B', kind: 'shiba', P: 107, offset: 27, dur: 5, x: 2163, y: hY(3.95) - 7, face: 1 });
})(typeof window !== 'undefined' ? window : globalThis);
