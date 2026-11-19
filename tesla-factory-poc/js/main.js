// Wires everything: one clock -> one canvas redraw per frame.
(function () {
  const { C, D, W, H, LOOP } = TF;
  const cv = document.getElementById('scene');
  const ctx = cv.getContext('2d');
  const qs = new URLSearchParams(location.search);
  let theme = TF.THEMES[qs.get('theme')] || TF.THEMES.default;
  let frozen = qs.has('t') ? parseFloat(qs.get('t')) || 0 : null;
  let scale = 1;
  const t0 = performance.now();
  const btn = document.getElementById('theme-btn');

  function resize() {
    const s = Math.min(innerWidth / W, innerHeight / H);
    const dpr = window.devicePixelRatio || 1;
    cv.style.width = W * s + 'px'; cv.style.height = H * s + 'px';
    cv.width = Math.round(W * s * dpr); cv.height = Math.round(H * s * dpr);
    scale = s * dpr;
  }
  addEventListener('resize', resize); resize();

  const rects = {}; TF.LAYOUT.forEach((e) => (rects[e.id] = TF.cellRect(e)));

  function header(p) {
    // TESLA sign over the block
    D.rect(ctx, 640, 24, 320, 60, '#1f2328', '#111', 2, 8);
    D.tLogo(ctx, 690, 55, 42, C.red);
    D.text(ctx, 'T E S L A', 820, 55, 30, '#ffffff', 'center', 800);
    for (let i = 0; i < 6; i++) { // chaser bulbs
      const on = Math.floor(TF.frac(p * 14) * 6) === i;
      D.circ(ctx, 660 + i * 56, 20, 3, on ? '#ffd84a' : '#b9c0c6', null);
    }
    // theme banner
    D.rect(ctx, 1150, 34, 370, 48, theme.signBg, theme.accent, 2.4, 6);
    D.text(ctx, theme.sign, 1335, 59, 24, theme.signColor, 'center', 800);
    D.line(ctx, [[1180, 34], [1180, 22]], C.line, 2); D.line(ctx, [[1490, 34], [1490, 22]], C.line, 2);
    D.joint(ctx, 1180, 22); D.joint(ctx, 1490, 22);
  }

  function floor() {
    D.rect(ctx, 0, 942, W, 58, C.floor, null, 0, 0);
    D.line(ctx, [[0, 942], [W, 942]], '#d6dadf', 2);
  }

  // Belt connectors follow a route (see layout.js): hopper -> belts / drop chutes -> bin.
  const routes = {};
  function routeOf(c) {
    const key = c.from + '>' + c.to;
    if (routes[key]) return routes[key];
    const a = rects[c.from], b = rects[c.to];
    const pts = c.route.map(([w, x, y]) => { const r = w === 'a' ? a : b; return [r.x + x, r.y + y]; });
    if (c.src === 'hopper') pts.unshift([pts[0][0], pts[0][1] - 24]);
    if (c.drop) pts.push([pts[pts.length - 1][0], pts[pts.length - 1][1] + c.drop]);
    const segs = []; let L = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const len = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
      segs.push({ p0: pts[i], p1: pts[i + 1], s0: L, len }); L += len;
    }
    const speed = c.speed || Math.max(1, Math.round(1120 / L)); // ~80 px/s, integer cycles per loop
    const sameRow = a.y === b.y, L0 = a.x < b.x ? a : b;
    const gx = sameRow ? L0.x + L0.w + TF.GRID.gx / 2 : null;
    return (routes[key] = { pts, segs, L, speed, gx, floorY: L0.y + L0.h - 20, n: Math.max(2, Math.round(L / 46)) });
  }
  function at(r, d) {
    for (const s of r.segs) if (d <= s.s0 + s.len) { const k = (d - s.s0) / (s.len || 1); return [TF.lerp(s.p0[0], s.p1[0], k), TF.lerp(s.p0[1], s.p1[1], k)]; }
    return r.pts[r.pts.length - 1];
  }
  function belt(c, p) {
    const r = routeOf(c);
    const item = (k, x, y) => (c.themed ? TF.payload(ctx, theme, k, x, y, 15) : TF.ITEMS.box(ctx, x, y, 15));
    r.segs.forEach((s) => {
      const [x0, y0] = s.p0, [x1, y1] = s.p1;
      if (y0 === y1) { // belt leg
        const dir = Math.sign(x1 - x0) || 1, xs = x0 - dir * 14, xe = x1 - dir * 2;
        if (r.gx != null && Math.min(xs, xe) < r.gx && Math.max(xs, xe) > r.gx) {
          D.rect(ctx, r.gx - 2.5, y0 + 10, 5, r.floorY - y0 - 6, C.m2, C.line, 1.2, 1);
          D.rect(ctx, r.gx - 10, r.floorY, 20, 6, C.m, C.line, 1.2, 2);
          D.joint(ctx, r.gx, y0 + 14);
        }
        D.belt(ctx, Math.min(xs, xe), y0, Math.abs(xe - xs), p, Math.round((r.speed * r.L) / 12), dir);
      } else if (!(c.src === 'hopper' && s === r.segs[0])) { // clear drop chute
        D.rect(ctx, x0 - 10, Math.min(y0, y1) - 16, 20, Math.abs(y1 - y0) + 4, 'rgba(190,215,235,0.35)', C.m3, 1.2, 3);
      }
    });
    for (let i = 0; i < r.n; i++) {
      const u = p * r.speed + i / r.n;
      const [x, y] = at(r, TF.frac(u) * r.L);
      item((Math.floor(u) % r.speed) * r.n + i + c.route[0][1], x, y - 8); // id stable across the seam
    }
    if (c.src === 'hopper') { // feeder hopper with a little pile on top
      const [hx, hy] = r.pts[1];
      item(1, hx - 7, hy - 38); item(2, hx + 7, hy - 39);
      D.poly(ctx, [[hx - 18, hy - 36], [hx + 18, hy - 36], [hx + 7, hy - 16], [hx - 7, hy - 16]], C.m, C.line, 1.6);
      D.rect(ctx, hx - 14, hy - 30, 28, 4, theme.accent, null, 0, 1);
      D.joint(ctx, hx, hy - 20, 2.6);
    }
    if (c.drop) { // collection bin
      const [bx, by] = r.pts[r.pts.length - 1];
      item(0, bx - 6, by - 17); item(2, bx + 7, by - 18);
      D.rect(ctx, bx - 17, by - 18, 34, 20, C.m, C.line, 1.6, 3);
      D.rect(ctx, bx - 12, by - 12, 24, 4, theme.accent, null, 0, 1);
    }
  }

  function pipe(c, p) {
    const a = rects[c.from], b = rects[c.to];
    const xa = a.x + c.x, xb = b.x + (c.x2 ?? c.x), y1 = a.y + a.h - 2, y2 = b.y + 2, ym = (y1 + y2) / 2;
    const path = xa === xb ? [[xa, y1], [xa, ym], [xb, y2]] :[[xa, y1], [xa, ym], [xb, ym], [xb, y2]];
    D.pipe(ctx, path, 8);
    ctx.save(); ctx.setLineDash([4, 8]); ctx.lineDashOffset = -TF.frac(p * 10) * 12;
    D.line(ctx, path, theme.accent2, 2.4); ctx.restore();
    path.forEach((pt, i) => (i === 0 || i === path.length - 1 ? D.rect(ctx, pt[0] - 8, pt[1] - 3, 16, 6, C.m2, C.line, 1.2, 1) : D.joint(ctx, pt[0], pt[1], 4)));
  }

  function cell(entry, idx, p, t) {
    const r = rects[entry.id], cdef = TF.CELLS[entry.id];
    ctx.save(); ctx.translate(r.x, r.y);
    ctx.beginPath(); ctx.roundRect(0, 0, r.w, r.h, 10); ctx.fillStyle = '#fbfcfd'; ctx.fill();
    ctx.save(); ctx.clip();
    D.rect(ctx, 0, TF.FY, r.w, r.h - TF.FY, C.floor, null, 0, 0);
    D.line(ctx, [[0, TF.FY], [r.w, TF.FY]], '#d6dadf', 1.6);
    if (cdef) cdef.draw(ctx, p, t, theme);
    ctx.restore();
    D.rect(ctx, 0, 0, r.w, r.h, null, '#d9dee3', 1.6, 10);
    D.text(ctx, `${idx + 1}`, 14, 14, 11, theme.accent, 'center', 800);
    D.text(ctx, (cdef ? cdef.name : entry.id).toUpperCase(), 24, 14, 10, '#8a9299', 'left', 700);
    ctx.restore();
  }

  // Elon: walks the gutter between rows 2 and 3, pausing at Optimus and the Cybertruck roll-out.
  const ELON_PATH = [ // [time s, x]; y fixed. Loops at LOOP.
    [0, 260], [3, 790], [5, 790], [7.8, 1330], [11.2, 1330], [14, 260],
  ];
  function elon(t) {
    let i = 0; while (i < ELON_PATH.length - 2 && t >= ELON_PATH[i + 1][0]) i++;
    const [ta, xa] = ELON_PATH[i], [tb, xb] = ELON_PATH[i + 1];
    const k = (t - ta) / (tb - ta), x = TF.lerp(xa, xb, k), moving = xa !== xb;
    const face = moving ? Math.sign(xb - xa) : 1;
    const y = rects.optimus.y + rects.optimus.h + 47;
    D.person(ctx, x, y, {
      face, shirt: '#111214', pants: '#3a3f47', hair: 'swept', tee: true,
      walk: moving ? t * 9.42 : undefined, bob: moving ? -Math.abs(Math.sin(t * 9.42)) * 1.2 : 0,
      armF: moving ? undefined : 0.9 + Math.sin(t * 3) * 0.05, armB: moving ? undefined : -0.1,
    });
  }

  function render(t) {
    const lt = ((t % LOOP) + LOOP) % LOOP, p = lt / LOOP;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);
    floor();
    header(p);
    (theme.decor || []).forEach((d) => TF.DECOR[d.type] && TF.DECOR[d.type](ctx, d, p, theme));
    TF.CONNECTORS.filter((c) => c.kind === 'pipe').forEach((c) => pipe(c, p));
    TF.LAYOUT.forEach((e, i) => cell(e, i, p, lt));
    TF.CONNECTORS.filter((c) => c.kind === 'belt').forEach((c) => belt(c, p));
    elon(lt);
  }

  function frame(now) {
    render(frozen != null ? frozen : (now - t0) / 1000);
    requestAnimationFrame(frame);
  }

  function setTheme(name) {
    if (!TF.THEMES[name]) return false;
    theme = TF.THEMES[name];
    btn.textContent = 'Theme: ' + theme.label;
    return true;
  }
  btn.addEventListener('click', () => {
    const o = TF.THEME_ORDER;
    setTheme(o[(o.indexOf(theme.id) + 1) % o.length]);
  });
  window.__setTheme = setTheme;
  window.__setTime = (s) => { frozen = s == null ? null : +s; render(frozen ?? (performance.now() - t0) / 1000); };
  setTheme(theme.id);
  requestAnimationFrame(frame);
})();
