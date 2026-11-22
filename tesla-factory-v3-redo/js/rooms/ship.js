// Starship + booster cutaway + launch mount (FACTORY-MAP §5). See-through decks; never launches.
(function (G) {
  const TF = G.TF, L = TF.layout, D = TF.draw, K = TF.kit, A = TF.act, M = TF.M, IT = TF.supply.items;
  TF.claimedZones = Object.assign(TF.claimedZones || {}, { SHIP: 1, BOOSTER: 1, MOUNT: 1 });
  const S = L.zoneById('SHIP').box, B = L.zoneById('BOOSTER').box, MT = L.zoneById('MOUNT').box;
  const CX = S.x + S.w / 2, X0 = S.x, X1 = S.x + S.w, W = S.w;
  const s24 = (t) => TF.mod(t, 24), s48 = (t) => TF.mod(t, 48);
  const deckY = (f) => S.y + S.h * f;
  const ALC = { x0: 22, w: 34, pitch: 38, h: 92, n: 3, pick: 2 };   // cargo rack alcoves (west end, beside the hatch)
  // deck top edges (fractions of ship height)
  const DCK = { bridge: 0.10, crew: 0.22, galley: 0.34, cargo: 0.46, header: 0.58, ch4: 0.66, lox: 0.78, eng: 0.88, bot: 1 };

  const hullPath = (ctx, b, nose) => {
    const x0 = b.x, x1 = b.x + b.w, y0 = b.y, y1 = b.y + b.h, cx = x0 + b.w / 2, n = nose || 220;
    ctx.beginPath();
    ctx.moveTo(x0, y1); ctx.lineTo(x0, y0 + n);
    ctx.quadraticCurveTo(x0, y0, cx, y0);
    ctx.quadraticCurveTo(x1, y0, x1, y0 + n);
    ctx.lineTo(x1, y1); ctx.closePath();
  };
  const raptor = (ctx, x, y, st) => {
    D.rect(ctx, x - 12, y - 1.7 * M, 24, 0.55 * M, '#5f6b77', '#2b2f34', 0.8);
    if (st && st.pump) D.circle(ctx, x + 10, y - 1.5 * M, 6, '#cbd5e1', '#2b2f34', 0.7);
    D.poly(ctx, [[x - 7, y - 1.15 * M], [x + 7, y - 1.15 * M], [x + 18, y], [x - 18, y]], '#9aa1a8', '#4a5056', 0.8);
  };
  TF.stage3 = TF.stage3 || {};
  TF.stage3.raptor = raptor;
  TF.stage3.shipCX = CX;
  TF.stage3.deckY = deckY;
  TF.stage3.alc = ALC;
  TF.stage3.DCK = DCK;
  TF.stage3.engBay = { x: CX, y: deckY(DCK.bot), mounts: 6 };

  // tank fill 0..1: ship/booster stay steady (inflow = vent)
  const tank = (ctx, x, y, w, h, fill, col, frost) => {
    D.rect(ctx, x, y, w, h, '#e8eef3', '#7b848c', 1);
    const fh = h * fill;
    D.rect(ctx, x + 2, y + h - fh, w - 4, fh, col);
    if (frost) D.line(ctx, [[x + 4, y + h - fh], [x + w - 4, y + h - fh]], '#bfdbfe', 2);
    D.rect(ctx, x, y, w, h, null, '#7b848c', 1);
  };
  const plume = (ctx, x, y, t, a) => {
    const tau = TF.mod(t, 24);
    const u = TF.mod(tau * 0.7 + a, 24) / 24;
    ctx.globalAlpha = 0.22 + 0.1 * Math.sin(tau * 2 + a);
    D.circle(ctx, x + Math.sin(tau * 1.4 + a) * 3, y - 10 - u * 28, 6 + u * 8, '#e5e7eb', null);
    ctx.globalAlpha = 1;
  };

  // residents (24 s), loadmaster carries the food crate cargo -> galley
  const TAU = Math.PI * 2, sn = (x) => Math.sin(TAU * x), fr = (x) => TF.mod(x, 1);
  const ell = (ctx, x, y, rx, ry, fill) => { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.fillStyle = fill; ctx.fill(); };
  const inRect = (ctx, r, fn) => { ctx.save(); ctx.beginPath(); ctx.rect(r.x, r.y, r.w, r.h); ctx.clip(); fn(); ctx.restore(); };
  // BRIDGE (24 s): pilot types + glances at the windows; lookout (binoculars / coffee) tosses the drifting rubber duck back to the dash start
  const pilot = (t) => A.run([A.hold(24, CX - 20, 1, (tl) => A.reach([0.4 + 0.05 * sn(tl * 2), 0.98 + 0.03 * sn(tl * 3)], [0.32 + 0.05 * sn(tl * 2.5 + 0.3), 0.95 + 0.03 * sn(tl * 2)],
    { gripN: 0.3, gripF: 0.3, head: -0.15 + 0.3 * TF.keys(tl, [[0, 0], [5, 0], [7, 1], [10, 1], [12, 0], [16, 0], [17, 0.6], [19, 0.6], [20.5, 0], [24, 0]]) }))], s24(t));
  const LKX = CX + 80, lkBin = A.reach([0.3, 1.52], [0.24, 1.5], { gripN: 0.8, gripF: 0.8, head: 0.1 }), lkPour = A.reach([0.5, 0.95], [0.3, 0.85], { gripN: 0.5 }), lkSip = A.reach([0.3, 1.45], [0.25, 0.9], { gripN: 0.8, head: 0.1 }),
    lkGrab = A.reach([0.58, 0.95], [0.3, 0.9], { gripN: 0.6, lean: 0.2 }), lkToss = A.reach([0.35, 1.45], [0.3, 0.9], { gripN: 0.1, lean: -0.05 });
  const lookoutSegs = [A.hold(5.4, LKX, -1, (tl) => A.reach([0.3 + 0.02 * sn(tl / 2.7), 1.52], [0.24, 1.5], { gripN: 0.8, gripF: 0.8, head: 0.1 * sn(tl / 5.4) })), A.turn(0.6, LKX, -1, () => lkBin), A.hold(3.6, LKX, 1, (tl) => tl < 2.4 ? lkPour : lkSip),
    A.turn(0.6, LKX, 1, () => lkSip), A.hold(2.8, LKX, -1, (tl) => tl < 1.2 ? lkSip : A.reach([0.3, 1.45], [0.25, 0.9], { gripN: 0.8, head: -0.1 })), A.keyed(1.2, LKX, -1, [[0, lkSip], [1, lkGrab]]), A.keyed(1.4, LKX, -1, [[0, lkGrab], [0.45, lkToss], [1, lkBin]]), A.hold(8.4, LKX, -1, () => lkBin)];
  const lookout = (t) => Object.assign(A.run(lookoutSegs, s24(t)), { id: 'bridge-lookout' });
  // GALLEY chef (24 s): flips the grill, takes + eats the unpacked food (6.2 / 7.8 / 9.4), walks to the stock pot, stirs, tastes, walks back
  const CHX = CX + 52, CHP = CX + 70;
  const chefGrill = (tl) => {
    const fw = TF.ramp(tl, 4.6, 5.5);
    const kx = TF.keys(tl, [[0, 0.3], [5.5, 0.5], [6, 0.68], [6.35, 0.68], [6.9, 0.3], [7.5, 0.3], [7.8, 0.44], [8.15, 0.44], [8.7, 0.3], [9.1, 0.3], [9.4, 0.2], [9.75, 0.2], [10.3, 0.3], [11.4, 0.3]]);
    const ky = TF.keys(tl, [[0, 0.7], [5.5, 0.7], [6, 0.52], [6.35, 0.52], [6.9, 1.46], [7.3, 1.46], [7.8, 0.52], [8.15, 0.52], [8.7, 1.46], [8.9, 1.46], [9.4, 0.52], [9.75, 0.52], [10.3, 1.46], [10.9, 1.46], [11.4, 0.9]]);
    return A.reach([TF.lerp(0.46 + 0.2 * sn(tl / 2), kx, fw), TF.lerp(0.66 + 0.12 * Math.abs(sn(tl / 1.5)), ky, fw)], [0.2, 0.85], { gripN: 0.8, lean: 0.12 });
  };
  const chefStir = (tl) => tl < 5.2 ? A.reach([0.52 + 0.07 * Math.cos(TAU * tl * 1.5), 0.9 + 0.05 * Math.sin(TAU * tl * 1.5)], [0.4, 0.95], { gripN: 0.8, lean: 0.1 }) : A.reach([0.3, 1.45], [0.4, 0.95], { gripN: 0.8, head: 0.1 });
  const chef = (t) => Object.assign(A.run([A.hold(11.4, CHX, -1, chefGrill), A.turn(0.6, CHX, -1), A.walk(2.4, CHX, CHP, { step: 0.3 }), A.hold(7.0, CHP, 1, chefStir), A.turn(0.6, CHP, 1), A.walk(2.0, CHP, CHX, { step: 0.3 })], s24(t)), { id: 'chef' });
  // ---------- item 23 tank / engine scenes ----------
  const bubbles = (ctx, u, tk, surf, x, n) => {
    for (let i = 0; i < n; i++) { const p = fr(u / 4 + i / n), by = tk.y + tk.h - 6; if (by - (by - surf) * p < surf) continue;
      ctx.globalAlpha = 0.7; D.circle(ctx, x + i * 14 + 3 * sn(p * 2 + i), by - (by - surf) * p, 1.6 + (i % 2), null, '#ffffff', 1); ctx.globalAlpha = 1; }
  };
  const fod = (ctx, kind, x, y, a, s) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s);
    if (kind === 'duck') { D.circle(ctx, 0, 0, 5, '#facc15', '#a16207', 0.6); D.circle(ctx, 4, -4, 3, '#facc15', '#a16207', 0.5); D.poly(ctx, [[6.5, -4.5], [10, -3.5], [6.5, -3]], '#f97316', null); D.circle(ctx, 4.8, -4.8, 0.7, '#111827'); }
    else if (kind === 'boot') { D.rect(ctx, -3, -8, 6, 9, '#78350f', '#451a03', 0.6); D.rect(ctx, -3, -1, 11, 4, '#78350f', '#451a03', 0.6); }
    else { D.rect(ctx, -9, -1.5, 14, 3, '#94a3b8', '#475569', 0.6); D.circle(ctx, 6, 0, 4, null, '#475569', 1.6); D.circle(ctx, -9, 0, 2.5, '#94a3b8', '#475569', 0.6); }
    ctx.restore();
  };
  // inspector (scaled Optimus in a bubble helmet) on a ring catwalk: a FOD item pops out of the nozzle, floats across, is netted, carried west, dropped in the bucket, level logged (24 s)
  const fishScene = (ctx, t, o) => {
    const u = s24(t), tk = o.tk, s = o.s, surf = tk.y + tk.h * (1 - o.fill), cwY = surf - 8, ox = tk.x + tk.w / 2, wy0 = surf - 3;
    const xn = tk.x + 18, xB = tk.x + 46, xs = tk.x + tk.w - 66, xe = xs + 0.6 * M * s, fx = (x) => ox + (x - ox) / s, tfp = (p) => [ox + (p[0] - ox) * s, cwY + (p[1] - cwY) * s];
    const dip = A.reach([0.6, -0.1], [0.4, 0.15], { lean: 0.4, hipY: 0.78, gripN: 0.8 }), up = A.reach([0.45, 1.0], [0.3, 0.9], { gripN: 0.8 }), book = A.reach([0.38, 1.05], [0.28, 0.95], { gripN: 0.7 }), toss = A.reach([0.4, 0.3], [0.3, 0.5], { lean: 0.25, hipY: 0.88 });
    const segs = [A.hold(1.0, fx(xB), 1), A.walk(10.5, fx(xB), fx(xs), { step: 0.4 }), A.keyed(2.6, fx(xs), 1, [[0, A.stand()], [0.3, dip], [0.62, dip], [1, up]]), A.turn(0.5, fx(xs), 1, () => up),
      A.walk(6.0, fx(xs), fx(xB), { step: 0.4, carry: [0.36, 1.0], carryW: 0.3 }), A.keyed(1.8, fx(xB), -1, [[0, up], [0.5, toss], [1, toss]]), A.keyed(1.1, fx(xB), -1, [[0, toss], [0.4, book], [1, book]]), A.turn(0.5, fx(xB), -1, () => book)];
    const st = Object.assign(A.run(segs, u), { id: o.id });
    inRect(ctx, tk, () => {
      wave(ctx, tk.x + 2, surf, tk.w - 4, u, '#ffffff', 1.4);
      bubbles(ctx, u, tk, surf, tk.x + tk.w - 50, 3);
      D.rect(ctx, tk.x + 4, tk.y + 6, 4, tk.h - 12, '#e2e8f0', '#64748b', 0.6);   // level gauge strip
      D.rect(ctx, tk.x + 3, surf - 1.5, 6, 3, '#38bdf8');
      if (u >= 22.4 && u < 23.5) D.circle(ctx, tk.x + 6, tk.y + 3, 2.6, '#4ade80');   // logged
      D.rect(ctx, tk.x + 4, cwY, tk.w - 8, 4, '#94a3b8', '#475569', 0.8);   // ring catwalk
      for (const px of [tk.x + 20, ox, tk.x + tk.w - 20]) D.line(ctx, [[px, cwY + 4], [px, tk.y + tk.h]], '#94a3b8', 2);
      D.rect(ctx, xn - 4, tk.y, 8, 12, '#64748b', '#334155', 0.8);   // nozzle
      ctx.save(); ctx.translate(ox, cwY); ctx.scale(s, s); ctx.translate(-ox, -cwY);
      const f = A.draw(ctx, st, cwY); ctx.restore();
      const hand = tfp(f.w(f.sk.wristN)), hd = tfp(f.w([0.03, 1.62]));
      ctx.globalAlpha = 0.45; D.circle(ctx, hd[0], hd[1], 0.26 * M * s, '#e0f2fe', '#7dd3fc', 1); ctx.globalAlpha = 1;   // helmet bubble
      let w = null;   // [x, y, scale]
      const sw = [TF.lerp(xn, xe, TF.ramp(u, 1.8, 11.5)), wy0 + 2 * sn(u / 3) * TF.ramp(u, 1.8, 3.5)];
      if (u < 0.8) w = [xn, tk.y + 14, 0.2 + 0.8 * TF.ramp(u, 0, 0.8)];
      else if (u < 1.8) w = [xn, TF.lerp(tk.y + 14, wy0, TF.ramp(u, 0.8, 1.8)), 1];
      else if (u < 12.3) w = [sw[0], sw[1], 1];
      else if (u < 13.1) { const k = TF.ramp(u, 12.3, 13.1); w = [TF.lerp(sw[0], hand[0], k), TF.lerp(sw[1], hand[1], k), 1]; }
      else if (u < 22) w = [hand[0], hand[1] + 8 * TF.ramp(u, 21.4, 22), 1];
      if (u >= 11.9 && u < 14.8) { D.circle(ctx, hand[0] + 2, hand[1] + 2, 5 * s + 2, null, '#e2e8f0', 1.2); D.line(ctx, [[hand[0] - 4, hand[1]], [hand[0] + 6, hand[1] + 4]], '#e2e8f0', 0.8); }
      if (w) fod(ctx, o.fod, w[0], w[1], 0.6 * sn(u / 2) + (u >= 13.1 ? 0.9 : 0), w[2] * s * 1.3);
      D.rect(ctx, tk.x + 22, cwY - 12, 24, 12, '#475569', '#1e293b', 0.8);   // FOD bucket (in front: swallows the drop)
      fod(ctx, o.fod, tk.x + 28, cwY - 12, 2.2, s * 0.9); fod(ctx, o.fod, tk.x + 40, cwY - 13, 0.4, s * 0.9);
      D.rect(ctx, tk.x + 22, cwY - 8, 24, 8, '#475569', '#1e293b', 0.8);
    });
  };
  const wave = (ctx, x, y, w, u, col, amp) => { const pts = []; for (let i = 0; i <= 12; i++) pts.push([x + w * i / 12, y + amp * sn(u / 6 + i / 6)]); D.line(ctx, pts, col, 1.6); };
  // overhead rail + hook crane fishes a rubber duck out of the tank: duck bubbles up (0-3), drifts, is hooked (12), carried to the bin (19), crane resets (24 s)
  const hookScene = (ctx, t, o) => {
    const u = s24(t), tk = o.tk, h = tk.h, surf = tk.y + h * (1 - o.fill), rail = tk.y + 8, Rh = tk.x + tk.w - 26, xd0 = tk.x + 34, xd10 = tk.x + 100, bot = tk.y + h - 6;
    const xd = TF.lerp(xd0, xd10, TF.ramp(u, 3, 10)), bob = 2.2 * sn(u / 3) * TF.ramp(u, 2.6, 4);
    const trol = TF.keys(u, [[0, Rh], [6, Rh], [10.5, xd10], [14.5, xd10], [18, Rh], [24, Rh]]);
    const cY = tk.y + 0.3 * h, bT = tk.y + 0.34 * h;
    const hk = TF.keys(u, [[0, rail + 6], [10.5, rail + 6], [12.2, surf - 2], [12.8, surf - 2], [14.5, cY], [18, cY], [19, bT + 6], [19.6, bT + 6], [20.8, rail + 6], [24, rail + 6]]);
    inRect(ctx, tk, () => {
      wave(ctx, tk.x + 2, surf, tk.w - 4, u, '#ffffff', 1.4);
      bubbles(ctx, u, tk, surf, tk.x + tk.w - 70, 4);
      D.rect(ctx, tk.x + 6, rail - 2, tk.w - 12, 3, '#64748b');   // rail
      D.rect(ctx, tk.x + 4, bot - 4, 10, 10, '#475569', '#1e293b', 0.7);   // bubble generator
      let dp;
      if (u < 3) { const k = TF.ramp(u, 0.6, 3), by = TF.lerp(bot - 4, surf - 3, k), r = 8 * TF.ramp(u, 0, 0.6); dp = [xd0, by + 0]; ctx.globalAlpha = 0.6; D.circle(ctx, xd0, by, r, null, '#ffffff', 1.4); ctx.globalAlpha = 1; if (u < 0.6) dp = null; }
      else { dp = [xd, surf - 3 + bob]; if (u < 3.4) { ctx.globalAlpha = 0.6 * (1 - TF.ramp(u, 3, 3.4)); D.circle(ctx, xd0, surf - 3, 8 + 6 * TF.ramp(u, 3, 3.4), null, '#ffffff', 1.4); ctx.globalAlpha = 1; } }
      if (u >= 12.5 && u < 19.6) dp = [trol, hk + 5];
      else if (u >= 19.6) dp = null;
      D.line(ctx, [[trol, rail + 2], [trol, hk]], '#334155', 1);
      D.rect(ctx, trol - 7, rail - 3, 14, 7, '#334155', '#0f172a', 0.8);
      D.circle(ctx, trol, hk + 1, 2.5, null, '#334155', 1.4);
      if (dp) fod(ctx, 'duck', dp[0], dp[1], 0.15 * sn(u / 2), 1.1);
      fod(ctx, 'duck', Rh - 6, bT - 2, 0, 1.0); fod(ctx, 'duck', Rh + 6, bT - 3, 0.2, 1.0);
      D.rect(ctx, Rh - 13, bT, 26, 0.14 * h, '#64748b', '#334155', 0.8);   // catch bin (in front of the drop)
    });
  };
  // rail gauge-reader bot reads the level at three marks; frost wisps drift off the surface; condensate drips into a cup that tips back into the tank
  const gaugeScene = (ctx, t, o) => {
    const u = s24(t), tk = o.tk, h = tk.h, surf = tk.y + h * (1 - o.fill), gx = tk.x + 10, y0 = tk.y + 12, y1 = tk.y + h - 12;
    inRect(ctx, tk, () => {
      wave(ctx, tk.x + 2, surf, tk.w - 4, u, '#ffffff', 1.4);
      bubbles(ctx, u, tk, surf, tk.x + tk.w * 0.45, 4);
      D.line(ctx, [[gx, y0], [gx, y1]], '#64748b', 3);
      for (let i = 0; i <= 5; i++) { const yy = TF.lerp(y0, y1, i / 5); D.line(ctx, [[gx + 3, yy], [gx + 8, yy]], '#64748b', 1); }
      const by = TF.lerp(y0, y1, TF.keys(u, [[0, 0.9], [4.5, 0.15], [7.5, 0.15], [12.5, 0.9], [15, 0.9], [18.5, 0.5], [21.5, 0.5], [24, 0.9]]));
      const rd = (u >= 5 && u < 7) || (u >= 13.5 && u < 14.8) || (u >= 19.5 && u < 21);
      D.rect(ctx, gx + 3, by - 6, 14, 12, '#e2e8f0', '#475569', 1);
      D.circle(ctx, gx, by, 3.5, '#334155', '#0f172a', 0.6);
      D.circle(ctx, gx + 13, by, 2.6, rd ? '#4ade80' : '#f87171');
      if (rd) { ctx.globalAlpha = 0.5; D.line(ctx, [[gx + 16, by], [gx + 44, by]], '#4ade80', 2); ctx.globalAlpha = 1; D.line(ctx, [[gx + 8, by - 9], [gx + 11, by - 6], [gx + 17, by - 13]], '#16a34a', 1.6); }
      if (o.frost) for (let i = 0; i < 4; i++) { const p = fr(u / 6 + i / 4); ctx.globalAlpha = 0.5 * (1 - p); D.circle(ctx, tk.x + 30 + (tk.w - 60) * fr(i * 0.37 + 0.1) + 6 * sn(p * 2 + i), surf - 4 - 26 * p, 4 + 5 * p, '#ffffff'); ctx.globalAlpha = 1; }
      const px = tk.x + tk.w - 34, cupY = tk.y + 0.3 * h, tip = TF.ramp(u, 20, 21) - TF.ramp(u, 22, 23), lvl = 10 * TF.ramp(u, 0, 20) * (1 - tip);
      D.rect(ctx, px - 2, tk.y, 4, 8, '#94a3b8', '#475569', 0.7);   // drip pipe
      if (tip < 0.05) { const p = fr(u / 2); D.circle(ctx, px, TF.lerp(tk.y + 10, cupY + 12 - lvl, p * p), 1.8, '#bfdbfe'); }
      ctx.save(); ctx.translate(px - 8, cupY + 14); ctx.rotate(0.9 * tip); ctx.translate(-(px - 8), -(cupY + 14));
      D.rect(ctx, px - 8, cupY + 14 - lvl, 16, lvl, '#bfdbfe'); D.rect(ctx, px - 8, cupY + 2, 16, 12, null, '#475569', 1.4); ctx.restore();
      D.rect(ctx, px - 10, cupY + 14, 20, 2, '#64748b');
      if (tip > 0.3 && tip < 0.9) D.line(ctx, [[px + 10, cupY + 14], [px + 11, surf]], '#bfdbfe', 1.4);
    });
  };
  const loadmaster = (t) => {
    const u = s24(t), yCargo = deckY(DCK.header) - 4, yGalley = deckY(DCK.cargo) - 4;
    // yFloor is the deck under the feet; cargo deck floor = deckY(header) is the HEADER top = cargo floor
    // cargo floor = deckY(DCK.header) wait: deckY(cargo)=top of cargo, floor of cargo = deckY(header)
    return { u };
  };

  // crew B on the bunk deck (24 s chore loop): smooth the bunk, walk to the towel, straighten it, walk back
  const bA = X0 + 112, bT = X1 - 62;
  const bunkP = (tl) => A.reach([0.45 + 0.05 * Math.sin(tl * 2.5), 0.85], [0.3, 0.7 + 0.1 * Math.sin(tl * 2.5 + 1)], { lean: 0.2, gripN: 0.6 });
  const towelP = (tl) => A.reach([0.4, 1.0 + 0.06 * Math.sin(tl * 3)], [0.25, 0.95], { gripN: 0.7 });
  const bSegs = [A.hold(3.4, bA, -1, bunkP), A.turn(0.6, bA, -1), A.walk(5, bA, bT, { step: 0.5 }), A.hold(4.4, bT, 1, towelP), A.turn(0.6, bT, 1), A.walk(5, bT, bA, { step: 0.5 })];
  bSegs.push(A.hold(24 - A.total(bSegs), bA, -1, bunkP));
  const crewB = (t) => A.run(bSegs, s24(t));

  TF.transport({ id: 'Starship', period: 48, layer: 'back', box: { x: MT.x - 20, y: S.y - 40, w: MT.w + 40, h: MT.y + MT.h - S.y + 40 },
    draw(ctx, t, theme, lod) {
      const u = s24(t), u48 = s48(t);
      // ----- mount -----
      D.poly(ctx, [[MT.x, MT.y + MT.h], [MT.x + 40, MT.y], [MT.x + MT.w - 40, MT.y], [MT.x + MT.w, MT.y + MT.h]], '#d8dce1', '#9aa3ab', 1.5);
      D.rect(ctx, MT.x + 50, MT.y - 18, MT.w - 100, 18, '#c3c9d0', '#7b848c', 1);
      // hold-down clamps
      for (const x of [CX - 70, CX + 70]) D.poly(ctx, [[x - 10, MT.y], [x + 10, MT.y], [x + 6, MT.y - 22], [x - 6, MT.y - 22]], '#6b737b', '#2b2f34', 1);
      // booster QD (fueling arm from the west / trench)
      const qdY = B.y + B.h * 0.72, qOn = u >= 4 && u < 14;
      D.rect(ctx, S.x - 70, qdY - 6, 70, 10, '#7b848c', '#2b2f34', 1);
      D.circle(ctx, S.x, qdY, 8, qOn ? '#93c5fd' : '#9aa3ab', '#2b2f34', 1);
      if (qOn && lod !== 'far') { ctx.globalAlpha = 0.5; D.line(ctx, [[S.x, qdY], [S.x + 18, qdY]], '#bfdbfe', 3); ctx.globalAlpha = 1; }

      // ----- booster cutaway -----
      D.rect(ctx, B.x, B.y, B.w, B.h, '#eef1f4', '#9aa3ab', 2);
      // skin strips
      D.rect(ctx, B.x, B.y, 10, B.h, '#d5dae0'); D.rect(ctx, B.x + B.w - 10, B.y, 10, B.h, '#d5dae0');
      // CH4 / LOX
      const bk1 = { x: B.x + 22, y: B.y + 20, w: B.w - 44, h: B.h * 0.32 }, bk2 = { x: B.x + 22, y: B.y + B.h * 0.36, w: B.w - 44, h: B.h * 0.32 };
      tank(ctx, bk1.x, bk1.y, bk1.w, bk1.h, 0.55, '#ecfccb', false);
      tank(ctx, bk2.x, bk2.y, bk2.w, bk2.h, 0.6, '#dbeafe', true);
      if (lod !== 'far') {
        fishScene(ctx, t, { tk: bk1, fill: 0.55, s: 0.9, id: 'booster-insp', fod: 'boot' });   // CH4: inspector nets a stray boot
        gaugeScene(ctx, t, { tk: bk2, fill: 0.6, frost: true });                                // LOX: gauge-reader bot, frost, condensate cup
      }
      // 33-engine bay: 3 visible rows (11+11+11)
      const ey = B.y + B.h * 0.78, eh = B.h * 0.22;
      D.rect(ctx, B.x + 8, ey, B.w - 16, eh - 8, '#d4d9de', '#7b848c', 1);
      const blink = qOn && Math.sin(u * 8) > 0;
      for (let row = 0; row < 3; row++) for (let k = 0; k < 11; k++) {
        const x = B.x + 22 + k * ((B.w - 44) / 10), y = ey + 16 + row * 28;
        const g = sn(u48 / 16 - k / 11 - row * 0.18);   // gimbal wave sweeps along the rows (16 s)
        D.circle(ctx, x, y, 7, '#6b737b', '#2b2f34', 0.7);
        D.line(ctx, [[x, y], [x + 3.2 * g, y + 2]], '#475569', 2);
        D.circle(ctx, x + 3.2 * g, y + 2, 3, '#9aa1a8');
      }
      if (lod !== 'far') {   // catwalk + mechanic weaving the rows, stopping to torque engines
        const cwy = ey + 100, ms = 0.5, mox = B.x + B.w / 2, col = (c) => B.x + 22 + c * ((B.w - 44) / 10), mx = (c) => mox + (col(c) - mox) / ms, hup = (tl) => A.reach([0.12, 0.95 + 0.1 * sn(tl * 2)], [0.0, 0.85], { gripN: 0.9, lean: 0.05 });
        D.rect(ctx, B.x + 12, cwy, B.w - 24, 4, '#94a3b8', '#475569', 0.8);
        for (let c = 0; c <= 10; c += 2) D.line(ctx, [[col(c), cwy + 4], [col(c), ey + eh - 8]], '#b6bec6', 2);
        const ms48 = [A.hold(2, mx(0), 1), A.walk(4, mx(0), mx(3), { step: 0.35 }), A.hold(3, mx(3), 1, hup), A.walk(4, mx(3), mx(6), { step: 0.35 }), A.hold(3, mx(6), 1, hup), A.walk(4, mx(6), mx(9), { step: 0.35 }), A.hold(3, mx(9), 1, hup),
          A.turn(0.5, mx(9), 1), A.walk(8, mx(9), mx(5), { step: 0.35 }), A.hold(3, mx(5), -1, hup), A.walk(6, mx(5), mx(1), { step: 0.35 }), A.hold(3, mx(1), -1, hup), A.walk(1.5, mx(1), mx(0), { step: 0.35 }), A.turn(0.5, mx(0), -1), A.hold(2.5, mx(0), 1)];
        const mst = Object.assign(A.run(ms48, u48), { id: 'booster-mech' });
        ctx.save(); ctx.translate(mox, cwy); ctx.scale(ms, ms); ctx.translate(-mox, -cwy);
        const mf = A.draw(ctx, mst, cwy); ctx.restore();
        if (!mst.walking && !mst.squash) { const w = mf.w(mf.sk.wristN), sx = mox + (w[0] - mox) * ms, sy = cwy + (w[1] - cwy) * ms; D.circle(ctx, sx, sy - 3, 2 + sn(u48 * 3) * 1, '#fde047'); }
      }
      // three valve lights
      for (let i = 0; i < 3; i++) D.circle(ctx, B.x + 30 + i * 18, ey - 8, 4, blink ? '#4ade80' : '#365314', '#14532d', 0.6);
      // grid fins (folded, mid-body)
      for (const side of [-1, 1]) {
        const fx = side < 0 ? B.x - 6 : B.x + B.w + 6;
        const fy = B.y + B.h * 0.18, hx = side < 0 ? B.x : B.x + B.w, fa = side * 0.35 * sn(u48 / 24);   // slow 24 s flex about the hinge
        ctx.save(); ctx.translate(hx, fy + 35); ctx.rotate(fa); ctx.translate(-hx, -(fy + 35));
        D.rect(ctx, fx - 8, fy, 16, 70, '#c3c9d0', '#6b737b', 1);
        for (let k = 0; k < 4; k++) D.line(ctx, [[fx - 6, fy + 12 + k * 14], [fx + 6, fy + 12 + k * 14]], '#9aa3ab', 1);
        ctx.restore();
      }
      plume(ctx, CX, B.y + 16, t, 1.2);

      // ----- ship hull -----
      hullPath(ctx, S, 240);
      ctx.fillStyle = '#eef1f4'; ctx.fill();
      ctx.strokeStyle = '#9aa3ab'; ctx.lineWidth = 2.4; ctx.stroke();
      // clip interiors to the hull
      ctx.save();
      hullPath(ctx, S, 240); ctx.clip();
      // edge skin
      D.rect(ctx, X0, S.y, 12, S.h, '#d5dae0'); D.rect(ctx, X1 - 12, S.y, 12, S.h, '#d5dae0');

      const slab = (f0, f1, fill) => D.rect(ctx, X0 + 12, deckY(f0), W - 24, deckY(f1) - deckY(f0), fill || '#f7f8fa');
      const floor = (f) => D.rect(ctx, X0 + 12, deckY(f) - 6, W - 24, 6, '#c3c9d0');

      // Bridge
      slab(0, DCK.crew, '#f4f7fb');
      D.rect(ctx, CX - 50, deckY(DCK.bridge) + 20, 100, 16, '#1d2733', '#5d656d', 1);   // windows / consoles
      for (let i = 0; i < 4; i++) D.rect(ctx, CX - 42 + i * 22, deckY(DCK.bridge) + 24, 16, 8, TF.mod(Math.floor(u * 2 + i), 4) === 0 ? '#fde047' : '#38bdf8');   // window lamps ripple
      { // dash desk at hand height with reactive lamps (pilot's hands rest on it)
        const yb = deckY(DCK.crew) - 6, dy = yb - 0.9 * M;
        D.rect(ctx, CX - 12, dy + 7, 6, yb - dy - 7, '#64748b'); D.rect(ctx, CX + 60, dy + 7, 6, yb - dy - 7, '#64748b');
        D.rect(ctx, CX - 12, dy, 80, 7, '#94a3b8', '#475569', 1);
        D.rect(ctx, CX - 4, dy - 20, 60, 20, '#1d2733', '#5d656d', 1);
        for (let i = 0; i < 6; i++) { const on = TF.mod(Math.floor(u * 3 + i * 1.7), 3); D.circle(ctx, CX + 4 + i * 9, dy - 10, 2.6, on === 0 ? '#4ade80' : on === 1 ? '#fbbf24' : '#1e293b'); }
        // coffee machine on the east wall shelf
        D.rect(ctx, X1 - 46, yb - 42, 32, 42, '#64748b', '#334155', 0.8); D.rect(ctx, X1 - 40, yb - 54, 12, 12, '#cbd5e1', '#475569', 0.8);
      }
      // Crew bunks
      slab(DCK.crew, DCK.galley);
      D.rect(ctx, X0 + 28, deckY(DCK.galley) - 22, 70, 10, '#d6d3d1', '#78716c', 0.8);
      D.rect(ctx, X0 + 28, deckY(DCK.galley) - 48, 70, 10, '#d6d3d1', '#78716c', 0.8);
      D.rect(ctx, X1 - 40, deckY(DCK.galley) - 70, 6, 36, '#a8a29e');   // towel hook
      D.rect(ctx, X1 - 52, deckY(DCK.galley) - 70, 16, 22, '#e7e5e4', '#78716c', 0.7);  // towel
      { const up = deckY(DCK.galley) - 48;   // sleeper on the upper bunk: breathing lump, pillow, drifting zzz
        D.circle(ctx, X0 + 38, up - 7, 6, '#e2e8f0', '#94a3b8', 0.8); ell(ctx, X0 + 68, up - 4, 28, 6 + 1.2 * sn(u / 4), '#64748b');
        ctx.fillStyle = '#475569';
        for (let i = 0; i < 3; i++) { const p = fr(u / 8 + i / 3); ctx.globalAlpha = 1 - p; ctx.font = (7 + 5 * p) + 'px sans-serif'; ctx.fillText('z', X0 + 44 + 10 * p + 3 * sn(p * 2), up - 16 - 28 * p); }
        ctx.globalAlpha = 1; }
      // Occupy Mars sticker
      D.rect(ctx, CX + 40, deckY(DCK.crew) + 16, 28, 22, '#7c2d12', '#9a3412', 0.6);
      D.circle(ctx, CX + 54, deckY(DCK.crew) + 26, 6, '#ea580c');
      // Galley
      slab(DCK.galley, DCK.cargo);
      D.rect(ctx, CX - 70, deckY(DCK.cargo) - 50, 36, 44, '#e5e7eb', '#7b848c', 1);   // fridge
      D.rect(ctx, CX + 10, deckY(DCK.cargo) - 28, 50, 10, '#6b737b', '#2b2f34', 1);  // grill
      const flameOn = u >= 3.0 && u < 9.6;   // grill is lit while the unpacked food is on it
      D.rect(ctx, CX + 8, deckY(DCK.cargo) - 28, 54, 22, '#cbd5e1', '#64748b', 0.8);   // grill counter
      { const yg = deckY(DCK.cargo) - 6, px = X1 - 30;   // stock pot station: simmers all loop
        D.rect(ctx, px - 16, yg - 40, 32, 40, '#cbd5e1', '#64748b', 0.8); D.rect(ctx, px - 10, yg - 54, 20, 14, '#78716c', '#44403c', 0.9);
        for (let i = 0; i < 3; i++) { const p = fr(u / 4 + i / 3); ctx.globalAlpha = 0.6 * (1 - p); D.circle(ctx, px - 4 + i * 4 + 3 * sn(p * 2), yg - 58 - 22 * p, 3 + 4 * p, '#ffffff'); ctx.globalAlpha = 1; } }
      if (flameOn) {
        const flare = 1; // gag 61 is the big flare; base is a small flame
        for (let i = 0; i < 3; i++) {
          ctx.globalAlpha = 0.7;
          D.poly(ctx, [[CX + 22 + i * 10, deckY(DCK.cargo) - 28], [CX + 18 + i * 10, deckY(DCK.cargo) - 40 - 4 * Math.sin(u * 10 + i)], [CX + 26 + i * 10, deckY(DCK.cargo) - 28]], '#f97316', null);
          ctx.globalAlpha = 1;
        }
      }
      // Cargo
      slab(DCK.cargo, DCK.header, '#f1f5f9');
      // rack of 3 crew alcoves (recesses; doors + LEDs drawn with the residents)
      for (let i = 0; i < ALC.n; i++) D.rect(ctx, X0 + ALC.x0 + i * ALC.pitch, deckY(DCK.header) - 6 - ALC.h, ALC.w, ALC.h, '#64748b', '#475569', 1);
      { // mars-soil crate: lid opens while the cargo rat samples it (lidK from rat timeline)
        const rr0 = TF.mod(t - 20.5, 24), tr = rr0 - 1.5, lk = tr < 0 ? 0 : TF.ramp(tr, 1.8, 2.5) - TF.ramp(tr, 4.9, 5.5);
        const sx = CX + 20, sy = deckY(DCK.header) - 6, hx = sx + 36, hy = sy - 16, th = lk * 1.75, dx = -Math.cos(th), dy = -Math.sin(th), nx = -dy, ny = dx;
        D.rect(ctx, sx, hy, 36, 16, '#a8a29e', '#57534e', 1);
        if (lk > 0.02) D.rect(ctx, sx + 3, hy, 30, 3, '#7c2d12');
        D.poly(ctx, [[hx, hy], [hx + dx * 36, hy + dy * 36], [hx + dx * 36 + nx * 6, hy + dy * 36 + ny * 6], [hx + nx * 6, hy + ny * 6]], '#b8b2ad', '#57534e', 1);
      }
      // cargo door (east); the 42 plate now lives on the west skirt (gags.js, drawn with the tower)
      const doorY = deckY((DCK.cargo + DCK.header) / 2) - 20;
      D.rect(ctx, X1 - 16, doorY, 16, 40, '#cbd5e1', '#64748b', 1.2);
      // Header / CH4 / LOX
      slab(DCK.header, DCK.ch4, '#eef2f7');
      const tkH = { x: X0 + 28, y: deckY(DCK.header) + 8, w: W - 56, h: deckY(DCK.ch4) - deckY(DCK.header) - 14 }, tkC = { x: X0 + 28, y: deckY(DCK.ch4) + 8, w: W - 56, h: deckY(DCK.lox) - deckY(DCK.ch4) - 14 }, tkL = { x: X0 + 28, y: deckY(DCK.lox) + 8, w: W - 56, h: deckY(DCK.eng) - deckY(DCK.lox) - 14 };
      tank(ctx, tkH.x, tkH.y, tkH.w, tkH.h, 0.35, '#e2e8f0', false);
      if (lod !== 'far') fishScene(ctx, t, { tk: tkH, fill: 0.35, s: 0.6, id: 'header-insp', fod: 'wrench' });
      slab(DCK.ch4, DCK.lox);
      tank(ctx, tkC.x, tkC.y, tkC.w, tkC.h, 0.5, '#ecfccb', false);
      if (lod !== 'far') hookScene(ctx, t, { tk: tkC, fill: 0.5 });
      slab(DCK.lox, DCK.eng);
      tank(ctx, tkL.x, tkL.y, tkL.w, tkL.h, 0.55, '#dbeafe', true);
      if (lod !== 'far') gaugeScene(ctx, t, { tk: tkL, fill: 0.55, frost: true });
      // Engine bay: 6 raptors; one mount empty while CS is installing (u48 32-37)
      slab(DCK.eng, DCK.bot, '#e2e6ea');
      const empty = (u48 >= 32 && u48 < 37) ? 2 : -1;   // middle-right mount (CS serviced engine on the existing 48 s schedule)
      const bayTop = deckY(DCK.eng), bayB = deckY(DCK.bot), mxs = (i) => X0 + 36 + i * ((W - 72) / 5), piv = bayB - 2 - 1.7 * M;
      const hov = u48 >= 37 && u48 < 38.2 ? 40 * (1 - TF.ramp(u48, 37.7, 38.2)) : 0;   // engine lowered onto the empty mount by the bay hoist
      const RS = TF.stage3.csRelease, trv = u48 >= 37 && u48 < 37.7 && RS ? TF.ramp(u48, 37, 37.7) : 1;   // 37-37.7 hook trolleys it from the CS release point to the mount (CS 48 s timetable untouched)
      for (let i = 0; i < 6; i++) {
        const x = mxs(i);
        if (i === empty) {   // waiting mount: flange ring, guide lights and an empty hoist hook
          D.circle(ctx, x, bayB - 8, 10, null, '#94a3b8', 1.2);
          D.circle(ctx, x - 10, bayB - 3, 2.4, Math.sin(u48 * 6) > 0 ? '#f59e0b' : '#78350f'); D.circle(ctx, x + 10, bayB - 3, 2.4, Math.sin(u48 * 6) > 0 ? '#78350f' : '#f59e0b');
          continue;
        }
        const env = i === 2 ? (u48 >= 37 ? TF.ramp(u48, 38.8, 40.8) : (u48 >= 32 ? 0 : 1)) : 1;   // new engine bolts on, then joins the ripple
        const ang = 0.17 * sn(u48 / 16 - i / 6) * env;
        const dx = i === 2 && trv < 1 ? (RS.x - x) * (1 - trv) : 0, dy = i === 2 && trv < 1 ? (RS.y - (bayB - 42)) * (1 - trv) : 0;
        ctx.save(); ctx.translate(x + dx, piv - hov + dy); ctx.rotate(ang); ctx.translate(-x, -piv);
        raptor(ctx, x, bayB - 2, { pump: 1 }); ctx.restore();
        if (i === 2 && hov > 0) { const hy = piv - hov - 6 + dy; D.line(ctx, [[x + dx, Math.min(bayTop + 6, hy)], [x + dx, hy]], '#334155', 1.4); D.circle(ctx, x + dx, hy, 3, null, '#334155', 1.4); }
        if (i === 2 && u48 >= 38.2 && u48 < 39.4) for (let k = 0; k < 4; k++) D.circle(ctx, x - 12 + 8 * k + 3 * Math.sin(u48 * 40 + k), bayB - 4 - 4 * ((u48 * 9 + k) % 2), 1.6, '#fde047');   // bolting sparks
      }
      if (u48 >= 34.5 && u48 < 37) { const x = mxs(2), ty = TF.lerp(bayTop + 6, piv - 46, TF.ramp(u48, 34.5, 36.4)); D.line(ctx, [[x, bayTop + 6], [x, ty]], '#334155', 1.4); D.circle(ctx, x, ty + 3, 3, null, '#334155', 1.4); }   // hoist hook lowers empty, waits
      { // inspection carriage on the bay ceiling rail: patrols the mounts, parks over the new engine while it is bolted
        const cxs = TF.keys(u48, [[0, mxs(0)], [5, mxs(0)], [9, mxs(4)], [14, mxs(4)], [18, mxs(5)], [21, mxs(5)], [26, mxs(1)], [30, mxs(1)], [33, mxs(2)], [40, mxs(2)], [44, mxs(3)], [47, mxs(0)], [48, mxs(0)]]);
        const ry = bayTop + 14, probe = 10 + 22 * (TF.ramp(u48, 8, 9.5) - TF.ramp(u48, 12.5, 14) + TF.ramp(u48, 37.2, 38.2) - TF.ramp(u48, 39.6, 40.4));
        D.rect(ctx, X0 + 16, ry - 2, W - 32, 3, '#64748b');
        D.line(ctx, [[cxs, ry], [cxs, ry + probe]], '#475569', 1.6);
        D.rect(ctx, cxs - 8, ry - 5, 16, 11, '#f1f5f9', '#334155', 0.9);
        D.circle(ctx, cxs, ry + 1, 3, '#0f172a'); D.circle(ctx, cxs + 1.2 * sn(u48 / 4), ry + 1, 1.2, Math.sin(u48 * 5) > 0 ? '#4ade80' : '#38bdf8');
      }
      // ship QD arm inlet (west, mid cargo)
      D.circle(ctx, X0 + 8, doorY + 10, 6, u >= 4 && u < 14 ? '#93c5fd' : '#9aa3ab', '#2b2f34', 1);

      for (const f of Object.values(DCK)) floor(f);

      // inner ladder CH (cargo..bridge)
      K.ladder(ctx, CX - 70, deckY(DCK.header) - 6, (deckY(DCK.header) - 6 - deckY(DCK.bridge)) / M, 0.28);
      ctx.restore();

      // nose windows (outside the clip is fine — redraw a couple on the skin)
      for (const dx of [-30, 0, 30]) D.rect(ctx, CX + dx - 8, S.y + 70, 16, 10, '#bae6fd', '#64748b', 0.8);
      plume(ctx, CX, S.y + 8, t, 0.4);

      // ----- residents (skip far lod for figures) -----
      if (lod === 'far') return;
      const yBridge = deckY(DCK.crew) - 6, yCrew = deckY(DCK.galley) - 6, yGalley = deckY(DCK.cargo) - 6, yCargo = deckY(DCK.header) - 6;
      A.draw(ctx, Object.assign(pilot(t), { id: 'pilot' }), yBridge);
      const lkF = A.draw(ctx, lookout(t), yBridge);
      { // rubber duck: drifts across the dash (0-10), lookout lifts it (13-14.2) and lobs it back to the start (14.8-16); coffee cup rides in the lookout's hand 8.4-13
        const dyk = yBridge - 0.9 * M - 5, d0 = CX + 12, d1 = CX + 56, cupS = [X1 - 40, yBridge - 42 - 3], cw = lkF.w(lkF.sk.wristN);
        let dx, dy, da = 0;
        if (u < 10) { const k = TF.ramp(u, 0, 10); dx = TF.lerp(d0, d1, k); dy = dyk - 1.5 * Math.abs(sn(u / 2)); da = 0.4 * sn(u / 6); }
        else if (u < 13) { dx = d1; dy = dyk - 1.5 * Math.abs(sn(u / 2)); }
        else if (u < 14.2) { const k = TF.ramp(u, 13, 14.2); dx = TF.lerp(d1, cw[0], k); dy = TF.lerp(dyk, cw[1], k); }
        else if (u < 14.8) { dx = cw[0]; dy = cw[1]; }
        else if (u < 16) { const k = (u - 14.8) / 1.2; dx = TF.lerp(cw[0], d0, k); dy = TF.lerp(cw[1], dyk, k * k) - 30 * Math.sin(Math.PI * k); da = 6 * k; }
        else { dx = d0; dy = dyk - 3 * Math.exp(-(u - 16) * 2) * Math.abs(Math.sin((u - 16) * 8)); }
        fod(ctx, 'duck', dx, dy, da, 1.0);
        const cupK = TF.ramp(u, 8.2, 8.8) - TF.ramp(u, 12.7, 13.3);
        if (u >= 6.4 && u < 8.2) D.line(ctx, [[X1 - 34, yBridge - 52], [X1 - 34, yBridge - 42]], '#78350f', 1.6);   // coffee stream
        D.rect(ctx, TF.lerp(cupS[0], cw[0], cupK) - 3, TF.lerp(cupS[1], cw[1], cupK) - 3, 6, 7, '#f8fafc', '#475569', 0.7);
        if (cupK > 0.5) for (let i = 0; i < 2; i++) { const p = fr(u / 2 + i / 2); ctx.globalAlpha = 0.6 * (1 - p); D.circle(ctx, cw[0] + 2, cw[1] - 6 - 8 * p, 2 + p * 2, '#ffffff'); ctx.globalAlpha = 1; }
      }
      A.draw(ctx, Object.assign(crewB(t), { id: 'crew-b' }), yCrew);
      { // bunk-cat: strolls the lower bunk, washes a paw, hops onto the sleeper, loafs, hops down
        const low = deckY(DCK.galley) - 22, upT = deckY(DCK.galley) - 48 - 11 - 1.2 * sn(u / 4), hop = (a, b) => TF.ramp(u, a, b);
        const cx = TF.keys(u, [[0, X0 + 36], [6, X0 + 84], [9, X0 + 84], [10.2, X0 + 72], [16, X0 + 72], [17.2, X0 + 62], [24, X0 + 36]]);
        const cy = u < 9 ? low : u < 10.2 ? TF.lerp(low, upT, hop(9, 10.2)) - 14 * Math.sin(Math.PI * hop(9, 10.2)) : u < 16 ? upT : u < 17.2 ? TF.lerp(upT, low, hop(16, 17.2)) - 14 * Math.sin(Math.PI * hop(16, 17.2)) : low;
        const mode = u < 6 || (u >= 17.2) ? 'walk' : u < 9 ? 'sit' : u < 10.2 || (u >= 16 && u < 17.2) ? 'hop' : 'loaf', face = u >= 17.2 ? -1 : 1;
        ctx.save(); ctx.translate(cx, cy); ctx.scale(face, 1);
        const ph = u * 3, col = '#94a3b8', ln = '#475569';
        if (mode === 'sit') { ell(ctx, 0, -7, 5, 7, col); D.circle(ctx, 2, -16 + sn(u * 2) * 0.8, 4, col, ln, 0.6); D.poly(ctx, [[0, -19], [1, -23], [3, -19]], col, ln, 0.5); D.poly(ctx, [[3, -19], [5, -22.5], [6, -18]], col, ln, 0.5); D.line(ctx, [[-4, -3], [-9, -4], [-9, -9 + sn(u) * 2]], col, 2); D.circle(ctx, 3.4, -16.8, 0.8, '#4ade80'); D.line(ctx, [[4, -9], [5.5, -14 + 3 * Math.abs(sn(u * 1.5))]], col, 2); }
        else if (mode === 'loaf') { ell(ctx, 0, -4, 9, 4, col); D.circle(ctx, 8, -5, 3.6, col, ln, 0.6); D.poly(ctx, [[6.5, -8], [7.5, -11.5], [9, -8]], col, ln, 0.5); D.circle(ctx, 9.4, -5.6, 0.8, '#4ade80'); D.line(ctx, [[-9, -3], [-13, -4 + 2 * sn(u / 2)]], col, 2); }
        else { ell(ctx, 0, -7, 8, 3.6, col); D.circle(ctx, 9, -9, 3.6, col, ln, 0.6); D.poly(ctx, [[7.5, -12], [8.5, -15.5], [10, -12]], col, ln, 0.5); D.circle(ctx, 10, -9.6, 0.8, '#4ade80'); D.line(ctx, [[-8, -8], [-12, -11 + 2 * sn(ph / 6)], [-14, -7]], col, 2);
          for (const lx of [-5, -1, 3, 6]) D.line(ctx, [[lx, -5], [lx + (mode === 'walk' ? 2.5 * Math.sin(ph * 2 + lx) : 1.5), 0]], ln, 1.4); }
        ctx.restore();
      }
      const chefF = A.draw(ctx, chef(t), yGalley);
      // ---- cargo deck: alcove doors first, then every walker in front of them ----
      const rr = TF.mod(t - 20.5, 24), mm = Math.round((t - 20.5 - rr) / 24);   // rr = seconds since a crew-up hand-off (tower 'a'), mm = cycle index
      const AX0 = X0 + ALC.x0 + ALC.w / 2, SX = CX + 10, ALCX = X0 + ALC.x0 + ALC.pitch * ALC.pick + ALC.w / 2;
      const c0 = TF.keys(rr, [[0, 1], [8.4, 1], [9.2, 0], [10.9, 0], [11.7, 1], [12, 1], [12.5, 0], [13.5, 0], [14.3, 1], [24, 1]]);   // rat stows / outbound robot leaves
      const c2 = TF.keys(rr, [[0, 0], [3, 0], [4.2, 1], [20, 1], [21.5, 0], [24, 0]]);   // arrival alcove: open for the arriver until the rat has stepped out
      const cu = TF.stage3.crewUp, hOpen = cu ? cu.hatch(t) : 0;
      D.rect(ctx, X0 - 2, yCargo - 88, 14, 88, '#1d2733');
      D.rect(ctx, X0 - 2, yCargo - 88, 14, 88 * (1 - hOpen), '#cbd5e1', '#64748b', 1);
      const door = (i, c) => {
        const ax = X0 + ALC.x0 + i * ALC.pitch, ay = yCargo - ALC.h;
        D.rect(ctx, ax, ay, ALC.w, ALC.h * c, '#e2e8f0', '#94a3b8', 1);
        D.circle(ctx, ax + ALC.w / 2, ay - 6, 2.6, c >= 1 ? '#4ade80' : '#f59e0b', '#14532d', 0.5);
      };
      door(0, c0); door(1, 1); door(2, c2);
      if (cu) for (const r of cu.list(t)) if (r.st.x >= X0) { const f = A.draw(ctx, r.st, r.y); if (r.fc) { const w = f.w(f.sk.wristN); IT.foodcrate(ctx, w[0], w[1] + 5); } }
      const cyc2id = (c) => TF.mod(c, 2) === 1 ? 0 : 1;   // same parity rule as crewUp: odd cycle -> 'crew-0'
      // cargo rat = the arriver (same id), samples the mars-soil crate, then stows in alcove 0 (closed door)
      const tauR = rr - 1.5;
      const lidP = A.reach([0.42, 0.85], [0.3, 0.8], { gripN: 0.5, lean: 0.1 }), inspP = (tl) => A.reach([0.4, 0.75 + 0.03 * Math.sin(tl * 3)], [0.25, 0.75], { gripN: 0.8, lean: 0.2 });
      const ratSegs = [A.hold(0.5, ALCX, 1, (tl) => A.idle(tl + 2.5)), A.walk(1.0, ALCX, SX, { step: 0.45 }), A.keyed(1.0, SX, 1, [[0, A.stand()], [1, lidP]]),
        A.hold(2.4, SX, 1, inspP), A.keyed(0.9, SX, 1, [[0, lidP], [1, A.stand()]]), A.turn(0.5, SX, 1), A.walk(2.6, SX, AX0, { step: 0.55 }), A.hold(1.4, AX0, -1)];
      let alc0Rob = false;
      if (tauR >= 0 && rr < 11.8) {
        const st = Object.assign(A.run(ratSegs, tauR, 0.25, false), { id: 'crew-' + cyc2id(mm - 1) });
        const f = A.draw(ctx, st, yCargo);
        if (tauR >= 8.9) alc0Rob = true;
        if (tauR >= 2.5 && tauR < 4.9) {   // sample vial: crate -> hand, scanned, back to crate
          const w = f.w(f.sk.wristN), k = TF.ramp(tauR, 2.5, 3.0) - TF.ramp(tauR, 4.3, 4.9), vx = TF.lerp(CX + 38, w[0], k), vy = TF.lerp(yCargo - 16, w[1], k);
          D.rect(ctx, vx - 1.5, vy - 7, 3, 7, '#67e8f9', '#0e7490', 0.5);
          if (tauR > 3.3 && tauR < 4.0) D.circle(ctx, vx, vy - 3.5, 5 + 1.5 * Math.sin(tauR * 30), null, '#4ade80', 1);
        }
      }
      // outbound robot (different id): leaves the closed alcove 0, fetches last cycle's EMPTY food crate, exits through the west hatch
      // outbound robot (different id): leaves the closed alcove 0, takes the parked EMPTY crate, exits the hatch (here only x >= hull plane; tower.js draws the rest: arm -> TL car -> ground west)
      const crateX = CX + 70, co = TF.stage3.crewOut && TF.stage3.crewOut.at(rr, 'crew-out-' + cyc2id(mm - 2));
      if (rr >= 12 && rr < 21 && co) {
        ctx.save(); ctx.beginPath(); ctx.rect(X0 - 2, yCargo - 160, 500, 220); ctx.clip();   // hull plane: past the hatch the tower side owns the picture
        const f = A.draw(ctx, co.st, co.y);
        if (rr >= 15.9) { const w = f.w(f.sk.wristN), k = TF.ramp(rr, 15.9, 16.4); IT.foodcrate(ctx, TF.lerp(crateX, w[0], k), TF.lerp(yCargo, w[1] + 5, k)); }
        ctx.restore();
        if (rr < 14.3) alc0Rob = true;
      }
      if (alc0Rob && c0 > 0) door(0, c0);   // door closes over the robot that is inside alcove 0
      // ---- loadmaster 24 s: galley -> unpack -> empty crate to cargo -> hand-over at ALCX -> full crate up ----
      const alcX = ALCX, ex = CX + 62;
      const lmY = u < 8.5 ? yGalley : u < 11.5 ? TF.lerp(yGalley, yCargo, TF.ramp(u, 8.5, 11.5)) : u < 20.5 ? yCargo : u < 23.2 ? TF.lerp(yCargo, yGalley, TF.ramp(u, 20.5, 23.2)) : yGalley;
      const lmX = TF.keys(u, [[0, CX - 20], [1.8, CX - 20], [2.8, CX + 2], [4.2, CX + 2], [5.2, CX - 20], [7.5, CX - 20], [8.5, CX - 70], [11.5, CX - 70], [13.5, ex], [14.3, ex], [16, alcX + 18],
        [19.28, alcX + 18], [20.5, CX - 70], [23.2, CX - 70], [24, CX - 20]]);
      const lmFace = (u >= 4.2 && u < 6.8) || (u >= 7.5 && u < 11.5) || (u >= 14.3 && u < 19.28) ? -1 : 1;
      const carry = u < 0.8 || (u >= 1.0 && u < 4.0) || (u >= 6.8 && u < 14.3) || u >= 19.28;
      A.draw(ctx, { id: 'loadmaster', x: lmX, face: lmFace, pose: carry ? A.carry(A.stand(), [0.3, 1.1], 0.35) : A.idle(t) }, lmY);
      // unpacked food (3 pieces): crate -> loadmaster's hands -> grill counter -> chef's hand -> eaten
      const food = TF.slot(theme, 'food'), gY = deckY(DCK.cargo) - 28, cw = chefF.w(chefF.sk.wristN);
      for (let i = 0; i < 3; i++) {
        const t0 = 1.0 + 0.15 * i, t1 = 2.9 + 0.35 * i, t2 = 6.2 + 1.6 * i, hx = lmX + 8 * lmFace, hy = lmY - 30 - 7 * i, sl = [CX + 18 + 12 * i, gY];
        let x, y, s = 1, al = 1;
        if (u < t0 || u >= t2 + 1.8) continue;
        if (u < t0 + 0.7) { const k = TF.ramp(u, t0, t0 + 0.7); x = TF.lerp(CX - 10, hx, k); y = TF.lerp(yGalley - 6, hy, k); }
        else if (u < t1) { x = hx; y = hy; }
        else if (u < t1 + 0.6) { const k = TF.ramp(u, t1, t1 + 0.6); x = TF.lerp(hx, sl[0], k); y = TF.lerp(hy, sl[1], k); }
        else if (u < t2) { x = sl[0]; y = sl[1]; }
        else if (u < t2 + 0.5) { const k = TF.ramp(u, t2, t2 + 0.5); x = TF.lerp(sl[0], cw[0], k); y = TF.lerp(sl[1], cw[1], k); }
        else if (u < t2 + 1.1) { x = cw[0]; y = cw[1]; }
        else { const k = TF.ramp(u, t2 + 1.1, t2 + 1.8); x = cw[0]; y = cw[1] - 22 * k; s = 1 - 0.8 * k; al = 1 - k * 0.6; }
        ctx.save(); ctx.globalAlpha = al; ctx.translate(x, y); ctx.scale(s, s); food(ctx, 0, 0, i); ctx.restore();
      }
      // food crate owners (exactly one per physical crate per frame). FULL crate: loadmaster hands -> galley floor -> hands. EMPTY crate: set down at cargo (~14.3), parked until the outbound robot lifts it (u 12.4 = rr 15.9); two crates are in the loop at once (one parked, one in the galley), never the same one twice
      if (u >= 19.28) IT.foodcrate(ctx, lmX + 8 * lmFace, lmY - 30);
      else if (u < 0.8) { const k = TF.ramp(u, 0, 0.8); IT.foodcrate(ctx, TF.lerp(lmX + 8, CX - 10, k), TF.lerp(lmY - 30, yGalley, k)); }
      else if (u < 6.8) IT.foodcrate(ctx, CX - 10, yGalley);
      else if (u < 7.5) { const k = TF.ramp(u, 6.8, 7.5); IT.foodcrate(ctx, TF.lerp(CX - 10, lmX + 8, k), TF.lerp(yGalley, lmY - 30, k)); }
      else if (u < 13.5) IT.foodcrate(ctx, lmX + 8 * lmFace, lmY - 30);
      else if (u < 14.3) { const k = TF.ramp(u, 13.5, 14.3); IT.foodcrate(ctx, TF.lerp(lmX + 8, crateX, k), TF.lerp(lmY - 30, yCargo, k)); }
      if (u >= 14.3 || u < 12.4) IT.foodcrate(ctx, crateX, yCargo);   // parked EMPTY crate (a different one from the galley/hand crate above)
    } });

  TF.flows.push(
    { item: 'serviced Raptor', from: 'TOWER', via: ['CS', 'EB'], to: 'SHIP', sink: 'engine bay mount', owner: 'Starship' },
    { item: 'old Raptor', from: 'SHIP', via: ['EB', 'CS'], to: 'TOWER', sink: 'trolley back to 8D', owner: 'Starship' },
    { item: 'ship food crate', from: 'TOWER', via: ['AA', 'CH'], to: 'SHIP', sink: 'galley', owner: 'Starship' },
    { item: 'crew-up robots', from: 'TOWER', via: ['AA'], to: 'SHIP', sink: 'cargo rack (1 in, 1 out later)', owner: 'Starship' },
    { item: 'LOX + CH4', from: 'VAULT', via: ['TRENCH'], to: 'SHIP', sink: 'tanks (inflow = vent, level steady)', owner: 'Starship' },
    { item: 'LOX + CH4', from: 'VAULT', via: ['TRENCH'], to: 'BOOSTER', sink: 'tanks (inflow = vent, level steady)', owner: 'Starship' }
  );
})(typeof window !== 'undefined' ? window : globalThis);
