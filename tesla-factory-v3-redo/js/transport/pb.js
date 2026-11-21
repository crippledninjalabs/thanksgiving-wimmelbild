// PB — pack paternoster in the back wall of column B, floors 2-5 (FACTORY-MAP §1, §3). 8 open cabins circulate
// continuously (24 s per loop, a cabin passes each stop every 3 s). Car / Semi packs board at the 3B stop and ride to
// 5B, 4B (up side) or 2B (down side); each trip is a pure function of t. Rooms read TF.PB.trip(id) for exit times.
(function (G) {
  const TF = G.TF, L = TF.layout, D = TF.draw;
  const XU = 1846, XD = 1876, yBot = L.floorY(2), yTop = L.floorY(5) - 110, H = yBot - yTop, Lp = 2 * H + 60, v = Lp / 24, N = 8, SP = Lp / N;
  const pos = (s) => { s = TF.mod(s, Lp);
    if (s < H) return [XU, yBot - s];
    if (s < H + 30) return [TF.lerp(XU, XD, (s - H) / 30), yTop];
    if (s < 2 * H + 30) return [XD, yTop + (s - H - 30)];
    return [TF.lerp(XD, XU, (s - 2 * H - 30) / 30), yBot]; };
  const sUp = (f) => yBot - L.floorY(f), sDn = (f) => H + 30 + (L.floorY(f) - yTop);
  // trips: board at 3B at tb (tau mod 24, must be a cabin pass time), exit at the destination stop
  const TR = {};
  const trip = (id, dest, tb, big) => { const down = dest < 3, s0 = down ? sDn(3) : sUp(3), s1 = down ? sDn(dest) : sUp(dest);
    TR[id] = { id, dest, tb, te: TF.mod(tb + (s1 - s0) / v, 24), s0, big, down }; };
  // cabin pass times at the 3B up stop are 0.468 + 3n, at the 3B down stop 2.208 + 3n (see FACTORY-MAP §6 PB)
  trip('5B-a', 5, 5.468); trip('5B-b', 5, 17.468); trip('4B', 4, 0.468); trip('2B-ct', 2, 11.208); trip('2B-semi', 2, 20.208, true);
  TF.PB = { XU, XD, trip: (id) => TR[id], trips: TR, period: 24 };
  TF.transport({ id: 'PB', owner: '3B', period: 24, layer: 'back', box: { x: XU - 20, y: yTop - 120, w: 70, h: H + 140 },
    draw(ctx, t, theme, lod) {
      D.line(ctx, [[XU - 12, yTop - 115], [XU - 12, yBot]], '#b3bac1', 2); D.line(ctx, [[XD + 12, yTop - 115], [XD + 12, yBot]], '#b3bac1', 2);
      D.circle(ctx, (XU + XD) / 2, yTop - 112, 16, null, '#9aa3ab', 2);
      for (let c = 0; c < N; c++) { const [x, y] = pos(v * t + c * SP); D.rect(ctx, x - 11, y - 104, 22, 104, null, '#7b848c', 1.2); D.rect(ctx, x - 11, y - 3, 22, 3, '#7b848c'); }
      if (lod === 'far') return;
      for (const k in TR) { const p = TR[k], u = TF.mod(t - p.tb, 24), dur = TF.mod(p.te - p.tb, 24);
        if (u >= dur) continue;
        const [x, y] = pos(p.s0 + (p.down ? 1 : 1) * u * v);
        D.rect(ctx, x - (p.big ? 8 : 6), y - (p.big ? 98 : 92), p.big ? 16 : 12, p.big ? 95 : 89, '#2a2e33', '#111', 0.8); }
    } });
})(typeof window !== 'undefined' ? window : globalThis);
