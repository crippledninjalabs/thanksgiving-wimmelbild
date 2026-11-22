// West core (FACTORY-MAP §1 round 3): BL big open-cage lift + counterweight, PT tube riser, W3 basket chain,
// SS spiral slide, W4 stair, and the DOCK sort table that every core carrier starts from / returns to.
(function (G) {
  const TF = G.TF, L = TF.layout, D = TF.draw, M = TF.M;
  const S = L.core.shafts, top = L.ceilY(L.floors), bot = L.G;

  // ---------- static shafts (back layer) ----------
  TF.core = {
    ssPath: TF.slide.path(L.core.SSx, L.floorY(9) - 60, L.G - 30, 100),
    ptRiser: [L.core.PTx, L.G - 30],
  };
  TF.transport({ id: 'core-shafts', owner: 'CORE', period: 24, layer: 'back', box: L.zoneById('CORE').box,
    draw(ctx, t, theme, lod) {
      for (const k in S) D.line(ctx, [[S[k][0], top], [S[k][0], bot]], '#e3e7eb', 1.5);
      // W4 stair (zig-zag flights per floor)
      for (let f = 1; f <= L.floors; f++) {
        const y0 = L.floorY(f), y1 = L.floorY(f) - 150, y2 = L.ceilY(f) + 2;
        D.line(ctx, [[S.W4[0] + 4, y0], [S.W4[1] - 4, y1], [S.W4[0] + 4, y2]], '#d6dbe0', 3);
        D.rect(ctx, S.W4[0], L.floorY(f), S.W4[1] - S.W4[0], 5, '#d6dbe0');
      }
      // W3 chain (up side west, down side east) + sprockets
      D.line(ctx, [[L.core.W3up, top + 12], [L.core.W3up, bot - 20]], '#aab2ba', 1.5);
      D.line(ctx, [[L.core.W3dn, top + 12], [L.core.W3dn, bot - 20]], '#aab2ba', 1.5);
      D.circle(ctx, (L.core.W3up + L.core.W3dn) / 2, top + 14, 12, null, '#aab2ba', 2);
      // PT riser
      TF.tube.draw(ctx, TF.track.path([[L.core.PTx, bot - 30], [L.core.PTx, top + 18]]), lod);
      // SS spiral slide
      TF.slide.draw(ctx, TF.core.ssPath, lod);
      // labels
      if (lod !== 'near') [['W4', S.W4], ['SS', S.SS], ['W3', S.W3], ['PT', S.PT], ['cw', S.cw], ['BL', S.BL]]
        .forEach(([n, r]) => D.text(ctx, n, (r[0] + r[1]) / 2, top - 22, 18, '#aab2ba'));
    } });

  // ---------- stops at every floor: PT ports, W3 transfer arms, SS exit lips, BL landing sills ----------
  TF.transport({ id: 'core-stops', owner: 'CORE', period: 24, layer: 'back', box: L.zoneById('CORE').box,
    draw(ctx, t, theme, lod) {
      for (let f = 1; f <= L.floors; f++) {
        const yF = L.floorY(f), cy = L.hY(f, L.rail.cable), ty = L.hY(f, L.rail.tube);
        D.rect(ctx, L.core.PTx - 12, ty - 9, 24, 18, '#e3e7eb', '#9aa3ab', 0.8);                       // PT junction
        D.rect(ctx, L.core.W3up - 6, cy - 3, (L.X0 - 10) - L.core.W3up + 6, 3, '#9aa3ab');               // W3 transfer arm to F(n)R
        D.circle(ctx, L.core.W3up, cy, 4, '#7b848c'); D.circle(ctx, L.core.W3dn, cy - 7, 4, '#7b848c');
        D.poly(ctx, [[S.SS[0] + 2, yF - 30], [S.SS[1] - 2, yF - 30], [S.SS[1] - 6, yF - 22], [S.SS[0] + 6, yF - 22]], '#e9d9a8', '#c9b071', 0.8);   // SS exit lip
        if ([1, 2, 4, 5, 6, 8].includes(f)) { D.rect(ctx, S.BL[0], yF, S.BL[1] - S.BL[0], 4, '#7b848c'); if (lod !== 'far') TF.kit.beacon(ctx, S.BL[1] - 14, yF - 2.3 * TF.M - 12, t, Math.abs(TF.BL.cageY(t) - yF) < 2); }
        D.rect(ctx, S.W4[0], yF - 3, S.W4[1] - S.W4[0], 3, '#c3c9d0');
      }
    } });

  // ---------- BL big open-cage lift (FACTORY-MAP §6 schedule, 24 s; ring coil only on A cycles -> 48 s) ----------
  const plan = [[0, 0.8, 1, 1], [0.8, 1.3, 1, 2], [1.3, 2.1, 2, 2], [2.1, 3.1, 2, 4], [3.1, 3.7, 4, 4], [3.7, 5.7, 4, 8],
    [5.7, 6.4, 8, 8], [6.4, 6.9, 8, 6], [6.9, 7.4, 6, 6], [7.4, 7.9, 6, 5], [7.9, 8.9, 5, 5], [8.9, 10.9, 5, 1],
    [10.9, 11.9, 1, 1], [11.9, 13.4, 1, 4], [13.4, 14.4, 4, 4], [14.4, 15.9, 4, 1], [15.9, 16.9, 1, 1], [16.9, 18.9, 1, 5],
    [18.9, 20.9, 5, 5], [20.9, 22.9, 5, 1], [22.9, 24, 1, 1]];
  // follow: the DOCK AGV (id 'bl-dock') pushes the whole row into the cage; dx follows its x (dock.js draws the same row before 0).
  // hands: gantry loader bots (cagelift.drawHands) at every non-car on/off; cars drive themselves (room clips at the gate).
  const follow = (lt) => TF.supply.fkX(Math.min(lt, 0.55)) - 1068;
  const loads = [
    { kind: 'kit', on: [0, 0.8, 'w'], off: [1.4, 2.0, 'e'], dx: -78, follow, hands: { off: { id: 'bl-f2-kit', barH: 66 } } },
    { kind: 'coil', on: [0, 0.8, 'w'], off: [1.4, 2.0, 'e'], dx: 22, follow, hands: { off: { id: 'bl-f2-coil', barH: 56 } } },
    { kind: 'ringcoil', on: [0, 0.8, 'w'], off: [5.75, 6.35, 'e'], dx: -22, cycle: 0, follow, hands: { off: { id: 'bl-f8-ring', barH: 66 } } },
    { kind: 'ingot', on: [0, 0.8, 'w'], off: [3.15, 3.65, 'e'], dx: 62, follow, hands: { off: { id: 'bl-f4-ingot', barH: 50 } } },
    { kind: 'ingot', on: [0, 0.8, 'w'], off: [6.9, 6.9, 'e'], dx: TF.layout.ingotDx = 96, follow,   // F6 ingot: 6A takes over at 6.9
      hands: { carry: { id: 'bl-f6-ingot', barH: 50, w: [6.9, 7.6], x0: (S.BL[0] + S.BL[1]) / 2 + 96, x1: 1392 } } },
    { kind: 'kitflat', on: [1.45, 2.0, 'e'], off: [23.0, 23.5, 'w'], dx: -60,   // stage 2: the folded empty Semi-kit crate rides back to the DOCK backload bin
      hands: { on: { id: 'bl-f2-flat', barH: 32 }, off: { id: 'bl-dock-flat', barH: 70 } } },
    { kind: 'modelY', on: [7.9, 8.6, 'e'], off: [10.95, 11.8, 'e'] },
    { kind: 'cab', on: [13.45, 14.2, 'e'], off: [15.95, 16.8, 'e'] },
    { kind: 'modelY', on: [19.9, 20.6, 'e'], off: [22.95, 23.55, 'e'] },
  ];
  const drawLoad = (ctx, kind, x, y, lod) => {
    const V = TF3.vehicles;
    if (kind === 'modelY' || kind === 'cab') TF.bodies.finished(ctx, kind, x, y, lod);
    else if (kind === 'ingot') TF.parts.ingot(ctx, x, y, lod, 0);
    else if (kind === 'coil' || kind === 'ringcoil') {
      const r = kind === 'coil' ? 19 : 24;
      D.circle(ctx, x, y - r, r, '#b9c0c7', '#6d757d', 1.5); D.circle(ctx, x, y - r, r * 0.35, '#ffffff', '#6d757d', 1);
      if (lod !== 'far') for (let k = 0.5; k < 1; k += 0.15) D.circle(ctx, x, y - r, r * k, null, '#9aa2aa', 0.6);
    } else if (kind === 'kit') {
      D.rect(ctx, x - 34, y - 46, 68, 46, '#c99b5f', '#7d5a2c', 1.5);
      if (lod !== 'far') D.text(ctx, 'SEMI KIT', x, y - 23, 9, '#6b4a22');
    }
    else if (kind === 'kitflat') D.rect(ctx, x - 34, y - 6, 68, 6, '#b98b52', '#7d5a2c', 1);
  };
  TF.BL = TF.transport(TF.cageLift({ id: 'BL', x0: S.BL[0], x1: S.BL[1], cw: S.cw, floorY: L.floorY, period: 48, base: 24,
    plan, loads, drawLoad }));
})(typeof window !== 'undefined' ? window : globalThis);
