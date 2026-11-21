// Page bootstrap: URL params (?theme= ?t= ?view=x,y,zoom ?clean=1), animation loop, test hooks
// window.__setTime(s), __setTheme(name), __view(x, y, zoom), __render(), __ready.
(function (G) {
  const TF = G.TF, Cam = TF.camera;
  const q = new URLSearchParams(location.search);
  const cv = document.getElementById('cv'), ctx = cv.getContext('2d');
  const st = TF.state = { t: 0, playing: true, theme: q.get('theme') || 'default', t0: performance.now(), dirty: true };
  if (q.get('clean')) document.body.classList.add('clean');
  if (q.has('t')) { st.t = parseFloat(q.get('t')) || 0; st.playing = false; }
  const resize = () => { const dpr = G.devicePixelRatio || 1; cv.width = Math.round(G.innerWidth * dpr); cv.height = Math.round(G.innerHeight * dpr); st.dirty = true; };
  G.addEventListener('resize', resize); resize();
  let urlTimer = null;
  Cam.onChange = () => { st.dirty = true; clearTimeout(urlTimer); urlTimer = setTimeout(syncURL, 250); };
  const syncURL = () => {
    const v = Cam.view, p = new URLSearchParams(location.search);
    p.set('view', `${Math.round(v.cx)},${Math.round(v.cy)},${v.zoom.toFixed(3)}`);
    if (st.theme !== 'default') p.set('theme', st.theme); else p.delete('theme');
    if (!st.playing) p.set('t', st.t.toFixed(2)); else p.delete('t');
    try { history.replaceState(null, '', '?' + p.toString()); } catch (e) { /* file:// may refuse */ }
  };
  const vq = (q.get('view') || '').split(',').map(Number);
  if (vq.length === 3 && vq.every(isFinite)) Cam.set(vq[0], vq[1], vq[2]); else Cam.fit();
  Cam.attach(cv);
  const clock = document.getElementById('clock');
  const draw = () => {
    TF.render.frame(ctx, G.innerWidth, G.innerHeight, st.t, Cam.view, st.theme, G.devicePixelRatio || 1);
    if (clock) clock.textContent = `t ${TF.mod(st.t, TF.LOOP).toFixed(1)} s · ${TF.render.stats.lod} · zoom ${Cam.view.zoom.toFixed(2)}`;
    st.dirty = false;
  };
  const loop = (now) => {
    if (st.playing) { st.t = (now - st.t0) / 1000; st.dirty = true; }
    if (st.dirty) draw();
    requestAnimationFrame(loop);
  };
  const play = document.getElementById('play'), home = document.getElementById('home');
  const toggle = () => { st.playing = !st.playing; if (st.playing) st.t0 = performance.now() - st.t * 1000; play.innerHTML = st.playing ? '&#10073;&#10073;' : '&#9654;'; syncURL(); };
  play.addEventListener('click', toggle); home.addEventListener('click', () => Cam.fit());
  G.addEventListener('keydown', (e) => { if (e.key === ' ') { e.preventDefault(); toggle(); } });
  if (!st.playing) play.innerHTML = '&#9654;';
  G.__setTime = (s) => { st.playing = false; st.t = s; play.innerHTML = '&#9654;'; draw(); };
  const themeSel = document.getElementById('theme');
  if (themeSel) { themeSel.value = st.theme; themeSel.addEventListener('change', () => G.__setTheme(themeSel.value)); }
  G.__setTheme = (name) => { st.theme = TF.themes[name] ? name : 'default'; if (themeSel) themeSel.value = st.theme; draw(); syncURL(); };
  G.__view = (x, y, zoom) => { Cam.set(x, y, zoom); draw(); };
  G.__render = () => { draw(); return TF.render.stats; };
  G.__boot = TF.boot();
  draw();
  requestAnimationFrame(loop);
  G.__ready = true;
})(typeof window !== 'undefined' ? window : globalThis);
