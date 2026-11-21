// West yard extras, east lawn, tank farm (FACTORY-MAP §5). Dock trucks stay in dock.js.
// Boring shaft, skip hoist, brick press and gopher hole removed.
(function (G) {
  const TF = G.TF, L = TF.layout, D = TF.draw, K = TF.kit, A = TF.act, M = TF.M;
  TF.claimedZones = Object.assign(TF.claimedZones || {}, { YARD: 1, LAWN: 1, TANKFARM: 1 });
  const G0 = L.G, yard = L.zoneById('YARD').box, lawn = L.zoneById('LAWN').box, farm = L.zoneById('TANKFARM').box;
  const s24 = (t) => TF.mod(t, 24);

  TF.transport({ id: 'Yard-lawn-tanks', period: 24, layer: 'back', box: { x: 0, y: 700, w: L.W, h: G0 - 700 + 40 },
    draw(ctx, t, theme, lod) {
      const u = s24(t);
      // ----- west yard road -----
      D.line(ctx, [[0, G0 - 4], [L.core.x0, G0 - 4]], '#d9dde2', 8);
      D.line(ctx, [[20, G0 - 4], [L.core.x0 - 20, G0 - 4]], '#ffffff', 1.5, [30, 30]);

      // ----- east lawn (no gopher hole) -----
      D.rect(ctx, lawn.x, G0 - 6, lawn.w, 8, '#d5ddc8');
      if (lod !== 'far') for (let i = 0; i < 14; i++) {
        const x = lawn.x + 30 + i * 38, h = 8 + (i % 3) * 3;
        D.line(ctx, [[x, G0], [x - 2, G0 - h], [x, G0], [x + 3, G0 - h + 2]], '#9aaa7a', 1.2, false);
      }
      D.rect(ctx, lawn.x + 40, G0 - 14, 50, 6, '#b98b52', '#7d5a2c', 0.8);
      // theme lawn decor + flock (slots; motion stays generic)
      const slots = (theme && theme.slots) || {};
      if (theme && theme.decor && theme.decor.lawn) theme.decor.lawn(ctx, lawn, t, lod);
      if (slots.lawnDecor) slots.lawnDecor(ctx, lawn, t, lod);
      if (slots.flock && lod !== 'far') slots.flock(ctx, lawn, t, lod);

      // ----- tank farm (above-ground vent stacks; tanks themselves are buried) -----
      D.rect(ctx, farm.x, G0 - 8, farm.w, 8, '#c3c9d0');
      for (let i = 0; i < 8; i++) D.line(ctx, [[farm.x + 10, G0 - 10 - i * 6], [farm.x + farm.w - 10, G0 - 10 - i * 6]], '#94a3b8', 1);
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
      // fill point (west edge of the farm): hose stand, lights while the truck pumps
      D.rect(ctx, farm.x - 8, G0 - 36, 10, 36, '#64748b', '#1e293b', 1);
      D.circle(ctx, farm.x - 3, G0 - 40, 6, (u >= 3 && u < 15) ? '#93c5fd' : '#9aa3ab', '#1e293b', 1);

      // fuel truck (from the east 0-3, hoses 3-4, pumps 4-14, unhooks 14-15, leaves east 15-19)
      let fx = null;
      if (u < 3) fx = TF.lerp(5400, farm.x - 120, TF.ramp(u, 0, 3));
      else if (u < 15) fx = farm.x - 120;
      else if (u < 19) fx = TF.lerp(farm.x - 120, 5400, TF.ramp(u, 15, 19));
      if (fx != null && fx < 5350) {
        D.rect(ctx, fx - 90, G0 - 44, 70, 28, '#94a3b8', '#334155', 1);
        D.line(ctx, [[fx - 55, G0 - 44], [fx - 55, G0 - 16]], '#64748b', 2);
        D.rect(ctx, fx - 20, G0 - 50, 40, 34, '#475569', '#1e293b', 1);
        D.rect(ctx, fx - 12, G0 - 44, 16, 10, '#bae6fd', '#64748b', 0.6);
        D.circle(ctx, fx - 70, G0 - 8, 8, '#1f2937'); D.circle(ctx, fx - 30, G0 - 8, 8, '#1f2937'); D.circle(ctx, fx + 10, G0 - 8, 8, '#1f2937');
        if (u >= 3 && u < 15) {
          D.line(ctx, [[fx - 90, G0 - 30], [farm.x - 3, G0 - 40]], '#64748b', 3);
          if (u >= 4 && u < 14) D.line(ctx, [[fx - 90, G0 - 30], [farm.x - 3, G0 - 40]], '#93c5fd', 1.5);
        }
      }
    } });

  TF.flows.push(
    { item: 'LOX + CH4 (fuel truck)', from: 'YARD', via: ['FILL'], to: 'VAULT', sink: 'buried tanks', owner: 'Yard' }
  );
})(typeof window !== 'undefined' ? window : globalThis);
