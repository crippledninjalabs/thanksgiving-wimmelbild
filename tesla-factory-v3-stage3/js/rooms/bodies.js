// TF.bodies — LOOKS ONLY for the other vehicles, staged like the floor-6 body-in-white (biw.js): open structure,
// bare metal (aluminium / stainless / frame steel), stamped panels added stage by stage, weld beads, glass, pack,
// wheels last. draw*(ctx, x, yFloor, st, lod): (x, yFloor) = world point under the vehicle centre on the floor.
//   cab  (Cybercab, GOLD):  castF, castR, ring, beads 0..1, paint 0..1 (gold sweep), seats, screen, door, doorOpen 0..1, pack, wheels, lit
//   ct   (Cybertruck):      floor, front, side, bed, roof (frame), beads 0..1, stack (panels still on the cart), glass, crack, pack, wheels, lit
//   semi (Tesla Semi):      frame, motors, pack, cab, wheels, lit, wheelAng
//   my   (Model Y finished) -> TF.biw.drawBody with TF.biw.finishedMY
(function (G) {
  const TF = G.TF, TF3 = G.TF3, P = TF3.paint, M = TF.M, D = TF.draw;
  const B = TF.biw, PAL = B.PAL;
  const V = (TF.bodies = {});
  const path = (ctx, pts) => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); };
  const panel = (ctx, pts, pal, arches) => B.noArchesAt(ctx, arches || [], () => {
    path(ctx, pts); ctx.fillStyle = B.grad(ctx, pal.panelTop, pal.panelBot); ctx.fill(); ctx.strokeStyle = pal.edge; ctx.lineWidth = 0.014; ctx.stroke(); });
  const bead = (ctx, pts, u, painted) => { if (u <= 0) return; const p = TF.track.path(pts), q = [];
    for (let s = 0; s <= p.total * u + 1e-9; s += p.total / 16) q.push(p.at(s)); q.push(p.at(p.total * u));
    P.line(ctx, q, painted ? '#8a6a2e' : '#3f454b', 0.035); };
  const wheelsAt = (ctx, arches, r, st, lod, cover) => arches.forEach(([x, wr]) => {
    const rad = wr || r;
    B.wheel(ctx, [x, rad], rad, st.wheelAng || 0, lod, cover ? '#e4c286' : '#9aa1a8');
    if (cover) P.circle(ctx, [x, rad], rad * 0.62, '#e4c286', '#bf9a5e', 0.8); });
  V.GOLD = { top: '#ecc98f', bot: '#c39352', panelTop: '#f0d29c', panelBot: '#c49756', inner: '#8a6a3a', far: '#6f5530', edge: '#7a5a2a', hi: '#fff1c9', dot: '#a8803f' };
  V.STEEL = { top: '#e3e6e9', bot: '#a9b0b6', panelTop: '#eceff1', panelBot: '#b0b7bd', inner: '#7f878f', far: '#6b737b', edge: '#5a6168', hi: '#ffffff', dot: '#8e959c' };

  // ---------------- Cybercab (~4.2 m). Real production profile: low two-seat coupe, smooth teardrop/fastback
  // roofline sloping to a short truncated tail, no rear window, no side mirrors, no roof sensor pod.
  // Oversized rear wheels (21") vs front (18"), gold aero covers, full-width light bars.
  const CAB = {
    arches: [[1.32, 0.38, 0.44], [-1.18, 0.44, 0.50]],
    castF: [[0.95, 0.34], [1.95, 0.34], [2.10, 0.42], [2.14, 0.56], [2.02, 0.68], [1.55, 0.78], [1.15, 0.88], [0.95, 0.88]],
    castR: [[-0.90, 0.36], [-1.85, 0.36], [-2.04, 0.40], [-2.10, 0.52], [-2.08, 0.86], [-1.72, 1.00], [-1.25, 1.16], [-0.90, 1.22]],
    ring: { sill: [[0.95, 0.40], [-0.90, 0.40]], a: [[1.15, 0.88], [0.68, 1.26]], roof: [[0.68, 1.26], [0.32, 1.36], [-0.28, 1.32], [-0.90, 1.22]], b: [[-0.48, 0.42], [-0.52, 1.24]] },
    door: [[0.95, 0.44], [-0.46, 0.44], [-0.50, 1.22], [-0.12, 1.30], [0.48, 1.28], [1.04, 0.92], [0.95, 0.90]],
    win: [[0.70, 0.94], [-0.40, 0.96], [-0.46, 1.18], [-0.08, 1.26], [0.46, 1.24]],
    hinge: [0.58, 1.30],
    seams: [[[0.95, 0.44], [1.12, 0.88]], [[-0.90, 0.44], [-0.90, 1.20]], [[0.68, 1.26], [-0.90, 1.22]]],
  };
  V.CAB = CAB;
  V.cab = (ctx, x, y, st, lod) => {
    P.begin(ctx, x, y, M, 1);
    const draw = (pal) => {
      if (st.ring) { P.poly(ctx, [[-1.0, 0.45], [1.0, 0.45], [1.0, 0.55], [-1.0, 0.55]], pal.inner, pal.edge, 0.6);   // floor pan
        P.line(ctx, [[0.9, 0.5], [0.9, 0.92]], pal.inner, 0.04); }
      if (st.seats) { P.poly(ctx, [[-0.3, 0.56], [0.12, 0.56], [0.06, 1.15], [-0.26, 1.18]], '#3d3935', '#111', 0.6); P.poly(ctx, [[-0.22, 1.2], [0.02, 1.2], [0.0, 1.3], [-0.2, 1.3]], '#3d3935', null); }
      if (st.screen) P.poly(ctx, [[0.78, 0.96], [0.94, 0.95], [0.94, 1.06], [0.78, 1.07]], st.screen > 0.5 ? '#7dd3fc' : '#1f2937', null);
      if (st.castF) panel(ctx, CAB.castF, pal, CAB.arches);
      if (st.castR) panel(ctx, CAB.castR, pal, CAB.arches);
      if (st.ring) for (const k in CAB.ring) B.member(ctx, CAB.ring[k], k === 'roof' ? 0.075 : 0.07, pal);
      if (st.door) P.at(ctx, CAB.hinge, (st.doorOpen || 0) * 1.25, () => { ctx.save(); ctx.translate(-CAB.hinge[0], -CAB.hinge[1]);
        panel(ctx, CAB.door, pal); ctx.globalAlpha = 0.8; P.poly(ctx, CAB.win, '#22292f', null); ctx.globalAlpha = 1; ctx.restore(); });
    };
    draw(st.castF && st.paint >= 1 ? V.GOLD : PAL.metal);
    if (st.paint > 0 && st.paint < 1) { const xm = 2.25 - st.paint * 4.5; ctx.save(); ctx.beginPath(); ctx.rect(xm, -1, 6, 4); ctx.clip(); draw(V.GOLD); ctx.restore(); }
    if (lod !== 'far') CAB.seams.forEach((sm, j) => bead(ctx, sm, st.beads === undefined ? 0 : TF.clamp(st.beads * 3 - j, 0, 1), st.paint > 0));
    if (st.wheels) wheelsAt(ctx, CAB.arches, 0.38, st, lod, true);
    if (st.lit && lod !== 'far') { P.line(ctx, [[2.12, 0.62], [1.70, 0.66]], '#f8fafc', 0.045); P.line(ctx, [[-2.08, 0.84], [-1.55, 0.84]], '#ef4444', 0.05); }
    if (st.paint >= 1 && lod !== 'far') { ctx.globalAlpha = 0.45; P.line(ctx, [[0.45, 1.28], [-0.70, 1.20]], '#ffffff', 0.025); ctx.globalAlpha = 1; }
    P.end(ctx);
  };
  V.finishedCab = { castF: 1, castR: 1, ring: 1, beads: 1, paint: 1, seats: 1, screen: 1, door: 1, doorOpen: 0, pack: 1, wheels: 1, lit: 1 };

  // ---------------- Cybertruck (5.68 m, wheel r 0.44, axles +1.91 / -1.90) ----------------
  const CT = {
    arches: [[1.91, 0.44, 0.52], [-1.9, 0.44, 0.52]],
    floor: [[2.6, 0.45], [-2.6, 0.45], [-2.72, 0.6], [2.72, 0.6]],
    front: [[2.84, 0.55], [2.84, 0.95], [2.3, 1.05], [1.6, 1.13], [1.5, 0.6], [2.72, 0.6]],
    side: [[1.5, 0.6], [-0.6, 0.6], [-0.6, 1.26], [1.5, 1.13]],
    bed: [[-0.6, 0.6], [-2.72, 0.6], [-2.84, 0.62], [-2.84, 1.12], [-0.6, 1.6]],
    roof: { a: [[1.6, 1.13], [0.25, 1.79]], c: [[0.25, 1.79], [-0.6, 1.6]], belt: [[1.5, 1.14], [-0.6, 1.26]] },
    glass: [[1.48, 1.17], [0.27, 1.75], [-0.55, 1.58], [-0.55, 1.29]],
    seams: [[[1.5, 0.62], [1.6, 1.12]], [[-0.6, 0.62], [-0.6, 1.58]], [[2.7, 0.6], [-2.7, 0.6]], [[1.6, 1.13], [0.25, 1.79], [-0.6, 1.6]]],
  };
  V.CT = CT;
  V.ct = (ctx, x, y, st, lod) => {
    P.begin(ctx, x, y, M, 1);
    const pal = V.STEEL;
    if (st.floor) { panel(ctx, CT.floor, pal, CT.arches); P.line(ctx, [[1.45, 0.6], [1.45, 1.1]], pal.inner, 0.04); P.line(ctx, [[-0.65, 0.6], [-0.65, 1.0]], pal.inner, 0.04); }
    if (st.stack) for (let i = 0; i < st.stack; i++) P.poly(ctx, [[-1.6, 0.62 + i * 0.05], [0.9, 0.62 + i * 0.05], [0.9, 0.66 + i * 0.05], [-1.6, 0.66 + i * 0.05]], pal.panelTop, pal.edge, 0.6);
    if (st.glass) { ctx.globalAlpha = 0.8; P.poly(ctx, CT.glass, '#26323d', null); ctx.globalAlpha = 1;
      if (st.crack && lod !== 'far') for (let k = 0; k < 6; k++) { const a = k * 1.05 + 0.3; P.line(ctx, [[0.65, 1.42], [0.65 + Math.cos(a) * 0.22, 1.42 + Math.sin(a) * 0.14]], '#e5e7eb', 0.008); } }
    for (const k of ['front', 'side', 'bed']) if (st[k]) panel(ctx, CT[k], pal, CT.arches);
    if (st.roof) for (const k in CT.roof) B.member(ctx, CT.roof[k], 0.06, pal);
    if (st.side && lod !== 'far') { P.line(ctx, [[0.45, 0.62], [0.45, 1.19]], pal.edge, 0.01); for (let k = 0; k < 4; k++) P.line(ctx, [[1.3 - k * 0.5, 0.75], [1.1 - k * 0.5, 1.0]], '#ffffff', 0.006); }
    if (lod !== 'far' && st.beads) CT.seams.forEach((sm, j) => bead(ctx, sm, TF.clamp(st.beads * 4 - j, 0, 1), false));
    if (st.pack) P.poly(ctx, [[-1.3, 0.34], [1.3, 0.34], [1.3, 0.45], [-1.3, 0.45]], '#2a2e33', '#111', 0.6);
    if (st.wheels) wheelsAt(ctx, CT.arches, 0.44, st, lod, false);
    if (st.lit && lod !== 'far') { P.line(ctx, [[2.84, 0.93], [2.3, 1.03]], '#f4f6f6', 0.03); P.line(ctx, [[-2.84, 1.1], [-2.84, 0.95]], '#d8323a', 0.04); }
    P.end(ctx);
  };
  V.finishedCT = { floor: 1, front: 1, side: 1, bed: 1, roof: 1, beads: 1, glass: 1, pack: 1, wheels: 1, lit: 1 };

  // ---------------- Tesla Semi tractor (7 m; front axle +2.15, drive axles -1.35 / -2.70) ----------------
  const SEMI = { axles: [2.15, -1.35, -2.7], r: 0.52,
    cab: [[3.5, 0.9], [3.5, 2.4], [3.2, 3.2], [2.2, 3.6], [0.9, 3.65], [0.9, 0.9]],
    win: [[3.18, 2.5], [2.95, 3.15], [2.2, 3.42], [2.2, 2.55]] };
  V.SEMI = SEMI;
  V.semi = (ctx, x, y, st, lod) => {
    P.begin(ctx, x, y, M, 1);
    const pal = PAL.metal;
    if (st.wheels !== false) SEMI.axles.forEach((ax) => B.wheel(ctx, [ax, SEMI.r], SEMI.r, st.wheelAng || 0, lod));
    if (st.frame) { P.poly(ctx, [[3.3, 0.68], [-3.4, 0.68], [-3.4, 0.86], [3.3, 0.86]], pal.top, pal.edge, 0.8);
      if (lod !== 'far') for (let k = 0; k < 7; k++) P.line(ctx, [[2.9 - k * 0.95, 0.7], [2.9 - k * 0.95, 0.84]], pal.edge, 0.02);
      P.poly(ctx, [[-1.6, 0.86], [-2.6, 0.86], [-2.6, 0.98], [-1.6, 0.98]], '#5d656d', null); }   // fifth wheel
    if (st.motors) for (const ax of [-1.35, -2.7]) P.poly(ctx, [[ax - 0.3, 0.5], [ax + 0.3, 0.5], [ax + 0.3, 0.7], [ax - 0.3, 0.7]], '#4a5056', '#111', 0.6);
    if (st.pack) P.poly(ctx, [[-0.8, 0.86], [0.8, 0.86], [0.8, 1.5], [-0.8, 1.5]], '#2a2e33', '#111', 0.8);
    if (st.cab) { P.poly(ctx, SEMI.cab, '#eef0f2', '#6b737b', 1.2); P.poly(ctx, SEMI.win, '#22292f', null);
      if (lod !== 'far') P.line(ctx, [[3.45, 1.4], [3.45, 2.2]], '#d1d5db', 0.03); }
    if (st.lit && lod !== 'far') { P.line(ctx, [[3.5, 1.2], [3.5, 1.5]], '#fffbe6', 0.06); P.line(ctx, [[-3.4, 0.9], [-3.4, 1.1]], '#d8323a', 0.05); }
    P.end(ctx);
  };
  V.finishedSemi = { frame: 1, motors: 1, pack: 1, cab: 1, wheels: true, lit: 1 };

  V.my = (ctx, x, y, st, lod) => TF.biw.drawBody(ctx, x, y, Object.assign({}, B.finishedMY, st), lod);
  // finished vehicle by kind (BL cage, 1A test lane, exit lane, car carrier)
  V.finished = (ctx, kind, x, y, lod, extra = {}) => {
    if (kind === 'modelY') V.my(ctx, x, y, extra, lod);
    else if (kind === 'cab') V.cab(ctx, x, y, Object.assign({}, V.finishedCab, extra), lod);
    else if (kind === 'ct') V.ct(ctx, x, y, Object.assign({}, V.finishedCT, extra), lod);
    else if (kind === 'semi') V.semi(ctx, x, y, Object.assign({}, V.finishedSemi, extra), lod);
  };
})(typeof window !== 'undefined' ? window : globalThis);
