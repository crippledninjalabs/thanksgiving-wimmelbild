// TF.camera — fit-all on open, wheel zoom at the cursor, drag pan, pinch, double-click a room to zoom to it,
// Home key / button to fit. Keeps ?view=x,y,zoom in the URL.
(function (G) {
  const TF = G.TF, L = TF.layout;
  const C = (TF.camera = { view: { cx: L.W / 2, cy: L.H / 2, zoom: 0.2 }, onChange: null });
  C.size = () => ({ w: G.innerWidth, h: G.innerHeight });
  C.fitZoom = () => { const { w, h } = C.size(); return Math.min(w / L.W, h / L.H) * 0.98; };
  C.minZoom = () => Math.min(0.2, C.fitZoom());
  C.set = (cx, cy, zoom) => {
    C.view = { cx, cy, zoom: TF.clamp(zoom, C.minZoom(), 3) };
    if (C.onChange) C.onChange(C.view);
  };
  C.fit = () => C.set(L.W / 2, L.H / 2, C.fitZoom());
  C.fitBox = (b, m = 1.08) => { const { w, h } = C.size(); C.set(b.x + b.w / 2, b.y + b.h / 2, Math.min(w / (b.w * m), h / (b.h * m))); };
  C.toWorld = (sx, sy) => { const { w, h } = C.size(), v = C.view; return [v.cx + (sx - w / 2) / v.zoom, v.cy + (sy - h / 2) / v.zoom]; };
  C.zoomAt = (sx, sy, k) => {
    const [wx, wy] = C.toWorld(sx, sy), { w, h } = C.size();
    const z = TF.clamp(C.view.zoom * k, C.minZoom(), 3);
    C.set(wx - (sx - w / 2) / z, wy - (sy - h / 2) / z, z);
  };
  C.attach = (cv) => {
    cv.addEventListener('wheel', (e) => { e.preventDefault(); C.zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.0015)); }, { passive: false });
    const ptrs = new Map(); let pinch = null;
    cv.addEventListener('pointerdown', (e) => { cv.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, [e.clientX, e.clientY]); cv.classList.add('drag');
      if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), z: C.view.zoom }; } });
    cv.addEventListener('pointermove', (e) => {
      if (!ptrs.has(e.pointerId)) return;
      const prev = ptrs.get(e.pointerId); ptrs.set(e.pointerId, [e.clientX, e.clientY]);
      if (ptrs.size === 1) C.set(C.view.cx - (e.clientX - prev[0]) / C.view.zoom, C.view.cy - (e.clientY - prev[1]) / C.view.zoom, C.view.zoom);
      else if (ptrs.size === 2 && pinch) {
        const [a, b] = [...ptrs.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
        C.zoomAt((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (pinch.z * d / pinch.d) / C.view.zoom);
      }
    });
    const up = (e) => { ptrs.delete(e.pointerId); if (ptrs.size < 2) pinch = null; if (!ptrs.size) cv.classList.remove('drag'); };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('dblclick', (e) => {
      const [wx, wy] = C.toWorld(e.clientX, e.clientY);
      const r = L.roomList.find((q) => wx >= q.box.x && wx < q.box.x + q.box.w && wy >= q.box.y && wy < q.box.y + q.box.h)
        || L.zones.find((z) => wx >= z.box.x && wx < z.box.x + z.box.w && wy >= z.box.y && wy < z.box.y + z.box.h);
      if (r) C.fitBox(r.box); else C.fit();
    });
    G.addEventListener('keydown', (e) => { if (e.key === 'Home') C.fit(); });
  };
})(typeof window !== 'undefined' ? window : globalThis);
