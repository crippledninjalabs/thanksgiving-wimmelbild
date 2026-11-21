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
    const lift = {
      id: cfg.id, owner: 'CORE', period, layer: 'main',
      box: { x: cfg.cw[0], y: top - 40, w: cfg.x1 - cfg.cw[0], h: bot - top + 60 },
      cageY,
      loadsAt(t) {
        const tau = TF.mod(t, period), out = [];
        for (const l of cfg.loads) {
          const base = cfg.base || period, cyc = Math.floor(tau / base), lt = tau - cyc * base;
          if (l.cycle !== undefined && l.cycle !== cyc) continue;
          const [n0, n1, ns] = l.on, [f0, f1, fs] = l.off;
          const inCage = n0 <= f1 ? lt >= n0 && lt < f1 : lt >= n0 || lt < f1;
          if (!inCage) continue;
          let dx = 0;
          const off = (s) => (s === 'e' ? 1 : -1) * (cfg.x1 - cfg.x0);
          if (lt >= n0 && lt < n1) dx = off(ns) * (1 - TF.smooth((lt - n0) / (n1 - n0)));
          else if (lt >= f0 && lt < f1) dx = off(fs) * TF.smooth((lt - f0) / (f1 - f0));
          out.push({ kind: l.kind, x: (cfg.x0 + cfg.x1) / 2 + (l.dx || 0) + dx });
        }
        return out;
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
        ctx.save(); ctx.beginPath(); ctx.rect(cfg.x0, top - 60, cfg.x1 - cfg.x0, bot - top + 80); ctx.clip();
        for (const l of lift.loadsAt(t)) cfg.drawLoad(ctx, l.kind, l.x, y, lod, t);
        ctx.restore();
        // open cage: floor, posts, top frame, mesh
        D.rect(ctx, x0, y, x1 - x0, 7, '#5c656e');
        D.line(ctx, [[x0 + 2, y], [x0 + 2, y - H], [x1 - 2, y - H], [x1 - 2, y]], '#e0a43a', 3);
        if (lod !== 'far') for (let x = x0 + 20; x < x1; x += 22) D.line(ctx, [[x, y - H], [x, y - H + 14]], '#e0a43a', 1.4);
      },
    };
    return lift;
  };
})(typeof window !== 'undefined' ? window : globalThis);
