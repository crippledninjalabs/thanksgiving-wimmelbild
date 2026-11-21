// 6D — Paint (FACTORY-MAP §2; cut job #4). In the booth a roof gantry arm and a side arm sweep their nozzles
// over the body front to back; the body turns from bare grey to red exactly where the spray has passed. The tank
// level drops while spraying. Every 24 s the basket brings two paint cans on F6R; the ladder Optimus carries them
// up, pours them into the tank (level rises) and puts the empties back in the basket (they ride back to the core
// and are tipped into the SS spiral slide to the dock).
(function (G) {
  const TF = G.TF, TF3 = G.TF3, R = TF3.rig, C = TF3.clips, L = TF.layout, D = TF.draw, K = TF.kit, A = TF.act, M = TF.M;
  const ln = TF.line6, yF = ln.yF, hY = ln.hY, X = ln.S[3];
  const room = L.roomById('6D');
  const BOOTH = [2905, 3195, 2.75], TANK = [2856, 2900, 2.2], FUNNEL = [2864, hY(2.32)], LADDER = 2852, OX = LADDER - 0.17 * M;
  const BASKET = [2822, hY(1.66)];
  const UP = [[2.45, 0.5], [2.36, 0.66], [2.15, 0.82], [1.6, 0.95], [1.12, 1.02], [0.7, 1.36], [0.3, 1.57], [-0.3, 1.62], [-1.0, 1.58], [-1.6, 1.46], [-2.05, 1.3], [-2.28, 1.17], [-2.4, 0.98], [-2.45, 0.5]];
  const topAt = (x) => { for (let i = 1; i < UP.length; i++) if (x >= UP[i][0]) { const [a, b] = [UP[i], UP[i - 1]]; return TF.lerp(a[1], b[1], (x - a[0]) / (b[0] - a[0])); } return 0.5; };
  // spray head position (car-local x, m): out of the way at 2.75, sweeps 2.45 -> -2.45 with the paint edge, returns
  const head = (t) => { const u = TF.mod(t, 12);
    return u < 0.8 ? TF.lerp(2.75, 2.45, TF.ramp(u, 0.3, 0.8)) : u < 7.6 ? 2.45 - 4.9 * TF.lin(u, 0.8, 7.6) : TF.lerp(-2.45, 2.75, TF.ramp(u, 7.6, 9.4)); };
  const spraying = (t) => { const u = TF.mod(t, 12); return u >= 0.8 && u < 7.6; };
  const level = (t) => { const u = TF.mod(t, 24); return 0.5 + 0.3 * TF.ramp(u, 6.8, 9.0) - 0.15 * TF.lin(u, 0.8, 7.6) - 0.15 * TF.lin(u, 12.8, 19.6); };

  // ladder Optimus (24 s)
  const climb = C.climb(0.17, 0.3);
  const onL = (k, ph) => { const p = climb.sample(Math.min(ph, 0.99999)); p.props = {}; return { p, ay: k * 0.6 + p.advanceY }; };
  const top = onL(1, 1);
  const pourPose = (u) => { const p = JSON.parse(JSON.stringify(top.p)), f = A.local(OX, yF - top.ay * M, 1, FUNNEL[0], FUNNEL[1]);
    p.handN = [f[0] - 0.02, f[1] + 0.22 - 0.06 * u]; p.gripN = 1; p.handAngN = 0.2 + 0.9 * u; p.head = 0.25; return p; };
  const basketPose = (k) => { const b = A.local(OX, yF, -1, BASKET[0], BASKET[1]); return A.reach([b[0], b[1] + 0.02 + k * 0.05], null, { lean: 0.15, gripN: 0.9 }); };
  // round 4 — no idle: after returning the empties the Optimus pulls a viscosity sample at the tank tap, reads it,
  // returns it, wipes the drip tray, then turns and reaches for the next basket as it drops in
  const TAP = A.local(OX, yF, 1, 2862, hY(0.45));
  const cupUp = A.reach([0.26, 1.38], [0.1, 1.0], { head: -0.2, gripN: 1 });
  const tapP = A.reach([TAP[0], TAP[1] + 0.05], [TAP[0] - 0.12, TAP[1] + 0.25], { lean: 0.45, hipY: 0.78, head: 0.4, gripN: 1 });
  const tray = (tl) => A.reach([0.3 + 0.1 * Math.sin(tl * 6), 0.32], [0.12, 0.55], { lean: 0.55, hipY: 0.66, head: 0.5, gripN: 0.6, angN: -0.6 });
  const readyB = (() => { const b = A.local(OX, yF, -1, BASKET[0], BASKET[1] - 18); return A.reach([b[0] - 0.05, b[1]], [b[0] - 0.2, b[1] - 0.05], { gripN: 0.2, gripF: 0.2, head: -0.2 }); })();
  const tail = [A.turn(0.3, OX, -1), A.keyed(0.7, OX, 1, [[0, A.stand()], [1, tapP]]), A.keyed(2.0, OX, 1, [[0, tapP], [0.3, cupUp], [1, cupUp]]),
    A.keyed(0.6, OX, 1, [[0, cupUp], [1, tapP]]), A.hold(2.6, OX, 1, (tl) => tray(tl)), A.keyed(0.4, OX, 1, [[0, tray(2.6)], [1, A.stand()]]),
    A.turn(0.3, OX, 1), A.keyed(1.5, OX, -1, [[0, A.stand()], [1, readyB]])];               // 15.6 .. 24.0
  const cupHeld = (t) => { const u = TF.mod(t, 24); return u >= 16.6 && u < 19.2; };
  const optimus = (t) => {
    const u = TF.mod(t, 24);
    const seg = (a, b) => u >= a && u < b;
    if (u >= 15.6) { const st = A.run(tail, u - 15.6, 0.25, false); st.ay = 0; return st; }
    if (u < 0.2) return { x: OX, face: -1, pose: readyB, ay: 0 };
    if (seg(0.2, 0.7)) return { x: OX, face: -1, pose: R.blend(readyB, basketPose(0), TF.ramp(u, 0.2, 0.7)), ay: 0 };
    if (seg(0.7, 1.2)) return { x: OX, face: -1, pose: R.blend(basketPose(0), A.reach([0.3, 1.0], null, { gripN: 0.9 }), TF.ramp(u, 0.7, 1.2)), ay: 0 };
    if (seg(1.2, 1.5)) { const k = TF.lin(u, 1.2, 1.5); return { x: OX, face: k < 0.5 ? -1 : 1, squash: 0.85 * (1 - Math.abs(Math.cos(Math.PI * k))), pose: A.reach([0.3, 1.0], null, { gripN: 0.9 }), ay: 0 }; }
    if (seg(1.5, 1.9)) { const a = onL(0, 0); return { x: OX, face: 1, pose: R.blend(A.reach([0.3, 1.0], null, { gripN: 0.9 }), a.p, TF.ramp(u, 1.5, 1.9)), ay: 0 }; }
    if (seg(1.9, 6.7)) { const q = (u - 1.9) / 2.4, k = Math.floor(q); const a = onL(k, q - k); return { x: OX, face: 1, pose: a.p, ay: a.ay }; }
    if (seg(6.7, 9.1)) { const k = TF.ramp(u, 6.7, 7.0) - TF.ramp(u, 8.8, 9.1); return { x: OX, face: 1, pose: R.blend(top.p, pourPose(TF.ramp(u, 7.0, 8.6)), k), ay: top.ay, pour: u >= 7.0 && u < 8.8 }; }
    if (seg(9.1, 13.9)) { const q = 2 - (u - 9.1) / 2.4, k = Math.min(1, Math.floor(q)); const a = onL(k, q - k); return { x: OX, face: 1, pose: a.p, ay: a.ay }; }
    if (seg(13.9, 14.3)) { const a = onL(0, 0); return { x: OX, face: 1, pose: R.blend(a.p, A.reach([0.3, 1.0], null, { gripN: 0.9 }), TF.ramp(u, 13.9, 14.3)), ay: 0 }; }
    if (seg(14.3, 14.6)) { const k = TF.lin(u, 14.3, 14.6); return { x: OX, face: k < 0.5 ? 1 : -1, squash: 0.85 * (1 - Math.abs(Math.cos(Math.PI * k))), pose: A.reach([0.3, 1.0], null, { gripN: 0.9 }), ay: 0 }; }
    if (seg(14.6, 14.9)) return { x: OX, face: -1, pose: R.blend(A.reach([0.3, 1.0], null, { gripN: 0.9 }), basketPose(0), TF.ramp(u, 14.6, 14.9)), ay: 0 };
    if (seg(14.9, 15.2)) return { x: OX, face: -1, pose: Object.assign(basketPose(0), { gripN: 0 }), ay: 0 };
    return { x: OX, face: -1, pose: R.blend(basketPose(0), A.idle(u), TF.ramp(u, 15.2, 15.6)), ay: 0 };
  };
  const cansHeld = (t) => { const u = TF.mod(t, 24); return u >= 0.7 && u < 14.9; };

  // ---------- paint kitchen on the booth roof: primer / base / clear tanks with mixers, sealer cartridge rack fed by
  // the PT capsule, level screen, feed pipes with paint blobs to the spray heads, fume duct with fans ----------
  const KD = hY(2.85), KTOP = hY(3.75);
  const TANKS = [{ x: 2958, col: '#9aa3ab', lv: () => 0.6 }, { x: 3003, col: '#c8202e', lv: (t) => level(t) }, { x: 3048, col: '#cfe8f0', lv: () => 0.7 }];
  const blobs = (ctx, pts, phase, col, on) => {   // paint moving along a pipe (only while the pump runs)
    if (!on) return; const pth = TF.track.path(pts);
    for (let s = TF.mod(phase, 14); s < pth.total; s += 14) { const q = pth.at(s); D.circle(ctx, q[0], q[1], 1.9, col); }
  };
  function kitchen(ctx, t, lod, sp) {
    D.rect(ctx, BOOTH[0] - 4, KD, BOOTH[1] - BOOTH[0] + 8, 5, '#9aa3ac', '#6d757d', 1);
    D.line(ctx, [[BOOTH[0], KD - 22], [BOOTH[1], KD - 22]], '#9aa3ac', 1.5);
    for (let x = BOOTH[0] + 2; x <= BOOTH[1]; x += 24) D.line(ctx, [[x, KD - 22], [x, KD]], '#b9c0c7', 1);
    // fume duct from the booth roof to the ceiling (Shiba peek hatch box on it)
    D.rect(ctx, 3160, L.ceilY(6), 18, KD - L.ceilY(6), '#dfe4e8', '#9aa3ab', 1);
    D.rect(ctx, 3156, hY(4.02), 26, 10, '#c9d0d6', '#7b848c', 1);
    const fan = K.spin(t, 12, 0.4, 2.5, [[0.8, 7.6]]);
    if (lod !== 'far') { D.fan(ctx, 3169, hY(3.45), 10, fan); D.fan(ctx, 3169, hY(4.65), 10, fan + 0.5); }
    // floor tank -> base tank transfer pipe (pumps while the booth sprays)
    K.pipe(ctx, [[TANK[1] - 6, hY(1.8)], [2912, hY(1.8)], [2912, hY(3.25)], [TANKS[1].x - 16, hY(3.25)]], '#a33', 3.5, null, lod);
    if (lod !== 'far') blobs(ctx, [[TANK[1] - 6, hY(1.8)], [2912, hY(1.8)], [2912, hY(3.25)], [TANKS[1].x - 16, hY(3.25)]], t * 40, '#ff6b6b', sp);
    for (const tk of TANKS) {
      const a = K.spin(t, 12, 0.2, 1.5, [[0.8, 7.6]]);
      // feed pipe down through the booth roof to the head rail
      K.pipe(ctx, [[tk.x, KD], [tk.x, hY(BOOTH[2] - 0.15)]], tk.col === '#cfe8f0' ? '#8fb7c4' : P(tk.col), 3, null, lod);
      if (lod !== 'far') blobs(ctx, [[tk.x, KD], [tk.x, hY(BOOTH[2] - 0.15)]], t * 30, tk.col, sp && tk.col === '#c8202e');
      D.rect(ctx, tk.x - 15, KTOP, 30, KD - KTOP, '#e8ecef', '#7b848c', 1.2);
      D.rect(ctx, tk.x - 8, KTOP - 8, 16, 8, '#5f6b77', '#3f4851', 0.8);                       // mixer motor
      D.line(ctx, [[tk.x, KTOP], [tk.x, KD - 10]], '#5d656d', 1.2);
      const lv = tk.lv(t), wy = KTOP + 6, wh = KD - KTOP - 12;
      D.rect(ctx, tk.x - 11, wy, 22, wh, '#ffffff', '#9aa3ab', 0.6);
      D.rect(ctx, tk.x - 11, wy + wh * (1 - lv), 22, wh * lv, tk.col);
      if (lod !== 'far') D.line(ctx, [[tk.x - 9 * Math.cos(a), KD - 12], [tk.x + 9 * Math.cos(a), KD - 12]], '#3f4851', 2);   // paddle
    }
    // sealer / primer cartridge rack under the PT-6 receiver (+1 cartridge per capsule, used one per car)
    const op = ln.PT.sealer.open, u24 = TF.mod(t, 24), lid = TF.pulse(u24, op[0], op[1], 0.15);
    const R0 = ln.PT.sealer.x;
    D.rect(ctx, R0 - 9, ln.PT.sealer.end, 18, 12, '#dfe4e8', '#7b848c', 1);
    D.rect(ctx, R0 - 9, ln.PT.sealer.end - 2 - lid * 5, 18, 3, '#7b848c');
    const n = 3 + (u24 >= op[0] + 0.4 ? 2 : 0) - (u24 >= 3 ? 1 : 0) - (u24 >= 15 ? 1 : 0);
    if (lod !== 'far') for (let i = 0; i < n; i++) D.rect(ctx, R0 - 10 + i * 5, KD - 13, 4, 12, '#8a939b', '#4a5056', 0.6);
    // level screen: one bar per tank
    D.rect(ctx, 3090, KD - 30, 3, 30, '#7b848c');
    D.screen(ctx, 3080, KD - 46, 26, 18, (x, y, w, h) => TANKS.forEach((tk, i) => { const lv = tk.lv(t); D.rect(ctx, x + 3 + i * 8, y + h - 2 - (h - 5) * lv, 5, (h - 5) * lv, tk.col === '#cfe8f0' ? '#7dd3fc' : tk.col === '#9aa3ab' ? '#cbd5e1' : '#f87171'); }));
  }
  const P = (c) => D.mix(c, '#000000', 0.25);

  TF.room({
    id: '6D', period: 24, box: room.box,
    ports: { D6CD: 'in', D6DE: 'out', F6R: 'both', 'W3-6': 'both', 'SS-6': 'out', 'PT-6': 'in' },
    actors: ['6D.ladderOptimus', '6D.topArm', '6D.sideArm', '6D.tank', '6D.kitchen', 'peek.shiba6D'],
    flows: [
      { item: 'sealer cartridges (capsule)', from: 'DOCK', via: ['PT-6'], to: '6D', sink: 'used by the booth; empty capsule returns' },
      { item: 'paint cans (basket)', from: 'DOCK', via: ['W3-6', 'F6R'], to: '6D', sink: 'poured into the tank' },
      { item: 'empty paint cans', from: '6D', via: ['F6R', 'W3-6', 'SS-6'], to: 'DOCK', sink: 'parts-truck backload' },
      { item: 'red body', from: '6D', via: ['D6DE'], to: '6E', sink: 'continues on the line' },
    ],
    back(ctx, t, theme, lod) {
      TF.rollers.draw(ctx, 2800, 3270, ln.rollTop, yF, ln.rollerAng(t), lod);
      // booth shell (back wall + roof)
      D.rect(ctx, BOOTH[0], hY(BOOTH[2]), BOOTH[1] - BOOTH[0], BOOTH[2] * M, '#f6f0ef', '#c9b8b6', 1.5);
      D.rect(ctx, BOOTH[0] - 4, hY(BOOTH[2]) - 6, BOOTH[1] - BOOTH[0] + 8, 8, '#b9aeb0');
      if (lod !== 'far') for (let x = BOOTH[0] + 20; x < BOOTH[1]; x += 30) D.line(ctx, [[x, yF - 2], [x + 12, yF - 2]], '#d7c9c7', 2);   // floor grate
      // tank with level window, pipe to the booth arms
      const lv = level(t);
      D.rect(ctx, TANK[0], hY(TANK[2]), TANK[1] - TANK[0], TANK[2] * M, '#d5dade', '#7b848c', 1.4);
      D.rect(ctx, TANK[0] + 14, hY(TANK[2] - 0.2), 16, (TANK[2] - 0.5) * M, '#ffffff', '#7b848c', 0.8);
      const wh = (TANK[2] - 0.5) * M; D.rect(ctx, TANK[0] + 14, hY(TANK[2] - 0.2) + wh * (1 - lv), 16, wh * lv, ln.PIECE && '#c8202e');
      D.poly(ctx, [[FUNNEL[0] - 8, FUNNEL[1] - 4], [FUNNEL[0] + 8, FUNNEL[1] - 4], [FUNNEL[0] + 3, hY(TANK[2])], [FUNNEL[0] - 3, hY(TANK[2])]], '#9aa3ab', '#5d656d', 1);
      const sp = spraying(t);
      K.pipe(ctx, [[TANK[1], hY(0.3)], [BOOTH[0] + 10, hY(0.3)], [BOOTH[0] + 10, hY(BOOTH[2] - 0.15)], [BOOTH[1] - 10, hY(BOOTH[2] - 0.15)]], '#a33', 4, sp ? t * 60 : null, lod, '#ffd0d0');
      K.ladder(ctx, LADDER, yF, TANK[2] + 0.15);
      if (lod === 'far') return;
      // roof gantry arm (behind the body): carriage follows the paint edge, nozzle aimed down at the body
      const xl = head(t), wx = X + xl * M, ny = yF - (topAt(xl) + 0.32) * M;
      D.line(ctx, [[BOOTH[0] + 10, hY(BOOTH[2] - 0.15)], [BOOTH[1] - 10, hY(BOOTH[2] - 0.15)]], '#6f7983', 3);
      D.rect(ctx, wx - 9, hY(BOOTH[2] - 0.15) - 4, 18, 8, '#4f5861');
      D.line(ctx, [[wx, hY(BOOTH[2] - 0.15)], [wx, ny - 6]], '#dfe4e8', 8);
      D.poly(ctx, [[wx - 4, ny - 6], [wx + 4, ny - 6], [wx + 2, ny], [wx - 2, ny]], '#3a3f45');
      if (sp) { ctx.globalAlpha = 0.35; D.poly(ctx, [[wx - 2, ny], [wx + 2, ny], [wx + 14, ny + 15], [wx - 14, ny + 15]], '#e04848'); ctx.globalAlpha = 1; }
      kitchen(ctx, t, lod, sp);
      K.cabinet(ctx, 3204, hY(0.95), 22, 47, t, 11, lod);
      if (sp && lod !== 'far') { ctx.globalAlpha = 0.05 + 0.02 * Math.sin(t * Math.PI); D.rect(ctx, BOOTH[0] + 4, hY(BOOTH[2]) + 4, BOOTH[1] - BOOTH[0] - 8, BOOTH[2] * M - 8, '#e04848'); ctx.globalAlpha = 1; }
      if (theme.decor.garland) theme.decor.garland(ctx, room.inner.x, room.inner.x + room.inner.w, room.inner.y, t, lod);
    },
    draw() {},
    front(ctx, t, theme, lod) {
      // booth front glass
      ctx.globalAlpha = 0.12; D.rect(ctx, BOOTH[0], hY(BOOTH[2]), BOOTH[1] - BOOTH[0], BOOTH[2] * M, '#d98c8c'); ctx.globalAlpha = 1;
      D.line(ctx, [[BOOTH[0], yF], [BOOTH[0], hY(BOOTH[2])]], '#b9aeb0', 4); D.line(ctx, [[BOOTH[1], yF], [BOOTH[1], hY(BOOTH[2])]], '#b9aeb0', 4);
      if (lod === 'far') return;
      // side spray mast (in front): carriage on a floor rail follows the paint edge, nozzle aimed at the body side
      const sp = spraying(t), xl = head(t), mx = X + xl * M + 6;
      D.rect(ctx, BOOTH[0] + 8, yF - 5, BOOTH[1] - BOOTH[0] - 16, 5, '#6f7983');
      D.rect(ctx, mx - 8, yF - 12, 16, 8, '#4f5861');
      D.line(ctx, [[mx, yF - 12], [mx, hY(0.95)]], '#dfe4e8', 8);
      D.poly(ctx, [[mx - 2, hY(0.84)], [mx - 9, hY(0.81)], [mx - 9, hY(0.77)], [mx - 2, hY(0.74)]], '#3a3f45');
      if (sp) { ctx.globalAlpha = 0.3; D.poly(ctx, [[mx - 9, hY(0.8)], [mx - 22, hY(1.0)], [mx - 22, hY(0.58)]], '#e04848'); ctx.globalAlpha = 1; }
      // ladder Optimus + cans
      const o = optimus(t), y = yF - o.ay * M, fig = A.draw(ctx, o, y);
      if (cupHeld(t)) { const w = fig.w(fig.sk.wristN), up = TF.mod(t, 24) > 17.0 && TF.mod(t, 24) < 18.9;
        D.poly(ctx, [[w[0] + 1, w[1] - 4], [w[0] + 7, w[1] - 4], [w[0] + 6, w[1] + 2], [w[0] + 2, w[1] + 2]], '#e5e7eb', '#5d656d', 0.6);
        if (up && lod === 'near') D.line(ctx, [[w[0] + 4, w[1] + 2], [w[0] + 4, w[1] + 6 + 4 * Math.abs(Math.sin(t * Math.PI * 2))]], '#c8202e', 0.9); }   // viscosity cup draining
      if (cansHeld(t)) {
        const w = fig.w(fig.sk.wristN), tilt = o.pour ? -o.face * 1.1 * TF.pulse(TF.mod(t, 24), 7.0, 8.8, 0.4) : 0;
        ln.drawCan(ctx, w[0] - 6, w[1] + 15, TF.mod(t, 24) < 7.4, lod, tilt); ln.drawCan(ctx, w[0] + 6, w[1] + 15, TF.mod(t, 24) < 8.2, lod, tilt);
        D.line(ctx, [[w[0] - 8, w[1] + 3], [w[0] + 8, w[1] + 3]], '#5d656d', 1);
        if (o.pour && TF.mod(t, 24) > 7.3 && TF.mod(t, 24) < 8.6) D.line(ctx, [[w[0] + 10, w[1] + 8], [FUNNEL[0], FUNNEL[1] - 2]], '#c8202e', 2.2);
      }
    },
  });
  TF.peek({ id: 'shiba6D', owner: '6D', kind: 'shiba', P: 73, offset: 5, dur: 5, x: 3169, y: hY(4.02), face: -1 });
  TF.debug6D = { optimus, level };
})(typeof window !== 'undefined' ? window : globalThis);
