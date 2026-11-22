// PB — pack paternoster in the back wall of column B, floors 2-5 (FACTORY-MAP §1, §3). 8 open cabins circulate
// continuously (24 s per loop, a cabin passes each stop every 3 s). Car / Semi packs board at the 3B stop and ride to
// 5B, 4B (up side) or 2B (down side); each trip is a pure function of t. Rooms read TF.PB.trip(id) for exit times.
(function (G) {
  const TF = G.TF, L = TF.layout, D = TF.draw;
  const XU = 1846, XD = 1876, yBot = L.floorY(2), yTop = L.floorY(5) - 110, H = yBot - yTop, Lp = 2 * H + 60, v = Lp / 24, N = 8, SP = Lp / N;
  const pos = (s) => { s = TF.mod(s, Lp);
    if (s < H) return [XU, yBot - s];
    if (s < H + 30) return [TF.lerp(XU, XD, (s - H) / 30), yTop];
    if (s < 2 * H + 30) return [XD, yTop + (s - H - 30)];
    return [TF.lerp(XD, XU, (s - 2 * H - 30) / 30), yBot]; };
  const sUp = (f) => yBot - L.floorY(f), sDn = (f) => H + 30 + (L.floorY(f) - yTop);
  // trips: board at 3B at tb (tau mod 24, must be a cabin pass time), exit at the destination stop
  const TR = {};
  const trip = (id, dest, tb, big) => { const down = dest < 3, s0 = down ? sDn(3) : sUp(3), s1 = down ? sDn(dest) : sUp(dest);
    TR[id] = { id, dest, tb, te: TF.mod(tb + (s1 - s0) / v, 24), s0, big, down }; };
  // cabin pass times at the 3B up stop are 0.468 + 3n, at the 3B down stop 2.208 + 3n (see FACTORY-MAP §6 PB)
  trip('5B-a', 5, 5.468); trip('5B-b', 5, 17.468); trip('4B', 4, 0.468); trip('2B-ct', 2, 11.208); trip('2B-semi', 2, 20.208, true);
  // R3-9: packs are always the same flat slab (w/th below). Tray top sits RISE above the stop; a pack on the tray has its bottom there.
  const W = (p) => p.big ? 56 : /ct/.test(p.id) ? 120 : /^5B/.test(p.id) ? 104 : 84, TH = (p) => p.big ? 10 : 5, RISE = () => 0.13 * TF.M - 5;
  TF.PB = { XU, XD, trip: (id) => TR[id], trips: TR, period: 24, w: W, th: TH, rise: RISE };
  const cx = (p) => p.down ? XD : XU, dur = (p) => TF.mod(p.te - p.tb, 24), TW = 124, XM = (XU + XD) / 2;
  // gate lift 0..1 for a landing (floor f, column x) at time t: open during load (3B) and unload windows of any trip
  const gateOpen = (t, f, x) => { let o = 0;
    for (const k in TR) { const p = TR[k];
      const win = (a, len) => { const w = TF.mod(t - a, 24); return w < len ? Math.min(TF.ramp(w, 0, 0.3), 1 - TF.ramp(w, len - 0.3, len)) : 0; };
      if (f === 3 && x === cx(p)) o = Math.max(o, win(p.tb - 0.9, 1.2));
      if (f === p.dest && x === cx(p)) o = Math.max(o, win(p.te - 0.5, 1.7)); }
    return o; };
  TF.transport({ id: 'PB', owner: '3B', period: 24, layer: 'back', box: { x: XU - 80, y: yTop - 150, w: 210, h: H + 170 },
    draw(ctx, t, theme, lod) {
      const yTs = yTop - 104, yBs = yBot - 104, rise = RISE(), ang = TF.mod(t, 24) * Math.PI * 2 * 8 / 24;   // R3 seam: whole turns per 24 s
      // shaft frame: two side rails + centre divider
      for (const x of [XU - 66, XM, XD + 80]) D.line(ctx, [[x, yTop - 130], [x, yBot + 6]], '#b3bac1', x === XM ? 1 : 2);
      D.rect(ctx, XU - 66, yTop - 132, XD + 80 - XU + 66, 4, '#9aa3ab', '#6d757d', 0.8);
      // drive chain loop (hanger-height path) with moving link dots
      D.line(ctx, [[XU, yBs], [XU, yTs]], '#59616a', 1.4); D.line(ctx, [[XD, yBs], [XD, yTs]], '#59616a', 1.4);
      if (lod !== 'far') for (let k = 0; k < Math.floor(Lp / 16); k++) { const [x, y] = pos(v * TF.mod(t, 24) + k * 16); D.circle(ctx, x, y - 104, 1.6, '#2a2e33'); }
      // sprockets (top + bottom) and top motor with spinning coupling
      for (const yy of [yTs, yBs]) { D.circle(ctx, XM, yy, 16, '#c9d0d6', '#59616a', 1.5);
        if (lod !== 'far') for (let k = 0; k < 6; k++) { const a = ang + k * Math.PI / 3; D.circle(ctx, XM + Math.cos(a) * 14, yy + Math.sin(a) * 14, 2, '#59616a'); }
        D.circle(ctx, XM, yy, 3, '#59616a'); }
      D.line(ctx, [[XM, yTs], [XD + 30, yTs - 14]], '#6d757d', 2);
      D.rect(ctx, XD + 30, yTs - 28, 34, 28, '#7b848c', '#4a5159', 1.2);
      D.circle(ctx, XD + 30, yTs - 14, 6, '#e3e7eb', '#4a5159', 1);
      if (lod !== 'far') D.line(ctx, [[XD + 30 - Math.cos(ang * 2) * 5, yTs - 14 - Math.sin(ang * 2) * 5], [XD + 30 + Math.cos(ang * 2) * 5, yTs - 14 + Math.sin(ang * 2) * 5]], '#d33', 1.5);
      // landings: sill plate + lifting gate; 3B shaft-side ramp is the sill itself
      const lands = [[5, XU], [4, XU], [3, XU], [3, XD], [2, XD]];
      for (const [f, x] of lands) { const yS = L.floorY(f) - rise, g = gateOpen(t, f, x);
        D.rect(ctx, x + TW / 2, yS, 70, 4, '#9aa3ab', '#6d757d', 0.8);
        D.rect(ctx, x + TW / 2 + 2, yS - 34, 12, 4, '#6d757d');
        D.rect(ctx, x + TW / 2 + 5, yS - 30 - 20 * g, 6, 22, '#d9a62b', '#8a6a14', 0.8); }
      if (lod === 'far') { for (let c = 0; c < N; c++) { const [x, y] = pos(v * TF.mod(t, 24) + c * SP); D.rect(ctx, x - 62, y - 104, 124, 106, null, '#7b848c', 1); } return; }
      // pusher arms at the exit landings (push the slab off the tray; floor takes it at te)
      for (const k in TR) { const p = TR[k], u = TF.mod(t - p.te + 0.7, 24) - 0.7;
        if (u < -0.7 || u > 0.9) continue;
        const w = W(p), off = p.down ? 0 : 30, hx = cx(p) - 74, e0 = cx(p) - w / 2, yS = L.floorY(p.dest) - rise - TH(p) / 2;
        const tip = u < -0.35 ? TF.lerp(hx, e0, TF.ramp(u, -0.7, -0.35)) : u < 0 ? e0 + off * TF.ramp(u, -0.35, 0)
          : TF.lerp(e0 + off + 12 * TF.ramp(u, 0.05, 0.35), hx, TF.ramp(u, 0.45, 0.9));
        D.rect(ctx, hx - 12, yS - 9, 12, 18, '#7b848c', '#4a5159', 1); D.line(ctx, [[hx, yS], [tip, yS]], '#59616a', 3); D.rect(ctx, tip - 3, yS - 8, 4, 16, '#59616a'); }
      // cabins: tray + backstop + upright + hanger bar to the chain
      for (let c = 0; c < N; c++) { const [x, y] = pos(v * TF.mod(t, 24) + c * SP);
        D.rect(ctx, x - TW / 2, y - rise, TW, 5, '#c9d0d6', '#59616a', 1.2);
        D.rect(ctx, x - TW / 2, y - rise - 14, 4, 14, '#9aa3ab', '#59616a', 1);
        D.rect(ctx, x - TW / 2, y - 104, 4, 104 - rise, '#b3bac1', '#59616a', 1);
        D.rect(ctx, x - TW / 2, y - 104, TW / 2 + 5, 4, '#9aa3ab', '#59616a', 1);
        D.circle(ctx, x, y - 102, 3, '#e3e7eb', '#59616a', 1); }
      // packs: same flat slab as on the floors, lying on the tray
      for (const k in TR) { const p = TR[k], u = TF.mod(t - p.tb, 24), d = dur(p);
        if (u >= d) continue;
        const [x, y] = pos(p.s0 + u * v), r = d - u, xo = p.down ? 0 : 30 * TF.ramp(0.35 - r, 0, 0.35), w = W(p), th = TH(p);
        D.rect(ctx, x + xo - w / 2, y - rise - th, w, th, '#2a2e33', '#111', 0.6); }
    } });
})(typeof window !== 'undefined' ? window : globalThis);
