// TF.cageLift — the ONE big open-cage lift with a bobbing counterweight (heavy items only).
// cfg: {id, x0, x1, cw: [x0, x1], floorY(f), period, plan: [[t0, t1, fromFloor, toFloor], ...] (stops have from == to),
//       loads: [{kind, on: [t0, t1, side], off: [t0, t1, side], cycle?: 0|1, dx}] (side 'w' | 'e'; t in plan time),
//       drawLoad(ctx, kind, x, yFloor, lod)}
// Loads slide in/out through the gate and are clipped to the shaft, so they leave into the neighbouring room.
(function (G) {
  const TF = G.TF, D = TF.draw;
  TF.cageLift = (cfg) => {
    const H = 2.3 * TF.M, period = cfg.period;
    const seg = (tau) => cfg.plan.find((p) => tau >= p[0] && tau < p[1]) || cfg.plan[cfg.plan.length - 1];
    const cageY = (tau) => {
      tau = TF.mod(tau, cfg.base || period);
      const [t0, t1, a, b] = seg(tau);
      return TF.lerp(cfg.floorY(a), cfg.floorY(b), TF.smooth((tau - t0) / (t1 - t0)));
    };
    const wobble = (tau) => { // counterweight overshoot after every stop (decays to 0 within the stop)
      tau = TF.mod(tau, cfg.base || period);
      const [t0, t1, a, b] = seg(tau);
      if (a !== b) return 0;
      const dt = tau - t0, w = Math.min(0.7, t1 - t0);
      return 9 * Math.sin(dt * Math.PI * 2 / 0.32) * (1 - TF.smooth(dt / w)) * (dt < w ? 1 : 0);
    };
    const top = cfg.floorY(cfg.topFloor || 9) - H, bot = cfg.floorY(1);
    const HALF = { kit: 34, coil: 19, ringcoil: 24, ingot: 22, kitflat: 34 }, HT = { kit: 46, coil: 38, ringcoil: 48, ingot: 30, kitflat: 6 };
    const slide = (l, lt) => { // x offset of a load from its resting x in the cage
      const [n0, n1, ns] = l.on, [f0, f1, fs] = l.off, sg = (s) => (s === 'e' ? 1 : -1) * (cfg.x1 - cfg.x0);
      if (lt >= n0 && lt < n1) return l.follow ? l.follow(lt) : sg(ns) * (1 - TF.smooth((lt - n0) / (n1 - n0)));
      if (lt >= f0 && lt < f1) return sg(fs) * TF.smooth((lt - f0) / (f1 - f0));
      return 0;
    };
    const lift = {
      id: cfg.id, owner: 'CORE', period, layer: 'main',
      box: { x: cfg.cw[0] - 260, y: top - 40, w: cfg.x1 - cfg.cw[0] + 620, h: bot - top + 60 },
      cageY,
      cfg, drawLoad: cfg.drawLoad,
      loadsAt(t) {
        const tau = TF.mod(t, period), out = [];
        for (const l of cfg.loads) {
          const base = cfg.base || period, cyc = Math.floor(tau / base), lt = tau - cyc * base;
          if (l.cycle !== undefined && l.cycle !== cyc) continue;
          const [n0, n1] = l.on, [f0, f1] = l.off;
          const inCage = n0 <= f1 ? lt >= n0 && lt < f1 : lt >= n0 || lt < f1;
          if (!inCage) continue;
          out.push({ kind: l.kind, x: (cfg.x0 + cfg.x1) / 2 + (l.dx || 0) + slide(l, lt) });
        }
        return out;
      },
      // gantry loader bots (ids in loads[].hands): reach over the item, hook it, drag it across the gate, retract and roll away
      drawHands(ctx, t, lod) {
        const tau = TF.mod(t, period), base = cfg.base || period, cyc = Math.floor(tau / base), lt = tau - cyc * base, c = (cfg.x0 + cfg.x1) / 2, span = cfg.x1 - cfg.x0;
        for (const l of cfg.loads) {
          if (!l.hands || (l.cycle !== undefined && l.cycle !== cyc)) continue;
          const half = HALF[l.kind] || 24, ih = HT[l.kind] || 30, dx = c + (l.dx || 0);
          const wins = [];
          if (l.hands.on) wins.push({ h: l.hands.on, w: l.on, s: l.on[2] === 'e' ? 1 : -1, on: true });
          if (l.hands.off) wins.push({ h: l.hands.off, w: l.off, s: l.off[2] === 'e' ? 1 : -1 });
          if (l.hands.carry) wins.push({ h: l.hands.carry, w: l.hands.carry.w, s: 1, carry: true });
          for (const k of wins) {
            const [w0, w1] = k.w, s = k.s;
            if (lt < w0 - 0.4 || lt > w1 + 0.6) continue;
            const xAt = (u) => k.carry ? TF.lerp(k.h.x0, k.h.x1, TF.ramp(u, w0, w1)) : dx + s * span * (k.on ? 1 - TF.smooth(TF.clamp((u - w0) / (w1 - w0), 0, 1)) : TF.smooth(TF.clamp((u - w0) / (w1 - w0), 0, 1)));
            const xs = xAt(w0), xe = xAt(w1), mastRest = (k.on ? xs : xe) + s * (half + 26);
            const away = 60 * (1 - TF.ramp(lt, w0 - 0.4, w0 - 0.1)) + 60 * TF.ramp(lt, w1 + 0.3, w1 + 0.58);
            const mx = mastRest + s * away;
            let hx, grip;
            if (lt < w0) { hx = k.on ? xs : TF.lerp(mx, xs, TF.ramp(lt, w0 - 0.3, w0)); grip = k.on ? 1 : 0; }
            else if (lt <= w1) { hx = xAt(lt); grip = 1; }
            else { hx = TF.lerp(xe, mx, TF.ramp(lt, w1, w1 + 0.3)); grip = 0; }
            const fl = cfg.floorY((cfg.plan.find((p) => (w0 + w1) / 2 >= p[0] && (w0 + w1) / 2 < p[1]) || cfg.plan[0])[2]), by = fl - k.h.barH;
            D.rect(ctx, mx - 12, fl - 12, 24, 9, '#f2c230', '#9c7a12', 1);
            D.circle(ctx, mx - 7, fl - 3, 3, '#1d1f22'); D.circle(ctx, mx + 7, fl - 3, 3, '#1d1f22');
            D.rect(ctx, mx - 2.5, by, 5, fl - 12 - by, '#6c757e');
            D.line(ctx, [[mx, by], [hx, by]], '#59626b', 4);
            D.rect(ctx, hx - 5, by, 10, 5, '#454c53');
            D.line(ctx, [[hx, by + 5], [hx, by + 5 + (k.h.barH - ih - 5) * (grip ? 1 : 0.35)]], '#454c53', 2);
            if (lod !== 'far') TF.kit.beacon(ctx, mx, by - 8, t, true);
          }
        }
      },
      draw(ctx, t, theme, lod) {
        const y = cageY(t), x0 = cfg.x0 + 4, x1 = cfg.x1 - 4;
        // guide rails + cables + head sheave
        D.line(ctx, [[x0, top - 30], [x0, bot]], '#b7bec5', 3); D.line(ctx, [[x1, top - 30], [x1, bot]], '#b7bec5', 3);
        const cwx = (cfg.cw[0] + cfg.cw[1]) / 2, cwY = top + bot - y - H * 0.6 + wobble(t);
        D.circle(ctx, (cwx + x0) / 2 + 30, top - 34, 22, null, '#7a838c', 3);
        D.line(ctx, [[(x0 + x1) / 2, top - 34], [(x0 + x1) / 2, y - H]], '#59626b', 1.6);
        D.line(ctx, [[cwx, top - 34], [cwx, cwY]], '#59626b', 1.6);
        D.line(ctx, [[cwx, top - 34], [(cwx + x0) / 2 + 30 - 22, top - 34], [(x0 + x1) / 2, top - 56], [(x0 + x1) / 2, top - 34]], '#59626b', 1.2);
        // counterweight
        D.rect(ctx, cfg.cw[0] + 4, cwY, cfg.cw[1] - cfg.cw[0] - 8, 70, '#6c757e', '#454c53', 1.5);
        if (lod !== 'far') for (let k = 1; k < 5; k++) D.line(ctx, [[cfg.cw[0] + 4, cwY + k * 14], [cfg.cw[1] - 4, cwY + k * 14]], '#8a939b', 1);
        // loads (clipped to the shaft so they slide out through the gate into the room)
        ctx.save(); ctx.beginPath(); ctx.rect(cfg.x0 - 260, top - 60, cfg.x1 - cfg.x0 + 260, bot - top + 80); ctx.clip();
        for (const l of lift.loadsAt(t)) cfg.drawLoad(ctx, l.kind, l.x, y, lod, t);
        ctx.restore();
        if (lod !== 'far') lift.drawHands(ctx, t, lod);
        // open cage: floor, posts, top frame, mesh
        D.rect(ctx, x0, y, x1 - x0, 7, '#5c656e');
        D.line(ctx, [[x0 + 2, y], [x0 + 2, y - H], [x1 - 2, y - H], [x1 - 2, y]], '#e0a43a', 3);
        if (lod !== 'far') for (let x = x0 + 20; x < x1; x += 22) D.line(ctx, [[x, y - H], [x, y - H + 14]], '#e0a43a', 1.4);
      },
    };
    return lift;
  };
})(typeof window !== 'undefined' ? window : globalThis);
