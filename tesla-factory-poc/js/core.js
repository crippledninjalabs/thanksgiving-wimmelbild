// Core namespace, math helpers and flat drawing primitives. Everything hangs off window.TF.
(function () {
  const TF = (window.TF = {
    LOOP: 14, // seconds; every motion completes an integer number of cycles in this period
    W: 1600, H: 1000,
    CELLS: {}, THEMES: {}, THEME_ORDER: [], ITEMS: {}, DECOR: {},
  });

  TF.C = {
    m: '#d3d8dd', m2: '#b9c0c6', m3: '#9ca4ab', line: '#7a828a', dark: '#4f575f',
    light: '#eceff1', blue: '#3d8bfd', blueD: '#2463c9', red: '#e31937',
    glass: '#3e4a56', skin: '#f2c9a5', floor: '#eef0f2', ink: '#3a4148',
  };
  TF.FY = 222; // floor line inside a cell (cell local coords, cell is 440x240)

  TF.registerCell = (c) => (TF.CELLS[c.id] = c);
  TF.registerTheme = (th) => { TF.THEMES[th.id] = th; TF.THEME_ORDER.push(th.id); };

  // --- math ---
  TF.clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
  TF.ease = (x) => { x = TF.clamp(x, 0, 1); return x * x * (3 - 2 * x); };
  TF.seg = (q, a, b) => TF.ease((q - a) / (b - a)); // eased 0..1 inside [a,b]
  TF.lin = (q, a, b) => TF.clamp((q - a) / (b - a), 0, 1);
  TF.lerp = (a, b, k) => a + (b - a) * k;
  TF.frac = (x) => x - Math.floor(x);
  TF.wave = (p, n, off = 0) => Math.sin((p * n + off) * Math.PI * 2); // n = integer cycles per loop

  // --- primitives ---
  const D = (TF.D = {});
  D.rect = (ctx, x, y, w, h, fill, stroke = TF.C.line, lw = 1.6, r = 2) => {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
  };
  D.circ = (ctx, x, y, r, fill, stroke = TF.C.line, lw = 1.4) => {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
  };
  D.poly = (ctx, pts, fill, stroke = TF.C.line, lw = 1.6, close = true) => {
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    if (close) ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.stroke(); }
  };
  D.line = (ctx, pts, color = TF.C.line, lw = 2) => D.poly(ctx, pts, null, color, lw, false);
  D.joint = (ctx, x, y, r = 3.6) => D.circ(ctx, x, y, r, TF.C.blue, TF.C.blueD, 1.2);
  D.text = (ctx, s, x, y, size, color, align = 'center', weight = 700) => {
    ctx.font = `${weight} ${size}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
    ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle';
    ctx.fillText(s, x, y);
  };

  // Thick pipe through points with blue joints at bends and ends.
  D.pipe = (ctx, pts, w = 7, color = TF.C.m2) => {
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    D.line(ctx, pts, TF.C.line, w + 3);
    D.line(ctx, pts, color, w);
    pts.forEach((pt) => D.joint(ctx, pt[0], pt[1], 3.2));
  };

  // Conveyor belt: top surface at y, from x to x+w. Treads move `cycles` times per loop (dir +1 = right).
  D.belt = (ctx, x, y, w, p, cycles = 4, dir = 1, legs = 0) => {
    const h = 10, sp = 12;
    if (legs > 0) {
      for (const lx of [x + 10, x + w - 10]) {
        D.rect(ctx, lx - 2, y + h, 4, legs, TF.C.m2, TF.C.line, 1.2, 1);
        D.joint(ctx, lx, y + h + legs - 3, 2.6);
      }
    }
    D.rect(ctx, x, y, w, h, TF.C.dark, TF.C.ink, 1.4, 5);
    ctx.save();
    ctx.beginPath(); ctx.roundRect(x + 4, y + 1, w - 8, h - 2, 4); ctx.clip();
    // cycles = tread spacings travelled per loop (integer => seamless)
    const off = TF.frac(p * cycles * dir) * sp;
    ctx.strokeStyle = '#8b939b'; ctx.lineWidth = 2;
    for (let tx = x - sp * 2 + off; tx < x + w + sp; tx += sp) {
      ctx.beginPath(); ctx.moveTo(tx, y + 2); ctx.lineTo(tx + 3, y + h - 2); ctx.stroke();
    }
    ctx.restore();
    D.circ(ctx, x + 5, y + 5, 3, TF.C.m, TF.C.ink, 1);
    D.circ(ctx, x + w - 5, y + 5, 3, TF.C.m, TF.C.ink, 1);
  };

  D.gauge = (ctx, x, y, r, val) => {
    D.circ(ctx, x, y, r, '#fff', TF.C.line, 1.6);
    const a = Math.PI * (0.8 + 1.4 * TF.clamp(val, 0, 1));
    D.line(ctx, [[x, y], [x + Math.cos(a) * r * 0.75, y + Math.sin(a) * r * 0.75]], TF.C.red, 1.6);
    D.circ(ctx, x, y, 1.6, TF.C.ink, null);
  };

  D.valve = (ctx, x, y, r, ang) => {
    D.circ(ctx, x, y, r, null, TF.C.red, 2.4);
    for (let i = 0; i < 3; i++) {
      const a = ang + (i * Math.PI * 2) / 3;
      D.line(ctx, [[x, y], [x + Math.cos(a) * r, y + Math.sin(a) * r]], TF.C.red, 1.8);
    }
    D.joint(ctx, x, y, 2.4);
  };

  // Tesla "T" logo centred at x,y; s = overall height.
  D.tLogo = (ctx, x, y, s, color = TF.C.red) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s / 100, s / 100); ctx.fillStyle = color;
    ctx.beginPath(); // top swoosh
    ctx.moveTo(-50, -40); ctx.quadraticCurveTo(0, -60, 50, -40);
    ctx.lineTo(46, -30); ctx.quadraticCurveTo(0, -46, -46, -30); ctx.closePath(); ctx.fill();
    ctx.beginPath(); // stem with flared shoulders
    ctx.moveTo(-34, -30); ctx.quadraticCurveTo(-14, -30, -10, -22);
    ctx.lineTo(0, 50); ctx.lineTo(10, -22); ctx.quadraticCurveTo(14, -30, 34, -30);
    ctx.quadraticCurveTo(0, -38, -34, -30); ctx.closePath(); ctx.fill();
    ctx.restore();
  };

  // Rounded sign plate with optional T logo at the left.
  D.sign = (ctx, x, y, w, h, text, o = {}) => {
    D.rect(ctx, x, y, w, h, o.bg || '#fff', o.stroke || TF.C.line, 1.6, o.r ?? 4);
    let tx = x + w / 2;
    if (o.logo) { D.tLogo(ctx, x + h * 0.55, y + h * 0.52, h * 0.7, o.logoColor || TF.C.red); tx += h * 0.45; }
    if (text) D.text(ctx, text, tx, y + h / 2 + 1, o.size || h * 0.45, o.color || TF.C.ink, 'center', 800);
  };

  // Two-link IK; returns [elbowX, elbowY, handX, handY]. bend = +1/-1 picks elbow side.
  TF.ik = (bx, by, tx, ty, l1, l2, bend = 1) => {
    const dx = tx - bx, dy = ty - by;
    const d = TF.clamp(Math.hypot(dx, dy), 0.001, l1 + l2 - 0.001);
    const a = Math.atan2(dy, dx);
    const c = TF.clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1);
    const ea = a + bend * Math.acos(c);
    const ex = bx + Math.cos(ea) * l1, ey = by + Math.sin(ea) * l1;
    const ha = Math.atan2(by + Math.sin(a) * d - ey, bx + Math.cos(a) * d - ex);
    return [ex, ey, ex + Math.cos(ha) * l2, ey + Math.sin(ha) * l2];
  };

  // Industrial robot arm from base (bx,by) to target; draws links + blue pivots, returns hand pos.
  D.robotArm = (ctx, bx, by, tx, ty, l1, l2, bend = 1, w = 9) => {
    const [ex, ey, hx, hy] = TF.ik(bx, by, tx, ty, l1, l2, bend);
    ctx.lineCap = 'round';
    D.line(ctx, [[bx, by], [ex, ey]], TF.C.line, w + 3);
    D.line(ctx, [[bx, by], [ex, ey]], TF.C.m, w);
    D.line(ctx, [[ex, ey], [hx, hy]], TF.C.line, w + 1);
    D.line(ctx, [[ex, ey], [hx, hy]], TF.C.m2, w - 2);
    D.joint(ctx, bx, by, 5); D.joint(ctx, ex, ey, 4.2); D.joint(ctx, hx, hy, 3.4);
    return [hx, hy];
  };

  // Themed payload i drawn centred at x,y (size s ~ 14).
  TF.payload = (ctx, theme, i, x, y, s = 14) => {
    const list = theme.payloads, name = list[((i % list.length) + list.length) % list.length];
    (TF.ITEMS[name] || TF.ITEMS.box)(ctx, x, y, s, theme);
  };
})();
