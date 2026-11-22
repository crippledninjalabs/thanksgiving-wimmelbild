// West yard extras, east lawn, tank farm (FACTORY-MAP §5). Dock trucks stay in dock.js.
// Item 20: fuel truck redrawn at dock/yard scale (M px/m, wheels r 0.45 M, 8.6 m long), parked in the lawn gap west of the farm; same 24 s loop.
(function (G) {
  const TF = G.TF, TF3 = G.TF3, L = TF.layout, D = TF.draw, K = TF.kit, A = TF.act, M = TF.M, IT = TF.supply.items;
  TF.claimedZones = Object.assign(TF.claimedZones || {}, { YARD: 1, LAWN: 1, TANKFARM: 1 });
  const G0 = L.G, yard = L.zoneById('YARD').box, lawn = L.zoneById('LAWN').box, farm = L.zoneById('TANKFARM').box;
  const s24 = (t) => TF.mod(t, 24);

  TF.transport({ id: 'Yard-lawn-tanks', period: 24, layer: 'back', box: { x: 0, y: 700, w: L.W, h: G0 - 700 + 40 },
    draw(ctx, t, theme, lod) {
      const u = s24(t);
      // ----- west yard road (replaces the shell road) -----
      D.line(ctx, [[0, G0 - 4], [L.core.x0, G0 - 4]], '#d9dde2', 8);
      D.line(ctx, [[20, G0 - 4], [L.core.x0 - 20, G0 - 4]], '#ffffff', 1.5, [30, 30]);

      // ----- east lawn -----
      D.rect(ctx, lawn.x, G0 - 6, lawn.w, 8, '#d5ddc8');
      // grass tufts
      if (lod !== 'far') for (let i = 0; i < 14; i++) {
        const x = lawn.x + 30 + i * 38, h = 8 + (i % 3) * 3;
        D.line(ctx, [[x, G0], [x - 2, G0 - h], [x, G0], [x + 3, G0 - h + 2]], '#9aaa7a', 1.2, false);
      }
      // cafeteria window / door already drawn in 1E; a bench + Shiba nap shadow on the lawn
      D.rect(ctx, lawn.x + 40, G0 - 14, 50, 6, '#b98b52', '#7d5a2c', 0.8);
      // theme decor (leaves / etc.)
      if (theme && theme.decor && theme.decor.lawn) theme.decor.lawn(ctx, lawn, t, lod);
      // lawn flock (themed `flock` slot; startles in the 42 gag, one member runs through 1E)
      TF.gag42.flock(ctx, theme, t, lod);

      // ----- tank farm (above-ground vent stacks; tanks themselves are buried) -----
      D.rect(ctx, farm.x, G0 - 8, farm.w, 8, '#c3c9d0');
      // grating
      for (let i = 0; i < 8; i++) D.line(ctx, [[farm.x + 10, G0 - 10 - i * 6], [farm.x + farm.w - 10, G0 - 10 - i * 6]], '#94a3b8', 1);
      // two vent stacks, 24 s steam puffs
      for (const [sx, ph] of [[farm.x + 50, 0], [farm.x + 150, 3]]) {
        D.rect(ctx, sx, G0 - 90, 16, 90, '#9aa3ab', '#57534e', 1);
        D.rect(ctx, sx - 4, G0 - 98, 24, 10, '#6b737b', '#2b2f34', 1);
        const puff = TF.pulse(u, 2 + ph, 8 + ph, 1.5);
        if (puff > 0) {
          ctx.globalAlpha = 0.25 * puff;
          D.circle(ctx, sx + 8, G0 - 110 - puff * 20, 10 + puff * 8, '#e5e7eb', null);
          D.circle(ctx, sx + 14, G0 - 124 - puff * 16, 8 + puff * 6, '#e5e7eb', null);
          ctx.globalAlpha = 1;
        }
      }
      // fill point (west edge of the farm): hose stand
      D.rect(ctx, farm.x - 8, G0 - 36, 10, 36, '#64748b', '#1e293b', 1);
      D.circle(ctx, farm.x - 3, G0 - 40, 6, (u >= 3 && u < 15) ? '#93c5fd' : '#9aa3ab', '#1e293b', 1);

      // fuel truck at yard scale (M px/m): ~8.6 m long, cab faces west, parks on the open lawn gap (X1 3750 .. farm.x), rear hose to the fill point
      const TL = 8.6 * M, PARK = farm.x - 80 - TL;                  // front bumper x when parked (rear ends 80 px before the fill point)
      let fx = null;
      if (u < 3) fx = TF.lerp(5450, PARK, TF.ramp(u, 0, 3));
      else if (u < 15) fx = PARK;
      else if (u < 19) fx = TF.lerp(PARK, 5450, TF.ramp(u, 15, 19));
      if (fx != null && fx < 5400) {
        const wy = G0 - 0.45 * M, tx0 = fx + 1.9 * M, tx1 = fx + TL;
        D.rect(ctx, fx, G0 - 0.9 * M, TL, 6, '#3a3f45');                                            // chassis rail
        D.rect(ctx, tx0, G0 - 3.1 * M, tx1 - tx0, 2.2 * M, '#cbd5e1', '#475569', 1.4);              // tanker
        D.rect(ctx, fx, G0 - 2.7 * M, 1.8 * M, 1.8 * M, '#e5e7eb', '#6b737b', 1.3);                 // cab
        D.rect(ctx, fx + 4, G0 - 2.5 * M, 0.5 * M, 0.7 * M, '#22292f');                             // windscreen
        D.rect(ctx, fx - 6, G0 - 1.2 * M, 6, 0.3 * M, '#9aa3ab');                                   // front bumper
        if (lod !== 'far') {
          for (let k = 1; k < 3; k++) D.line(ctx, [[tx0 + k * (tx1 - tx0) / 3, G0 - 3.1 * M], [tx0 + k * (tx1 - tx0) / 3, G0 - 0.9 * M]], '#64748b', 1.5);   // compartments
          for (let k = 0; k < 3; k++) D.rect(ctx, tx0 + (k + 0.5) * (tx1 - tx0) / 3 - 10, G0 - 3.1 * M - 7, 20, 7, '#64748b', '#334155', 1); // manways
          D.rect(ctx, tx0 + 6, G0 - 1.2 * M, tx1 - tx0 - 12, 8, '#f2c230');                          // hazard band
          D.circle(ctx, fx + 0.9 * M, G0 - 2.0 * M, 12, '#0ea5e9', '#0c4a6e', 1);                    // roundel on the cab door
        }
        for (const wx of [fx + 0.9 * M, tx1 - 2.2 * M, tx1 - 1.2 * M]) { D.circle(ctx, wx, wy, 0.45 * M, '#1d1f22'); D.circle(ctx, wx, wy, 0.22 * M, '#9aa3ab'); }
        if (u >= 3 && u < 15) {
          const hx = tx1, hy = G0 - 1.4 * M, ex = farm.x - 3, ey = G0 - 40, sag = [(hx + ex) / 2, G0 - 14];
          D.line(ctx, [[hx, hy], [hx + 10, hy + 14], sag, [ex - 12, ey + 14], [ex, ey]], '#475569', 4, false);
          if (u >= 4 && u < 14) D.line(ctx, [[hx, hy], [hx + 10, hy + 14], sag, [ex - 12, ey + 14], [ex, ey]], '#93c5fd', 1.8, false);
        }
      }
    } });

  TF.flows.push(
    { item: 'LOX + CH4 (fuel truck)', from: 'YARD', via: ['FILL'], to: 'VAULT', sink: 'buried tanks', owner: 'Yard' }
  );
})(typeof window !== 'undefined' ? window : globalThis);
