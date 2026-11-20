// TF.kit — shared machine parts for room modules (world units, y down): industrial arm with IK, gauge,
// valve wheel, ladder, pipe with flow dots, sparks, weld bead. TF.parts — shared part drawings.
(function (G) {
  const TF = G.TF, D = TF.draw, R = G.TF3.rig, M = TF.M;
  const K = (TF.kit = {});

  // Compact industrial robot (v2 look: white links, blue joints, Tesla-red accent). Base on the floor or hung from a
  // gantry (o.hang). IK puts the TOOL TIP exactly on `tip`; toolAng = wrist->tip direction (rad, world, y down).
  K.arm = (ctx, base, tip, o = {}) => {
    const l1 = o.l1 || 38, l2 = o.l2 || 34, tool = o.tool ?? 13, ped = o.ped ?? 12, bend = o.bend || 1;
    const hang = o.hang ? -1 : 1, out = '#7b848c', joint = '#2f7fd8', shell = o.col || '#eef0f2';
    const sh = [base[0], base[1] - hang * ped];
    const ta = o.toolAng ?? Math.PI / 2;
    const wrist = [tip[0] - Math.cos(ta) * tool, tip[1] - Math.sin(ta) * tool];
    const ik = R.ik2(sh, wrist, l1, l2, bend);
    const el = ik.mid, wr = ik.end;
    // base: pedestal (floor) or carriage (gantry)
    if (hang > 0) D.poly(ctx, [[base[0] - 10, base[1]], [base[0] + 10, base[1]], [base[0] + 7, sh[1] + 3], [base[0] - 7, sh[1] + 3]], '#9aa3ab', out, 1);
    else D.rect(ctx, base[0] - 9, base[1] - 3, 18, ped * 0.6, '#9aa3ab', out, 1);
    D.circle(ctx, sh[0], sh[1], 7.5, shell, out, 1.2);
    const link = (a, b, w) => { ctx.lineCap = 'round'; D.line(ctx, [a, b], out, w + 2); D.line(ctx, [a, b], shell, w); ctx.lineCap = 'butt'; };
    link(sh, el, 8); link(el, wr, 6);
    D.line(ctx, [[TF.lerp(sh[0], el[0], 0.35), TF.lerp(sh[1], el[1], 0.35)], [TF.lerp(sh[0], el[0], 0.55), TF.lerp(sh[1], el[1], 0.55)]], '#e31937', 3); // red accent
    D.circle(ctx, sh[0], sh[1], 3, joint); D.circle(ctx, el[0], el[1], 3.6, out); D.circle(ctx, el[0], el[1], 2.4, joint); D.circle(ctx, wr[0], wr[1], 2.6, joint);
    // weld gun: body + nozzle to the tip
    const nx = Math.cos(ta), ny = Math.sin(ta);
    D.line(ctx, [wr, [tip[0] - nx * 4, tip[1] - ny * 4]], '#4a525a', 4);
    D.line(ctx, [[tip[0] - nx * 5, tip[1] - ny * 5], tip], '#b8860b', 2);
    return { wrist: wr, elbow: el, shoulder: sh, reached: ik.reached };
  };

  // Rotor angle that is a closed-form pure function of t: `base` rev/s always, + `boost` rev/s inside the windows
  // [[a, b], ...] of each `period` (seconds). Whole revolutions per period keep loops seamless.
  K.spin = (t, period, base, boost = 0, wins = []) => {
    const n = Math.floor(t / period), u = t - n * period;
    const inWin = (x) => wins.reduce((s, [a, b]) => s + TF.clamp(x - a, 0, b - a), 0);
    const per = Math.round(base * period + boost * inWin(period));
    const rev = (base * u + boost * inWin(u)) * per / (base * period + boost * inWin(period));   // n * per whole turns dropped
    return Math.PI * 2 * (rev - Math.floor(rev));
  };
  K.sparks = (ctx, x, y, t, lod, k = 1) => {
    D.circle(ctx, x, y, 6 * k, 'rgba(255,190,60,0.35)');
    D.circle(ctx, x, y, 2.4 * k, '#fff6c8');
    if (lod !== 'near') return;
    const f = Math.floor(t * 30);
    for (let i = 0; i < 9; i++) {
      const r = TF.hash(i, f), a = Math.PI * (0.15 + 0.7 * r) + (TF.hash(i + 3, f) - 0.5) * 1.6, l = (4 + 9 * TF.hash(i + 7, f)) * k;
      D.line(ctx, [[x + Math.cos(a) * 2, y + Math.sin(a) * 2 - 1], [x + Math.cos(a) * l, y + Math.sin(a) * l - 2]], i % 3 ? '#ffb020' : '#fff1a0', 0.9);
    }
  };

  K.gauge = (ctx, x, y, r, v, lod) => {
    D.circle(ctx, x, y, r, '#ffffff', '#4a525a', 1.5);
    if (lod === 'near') {
      const arc = (a0, a1, c) => { ctx.beginPath(); ctx.arc(x, y, r * 0.78, a0, a1); ctx.strokeStyle = c; ctx.lineWidth = r * 0.22; ctx.stroke(); };
      arc(Math.PI * 0.8, Math.PI * 1.45, '#3cb371'); arc(Math.PI * 1.45, Math.PI * 1.85, '#f0b429'); arc(Math.PI * 1.85, Math.PI * 2.2, '#e74c3c');
    }
    const a = Math.PI * (0.85 + 1.3 * TF.clamp(v, 0, 1));
    D.line(ctx, [[x, y], [x + Math.cos(a) * r * 0.85, y + Math.sin(a) * r * 0.85]], '#1d2125', 1.4);
    D.circle(ctx, x, y, 1.6, '#1d2125');
  };

  K.valve = (ctx, x, y, r, ang) => {
    D.circle(ctx, x, y, r, null, '#c0392b', 2.4);
    for (let k = 0; k < 3; k++) { const a = ang + k * Math.PI / 3; D.line(ctx, [[x - Math.cos(a) * r, y - Math.sin(a) * r], [x + Math.cos(a) * r, y + Math.sin(a) * r]], '#c0392b', 1.4); }
    D.circle(ctx, x, y, 2, '#7f241b');
  };

  // Side-view ladder like the approved TF3 ladder prop: one rail + rungs seen end-on, rung k at height k*rung (m).
  K.ladder = (ctx, x, yFloor, hTop, rung = 0.3) => {
    D.line(ctx, [[x + 0.035 * M, yFloor], [x + 0.035 * M, yFloor - hTop * M]], '#8a9199', 0.04 * M);
    for (let k = 1; k * rung <= hTop + 1e-6; k++) D.circle(ctx, x, yFloor - k * rung * M, 0.019 * M, '#6b737b', '#3d434a', 0.6);
  };

  // Pipe along pts; flowing dots when `flow` is a number (distance phase, world units); dots only at near LOD
  K.pipe = (ctx, pts, col, w, flow, lod, dotCol = '#ffffff') => {
    D.line(ctx, pts, col, w);
    if (flow === null || flow === undefined || lod !== 'near') return;
    const path = TF.track.path(pts);
    for (let s = TF.mod(flow, 24); s < path.total; s += 24) { const p = path.at(s); D.circle(ctx, p[0], p[1], w * 0.25, dotCol); }
  };

  // ---------- parts ----------
  const P = (TF.parts = {});
  P.ingot = (ctx, x, yFloor, lod, glow = 0) => {
    const col = glow > 0 ? D.mix('#c5ccd3', '#ff8a3d', glow) : '#c5ccd3';
    D.poly(ctx, [[x - 15, yFloor], [x + 15, yFloor], [x + 12, yFloor - 12], [x - 12, yFloor - 12]], col, '#6d757d', 1.2);
    if (lod !== 'far') D.line(ctx, [[x - 9, yFloor - 9], [x + 9, yFloor - 9]], '#e6eaee', 1.2);
  };
})(typeof window !== 'undefined' ? window : globalThis);
