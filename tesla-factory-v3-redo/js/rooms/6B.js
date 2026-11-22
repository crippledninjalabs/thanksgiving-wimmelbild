// 6B — Body weld (FACTORY-MAP §2; MOTION-REVIEW general fix 3). The 6A carrier sets the next rear quarter panel in
// the fixture; the fitter Optimus lifts it onto the frame. Four compact weld robots each own one seam zone (two hang
// from a portal gantry: roof joint + quarter top; two on floor pedestals: quarter front + sill). Tips sit exactly on
// the seam, sparks only at contact, beads stay. Spare weld tips arrive by PT capsule into the gantry tip magazine and
// the gantry robots dress their tips there between cars. Weld-count lamps light per bead; the extractor fan runs
// while welding.
(function (G) {
  const TF = G.TF, TF3 = G.TF3, R = TF3.rig, L = TF.layout, D = TF.draw, K = TF.kit, A = TF.act, M = TF.M;
  const ln = TF.line6, yF = ln.yF, hY = ln.hY, X = ln.S[1];
  const room = L.roomById('6B');
  const GY = hY(2.95);                                    // gantry beam underside
  const MAG = ln.TIPMAG;                                  // tip magazine / dresser by the gantry west leg (fed from below)
  const ARMS = [
    { j: 0, base: [X - 0.3 * M, GY], hang: true, rest: [X - 0.2 * M, hY(2.15)], toolAng: Math.PI / 2 + 0.25, bend: -1 },
    { j: 1, base: [X - 1.75 * M, GY], hang: true, rest: [X - 1.7 * M, hY(2.15)], toolAng: Math.PI / 2 - 0.2, bend: 1, dress: [5.6, 6.4] },
    { j: 2, base: [X - 2.5 * M, yF], rest: [X - 2.15 * M, hY(1.15)], toolAng: 0.1, bend: -1 },
    { j: 3, base: [X + 0.1 * M, yF], rest: [X + 0.2 * M, hY(1.05)], toolAng: Math.PI / 2 - 0.1, bend: 1 },
  ];
  const lerp2 = (a, b, u) => [TF.lerp(a[0], b[0], u), TF.lerp(a[1], b[1], u)];
  const tipOf = (a, t) => {
    const car = ln.carAtStation(t, 1), u = TF.mod(t, 12), [w0, w1] = ln.WELD[a.j];
    if (a.dress && u >= a.dress[0] - 0.4 && u < a.dress[1] + 0.4) {   // dress the tip in the gantry magazine
      const k = TF.ramp(u, a.dress[0] - 0.4, a.dress[0]) - TF.ramp(u, a.dress[1], a.dress[1] + 0.4);
      return { tip: lerp2(a.rest, [MAG[0] + (a.j ? -6 : 6), MAG[1] + 10], k), on: false, dressing: u >= a.dress[0] && u < a.dress[1] };
    }
    if (!car || car.tau >= 8.5) return { tip: a.rest, on: false };
    const s0 = ln.seamWorld(car.x, a.j, 0), s1 = ln.seamWorld(car.x, a.j, 1);
    if (u >= w0 - 0.5 && u < w0) return { tip: lerp2(a.rest, s0, TF.ramp(u, w0 - 0.5, w0)), on: false };
    if (u >= w0 && u < w1) return { tip: ln.seamWorld(car.x, a.j, TF.lin(u, w0, w1)), on: true };
    if (u >= w1 && u < w1 + 0.5) return { tip: lerp2(s1, a.rest, TF.ramp(u, w1, w1 + 0.5)), on: false };
    return { tip: a.rest, on: false };
  };
  const drawArm = (ctx, a, t, lod) => {
    const r = tipOf(a, t);
    const j = K.arm(ctx, a.base, r.tip, { l1: 38, l2: 34, toolAng: a.toolAng, bend: a.bend, hang: a.hang });
    if (lod !== 'far') {   // dress pack strapped along the links (never hangs across the car)
      const off = (p, q, s) => { const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1; return [-dy / l * s, dx / l * s]; };
      const s1 = off(j.shoulder, j.elbow, a.bend * 3.2), s2 = off(j.elbow, j.wrist, a.bend * 2.6);
      D.line(ctx, [[a.base[0], a.base[1]], [j.shoulder[0] + s1[0], j.shoulder[1] + s1[1]], [j.elbow[0] + (s1[0] + s2[0]) / 2, j.elbow[1] + (s1[1] + s2[1]) / 2], [j.wrist[0] + s2[0], j.wrist[1] + s2[1]]], '#3f4851', 1.2);
    }
    if (r.on && lod !== 'far') { K.sparks(ctx, r.tip[0], r.tip[1], t, lod, 0.8); K.wisp(ctx, r.tip[0], r.tip[1] - 4, t, 1.5, lod, 0.16, '#cfd5db', 22); }
    if (r.dressing && lod === 'near') K.sparks(ctx, r.tip[0], r.tip[1], t, lod, 0.35);
  };
  const welding = (t) => ARMS.some((a) => tipOf(a, t).on);
  const beadsDone = (t) => { const car = ln.carAtStation(t, 1); return car && car.tau < 8.5 ? car.beads.filter((b) => b >= 1).length : 0; };
  const magLevel = (t) => { const u = TF.mod(t, 12), op = TF.mod(ln.PT.tips.open[1], 12);   // spare tips in, quarter-top robot dresses once per car
    return 0.4 + 0.2 * TF.ramp(u, op, op + 0.3) - 0.2 * TF.ramp(u, 5.6, 6.4); };   // capsule tips in, one used per car (op < 5.6)

  // fitter Optimus (12 s, starts at 11.3): fixture -> car quarter, back to the fixture
  const FX = 1902, PX = ln.S[1] + ln.PIECE.quarter.c[0] * M - 0.45 * M, F0 = 11.3, QF = ln.QFIX;
  const hold = (c, o = {}) => A.reach([c[0] - 0.05, c[1] + 0.03], [c[0] - 0.2, c[1] + 0.05], Object.assign({ gripN: 0.9, gripF: 0.9, angN: 0.3, angF: 0.4 }, o));
  const pickL = A.local(FX, yF, -1, QF.c[0] + 13, QF.c[1]), carryL = [0.45, 1.05], fitL = [0.45, ln.PIECE.quarter.c[1]];
  const fsegs = [
    A.keyed(0.4, FX, -1, [[0, A.stand()], [1, hold(pickL, { lean: 0.25, gripN: 0.3, gripF: 0.3 })]]),
    A.keyed(0.4, FX, -1, [[0, hold(pickL, { lean: 0.25 })], [1, hold(carryL)]]),
    A.turn(0.3, FX, -1, () => hold(carryL)),
    ((w) => ({ d: w.d, f: (u, tl) => { const st = w.f(u, tl); st.pose = R.layer(st.pose, hold(carryL), ['handN', 'handF', 'gripN', 'gripF', 'handAngN', 'handAngF']); return st; } }))(A.walk(0.8, FX, PX, { step: 0.45 })),
    A.keyed(0.8, PX, 1, [[0, hold(carryL)], [1, hold(fitL, { lean: 0.2, head: 0.2 })]]),
    A.keyed(0.15, PX, 1, [[0, hold(fitL, { lean: 0.2 })], [1, hold(fitL, { lean: 0.2, gripN: 0, gripF: 0 })]]),
    A.turn(0.3, PX, 1),
    A.walk(0.8, PX, FX, { step: 0.45 }),
  ];
  // round 4: no idle — wipe the fixture locating pins, walk down the car and check the sill bead, walk back
  const IX = 2010, wipe = (tl) => A.reach([0.26 + 0.07 * Math.sin(tl * 9), 0.64], [0.12, 0.8], { lean: 0.42, hipY: 0.8, head: 0.4, gripN: 0.6, angN: -0.6 });
  const insp = (u) => A.reach([0.48 + 0.3 * u, 0.55], [0.3, 0.9], { lean: 0.45, hipY: 0.78, head: 0.45, gripN: 0.2, angN: -0.4 });
  fsegs.push(A.hold(2.05, FX, -1, (tl) => wipe(tl)), A.turn(0.3, FX, -1), A.walk(1.3, FX, IX, { step: 0.55 }),
    A.keyed(1.6, IX, 1, [[0, A.stand()], [0.2, insp(0)], [0.9, insp(1)], [1, A.stand()]]),
    A.turn(0.3, IX, 1), A.walk(1.3, IX, FX, { step: 0.55 }));
  fsegs.push(A.hold(12 - A.total(fsegs), FX, -1, (tl) => {   // park: tick the sill-bead gauge on the fixture (hand dips to the dial every 4 s, head follows it)
    const k = 0.5 - 0.5 * Math.cos(tl * Math.PI / 2);
    return A.reach([0.42 + 0.03 * k, 1.12 - 0.14 * k], [0.2, 0.9], { gripN: 0.3 + 0.4 * k, head: -0.1 - 0.25 * k, lean: 0.08 * k });
  }));
  const fitter = (t) => A.run(fsegs, TF.mod(t - F0, 12));
  // panel position while the fitter holds it (11.7 .. 2.0 next pitch)
  const panelOnFitter = (t) => { const u = TF.mod(t - F0, 12); return u >= 0.4 && u < 2.7; };

  TF.room({
    id: '6B', period: 12, box: room.box,
    ports: { D6AB: 'in', D6BC: 'out', F6R: 'pass', F6H: 'pass', 'PT-6': 'in' },
    actors: ['6B.robot.roof', '6B.robot.quarterTop', '6B.robot.quarterFront', '6B.robot.sill', '6B.fitter', '6B.extractor'],
    flows: [
      { item: 'body in', from: '6A', via: ['D6AB'], to: '6B', sink: 'welded here' },
      { item: 'spare weld tips (capsule)', from: 'DOCK', via: ['PT-6'], to: '6B', sink: 'used up in the tip dresser; empty capsule returns' },
      { item: 'welded body (quarter + beads)', from: '6B', via: ['D6BC'], to: '6C', sink: 'continues on the line' },
    ],
    back(ctx, t, theme, lod) {
      TF.rollers.draw(ctx, 1840, 2310, ln.rollTop, yF, ln.rollerAng(t), lod);
      // fume extractor: hood near the weld zone, duct up the back wall to the ceiling, fan runs while welding
      const DX = 2262;
      // (round 4: stays below the hanging-door path — rises to 2.95 m, then runs east into the wall chase)
      D.rect(ctx, DX - 9, hY(2.95), 18, hY(1.9) - hY(2.95), '#dfe4e8', '#9aa3ab', 1);
      D.rect(ctx, DX - 9, hY(2.95), 2310 - DX + 9, 0.3 * M, '#dfe4e8', '#9aa3ab', 1);
      D.poly(ctx, [[DX - 9, hY(1.9)], [DX + 9, hY(1.9)], [DX + 4, hY(1.4)], [DX - 26, hY(1.4)]], '#cfd5db', '#9aa3ab', 1);
      if (lod !== 'far') { const sp = K.spin(t, 12, 0.4, 2.5, [[2.3, 7.6]]); D.fan(ctx, DX, hY(2.35), 10, sp); }
      // portal gantry over the station (robots hang from it) + tip magazine fed by the PT drop tube
      D.rect(ctx, X - 2.95 * M, GY - 6, 5.9 * M, 6, '#9aa3ab', '#6d757d', 1);
      for (const x of [X - 2.95 * M, X + 2.75 * M]) D.rect(ctx, x, GY, 8, yF - GY, '#b3bac1', '#7b848c', 0.8);
      D.rect(ctx, MAG[0] - 8, MAG[1] - 9, 16, 16, '#ffffff', '#5d656d', 0.8);
      const ml = TF.clamp(magLevel(t), 0, 1); if (lod !== 'far') D.rect(ctx, MAG[0] - 6, MAG[1] + 5 - 12 * ml, 12, 12 * ml, '#c27a3a');
      // quarter-panel fixture (stand with two locating pins)
      const fc = ln.QFIX.c;
      D.rect(ctx, fc[0] - 24, fc[1] + 20, 48, 4, '#7b848c'); D.rect(ctx, fc[0] - 3, fc[1] + 24, 6, yF - fc[1] - 24, '#9aa3ab');
      for (const dx of [-18, 18]) D.rect(ctx, fc[0] + dx - 2, fc[1] + 12, 4, 9, '#2f7fd8');
      { const uu = TF.mod(t, 12); if (uu >= ln.QFIX.on[0] && uu < ln.QFIX.on[1]) ln.drawPiece(ctx, 'quarter', fc[0], fc[1], lod); }
      if (lod === 'far') return;
      K.cabinet(ctx, 2276, yF - 50, 22, 50, t, 5, lod);
      // weld-count lamps + current trace on the gantry leg screen
      const n = beadsDone(t);
      D.screen(ctx, X + 2.25 * M, hY(2.3), 22, 14, (x, y, w, h) => {
        for (let k = 0; k < 4; k++) D.circle(ctx, x + 3.5 + k * 5, y + 4, 1.8, k < n ? '#4ade80' : '#334155');
        if (welding(t)) D.rect(ctx, x + 2, y + 9, (w - 4) * (0.3 + 0.7 * TF.hash(Math.floor(t * 8))), 2.5, '#fbbf24');
      });
      ARMS.filter((a) => a.hang).forEach((a) => drawArm(ctx, a, t, lod));
      if (theme.decor.garland) theme.decor.garland(ctx, room.inner.x, room.inner.x + room.inner.w, room.inner.y, t, lod);
    },
    draw() {},
    front(ctx, t, theme, lod) {
      if (lod === 'far') return;
      const u = TF.mod(t, 12);
      ARMS.filter((a) => !a.hang).forEach((a) => drawArm(ctx, a, t, lod));
      const st = fitter(t);
      if (panelOnFitter(t)) {
        const v = TF.mod(t - F0, 12), sx = v >= 0.8 && v < 1.1 ? -Math.cos(Math.PI * (v - 0.8) / 0.3) : st.face;
        const w = (q) => [st.x + sx * (q[0] + 0.13) * M, yF - q[1] * M];
        let p = v < 0.8 ? [TF.lerp(ln.QFIX.c[0], w(carryL)[0], TF.ramp(v, 0.4, 0.8)), TF.lerp(ln.QFIX.c[1], w(carryL)[1], TF.ramp(v, 0.4, 0.8))] : w(carryL);
        if (v >= 1.9) { const k = TF.ramp(v, 1.9, 2.7), f = [ln.S[1] + ln.PIECE.quarter.c[0] * M, yF - ln.PIECE.quarter.c[1] * M]; p = [TF.lerp(w(carryL)[0], f[0], k), TF.lerp(w(carryL)[1], f[1], k)]; }
        ln.drawPiece(ctx, 'quarter', p[0], p[1], lod);
      }
      A.draw(ctx, st, yF);
    },
  });
  TF.debug6B = { tipOf, ARMS, fitter };
})(typeof window !== 'undefined' ? window : globalThis);
