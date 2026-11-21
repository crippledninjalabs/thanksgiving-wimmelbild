// TF3.paint — small canvas helpers used by the draw modules. Coordinates in metres, y up
// (the draw modules set ctx.scale(face*s, -s) first). lw() converts px outline to metres.
(function (G) {
  const TF3 = (G.TF3 = G.TF3 || {});
  const P = (TF3.paint = {});
  P.begin = (ctx, x, y, scale, face) => {
    ctx.save(); ctx.translate(x, y); ctx.scale((face || 1) * scale, -scale);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    P._s = scale;
  };
  P.end = (ctx) => ctx.restore();
  P.lw = (px) => Math.max(0.6, px * Math.min(1, P._s / 250)) / P._s;
  P.fillStroke = (ctx, fill, stroke, px) => {
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = P.lw(px ?? TF3.style.outlinePx); ctx.stroke(); }
  };
  P.poly = (ctx, pts, fill, stroke, px, close = true) => {
    ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    if (close) ctx.closePath();
    P.fillStroke(ctx, fill, stroke, px);
  };
  P.circle = (ctx, c, r, fill, stroke, px) => {
    ctx.beginPath(); ctx.arc(c[0], c[1], r, 0, Math.PI * 2); P.fillStroke(ctx, fill, stroke, px);
  };
  P.ellipse = (ctx, c, rx, ry, rot, fill, stroke, px) => {
    ctx.beginPath(); ctx.ellipse(c[0], c[1], rx, ry, rot || 0, 0, Math.PI * 2); P.fillStroke(ctx, fill, stroke, px);
  };
  // Smooth closed curve through pts (Catmull-Rom -> Bezier).
  P.smooth = (ctx, pts, fill, stroke, px) => {
    const n = pts.length; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      ctx.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
    }
    ctx.closePath(); P.fillStroke(ctx, fill, stroke, px);
  };
  P.line = (ctx, pts, col, wM) => { // width in metres
    ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.strokeStyle = col; ctx.lineWidth = wM; ctx.stroke();
  };
  // Tapered capsule a->b with end radii r1, r2.
  P.capsule = (ctx, a, b, r1, r2, fill, stroke, px) => {
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const t = Math.asin(Math.max(-1, Math.min(1, (r1 - r2) / Math.max(d, 1e-6))));
    ctx.beginPath();
    ctx.arc(a[0], a[1], r1, ang + Math.PI / 2 + t, ang + Math.PI * 1.5 - t);
    ctx.arc(b[0], b[1], r2, ang - Math.PI / 2 - t, ang + Math.PI / 2 + t);
    ctx.closePath();
    P.fillStroke(ctx, fill, stroke, px);
  };
  // Transform helper: run fn with origin at p rotated by a (metres frame).
  P.at = (ctx, p, a, fn) => { ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(a || 0); fn(); ctx.restore(); };
  P.shade = (hex, k) => {
    const n = parseInt(hex.slice(1), 16);
    const f = (v) => Math.max(0, Math.min(255, Math.round(v * k))).toString(16).padStart(2, '0');
    return '#' + f(n >> 16) + f((n >> 8) & 255) + f(n & 255);
  };
})(typeof window !== 'undefined' ? window : globalThis);
