// 6C — Doors + hood (FACTORY-MAP §2). The F6H hanger drops in over the body; ONE Optimus (round 4) works the whole
// 12 s pitch: rear door off the hook -> hang -> bolt, step forward, front door -> hang -> bolt, step, hood -> hang ->
// bolt, gap check, walk back as the body leaves and reach for the next hanger. The nut-runner rides a balancer trolley
// on the air header and follows it.
// Bolts arrive by pneumatic-tube capsule (PT-6) into the feeder on the west wall and run down the feeder hoses.
(function (G) {
  const TF = G.TF, TF3 = G.TF3, R = TF3.rig, L = TF.layout, D = TF.draw, K = TF.kit, A = TF.act, M = TF.M;
  const ln = TF.line6, yF = ln.yF, hY = ln.hY, X = ln.S[2];
  const room = L.roomById('6C'), FD = ln.FEEDER;
  const PC = ln.PIECE;
  const hang = { rearDoor: [X - 36, hY(1.6)], frontDoor: [X + 26, hY(1.6)], hood: [X + 82.5, hY(1.45)] };   // = hanger positions at 6C
  const fit = (n) => [X + PC[n].c[0] * M, yF - PC[n].c[1] * M];
  const P1 = 2528, P2 = 2595, P3 = 2622;   // standing spots: rear door, front door, hood

  // hands relative to the piece centre while holding it (figure-local metres)
  const holdPose = (x0, piece, c, o = {}) => { // c = piece centre in world
    const l = A.local(x0, yF, 1, c[0], c[1]);
    const n = piece === 'hood' ? [l[0] - 0.12, l[1] - 0.02] : [l[0] + 0.12, l[1] - 0.3], f = piece === 'hood' ? [l[0] - 0.3, l[1] + 0.0] : [l[0] - 0.04, l[1] - 0.24];
    const low = Math.max(0, 1.25 - n[1]);
    return A.reach(n, f, Object.assign({ lean: 0.08 + low * 0.45, hipY: 0.9 - low * 0.06, head: 0.1 + low * 0.3, angN: 0.4, angF: 0.6 }, o));
  };
  const boltPose = (x0, hinge, free) => { const h = A.local(x0, yF, 1, hinge[0], hinge[1]);
    return A.reach(h, free, { lean: 0.28, hipY: 0.87, head: 0.35, angN: -0.1, angF: 0.3 }); };
  const toLocal = (x0, p) => A.local(x0, yF, 1, p[0], p[1]);

  // piece centre along its route (hanger -> hands -> fitted), tau in the 12 s pitch
  const route = (n, g0, f1) => (u) => (u < g0 ? hang[n] : u < f1 ? [TF.lerp(hang[n][0], fit(n)[0], TF.ramp(u, g0, f1)), TF.lerp(hang[n][1], fit(n)[1], TF.ramp(u, g0, f1))] : fit(n));
  const F = ln.FIT, TK = ln.TAKE;
  const rearC = route('rearDoor', TK.rearDoor, F.rearDoor), frontC = route('frontDoor', TK.frontDoor, F.frontDoor), hoodC = route('hood', TK.hood, F.hood);
  const HINGE = { rear: [X - 0.12 * M, hY(0.95)], front: [X + 1.12 * M, hY(0.95)], hood: [X + 1.3 * M, hY(1.0)] };
  const BOLT = { rearDoor: 'boltRear', frontDoor: 'boltFront', hood: 'boltHood' };
  // one station = reach to the hanging part, lower it into the opening, swing the nut-runner onto the hinge, run the bolts
  const station = (x0, n, c, hinge, free, t0) => {
    const bp = () => boltPose(x0, hinge, toLocal(x0, free));
    return [
      A.keyed(TK[n] - t0, x0, 1, [[0, A.stand()], [1, holdPose(x0, n, hang[n], { gripN: 0.3, gripF: 0.3 })]]),
      { d: F[n] - TK[n], f: (u, tl) => ({ x: x0, face: 1, pose: holdPose(x0, n, c(TK[n] + tl)) }) },
      A.keyed(0.2, x0, 1, [[0, holdPose(x0, n, fit(n))], [1, bp()]]),
      A.hold(F[BOLT[n]] - F[n] - 0.2, x0, 1, (tl) => { const p = bp(); p.handN[1] += 0.004 * Math.sin(tl * 40); return p; }),
      A.keyed(0.2, x0, 1, [[0, bp()], [1, A.stand()]]),
    ];
  };
  const gap = (u) => A.reach([0.2 + 0.32 * u, 0.98 - 0.05 * u], null, { lean: 0.22, head: 0.3, gripN: 0.2, angN: -0.3 });
  const ready = A.reach([0.12, 1.42], [0.0, 1.4], { gripN: 0.2, gripF: 0.2, head: -0.15 });
  const segs = [
    ...station(P1, 'rearDoor', rearC, HINGE.rear, [fit('rearDoor')[0] + 4, hY(1.05)], 0),            // 0.0 .. 2.2
    A.walk(0.8, P1, P2, { step: 0.5 }),                                                             // 2.2 .. 3.0
    ...station(P2, 'frontDoor', frontC, HINGE.front, [fit('frontDoor')[0] + 8, hY(1.05)], 3.0),     // 3.0 .. 5.2
    A.walk(0.5, P2, P3, { step: 0.3 }),                                                             // 5.2 .. 5.7
    ...station(P3, 'hood', hoodC, HINGE.hood, [X + 1.75 * M, hY(0.93)], 5.7),                       // 5.7 .. 8.0
    A.keyed(0.5, P3, 1, [[0, A.stand()], [0.3, gap(0)], [0.85, gap(1)], [1, A.stand()]]),          // 8.0 .. 8.5 gap check
    A.turn(0.3, P3, 1), A.walk(2.2, P3, P1, { step: 0.6 }), A.turn(0.3, P1, -1),                    // 8.5 .. 11.3
  ];
  segs.push(A.keyed(12 - A.total(segs), P1, 1, [[0, A.stand()], [1, ready]]));                      // 11.3 .. 12 reach up as the hanger lands
  const opt = (t) => A.run(segs, TF.mod(t, 12));
  const bolting = (t) => { const u = TF.mod(t, 12); return [u >= F.rearDoor + 0.2 && u < F.boltRear, u >= F.frontDoor + 0.2 && u < F.boltFront, u >= F.hood + 0.2 && u < F.boltHood]; };
  const inHand = (t) => { const u = TF.mod(t, 12); return (u >= F.rearDoor && u < F.boltRear + 0.2) || (u >= F.frontDoor && u < F.boltFront + 0.2) || (u >= F.hood && u < F.boltHood + 0.2); };
  // feeder hopper bolt count (+6 per capsule at BOLTS_IN, -2 per hinge set)
  const bolts = (t) => { const u = TF.mod(t, 12); return 8 - (u > ln.FIT.boltFront ? 2 : 0) - (u > ln.FIT.boltRear ? 2 : 0) - (u > ln.FIT.boltHood ? 2 : 0) + (u > ln.BOLTS_IN ? 6 : 0); };

  const driver = (ctx, wrist, ang, spin, lod) => { // auto-feed nut driver in the near hand
    ctx.save(); ctx.translate(wrist[0], wrist[1]); ctx.rotate(ang);
    D.rect(ctx, -2, -3, 12, 6, '#2f6fb0', '#1d4570', 0.8); D.rect(ctx, 10, -1.5, 5, 3, '#9aa3ab');
    if (spin && lod === 'near') D.line(ctx, [[15, -3], [15, 3]], '#ffffff', 1);
    ctx.restore();
  };
  const AY = hY(2.62);
  function drawOpt(ctx, st, t, lod, holding, bolt) {
    if (holding) { const c = holding.c(TF.mod(t, 12)); ln.drawPiece(ctx, holding.n, c[0], c[1], lod); }
    const fig = A.draw(ctx, st, yF);
    const w = fig.w(fig.sk.wristN), e = fig.w(fig.sk.elbowN), tx = st.x - 12;
    // nut-runner on its balancer trolley: in the hand while hanging/bolting, otherwise parked on the balancer cord
    const held = inHand(t), dp = held ? w : [tx, hY(1.3)];
    if (lod !== 'far') { D.rect(ctx, tx - 5, AY - 3, 10, 6, '#4f5861'); K.cable(ctx, [tx, AY + 3], [dp[0], dp[1] - 3], t, 4, 6, 1.2, '#2b2f34', 1); }
    driver(ctx, dp, held ? Math.atan2(w[1] - e[1], w[0] - e[0]) : Math.PI / 2, bolt, lod);
    return w;
  }

  TF.room({
    id: '6C', period: 12, box: room.box,
    ports: { D6BC: 'in', D6CD: 'out', F6H: 'both', 'PT-6': 'in', F6R: 'pass' },
    actors: ['6C.optimus', '6C.feeder', 'peek.hardhat6C', 'peek.shiba6C'],
    flows: [
      { item: 'bolts (capsule)', from: 'DOCK', via: ['PT-6'], to: '6C', sink: 'bolted into hinges; empty capsule whooshes back' },
      { item: 'empty hanger', from: '6C', via: ['F6H'], to: '6A', sink: 'closed loop' },
      { item: 'body with doors + hood', from: '6C', via: ['D6CD'], to: '6D', sink: 'continues on the line' },
    ],
    back(ctx, t, theme, lod) {
      TF.rollers.draw(ctx, 2320, 2790, ln.rollTop, yF, ln.rollerAng(t), lod);
      if (lod === 'far') return;
      // bolt feeder (PT receiver + hopper) on the west wall, hose run along the floor
      const u = TF.mod(t, 12), po = ln.PT.bolts.open, open = TF.pulse(u, TF.mod(po[0], 12), TF.mod(po[1], 12), 0.15);
      D.rect(ctx, FD[0] - 14, FD[1] - 10, 28, 22, '#dfe4e8', '#7b848c', 1.2);
      D.rect(ctx, FD[0] - 14, FD[1] - 10 - open * 6, 28, 4, '#7b848c');
      D.poly(ctx, [[FD[0] - 12, FD[1] + 12], [FD[0] + 12, FD[1] + 12], [FD[0] + 6, FD[1] + 30], [FD[0] - 6, FD[1] + 30]], '#c3c9d0', '#7b848c', 1);
      const n = bolts(t);
      if (lod === 'near') for (let i = 0; i < n; i++) D.circle(ctx, FD[0] - 9 + (i % 5) * 4.5, FD[1] + 8 - Math.floor(i / 5) * 4, 1.8, '#4a5056');
      D.rect(ctx, FD[0] - 2, FD[1] + 30, 4, yF - FD[1] - 30, '#8a939b');
      const bi = ln.BOLTS_IN - 0.15;
      if (lod === 'near' && u >= bi && u < bi + 0.5) for (let i = 0; i < 6; i++) { const k = TF.lin(u, bi + i * 0.03, bi + 0.15 + i * 0.03); if (k > 0 && k < 1) D.circle(ctx, FD[0] - 4 + i * 1.5, FD[1] - 4 + k * 12, 1.6, '#4a5056'); }
      // compressed-air header for the nut drivers: pressure dips while a driver runs; drops to each station
      const b = bolting(t), dip = (b[0] || b[1] || b[2]) ? 0.25 + 0.1 * Math.sin(t * 20) : 0;
      K.pipe(ctx, [[2322, AY], [2778, AY]], '#4f7fb0', 5, null, lod);
      K.gauge(ctx, 2360, AY + 12, 6, 0.75 - dip, lod);
      // torque controller screen: a spike per bolt as each hinge is tightened, green lamps when a hinge set is done
      D.screen(ctx, 2385, hY(2.42), 34, 18, (x, y, w, h) => {
        ctx.beginPath(); for (let i = 0; i <= 30; i++) { const tt = t - 3 + i * 0.1, bb = bolting(tt), on = bb[0] || bb[1] || bb[2];
          const yy = y + h - 7 - (on ? 6 * Math.abs(Math.sin(tt * 9)) : 0); i ? ctx.lineTo(x + i * w / 30, yy) : ctx.moveTo(x, yy); }
        ctx.strokeStyle = '#60a5fa'; ctx.lineWidth = 0.9; ctx.stroke();
        const car = ln.carAtStation(t, 2), done = car && car.tau < 8.5 ? car.bolts : [0, 0, 0];
        done.forEach((d, k) => D.circle(ctx, x + 6 + k * 8, y + h - 3, 1.8, d ? '#4ade80' : '#334155'));
      });
      // status cabinet (background life, behind the car line)
      K.cabinet(ctx, 2366, hY(0.92), 20, 46, t, 7, lod);
      // supply-air duct along the upper wall: fan box pushes fresh air to the bolting stations and out of the east vent
      D.rect(ctx, 2322, hY(3.04), 425, 10, '#e3e7eb', '#9aa3ab', 1);
      D.rect(ctx, 2700, hY(3.17), 30, 22, '#c9d0d6', '#7b848c', 1);
      if (lod !== 'far') { D.fan(ctx, 2715, hY(2.95), 8, K.spin(t, 12, 0.6)); for (const x of [P1, P2 + 20]) D.poly(ctx, [[x - 8, hY(2.84)], [x + 8, hY(2.84)], [x + 5, hY(2.77)], [x - 5, hY(2.77)]], '#cfd5db', '#9aa3ab', 0.8); }
      // high wall vent (Shiba peek) near the east wall
      D.rect(ctx, 2745, hY(3.17), 30, 9, '#c9d0d6', '#7b848c', 1);
      for (let k = 0; k < 4; k++) D.line(ctx, [[2749 + k * 7, hY(3.17) + 2], [2749 + k * 7, hY(3.17) + 7]], '#7b848c', 1);
      if (theme.decor.garland) theme.decor.garland(ctx, room.inner.x, room.inner.x + room.inner.w, room.inner.y, t, lod);
    },
    draw() {},
    front(ctx, t, theme, lod) {
      if (lod === 'far') return;
      const u = TF.mod(t, 12), b = bolting(t);
      const holding = u >= TK.rearDoor && u < F.rearDoor ? { n: 'rearDoor', c: rearC } : u >= TK.frontDoor && u < F.frontDoor ? { n: 'frontDoor', c: frontC } : u >= TK.hood && u < F.hood ? { n: 'hood', c: hoodC } : null;
      drawOpt(ctx, opt(t), t, lod, holding, b[0] || b[1] || b[2]);
    },
  });
  TF.peek({ id: 'hardhat6C', owner: '6C', kind: 'hardhat', P: 43, offset: 13, dur: 3.5, x: 2655, y: hY(2.62) - 3 });
  TF.peek({ id: 'shiba6C', owner: '6C', kind: 'shiba', P: 59, offset: 31, dur: 5, x: 2760, y: hY(3.17), face: -1 });
  TF.debug6C = { opt, segs };
})(typeof window !== 'undefined' ? window : globalThis);
