// TF3.props — held / nearby objects named in pose.props (positions in figure-local metres).
// Each prop has a `layer`: 'behind' (before the body), 'held' (between body and near arm), 'front'.
(function (G) {
  const TF3 = (G.TF3 = G.TF3 || {});
  const R = TF3.rig, P = TF3.paint;
  const D = {};
  D.box = (ctx, b) => {
    const [x, y] = b.c, w = b.w / 2, h = b.h / 2;
    P.poly(ctx, [[x - w, y - h], [x + w, y - h], [x + w, y + h], [x - w, y + h]], '#c99b5f', '#7d5a2c');
    P.line(ctx, [[x - w * 0.15, y + h], [x - w * 0.15, y + h * 0.3]], '#e6c58d', 0.03);
    P.line(ctx, [[x - w, y + h * 0.82], [x + w, y + h * 0.82]], '#b4864d', 0.006);
  };
  D.torch = (ctx, t) => {
    const back = R.sub(t.tip, R.polar(t.ang, t.len + 0.06));
    const neck = R.sub(t.tip, R.polar(t.ang, 0.09));
    P.capsule(ctx, back, neck, 0.024, 0.02, '#5d6670', '#2c3136');
    P.line(ctx, [neck, R.sub(t.tip, R.polar(t.ang, 0.01))], '#b8860b', 0.014);
    P.line(ctx, [back, R.add(back, [-0.12, -0.25])], '#2b2b2b', 0.012); // hose
  };
  D.sparks = (ctx, s) => {
    const [x, y] = s.at;
    P.circle(ctx, [x, y], 0.03, 'rgba(255,190,60,0.35)', null);
    P.circle(ctx, [x, y], 0.012, '#fff6c8', null);
    for (let i = 0; i < 9; i++) {
      const seed = Math.sin(i * 12.9898 + Math.floor(s.ph * 60) * 78.233) * 43758.5453;
      const r = seed - Math.floor(seed);
      const a = Math.PI * (0.35 + 1.3 * r) - 0.2, l = 0.05 + 0.09 * ((r * 7) % 1);
      const p0 = R.add([x, y], R.polar(a, 0.02)), p1 = R.add([x, y], R.add(R.polar(a, l), [0, -0.04 * ((r * 3) % 1)]));
      P.line(ctx, [p0, p1], i % 3 ? '#ffb020' : '#fff1a0', 0.006);
    }
  };
  D.ladder = (ctx, l) => {
    const top = l.top ?? 2.3, bot = l.bot ?? -0.3;
    P.line(ctx, [[l.x + 0.035, bot], [l.x + 0.035, top]], '#8a9199', 0.04);
    const k0 = Math.ceil((bot - l.offY) / l.rung), k1 = Math.floor((top - l.offY) / l.rung);
    for (let k = k0; k <= k1; k++) P.circle(ctx, [l.x, k * l.rung + l.offY], 0.019, '#6b737b', '#3d434a', 1);
  };
  D.cart = (ctx, c) => {
    const x = c.x;
    P.poly(ctx, [[x + 0.08, 0.3], [x + 0.95, 0.3], [x + 0.95, 0.38], [x + 0.08, 0.38]], '#5b8fc9', '#2d4f75');
    P.line(ctx, [[x + 0.09, 0.36], [x - 0.02, 1.03]], '#4a5560', 0.03);
    P.line(ctx, [[x - 0.05, 1.03], [x + 0.02, 1.03]], '#2b3036', 0.04);
    for (const wx of [x + 0.22, x + 0.82]) P.circle(ctx, [wx, 0.08], 0.075, '#2a2c2f', null), P.circle(ctx, [wx, 0.08], 0.03, '#9aa1a8', null);
    P.poly(ctx, [[x + 0.15, 0.38], [x + 0.55, 0.38], [x + 0.55, 0.62], [x + 0.15, 0.62]], '#c99b5f', '#7d5a2c');
  };
  D.plate = (ctx, p) => {
    const [x, y] = p.c;
    if (p.food) {
      P.ellipse(ctx, [x - 0.02, y + 0.035], 0.06, 0.04, 0, '#f3e6c4', '#b9a77d', 1);      // mash
      P.ellipse(ctx, [x + 0.055, y + 0.025], 0.045, 0.026, -0.2, '#b06a3b', '#6f3f1f', 1); // turkey slice
      P.circle(ctx, [x - 0.07, y + 0.02], 0.016, '#b3202d', null);                       // cranberry
      if (p.chunk !== false) P.ellipse(ctx, [x + 0.005, y + 0.07], 0.024, 0.017, 0, '#e8d6a6', '#b9a77d', 1); // bite-sized chunk
    }
    P.ellipse(ctx, [x, y], 0.13, 0.016, 0, '#ffffff', '#8c949c', 1.2);
  };
  D.fork = (ctx, f, sk) => {
    let base, ang;
    if (f.onPlate) { base = R.add(f.onPlate, [-0.12, 0.01]); ang = 0.05; }
    else { const s = f.hand || 'N'; base = sk['wrist' + s]; ang = sk['handAng' + s] ?? R.ang(sk['elbow' + s], base); base = R.add(base, R.polar(ang, 0.05)); }
    const tip = R.add(base, R.polar(ang, 0.19));
    P.line(ctx, [base, tip], '#9aa3ab', 0.008);
    for (const o of [-0.008, 0, 0.008]) P.line(ctx, [R.add(tip, R.polar(ang + Math.PI / 2, o)), R.add(R.add(tip, R.polar(ang, 0.035)), R.polar(ang + Math.PI / 2, o))], '#9aa3ab', 0.004);
    if (f.bite) P.ellipse(ctx, R.add(tip, R.polar(ang, 0.025)), 0.024, 0.017, ang, '#e8d6a6', '#b9a77d', 1);
  };
  D.rail = (ctx, r) => {
    P.line(ctx, [[r.x - 0.5, r.y], [r.x + 0.25, r.y]], '#6f7a85', 0.035);
    P.line(ctx, [[r.x + 0.2, r.y], [r.x + 0.2, 0]], '#6f7a85', 0.03);
  };
  TF3.props = {
    D,
    draw(ctx, props, layer, sk) {
      for (const k in props) {
        const p = props[k];
        if (!p || (p.layer || 'held') !== layer) continue;
        const fn = D[p.type || k];
        if (fn) fn(ctx, p, sk);
      }
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
