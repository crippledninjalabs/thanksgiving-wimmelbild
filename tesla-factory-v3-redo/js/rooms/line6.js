// Floor 6 shared line (FACTORY-MAP §2 Floor 6, §4): the Model Y top-half car chain W -> E at a 12 s pitch,
// the staged body drawing (frame -> quarter panel + weld beads -> doors + hood -> red paint -> bake), and the
// floor's cross-room carriers: F6H hangers (6A -> 6C), F6R baskets (blanks to 6A, paint cans to 6D; empties
// tipped into the SS slide), and the PT capsule network (bolts -> 6C, weld tips -> 6B, sealer -> 6D).
(function (G) {
  const TF = G.TF, TF3 = G.TF3, L = TF.layout, D = TF.draw, P = TF3.paint, M = TF.M;
  const F = 6, yF = L.floorY(F), hY = (h) => yF - h * M;
  const PITCH = 12, MOVE0 = 8.5;
  // car-centre stations: 6A press, 6B weld, 6C doors, 6D booth, 6E oven, 6E lift L65
  const S = [1695, 2080, 2560, 3050, 3410, 3620];
  const LIFE = 48 + 10.9;                        // age when the car has dropped below the slab
  const line = (TF.line6 = { F, yF, hY, S, PITCH, LIFE, rollTop: yF - 0.33 * M });

  // ---------- body geometry (car-local metres, x forward, y up; from the approved Model Y side view) ----------
  const OUT = [[2.3, 0.33], [2.38, 0.46], [2.36, 0.66], [2.15, 0.82], [1.6, 0.95], [1.12, 1.02], [0.7, 1.36], [0.3, 1.57],
    [-0.3, 1.62], [-1.0, 1.58], [-1.6, 1.46], [-2.05, 1.3], [-2.28, 1.17], [-2.35, 1.16], [-2.38, 0.98], [-2.36, 0.5], [-2.25, 0.33], [0, 0.33]];
  const GLASS = [[1.05, 1.05], [0.68, 1.34], [0.3, 1.54], [-0.3, 1.585], [-1.0, 1.545], [-1.6, 1.42], [-1.95, 1.28], [-1.75, 1.1], [0, 1.05]];
  const PIECE = {
    rearDoor: { poly: [[-1.35, 0.49], [-0.1, 0.46], [-0.1, 1.05], [-1.33, 1.06]], frame: [[-0.1, 1.05], [-0.1, 1.585], [-1.0, 1.545], [-1.33, 1.47], [-1.33, 1.06]], c: [-0.72, 1.0] },
    frontDoor: { poly: [[-0.1, 0.46], [1.15, 0.48], [1.13, 1.03], [-0.1, 1.05]], frame: [[1.05, 1.05], [0.68, 1.34], [0.3, 1.54], [-0.1, 1.585], [-0.1, 1.05]], c: [0.52, 1.0] },
    hood: { poly: [[1.13, 1.03], [1.6, 0.955], [2.15, 0.825], [2.2, 0.75], [1.6, 0.875], [1.13, 0.95]], c: [1.65, 0.89] },
    quarter: { poly: [[-1.35, 0.52], [-1.35, 1.1], [-1.75, 1.1], [-1.95, 1.28], [-2.05, 1.3], [-2.28, 1.17], [-2.35, 1.16], [-2.38, 0.98], [-2.36, 0.52]], c: [-1.86, 0.85] },
  };
  const ARCH = [[1.455, 0.37], [-1.435, 0.37]], ARCH_R = 0.44;
  // weld seams (6B): 0 roof (arm R2), 1 quarter top (R1), 2 quarter front (F1), 3 sill (F2)
  const SEAMS = [[[0.3, 1.57], [-0.95, 1.585]], [[-1.35, 1.1], [-1.75, 1.1], [-1.95, 1.28]], [[-1.35, 0.54], [-1.35, 1.1]], [[-0.9, 0.47], [1.1, 0.47]]]
    .map((pts) => TF.track.path(pts));
  // 6B weld windows (tau within the 6B pitch) and 6C fitting times
  const WELD = [[2.3, 5.0], [2.5, 5.0], [2.8, 5.2], [3.2, 7.6]];
  line.WELD = WELD; line.SEAMS = SEAMS; line.PIECE = PIECE;
  // 6C: ONE Optimus hangs + bolts rear door, front door, hood in sequence (round 4)
  line.FIT = { rearDoor: 1.2, frontDoor: 4.2, hood: 6.9, boltRear: 2.0, boltFront: 5.0, boltHood: 7.8 };
  line.TAKE = { rearDoor: 0.4, frontDoor: 3.4, hood: 6.0 };   // tau when each part leaves the 6C hanger
  const COL = { frame: '#aeb5bc', steel: '#bcc3ca', red: TF3.style.vehicles.paints.red, open: '#e6e9ed', win: '#7d858d', out: '#5d656d', bead: '#3f454b' };

  // ---------- car chain (pure function of t) ----------
  line.state = (age) => {
    const i = Math.min(4, Math.floor(age / PITCH)), tau = age - i * PITCH;
    let x = S[i], drop = 0;
    if (i < 4) { if (tau >= MOVE0) x = TF.lerp(S[i], S[i + 1], TF.ramp(tau, MOVE0, PITCH)); }
    else { x = TF.lerp(S[4], S[5], TF.ramp(tau, 5, 6.8)); drop = 300 * TF.ramp(tau, 9.4, 10.9); }   // QC polish + scan on the lift 6.8-9.3, then L65 drops
    const a6B = age - 12, a6C = age - 24, a6D = age - 36, a6E = age - 48;
    return {
      age, room: i, tau, x, drop,
      heat: 1 - TF.ramp(age, 3.8, 13),
      quarter: a6B >= 2.0,
      beads: WELD.map(([w0, w1]) => TF.lin(a6B, w0, w1)),
      welding: WELD.map(([w0, w1]) => a6B >= w0 && a6B < w1),
      rearDoor: a6C >= line.FIT.rearDoor, frontDoor: a6C >= line.FIT.frontDoor, hood: a6C >= line.FIT.hood,
      bolts: [a6C >= line.FIT.boltRear, a6C >= line.FIT.boltFront, a6C >= line.FIT.boltHood],
      paint: TF.lin(a6D, 0.8, 7.6),
      bake: TF.ramp(a6E, 0.3, 4.8),
    };
  };
  line.cars = (t) => {
    const out = [], k1 = Math.floor(t / PITCH), k0 = Math.floor((t - LIFE) / PITCH);
    for (let k = k0; k <= k1; k++) { const age = t - k * PITCH; if (age >= 0 && age < LIFE) out.push(Object.assign({ k }, line.state(age))); }
    return out;
  };
  line.carAtStation = (t, i) => line.cars(t).find((c) => c.room === i);
  // roller angle for room i: two whole turns per move (seamless), only while a car moves
  line.rollerAng = (t, extra) => {
    const n = Math.floor(t / PITCH), tau = t - n * PITCH;
    return Math.PI * 4 * (n + TF.ramp(tau, MOVE0, PITCH) + (extra ? n + TF.ramp(tau, 5, 6.8) : 0));
  };

  // ---------- drawing: looks live in biw.js (body-in-white), this file only owns geometry + timing ----------
  line.ARCH = ARCH; line.ARCH_R = ARCH_R; line.OUT = OUT; line.GLASS = GLASS;
  line.drawBody = (ctx, x, y, st, lod) => TF.biw.drawBody(ctx, x, y, st, lod);
  line.drawPiece = (ctx, name, wx, wy, lod) => TF.biw.drawPiece(ctx, name, wx, wy, lod);
  line.pieceTop = (name) => Math.max(...PIECE[name].poly.concat(PIECE[name].frame || []).map((p) => p[1])) - PIECE[name].c[1];
  line.seamWorld = (carX, j, u) => { const p = SEAMS[j].at(SEAMS[j].total * u); return [carX + p[0] * M, yF - p[1] * M]; };

  TF.transport({ id: 'F6-cars', owner: '6A', period: PITCH, layer: 'main', box: { x: L.X0, y: L.ceilY(F), w: L.X1 - L.X0, h: 320 },
    draw(ctx, t, theme, lod) {
      for (const c of line.cars(t)) {
        if (c.drop > 0) { ctx.save(); ctx.beginPath(); ctx.rect(3400, yF - 200, 400, 200); ctx.clip(); }
        line.drawBody(ctx, c.x, yF - 0.0 + c.drop, c, lod);
        if (c.drop > 0) ctx.restore();
      }
    } });

  // ---------- F6H hangers (power-and-free, 3 hangers, 36 s journey; a loaded hanger waits over 6B) ----------
  const yLo = hY(L.rail.hangerLo), yHi = hY(L.rail.hangerHi);
  const HX0 = 1610, hp = TF.track.path([[HX0, yLo], [2700, yLo], [2700, yHi], [HX0, yHi]], true);
  const HOFF = { rearDoor: -59, frontDoor: 3, hood: 59.5, winch: 95, quarter: 95 };
  const H6C = 102;   // drop at 6C
  const sP = 1640 - HX0, sE = 1705 - HX0, sB = 2080 - HX0, sC = 2583 - HX0;   // press slot, 6A-east winch, 6B buffer, 6C drop
  const hsched = TF.track.schedule([[0, sP, 0, 0], [5.3, sP, 0, 0], [6.0, sE, 0, 0], [6.8, sE, 0, 1], [7.2, sE, 0, 1], [7.9, sE, 0, 0],
    [8.1, sE, 0, 0], [10.0, sB, 0, 0], [20.0, sB, 0, 0], [21.0, sC, 0, 0], [22.4, sC, 0, 0], [23.4, sC, H6C, 0], [30.2, sC, H6C, 0], [31.0, sC, 0, 0],
    [31.5, 2700 - HX0, 0, 0], [32.0, 2700 - HX0 + 6, 0, 0], [35.2, hp.total - 6, 0, 0], [35.6, hp.total, 0, 0],   // slow rail switch at the ends
    [36, hp.total + sP, 0, 0]], 36);
  line.hanger = (t, i) => { // i = 0, 1, 2 (offset 12 s)
    const j = TF.mod(t - i * 12, 36), st = hsched(j), [x, y] = hp.at(st.s);
    const bar = y + 7 + st.k[0], winch = st.k[1];
    return { j, x, y, bar, drop: st.k[0], winch,
      parts: { // which parts hang on this hanger at time j
        rearDoor: j >= 2.0 && j < 24 + line.TAKE.rearDoor, frontDoor: j >= 2.0 && j < 24 + line.TAKE.frontDoor,
        hood: j >= 4.6 && j < 24 + line.TAKE.hood, quarter: j >= 4.6 && j < 7.0 },
      pos: (name) => [x + HOFF[name], name === 'hood' ? bar + 37.5 : name === 'quarter' ? bar + 14 + winch * 125 + 20 : bar + 30] };
  };
  // parts sliding from the panel press (on the 6A mezzanine) onto the hooks
  line.PRESS_OUT = [1480, hY(3.7)];
  TF.transport({ id: 'F6H', owner: '6A', period: 12, layer: 'main', box: { x: HX0 - 110, y: yHi - 20, w: 2700 - HX0 + 220, h: 260 },
    draw(ctx, t, theme, lod) {
      TF.hanger.rail(ctx, HX0, 2700, yLo, yHi, lod);
      if (lod === 'far') return;
      for (let i = 0; i < 3; i++) {
        const h = line.hanger(t, i);
        TF.hanger.draw(ctx, h.x, h.y, h.drop, 100, lod);
        D.line(ctx, [[h.x + HOFF.winch, h.bar], [h.x + HOFF.winch, h.bar + 14 + h.winch * 125]], '#59626b', 1);   // winch cord
        D.rect(ctx, h.x + HOFF.winch - 4, h.bar + 12 + h.winch * 125, 8, 4, '#4f5861');
        for (const n of ['rearDoor', 'frontDoor']) {
          if (!h.parts[n]) continue;
          let [px, py] = h.pos(n);
          const u = TF.ramp(h.j, 2.0, 2.6);                       // slide out of the press along the bar
          const sliding = h.j < 2.6;
          if (sliding) { px = TF.lerp(line.PRESS_OUT[0], px, u); py = TF.lerp(line.PRESS_OUT[1], py, u); ctx.save(); ctx.beginPath(); ctx.rect(1505, py - 80, 400, 160); ctx.clip(); }
          D.line(ctx, [[px, h.bar], [px, py - 28]], '#59626b', 1);
          line.drawPiece(ctx, n, px, py, lod);
          if (sliding) ctx.restore();
        }
        for (const n of ['hood', 'quarter']) {
          if (!h.parts[n]) continue;
          let [px, py] = h.pos(n);
          const u = TF.ramp(h.j, 4.6, 5.2);
          const sliding = h.j < 5.2;
          if (sliding) { px = TF.lerp(line.PRESS_OUT[0], px, u); py = TF.lerp(line.PRESS_OUT[1], py, u); ctx.save(); ctx.beginPath(); ctx.rect(1505, py - 80, 400, 160); ctx.clip(); }
          if (n === 'hood') { D.line(ctx, [[px - 12, h.bar], [px - 12, py - 4]], '#59626b', 1); D.line(ctx, [[px + 12, h.bar], [px + 12, py - 4]], '#59626b', 1); }
          line.drawPiece(ctx, n, px, py, lod);
          if (sliding) ctx.restore();
        }
      }
    } });

  // ---------- F6R baskets (fleets: N baskets share one schedule, offset by the period) ----------
  // Speeds are kept under ~700 units/s so a basket never moves more than its own width per 30 fps frame.
  const cy = hY(L.rail.cable), cyR = cy - 7, W3u = L.core.W3up, W3d = L.core.W3dn, DOCKY = L.G - 30;
  const fleet = (o) => {
    const p = TF.track.path(o.pts), s = (k) => p.cum[k];
    const sched = TF.track.schedule(o.keys(s, p), o.journey);
    return { path: p, journey: o.journey, period: o.period, n: o.journey / o.period,
      at: (t, i) => { const j = TF.mod(t - i * o.period, o.journey), st = sched(j), xy = p.at(st.s); return { j, x: xy[0], y: xy[1], drop: st.k[0], tilt: st.k[1] || 0 }; } };
  };
  // blanks: dock -> W3 up -> F6R -> panel-press infeed (6A) -> rear cable -> W3 down -> dock; 2 baskets, 24 s journey
  const BX = 1405, BD = 72;
  const blanks = line.blanks = fleet({ period: 12, journey: 24,
    pts: [[W3u, DOCKY], [W3u, cy], [BX, cy], [BX, cyR], [W3d, cyR], [W3d, DOCKY], [W3u, DOCKY]],
    keys: (s) => [[0, s(2), BD, 0], [5.0, s(2), BD, 0], [5.6, s(2), 0, 0], [5.65, s(3), 0, 0], [6.6, s(4), 0, 0], [10.6, s(5), 0, 0], [11.4, s(6), 0, 0], [18.3, s(6), 0, 0],
      [18.3, 0, 0, 0], [22.2, s(1), 0, 0], [23.1, s(2), 0, 0], [23.7, s(2), BD, 0], [24, s(2), BD, 0]] });
  line.blanksCount = (j) => (j >= 17.9 || j < 0.6 ? 4 : j < 3.1 ? 2 : 0);   // loaded at the DOCK from the outbox just before departure (18.3), 2 per stroke
  // paint cans: dock -> W3 up -> F6R -> 6D ladder foot -> rear cable -> tip empties into SS at F6 -> W3 down -> dock;
  // 2 baskets, 48 s journey, one at 6D every 24 s
  const PX = 2822, PD = 170, TIPY = hY(1.0);
  const paint = line.paint = fleet({ period: 24, journey: 48,
    pts: [[W3u, DOCKY], [W3u, cy], [PX, cy], [PX, cyR], [W3d, cyR], [W3d, TIPY], [W3d, DOCKY], [W3u, DOCKY]],
    keys: (s) => [[0, s(2), PD, 0], [15.3, s(2), PD, 0], [16.0, s(2), 0, 0], [16.05, s(3), 0, 0], [20.0, s(4), 0, 0], [20.6, s(5), 0, 0],
      [20.8, s(5), 0, 1], [21.0, s(5), 0, 1], [21.2, s(5), 0, 0], [24.6, s(6), 0, 0], [25.4, s(7), 0, 0], [38.5, s(7), 0, 0],
      [38.5, 0, 0, 0], [42.5, s(1), 0, 0], [46.8, s(2), 0, 0], [47.95, s(2), PD, 0], [48, s(2), PD, 0]] });
  // can i of a paint basket: 1 full, 0 empty, -1 not in the basket
  line.canInBasket = (j, i) => (j >= 38.1 || j < 0.7 ? 1 : j >= 14.9 && j < 20.85 + i * 0.18 ? 0 : -1);
  const SSP = TF.core.ssPath;
  let sEntry = 0; for (let s = 0; s < SSP.total; s += 2) if (SSP.at(s)[1] <= TIPY) sEntry = s;
  line.ssCan = (j, i) => { // empty can i on the spiral slide (null when not on it); j = basket journey time
    const u = j - 20.85 - i * 0.18;
    if (u < 0 || u > 8.3) return null;
    if (u < 0.3) { const a = [W3d - 6 + i * 12, TIPY + 30], b = SSP.at(sEntry); return [TF.lerp(a[0], b[0], u / 0.3), TF.lerp(a[1], b[1], u / 0.3) - 14 * Math.sin(Math.PI * u / 0.3)]; }
    return SSP.at(sEntry + (SSP.total - sEntry) * TF.lin(u, 0.3, 8.3));
  };
  line.drawCan = (ctx, x, y, full, lod, ang = 0) => { // y = bottom of can
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    D.rect(ctx, -4.5, -11, 9, 11, full ? '#d7dde2' : '#eef1f3', '#5d656d', 0.8);
    D.rect(ctx, -4.5, -8, 9, 4, full ? COL.red : '#c9b0b0');
    D.line(ctx, [[-3, -11], [0, -14], [3, -11]], '#5d656d', 0.8);
    ctx.restore();
  };
  TF.transport({ id: 'F6R', owner: '6A', period: 24, layer: 'main', box: { x: W3u - 30, y: cy - 40, w: L.X1 - W3u + 30, h: L.G - cy + 40 },
    draw(ctx, t, theme, lod) {
      TF.basket.cable(ctx, W3u, L.X1 - 12, cy, lod);
      if (lod === 'far') return;
      for (let i = 0; i < blanks.n; i++) {
        const b = blanks.at(t, i), n = line.blanksCount(b.j);
        TF.basket.draw(ctx, b.x, b.y, b.drop, lod, (c, px, py) => { for (let k = 0; k < n; k++) D.rect(c, px - 13, py - 3 - k * 3, 26, 2.4, '#c9d0d6', '#7b848c', 0.6); });
      }
      for (let i = 0; i < paint.n; i++) {
        const b = paint.at(t, i);
        TF.basket.draw(ctx, b.x, b.y, b.drop, lod, (c, px, py) => [0, 1].forEach((k) => { const v = line.canInBasket(b.j, k); if (v >= 0) line.drawCan(c, px - 6 + 12 * k, py + 1, v === 1, lod); }), -b.tilt);
        for (let k = 0; k < 2; k++) { const q = line.ssCan(b.j, k); if (q) line.drawCan(ctx, q[0], q[1], false, lod, b.j * 2 + k); }
      }
    } });

  // ---------- PT capsule network (round 4: 6B/6C drops come up through the floor so they never cross the hanging
  // doors; only the 6D sealer line uses the ceiling trunk). Supply + return tubes; each route a fleet (journey 24 s)
  // leaving the dock on its own slot so the risers never collide. ----------
  const ty = hY(L.rail.tube), tyR = hY(L.rail.tubeR), RS = L.core.PTx - 6, RR = L.core.PTx + 7, yT = yF + 5, yTR = yF + 11;
  line.FEEDER = [2338, hY(1.45)];
  const FD = line.FEEDER, GY = hY(2.95), MX = 1958;
  line.TIPMAG = [MX, GY + 9];
  const ROUTES = line.PT = {
    tips: { t0: 9.0, period: 12, col: '#c27a3a',                                    // spare weld tips -> 6B gantry tip magazine
      sup: [[RS, DOCKY], [RS, yT], [1947, yT], [1947, GY + 12], [MX - 4, GY + 12]], ret: [[MX - 4, GY + 12], [1941, GY + 18], [1941, yTR], [RR, yTR], [RR, DOCKY]] },
    bolts: { t0: 0.5, period: 12, col: '#3f8fd0',                                   // bolts -> 6C feeder
      sup: [[RS, DOCKY], [RS, yT], [2350, yT], [2350, FD[1] + 4]], ret: [[2350, FD[1] + 4], [2357, FD[1] + 14], [2357, yTR], [RR, yTR], [RR, DOCKY]] },
    sealer: { t0: 4.5, period: 24, col: '#8a939b',                                  // sealer/primer cartridges -> 6D kitchen
      sup: [[RS, DOCKY], [RS, ty], [2918, ty], [2918, hY(3.18)]], ret: [[2918, hY(3.18)], [2918, tyR], [RR, tyR], [RR, DOCKY]] },
  };
  const legKeys = (pts, t0, riserFirst) => { const p = TF.track.path(pts), keys = [[t0, 0]]; let t = t0;
    for (let i = 1; i < pts.length; i++) { const len = p.cum[i] - p.cum[i - 1], first = riserFirst ? i === 1 : i === pts.length - 1;
      t += first && len > 600 ? 3.0 : Math.max(0.25, len / 600); keys.push([t, p.cum[i]]); }
    return { p, keys, end: t }; };
  for (const k in ROUTES) {
    const r = ROUTES[k], open = 0.8;
    r.x = r.sup[r.sup.length - 1][0]; r.end = r.sup[r.sup.length - 1][1];
    const S1 = legKeys(r.sup, r.t0, true), o1 = S1.end + open, R1 = legKeys(r.ret, o1, false);
    r.open = [S1.end, o1]; r.arrive = S1.end; r.sup = S1.p; r.ret = R1.p; r.back = R1.end; r.dep = r.t0; r.home = 'dock';
    const supK = S1.keys.concat([[o1, S1.p.total]]), retK = R1.keys, b3 = R1.end;
    r.at = (t, i) => { // -> {path, s, v} or null when at the dock
      const J = TF.mod(t - r.t0 - i * r.period, 24) + r.t0;
      const seg = (path, keys) => { const f = TF.track.schedule(keys, 1e9); return { path, s: f(J).s, v: (f(J + 0.02).s - f(J - 0.02).s) / 0.04 }; };
      if (J >= b3) return null;
      return J < o1 ? seg(r.sup, supK) : seg(r.ret, retK);
    };
  }
  line.BOLTS_IN = ROUTES.bolts.arrive + 0.2;
  TF.transport({ id: 'PT-6', owner: '6C', period: 24, layer: 'back', box: { x: RS - 20, y: ty - 20, w: 2940 - RS + 40, h: L.G - ty + 20 },
    draw(ctx, t, theme, lod) {
      const pipe = (pts) => TF.tube.draw(ctx, TF.track.path(pts), lod);
      pipe([[RS, DOCKY], [RS, ty]]); pipe([[RR, DOCKY], [RR, tyR]]);
      for (const k in ROUTES) { const r = ROUTES[k]; pipe(r.sup.pts.slice(1)); pipe(r.ret.pts.slice(0, -1)); }
      if (lod === 'far') return;
      for (const k in ROUTES) { const r = ROUTES[k]; for (let i = 0; i < 24 / r.period; i++) { const c = r.at(t, i); if (c && c.s > 1) TF.tube.capsule(ctx, c.path, c.s, c.v, lod, theme.decor.capsuleDecal, r.col); } }
    } });
})(typeof window !== 'undefined' ? window : globalThis);
