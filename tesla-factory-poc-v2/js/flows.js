// Global flow engine: indexed chains (car line), payload routes, pipes, walkers and the building structure.
// Everything is a pure function of loop time t (0..LOOP).
(function () {
  const { C, D, M } = TF;
  const mod = (a, n) => ((a % n) + n) % n;
  TF.mod = mod;

  // ---------- chains ----------
  // slots: [x, y, dwell, move, via?]. Returns { P, T, N, segs, tauArr, slots }.
  TF.buildChain = (slots, P) => {
    const segs = [], tauArr = [];
    let tau = 0;
    slots.forEach((s, i) => {
      tauArr[i] = tau;
      const [x, y, dwell, move, via] = s;
      if (dwell > 0) { segs.push({ t0: tau, t1: tau + dwell, pts: [[x, y]], slot: i }); tau += dwell; }
      const nx = slots[i + 1];
      if (nx && move > 0) {
        const pts = [[x, y], ...(via || []), [nx[0], nx[1]]];
        let L = 0; const cum = [0];
        for (let j = 1; j < pts.length; j++) { L += Math.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]); cum.push(L); }
        segs.push({ t0: tau, t1: tau + move, pts, cum, L, slot: i, move: true });
        tau += move;
      }
    });
    const T = Math.ceil((tau + 0.001) / P) * P;
    return { P, T, N: T / P, segs, tauArr, slots, end: tau };
  };
  // Position of a chain member at its own journey time tau. Returns null when hidden (after the end).
  const POS = { x: 0, y: 0, slot: 0, moving: false, local: 0 };
  TF.chainPos = (ch, tau) => {
    if (tau >= ch.end) return null;
    for (const s of ch.segs) {
      if (tau < s.t1) {
        POS.slot = s.slot; POS.local = tau - ch.tauArr[s.slot];
        if (!s.move) { POS.x = s.pts[0][0]; POS.y = s.pts[0][1]; POS.moving = false; return POS; }
        // each leg is eased on its own; time split proportional to leg length
        const q = ((tau - s.t0) / (s.t1 - s.t0)) * s.L;
        let j = 1; while (j < s.pts.length - 1 && s.cum[j] < q) j++;
        const k = TF.ease((q - s.cum[j - 1]) / (s.cum[j] - s.cum[j - 1] || 1));
        POS.x = TF.lerp(s.pts[j - 1][0], s.pts[j][0], k); POS.y = TF.lerp(s.pts[j - 1][1], s.pts[j][1], k);
        POS.moving = true; return POS;
      }
    }
    return null;
  };
  // Time since the current occupant arrived at slot i (0..P).
  TF.phaseAt = (ch, i, t) => mod(t - ch.tauArr[i], ch.P);
  TF.slotDwell = (ch, i) => ch.slots[i][2];

  // ---------- car look along the journey ----------
  const CS = 0.7; // car scale
  TF.CAR_S = CS;
  const lerpCol = (a, b, k) => {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const ch = (sh) => Math.round(TF.lerp((pa >> sh) & 255, (pb >> sh) & 255, k));
    return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
  };
  TF.lerpCol = lerpCol;
  function drawCar(ctx, ch, tau, p) {
    const A = ch.tauArr, row = p.y < 380 ? 0 : p.y < 686 ? 1 : 2;
    const dir = row === 1 ? -1 : 1;
    const x = p.x, y = p.y;
    if (tau < A[3] + 1.2) { // giga-cast frame, hot at first
      const hot = 1 - TF.lin(tau, 0.4, A[1] + 1.6);
      ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
      D.underbody(ctx, -45, 0, 0.9);
      if (hot > 0) { ctx.globalAlpha = hot * 0.85; D.underbody(ctx, -45, 0, 0.9); D.poly(ctx, [[-45, -5], [-40, -12], [40, -12], [45, -5], [41, 0], [-41, 0]], '#ff7a1a', null); }
      ctx.restore();
      return;
    }
    const paint = TF.lin(tau, A[5] + 0.3, A[6] + 2.2);
    const col = paint <= 0 ? '#d7dce1' : lerpCol('#d7dce1', '#e31937', paint);
    const wheels = tau >= A[13] + 1.4;
    const glassA = TF.lin(tau, A[9], A[10] + 1.5);
    const L = 130 * CS;
    ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1); D.underbody(ctx, -45, 0, 0.9); ctx.restore(); // cast frame stays under the body
    if (tau >= A[12] + 1.7) D.pack(ctx, x, y + 9 - 11 * TF.seg(tau, A[13] + 0.6, A[13] + 1.2), 50); // married battery
    const spin = x / 8 + 30 * TF.clamp(tau - A[19] - 0.2, 0, 2.0);
    D.car(ctx, x - L / 2, y, CS, col, { dir, wheels, glassA, spin });
    if (tau > A[19] && tau < A[20] + 2) { // headlights on during test
      const hx = x + dir * L * 0.47;
      ctx.fillStyle = 'rgba(255,245,180,0.45)';
      ctx.beginPath(); ctx.moveTo(hx, y - 13); ctx.lineTo(hx + dir * 40, y - 24); ctx.lineTo(hx + dir * 40, y - 2); ctx.closePath(); ctx.fill();
    }
  }
  // Lift platform for lift top slot i (bottom slot i+1). Drawn under the car.
  // Platform height of the lift whose top stop is slot i (bottom stop i+1); returns 0..1 too via TF.liftK.
  TF.liftY = (ch, i, t) => {
    const dT = ch.slots[i][2], mT = ch.slots[i][3], dB = ch.slots[i + 1][2], mB = ch.slots[i + 1][3];
    const yT = ch.slots[i][1], yB = ch.slots[i + 1][1];
    const ph = TF.phaseAt(ch, i, t);
    const off = dT + mT + dB + mB * 0.55;
    if (ph < dT) return yT;
    if (ph < dT + mT) return TF.lerp(yT, yB, TF.ease((ph - dT) / mT));
    if (ph < off) return yB;
    return TF.lerp(yB, yT, TF.ease((ph - off) / Math.min(1.0, ch.P - off - 0.05)));
  };
  TF.liftK = (ch, i, t) => (TF.liftY(ch, i, t) - ch.slots[i][1]) / (ch.slots[i + 1][1] - ch.slots[i][1]);
  function liftPlatform(ctx, ch, i, t, w) {
    const x = ch.slots[i][0], yT = ch.slots[i][1];
    const y = TF.liftY(ch, i, t);
    D.rect(ctx, x - w / 2, y, w, 5, C.m3, C.ink, 1.2, 1);
    D.line(ctx, [[x - w / 2 + 6, y], [x - w / 2 + 6, yT - 60]], C.ink, 1);
    D.line(ctx, [[x + w / 2 - 6, y], [x + w / 2 - 6, yT - 60]], C.ink, 1);
    D.joint(ctx, x - w / 2 + 6, y + 2, 2.4); D.joint(ctx, x + w / 2 - 6, y + 2, 2.4);
  }
  // Car decks (roller beds hung from the ceiling) for rows 1 and 2.
  function decks(ctx, t) {
    TF.M.rollers(ctx, 470, 1556, 452, t, 0, 1);
    for (let x = 560; x < 1550; x += 150) { D.line(ctx, [[x, 380], [x, 452]], C.m3, 2); D.joint(ctx, x, 452, 2.4); }
    TF.M.rollers(ctx, 150, 590, 826, t, 0, 1);
    for (let x = 200; x < 590; x += 130) { D.line(ctx, [[x, 686], [x, 826]], C.m3, 2); D.joint(ctx, x, 826, 2.4); }
    TF.M.rollers(ctx, 664, 1586, 966, t, 0, 1);
  }
  TF.drawCars = (ctx, t) => {
    const ch = TF.CAR;
    decks(ctx, t);
    liftPlatform(ctx, ch, 7, t, 104); liftPlatform(ctx, ch, 14, t, 104); liftPlatform(ctx, ch, 17, t, 104);
    for (let c = 0; c < ch.N; c++) {
      const tau = mod(t + c * ch.P, ch.T), p = TF.chainPos(ch, tau);
      if (p) drawCar(ctx, ch, tau, p);
    }
  };

  // ---------- payload routes ----------
  // k items enter per loop (multiple of 12 so every payload list of 3 or 4 tiles the loop), spacing s px.
  function prep(r) {
    if (r.L) return r;
    r.cum = [0]; r.L = 0;
    for (let j = 1; j < r.pts.length; j++) { r.L += Math.hypot(r.pts[j][0] - r.pts[j - 1][0], r.pts[j][1] - r.pts[j - 1][1]); r.cum.push(r.L); }
    r.v = (r.k * r.s) / TF.LOOP;
    return r;
  }
  const AT = [0, 0];
  const at = (r, d) => {
    let j = 1; while (j < r.pts.length - 1 && r.cum[j] < d) j++;
    const k = (d - r.cum[j - 1]) / (r.cum[j] - r.cum[j - 1] || 1);
    AT[0] = TF.lerp(r.pts[j - 1][0], r.pts[j][0], k); AT[1] = TF.lerp(r.pts[j - 1][1], r.pts[j][1], k);
    return AT;
  };
  TF.drawRoute = (ctx, r, t, theme, size = 14) => {
    prep(r);
    const p = t / TF.LOOP;
    for (let j = 1; j < r.pts.length; j++) {
      const [x0, y0] = r.pts[j - 1], [x1, y1] = r.pts[j];
      if (y0 === y1) {
        const dir = Math.sign(x1 - x0) || 1;
        D.belt(ctx, Math.min(x0, x1) - 8, y0, Math.abs(x1 - x0) + 16, p, Math.round((r.k * r.s) / 12), dir);
      } else {
        D.rect(ctx, x0 - 10, Math.min(y0, y1) - 8, 20, Math.abs(y1 - y0) + 8, 'rgba(190,215,235,0.45)', C.m3, 1.2, 3);
      }
    }
    const head = t * r.v;
    const g0 = Math.ceil((head - r.L) / r.s), g1 = Math.floor(head / r.s);
    for (let g = g0; g <= g1; g++) {
      const d = head - g * r.s;
      const [x, y] = at(r, d);
      const lift = 1 - TF.clamp((d - r.cum[1]) / 14, 0, 1); // 1 on the belt, 0 once inside the chute
      TF.payload(ctx, theme, g + (r.seed || 0), x, y - size * 0.55 * lift, size);
    }
  };
  TF.routeCovers = (ctx, r, t, theme) => {
    const [sx, sy] = r.pts[0], [ex, ey] = r.pts[r.pts.length - 1];
    const vEnd = r.pts[r.pts.length - 2][0] === ex;
    // feeder at the start
    D.rect(ctx, sx - 20, sy - 30, 32, 40, C.m, C.line, 1.4, 3);
    D.rect(ctx, sx - 16, sy - 24, 24, 5, theme.accent, null, 0, 1);
    M.lights(ctx, sx - 13, sy - 8, 3, t, (sx | 0) % 7);
    D.joint(ctx, sx - 4, sy + 4, 2.6);
    // bin / receiver at the end
    if (vEnd) { D.rect(ctx, ex - 22, ey - 6, 44, 26, C.m, C.line, 1.4, 3); D.rect(ctx, ex - 16, ey + 2, 32, 4, theme.accent, null, 0, 1); }
    else { D.rect(ctx, ex - 12, ey - 30, 34, 40, C.m, C.line, 1.4, 3); M.lights(ctx, ex - 6, ey - 20, 3, t, 3); }
  };

  // ---------- pipes ----------
  TF.drawPipe = (ctx, pp, t, theme) => {
    D.pipe(ctx, pp.pts, pp.w);
    if (!pp.L) { pp.L = 0; pp.cum = [0]; for (let j = 1; j < pp.pts.length; j++) { pp.L += Math.hypot(pp.pts[j][0] - pp.pts[j - 1][0], pp.pts[j][1] - pp.pts[j - 1][1]); pp.cum.push(pp.L); } }
    const sp = 22, head = TF.frac(t / 8) * sp * 24; // 48 spacings per loop
    ctx.fillStyle = theme.blob || C.blue;
    for (let d = head % sp; d < pp.L; d += sp) {
      const [x, y] = at(pp, d);
      ctx.beginPath(); ctx.arc(x, y, pp.w * 0.32, 0, Math.PI * 2); ctx.fill();
    }
  };

  // ---------- walkers ----------
  // keys: [time, x, y?]. Segments with equal x are stops (or lift rides when y changes, eased).
  // Facing turns ease over the last 0.45 s of a whole run of stop segments.
  const W = { x: 0, y: 0, face: 1, moving: false };
  function walkState(w, tau) {
    const k = w.keys, n = k.length - 1;
    let i = 0; while (i < n - 1 && tau >= k[i + 1][0]) i++;
    const [ta, xa, ya = w.y] = k[i], [tb, xb, yb = w.y] = k[i + 1];
    const q = (tau - ta) / (tb - ta || 1);
    W.moving = xa !== xb;
    W.x = TF.lerp(xa, xb, q); W.y = TF.lerp(ya, yb, W.moving ? q : TF.ease(q));
    const dirOf = (j) => { const s0 = k[mod(j, n)], s1 = k[mod(j, n) + 1]; return Math.sign(s1[1] - s0[1]); };
    if (W.moving) { W.face = Math.sign(xb - xa); W.still = 0; return W; }
    let pj = i - 1, nj = i + 1, pd = 0, nd = 0, g = 0;
    while (!(pd = dirOf(pj)) && g++ < 20) pj--;
    g = 0; while (!(nd = dirOf(nj)) && g++ < 20) nj++;
    let tEnd = k[mod(nj, n)][0]; if (nj >= n) tEnd += w.period; // start time of the next real move
    let tStart = k[mod(pj + 1, n)][0]; if (pj + 1 < 0) tStart -= w.period;
    W.still = Math.min(TF.ease((tau - tStart) / 0.35), TF.ease((tEnd - tau) / 0.35)); // 0 at walk<->stand hand-offs
    const turn = TF.ease((tau - (tEnd - 0.45)) / 0.4);
    W.face = pd === nd ? pd : Math.cos(turn * Math.PI) * pd;
    return W;
  }
  TF.walkState = walkState;
  // walking pose and standing pose blended by s.still so stops/starts never snap
  const optHands = (s, f, t, c, y) => {
    const sf = Math.sign(f), st = s.still, reach = TF.osc(t, 0.5, c * 0.3), sw = Math.sin(t * Math.PI * 4);
    return [[s.x + sf * TF.lerp(6 + sw * 6, 16 + reach * 4, st), y - 30 - st * (6 + reach * 3)],
      [s.x + sf * TF.lerp(-6 - sw * 6, 12, st), y - 28 - st * 8]];
  };
  // Carrier: box slides out of a dispenser, is picked up, carried, and lowered into a bin (both covered by room fronts).
  function carrier(ctx, w, s, f, tau, t, theme, c, y) {
    const C2 = w.carry, sf = Math.sign(f);
    const hold = [s.x + f * 13, y - 33];
    let box = null, holding = false, rel = 0;
    if (tau >= C2.slide[0] && tau < C2.pick[0]) {
      box = [TF.lerp(C2.ledge[0] + 30, C2.ledge[0], TF.seg(tau, C2.slide[0], C2.slide[1])), C2.ledge[1]];
    } else if (tau >= C2.pick[0] && tau < C2.drop[0]) {
      const k = TF.seg(tau, C2.pick[0], C2.pick[1]);
      box = [TF.lerp(C2.ledge[0], hold[0], k), TF.lerp(C2.ledge[1], hold[1], k)]; holding = k > 0;
    } else if (tau >= C2.drop[0] && tau < C2.drop[1]) {
      const k1 = TF.seg(tau, C2.drop[0], C2.drop[0] + 0.5), k2 = TF.seg(tau, C2.drop[0] + 0.5, C2.drop[1]);
      box = [TF.lerp(hold[0], C2.bin[0], k1), TF.lerp(hold[1], C2.bin[1], k1) + 22 * k2]; holding = k2 < 0.6;
      rel = TF.seg(k2, 0.2, 0.95); // hands ease off the box while it sinks
    }
    const legs = t * Math.PI * 4, amp = 1 - s.still, bob = -Math.abs(Math.sin(legs)) * 1.2 * amp;
    let [hF, hB] = optHands(s, f, t, c, y);
    if (box && (holding || rel > 0) && tau >= C2.pick[0]) {
      const bF = [box[0] + sf * 2, box[1] + 2], bB = [box[0] - sf * 6, box[1] + 4];
      hF = [TF.lerp(bF[0], hF[0], rel), TF.lerp(bF[1], hF[1], rel)]; hB = [TF.lerp(bB[0], hB[0], rel), TF.lerp(bB[1], hB[1], rel)];
    }
    else if (tau >= C2.pick[0] - 0.5 && tau < C2.pick[0]) { const k = TF.seg(tau, C2.pick[0] - 0.5, C2.pick[0]); hF = [TF.lerp(hF[0], C2.ledge[0], k), TF.lerp(hF[1], C2.ledge[1], k)]; }
    const drawBox = () => box && TF.payload(ctx, theme, c + 1, box[0], box[1], 14);
    D.opt(ctx, s.x, y, 0.62, { face: f, bob, walk: legs, amp, hB, hF, mid: holding ? drawBox : null });
    if (!holding) drawBox();
  }
  TF.drawWalkers = (ctx, t, theme, front = false) => {
    for (const w of TF.WALKERS) {
      if (!!w.front !== front) continue;
      for (let c = 0; c < w.n; c++) {
        const tau = mod(t + (c * w.period) / w.n, w.period);
        const s = walkState(w, tau), y = s.y;
        const f = Math.abs(s.face) < 0.12 ? 0.12 * Math.sign(s.face || 1) : s.face;
        const legs = t * Math.PI * 4, amp = 1 - s.still, sw = Math.sin(legs) * 0.5 * amp;
        const bob = -Math.abs(Math.sin(legs)) * 1.2 * amp;
        if (w.kind === 'carrier') carrier(ctx, w, s, f, tau, t, theme, c, y);
        else if (w.kind === 'optimus') {
          const [hF, hB] = optHands(s, f, t, c, y);
          D.opt(ctx, s.x, y, 0.62, { face: f, bob, walk: legs, amp, hF, hB });
        } else if (w.kind === 'elon') {
          if (w.draw) w.draw(ctx, t, s, true);
          D.person(ctx, s.x, y, { s: 0.85, face: f, shirt: '#111214', pants: '#2c3036', hair: 'swept', tee: true, walk: legs, amp, bob,
            armF: TF.lerp(sw, 0.7 + TF.osc(t, 0.5) * 0.05, s.still), armB: TF.lerp(-sw, -0.1, s.still) });
          if (w.draw) w.draw(ctx, t, s, false);
        } else {
          if (w.cart) M.cart(ctx, s.x + f * 20, y, f);
          D.person(ctx, s.x, y, { s: 0.8, face: f, shirt: w.shirt, hair: 'cap', hat: w.hat || '#f4c430', walk: legs, amp, bob,
            box: w.box, armF: w.cart ? 1.3 : TF.lerp(sw, 1.1 + TF.osc(t, 1) * 0.2, s.still), armB: w.cart ? undefined : TF.lerp(-sw, -0.15, s.still) });
        }
      }
    }
  };

  // ---------- structure ----------
  const SLAB = '#8f99a3', SLAB_D = '#68717a';
  TF.drawStructureBack = (ctx) => {
    // tunnels seen through openings
    ctx.fillStyle = '#dfe3e7';
    for (const w of TF.WALLS.v) for (const [a, b] of w.open) ctx.fillRect(w.x - 2, a, w.w + 4, b - a);
  };
  TF.drawStructure = (ctx) => {
    const G = TF.GRID;
    for (const w of TF.WALLS.v) {
      let y = w.y0;
      const solid = (y0, y1) => { if (y1 > y0) { ctx.fillStyle = SLAB; ctx.fillRect(w.x, y0, w.w, y1 - y0); ctx.fillStyle = SLAB_D; ctx.fillRect(w.x, y0, 2, y1 - y0); ctx.fillRect(w.x + w.w - 2, y0, 2, y1 - y0); } };
      for (const [a, b] of w.open) {
        solid(y, a);
        ctx.fillStyle = SLAB_D; ctx.fillRect(w.x - 2, a - 3, w.w + 4, 3); // lintel
        y = b;
      }
      solid(y, w.y1);
    }
    for (const h of TF.WALLS.h) {
      let x = h.x0;
      const solid = (x0, x1) => {
        if (x1 <= x0) return;
        ctx.fillStyle = SLAB; ctx.fillRect(x0, h.y, x1 - x0, h.h);
        ctx.fillStyle = SLAB_D; ctx.fillRect(x0, h.y, x1 - x0, 2); ctx.fillRect(x0, h.y + h.h - 2, x1 - x0, 2);
      };
      for (const [a, b] of h.open) { solid(x, a); x = b; }
      solid(x, h.x1);
      for (const [a, b] of h.open) { ctx.fillStyle = '#e8c547'; ctx.fillRect(a - 4, h.y, 4, h.h); ctx.fillRect(b, h.y, 4, h.h); }
    }
    // garage door frames (rolled-up shutters)
    for (const [x, y0] of [[0, 902], [1586, 898]]) {
      D.rect(ctx, x, y0 - 12, 14, 12, '#c3c9cf', SLAB_D, 1.2, 1);
      for (let i = 0; i < 3; i++) D.line(ctx, [[x + 1, y0 - 10 + i * 4], [x + 13, y0 - 10 + i * 4]], SLAB_D, 1);
    }
    D.rect(ctx, 0.5, G.top + 0.5, 1599, G.bottom - G.top - 1, null, '#5d666f', 1.5, 0);
  };
})();
