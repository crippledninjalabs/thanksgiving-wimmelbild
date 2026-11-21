// TF.track — generic path + schedule primitives shared by every transport (baskets, hangers, capsules,
// slides). A path is a polyline in world units; a schedule maps local time to {s (distance along path), drop, ...}.
// A "fleet" is N identical carriers on the same schedule, offset by the period: carrier i uses tau = (t - i*period) mod journey.
(function (G) {
  const TF = G.TF;
  const T = (TF.track = {});

  T.path = (pts, closed = false) => {
    const P = closed ? [...pts, pts[0]] : pts.slice();
    const cum = [0];
    for (let i = 1; i < P.length; i++) cum.push(cum[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
    const total = cum[cum.length - 1];
    const box = P.reduce((b, p) => ({ x0: Math.min(b.x0, p[0]), y0: Math.min(b.y0, p[1]), x1: Math.max(b.x1, p[0]), y1: Math.max(b.y1, p[1]) }),
      { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity });
    const path = { pts: P, cum, total, closed, box: { x: box.x0, y: box.y0, w: box.x1 - box.x0, h: box.y1 - box.y0 } };
    path.at = (s) => {
      s = closed ? TF.mod(s, total) : TF.clamp(s, 0, total);
      let i = 1; while (i < cum.length - 1 && cum[i] < s) i++;
      const u = (s - cum[i - 1]) / Math.max(1e-9, cum[i] - cum[i - 1]);
      const a = P[i - 1], b = P[i];
      return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
    };
    path.dir = (s) => { const a = path.at(s - 1), b = path.at(s + 1); return Math.atan2(b[1] - a[1], b[0] - a[0]); };
    path.sOfX = (x, seg = 0) => { // distance at which segment `seg` reaches x (horizontal segments)
      const a = P[seg], b = P[seg + 1]; return cum[seg] + (x - a[0]) / (b[0] - a[0]) * (cum[seg + 1] - cum[seg]);
    };
    path.draw = (ctx, col, lw, dash) => TF.draw.line(ctx, P, col, lw, dash);
    return path;
  };

  // Schedule from keys [[tau, s, extra...]]: eased between keys (moves) and constant on equal keys (stops).
  // Returns state(tau) -> {s, k: [extra values], moving}
  T.schedule = (keys, period, ease = TF.smooth) => (tau) => {
    tau = TF.mod(tau, period);
    let i = 1; while (i < keys.length && keys[i][0] <= tau) i++;
    const a = keys[i - 1], b = keys[i] || [period + keys[0][0], ...keys[0].slice(1)];
    const u = ease(TF.clamp((tau - a[0]) / (b[0] - a[0]), 0, 1));
    const out = a.slice(1).map((v, j) => (typeof v === 'number' && typeof b[j + 1] === 'number' ? v + (b[j + 1] - v) * u : (u < 1 ? v : b[j + 1])));
    return { s: out[0], k: out.slice(1), moving: Math.abs(b[1] - a[1]) > 0.01 && u > 0 && u < 1, u, i };
  };
})(typeof window !== 'undefined' ? window : globalThis);
