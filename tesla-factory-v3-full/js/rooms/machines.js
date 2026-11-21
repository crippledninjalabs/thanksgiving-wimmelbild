// TF.mx — generic machine drawers for the room modules (world units, y down; heights in metres above the floor).
// Pure drawing: callers pass the animation parameters (ram stroke, lift height, belt phase...) from their timelines.
(function (G) {
  const TF = G.TF, D = TF.draw, K = TF.kit, M = TF.M;
  const X = (TF.mx = {});
  const H = (yF, m) => yF - m * M;

  // hydraulic / stamping press: frame w x h (m), ram stroke k 0 (up) .. 1 (down)
  X.press = (ctx, x, yF, w, h, k, lod, col = '#5f6b77', accent = '#d0453b') => {
    const hw = w * M / 2;
    D.rect(ctx, x - hw, H(yF, h), 9, h * M, col); D.rect(ctx, x + hw - 9, H(yF, h), 9, h * M, col);
    D.rect(ctx, x - hw - 3, H(yF, h) - 4, 2 * hw + 6, 0.2 * M, '#4c5762');
    D.rect(ctx, x - hw + 9, H(yF, 0.55), 2 * hw - 18, 0.55 * M, '#7a8794');
    const ry = H(yF, h - 0.25 - (h - 1.0) * k);
    D.rect(ctx, x - hw + 11, ry, 2 * hw - 22, 0.28 * M, accent, '#8e2a23', 1);
    D.rect(ctx, x - 3, H(yF, h) + 6, 6, ry - H(yF, h) - 6, '#aab2ba');
    if (lod !== 'far') D.tLogo(ctx, x, H(yF, h) + 3, 6);
  };
  // lift table / scissor: deck at height hTop (m)
  X.liftTable = (ctx, x, yF, w, hTop, lod, col = '#e0a43a') => {
    const hw = w * M / 2, y = H(yF, hTop);
    D.rect(ctx, x - hw, y, 2 * hw, 5, col, '#9a6b1c', 0.8);
    if (hTop > 0.12) { D.line(ctx, [[x - hw * 0.6, yF], [x + hw * 0.6, y + 5]], '#7b848c', 2); D.line(ctx, [[x + hw * 0.6, yF], [x - hw * 0.6, y + 5]], '#7b848c', 2); }
    D.rect(ctx, x - hw * 0.8, yF - 3, hw * 1.6, 3, '#5d656d');
  };
  // overhead hoist on a beam: trolley at x on rail yRail, hook down to yHook
  X.hoist = (ctx, x, yRail, yHook, x0, x1) => {
    if (x0 !== undefined) D.rect(ctx, x0, yRail - 4, x1 - x0, 5, '#7b848c');
    D.rect(ctx, x - 7, yRail - 2, 14, 7, '#4f5861');
    D.line(ctx, [[x, yRail + 5], [x, yHook]], '#3f4851', 1);
    D.line(ctx, [[x - 4, yHook], [x, yHook + 4], [x + 4, yHook]], '#3f4851', 1.4);
  };
  // shelving rack with n items drawn by itemFn(ctx, x, y) on `shelves` levels
  X.rack = (ctx, x, yF, w, h, shelves, n, itemFn, lod) => {
    const W = w * M;
    D.rect(ctx, x, H(yF, h), 3, h * M, '#8a939b'); D.rect(ctx, x + W - 3, H(yF, h), 3, h * M, '#8a939b');
    for (let s = 0; s < shelves; s++) D.rect(ctx, x, H(yF, (s + 1) * h / shelves) + 2, W, 3, '#aab2ba');
    if (lod === 'far') return;
    const per = Math.ceil(n / shelves);
    for (let i = 0; i < n; i++) { const s = Math.floor(i / per), j = i % per; itemFn(ctx, x + 6 + j * ((W - 12) / Math.max(1, per - 1 || 1)), H(yF, (s + 1) * h / shelves) + 2); }
  };
  // belt conveyor top at hTop (m), slats move with phase (units)
  X.belt = (ctx, x0, x1, yF, hTop, phase, lod) => {
    const y = H(yF, hTop);
    D.rect(ctx, x0, y, x1 - x0, 6, '#3f4851');
    if (lod !== 'far') for (let s = x0 + TF.mod(phase, 12); s < x1; s += 12) D.line(ctx, [[s, y + 1], [s, y + 5]], '#6b737b', 1);
    for (const x of [x0 + 6, x1 - 6]) D.rect(ctx, x - 2, y + 6, 4, yF - y - 6, '#9aa3ab');
  };
  // turntable disc (ang) at floor
  X.turntable = (ctx, x, yF, r, ang, lod) => {
    D.poly(ctx, [[x - r * M, yF], [x + r * M, yF], [x + r * M - 6, yF - 8], [x - r * M + 6, yF - 8]], '#cfd5db', '#7b848c', 1);
    if (lod !== 'far') for (let k = 0; k < 6; k++) { const a = ang + k * Math.PI / 3, c = Math.cos(a); D.line(ctx, [[x + c * r * M * 0.9, yF - 7], [x + c * r * M * 0.9, yF - 1]], '#9aa3ab', 1); }
  };
  // chassis dyno: two roller pairs in a floor pit, spinning by ang
  X.dyno = (ctx, x, yF, ang, lod) => {
    for (const dx of [-70, 70]) { D.rect(ctx, x + dx - 22, yF - 6, 44, 6, '#3a3f45');
      for (const ox of [-9, 9]) { D.circle(ctx, x + dx + ox, yF - 4, 6, '#8a939b', '#4a5056', 1); if (lod === 'near') D.line(ctx, [[x + dx + ox, yF - 4], [x + dx + ox + Math.cos(ang) * 5, yF - 4 + Math.sin(ang) * 5]], '#e5e7eb', 1); } }
  };
  // charger post with level bar (0..1) and cable to (cx, cy) when plugged
  X.charger = (ctx, x, yF, level, plug, lod, t) => {
    D.rect(ctx, x - 7, H(yF, 1.5), 14, 1.5 * M, '#e8ecef', '#7b848c', 1);
    D.rect(ctx, x - 4, H(yF, 1.35), 8, 0.5 * M, '#1d2733');
    D.rect(ctx, x - 3, H(yF, 0.88) - level * 0.45 * M, 6, level * 0.45 * M, '#4ade80');
    D.tLogo(ctx, x, H(yF, 1.42), 6);
    if (plug) K.cable(ctx, [x + 6, H(yF, 0.9)], plug, t, 6, 10, 1, '#1d2125', 1.6);
  };
  // translucent booth / enclosure
  X.booth = (ctx, x0, x1, yF, h, tint = '#d98c8c', a = 0.1) => {
    ctx.globalAlpha = a; D.rect(ctx, x0, H(yF, h), x1 - x0, h * M, tint); ctx.globalAlpha = 1;
    D.line(ctx, [[x0, yF], [x0, H(yF, h)], [x1, H(yF, h)], [x1, yF]], '#9aa3ab', 3);
  };
  X.tank = (ctx, x, yF, w, h, level, col, lod) => {
    D.rect(ctx, x, H(yF, h), w * M, h * M, '#dfe4e8', '#7b848c', 1.2);
    const ww = Math.min(14, w * M - 8), wx = x + (w * M - ww) / 2, wh = (h - 0.4) * M;
    D.rect(ctx, wx, H(yF, h - 0.2), ww, wh, '#ffffff', '#9aa3ab', 0.6);
    D.rect(ctx, wx, H(yF, h - 0.2) + wh * (1 - level), ww, wh * level, col);
  };

  // ---------- upper-half filler (overhead services; static or subtly animated, periods divide 48) ----------
  // o: {duct: [x0, x1, hm], fans: [x...], pipes: [x0, x1, hm], valves: [x...], tray: [x0, x1, hm], lamps: [x...], seed}
  X.upper = (ctx, yF, ceil, t, lod, o) => {
    if (o.duct) { const [x0, x1, h] = o.duct; D.rect(ctx, x0, H(yF, h) - 7, x1 - x0, 14, '#e3e7eb', '#9aa3ab', 1);
      if (lod !== 'far') for (const x of o.fans || []) { D.rect(ctx, x - 12, H(yF, h) - 13, 24, 26, '#c9d0d6', '#7b848c', 1); D.fan(ctx, x, H(yF, h), 9, K.spin(t, 12, 0.5)); }
      for (const x of o.drops || []) { D.rect(ctx, x - 5, H(yF, h) + 7, 10, 18, '#e3e7eb', '#9aa3ab', 0.8); D.poly(ctx, [[x - 10, H(yF, h) + 25], [x + 10, H(yF, h) + 25], [x + 6, H(yF, h) + 20], [x - 6, H(yF, h) + 20]], '#cfd5db', '#9aa3ab', 0.8); } }
    if (o.pipes) { const [x0, x1, h] = o.pipes;
      K.pipe(ctx, [[x0, H(yF, h)], [x1, H(yF, h)]], '#5b8fc9', 4, t * 25, lod); K.pipe(ctx, [[x0, H(yF, h) + 8], [x1, H(yF, h) + 8]], '#9aa3ab', 4, null, lod);
      if (lod !== 'far') for (const x of o.valves || []) K.valve(ctx, x, H(yF, h) - 5, 4, 0); }
    if (o.tray && lod !== 'far') { const [x0, x1, h] = o.tray; D.rect(ctx, x0, H(yF, h), x1 - x0, 4, '#9aa3ab', '#6d757d', 0.8);
      for (let x = x0 + 8, i = 0; x + 30 < x1; x += 46, i++) K.cable(ctx, [x, H(yF, h) + 4], [x + 30, H(yF, h) + 4], t, [6, 8, 12][i % 3], 5 + (i % 3), 1.2, '#3f4851', 1); }
    for (const x of o.lamps || []) { D.line(ctx, [[x, ceil], [x, ceil + 10]], '#9aa3ab', 1); D.poly(ctx, [[x - 8, ceil + 14], [x + 8, ceil + 14], [x + 5, ceil + 10], [x - 5, ceil + 10]], '#e5e7eb', '#9aa3ab', 0.8);
      if (lod === 'near') { ctx.globalAlpha = 0.12; D.poly(ctx, [[x - 8, ceil + 14], [x + 8, ceil + 14], [x + 22, ceil + 60], [x - 22, ceil + 60]], '#fff7d6'); ctx.globalAlpha = 1; } }
  };
})(typeof window !== 'undefined' ? window : globalThis);
