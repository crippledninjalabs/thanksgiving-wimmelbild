// One clock -> one canvas redraw per frame. Draw order = back-to-front layers.
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
  const G = TF.GRID, MARGIN = 14;

  function resize() {
    const s = Math.min(innerWidth / W, innerHeight / H);
    const dpr = window.devicePixelRatio || 1;
    cv.style.width = W * s + 'px'; cv.style.height = H * s + 'px';
    cv.width = Math.round(W * s * dpr); cv.height = Math.round(H * s * dpr);
    scale = s * dpr;
  }
  addEventListener('resize', resize); resize();

  function roof(t) {
    // parapet, TESLA sign (only text besides the theme banner)
    D.rect(ctx, 0, 52, W, 8, '#8a939b', null, 0, 0);
    D.rect(ctx, 612, 4, 376, 50, '#1f2328', '#111', 2, 6);
    D.line(ctx, [[660, 54], [660, 60]], '#555', 3); D.line(ctx, [[940, 54], [940, 60]], '#555', 3);
    D.tLogo(ctx, 660, 30, 38, C.red);
    D.text(ctx, 'T E S L A', 820, 30, 30, '#ffffff', 'center', 800);
    for (let i = 0; i < 8; i++) D.circ(ctx, 630 + i * 48, 50, 2.4, Math.floor(TF.saw(t, 1) * 8) === i ? '#ffd84a' : '#4a5158', null);
    // small theme banner on the roof
    D.rect(ctx, 1330, 12, 220, 30, theme.signBg, theme.accent, 2, 5);
    D.text(ctx, theme.sign, 1440, 28, 15, theme.signColor, 'center', 800);
    D.line(ctx, [[1350, 42], [1350, 52]], C.line, 2); D.line(ctx, [[1530, 42], [1530, 52]], C.line, 2);
  }

  function roomPass(fnName, t) {
    for (const e of TF.LAYOUT) {
      const room = TF.ROOMS[e.id];
      if (!room || !room[fnName]) continue;
      ctx.save(); ctx.beginPath(); ctx.rect(e.x, e.y, e.w, e.h); ctx.clip();
      ctx.translate(e.x, e.y);
      room[fnName](ctx, t, theme, e);
      ctx.restore();
    }
  }
  const layer = (name, t) => (TF.LAYERS[name] || []).forEach((fn) => fn(ctx, t, theme));

  function render(tAbs) {
    const t = ((tAbs % LOOP) + LOOP) % LOOP;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);
    // ground strip under the building, then shrink the world so the shell has margins all round
    const VS = (W - 2 * MARGIN) / W, gy = H * VS;
    ctx.fillStyle = '#d9dcd5'; ctx.fillRect(0, gy, W, H - gy);
    ctx.fillStyle = '#b9bdb3'; ctx.fillRect(0, gy, W, 3);
    for (let x = 30; x < W; x += 70) { ctx.fillStyle = '#c8ccc3'; ctx.fillRect(x, gy + 8, 28, 3); }
    ctx.setTransform(scale * VS, 0, 0, scale * VS, scale * MARGIN, 0);
    ctx.save(); ctx.beginPath(); ctx.rect(0, G.top, W, G.bottom - G.top); ctx.clip();
    for (const e of TF.LAYOUT) {
      ctx.fillStyle = (e.col + e.row) % 2 ? '#f1f3f6' : '#f8f9fb'; ctx.fillRect(e.x, e.y, e.w, e.h);
      ctx.fillStyle = '#eceff2'; ctx.fillRect(e.x, e.y + e.h - 5, e.w, 5);
    }
    TF.drawStructureBack(ctx);
    roomPass('back', t);
    layer('back', t);
    TF.ROUTES.forEach((r) => TF.drawRoute(ctx, r, t, theme));
    TF.drawCars(ctx, t);
    layer('mid', t);
    roomPass('mid', t);
    TF.drawWalkers(ctx, t, theme);
    roomPass('front', t);
    TF.drawWalkers(ctx, t, theme, true); // front walkway layer (Elon)
    layer('front', t);
    TF.ROUTES.forEach((r) => TF.routeCovers(ctx, r, t, theme));
    TF.drawStructure(ctx);
    TF.PIPES.forEach((pp) => TF.drawPipe(ctx, pp, t, theme));
    (theme.decor || []).forEach((d) => TF.DECOR[d.type] && TF.DECOR[d.type](ctx, d, t, theme));
    ctx.restore();
    roof(t);
    (theme.roofDecor || []).forEach((d) => TF.DECOR[d.type] && TF.DECOR[d.type](ctx, d, t, theme));
  }

  function frame(now) {
    render(frozen != null ? frozen : (now - t0) / 1000);
    requestAnimationFrame(frame);
  }
  function setTheme(name) {
    if (!TF.THEMES[name]) return false;
    theme = TF.THEMES[name];
    btn.textContent = theme.label;
    if (frozen != null) render(frozen);
    return true;
  }
  btn.addEventListener('click', () => {
    const o = TF.THEME_ORDER;
    setTheme(o[(o.indexOf(theme.id) + 1) % o.length]);
  });
  window.__setTheme = setTheme;
  window.__setTime = (s) => { frozen = s == null ? null : +s; render(frozen ?? (performance.now() - t0) / 1000); };
  window.__render = render;
  setTheme(theme.id);
  requestAnimationFrame(frame);
})();
