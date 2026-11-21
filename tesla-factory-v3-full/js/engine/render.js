// TF.render — draws one frame as a pure function of (t, view, theme). Order: outside shells -> building shells ->
// back layer (transports + rooms) -> main layer -> front layer. Rooms and transports are culled by their world box.
(function (G) {
  const TF = G.TF, L = TF.layout;
  const R = (TF.render = { stats: {} });
  R.viewBox = (view, w, h) => ({ x: view.cx - w / 2 / view.zoom, y: view.cy - h / 2 / view.zoom, w: w / view.zoom, h: h / view.zoom });
  R.frame = (ctx, w, h, t, view, themeName, dpr = 1) => {
    const theme = TF.themes[themeName] || TF.themes.default, z = view.zoom, lod = TF.lodOf(z);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
    ctx.setTransform(z * dpr, 0, 0, z * dpr, (w / 2 - view.cx * z) * dpr, (h / 2 - view.cy * z) * dpr);
    const vb = R.viewBox(view, w, h);
    TF.shells.outside(ctx, vb, t, theme);
    TF.shells.building(ctx, vb);
    const rooms = Object.values(TF.rooms).filter((m) => TF.boxHit(TF.pad(m.box, 320), vb));
    const trs = TF.transports.filter((tr) => TF.boxHit(TF.pad(tr.box, 60), vb));
    for (const layer of ['back', 'main', 'front']) {
      for (const tr of trs) if ((tr.layer || 'main') === layer) tr.draw(ctx, t, theme, lod);
      const fn = layer === 'main' ? 'draw' : layer;
      for (const m of rooms) if (m[fn]) m[fn](ctx, t, theme, lod);
    }
    TF.drawPeeks(ctx, t, lod, vb);
    R.stats = { lod, zoom: z, rooms: rooms.map((m) => m.id), transports: trs.length };
    return R.stats;
  };
})(typeof window !== 'undefined' ? window : globalThis);
