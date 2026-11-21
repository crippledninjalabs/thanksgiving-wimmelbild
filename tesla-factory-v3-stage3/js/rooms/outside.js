// West yard extras, east lawn, tank farm (FACTORY-MAP §5). Dock trucks stay in dock.js.
(function (G) {
  const TF = G.TF, TF3 = G.TF3, L = TF.layout, D = TF.draw, K = TF.kit, A = TF.act, M = TF.M, IT = TF.supply.items;
  TF.claimedZones = Object.assign(TF.claimedZones || {}, { YARD: 1, LAWN: 1, TANKFARM: 1, SHAFT: 1 });
  const G0 = L.G, yard = L.zoneById('YARD').box, lawn = L.zoneById('LAWN').box, farm = L.zoneById('TANKFARM').box;
  const shaft = L.zoneById('SHAFT').box;
  const s24 = (t) => TF.mod(t, 24);

  const gopher = (ctx, x, y, face, breath, awake) => {
    const P = TF3.paint;
    P.begin(ctx, x, y, M * 0.45, face);
    P.ellipse(ctx, [0, 0.16 + breath], 0.22, 0.12, 0, '#92400e', '#78350f', 0.8);
    P.circle(ctx, [0.2, 0.26 + breath], 0.1, '#92400e', '#78350f', 0.8);
    P.circle(ctx, [0.26, 0.28 + breath], 0.03, '#fed7aa');
    if (awake) { P.circle(ctx, [0.24, 0.30 + breath], 0.02, '#1c1917'); }
    else { P.line(ctx, [[0.20, 0.30 + breath], [0.28, 0.30 + breath]], '#1c1917', 0.015); }
    P.ellipse(ctx, [0.16, 0.36 + breath], 0.03, 0.05, 0.2, '#78350f', null);
    P.end(ctx);
  };
  TF.stage3 = TF.stage3 || {};
  TF.stage3.gopher = gopher;
  TF.stage3.gopherHole = { x: lawn.x + 180, y: G0 };   // lawn hole, used by the gag

  TF.transport({ id: 'Yard-lawn-tanks', period: 24, layer: 'back', box: { x: 0, y: 700, w: L.W, h: G0 - 700 + 40 },
    draw(ctx, t, theme, lod) {
      const u = s24(t);
      // ----- west yard road (replaces the shell road) -----
      D.line(ctx, [[0, G0 - 4], [L.core.x0, G0 - 4]], '#d9dde2', 8);
      D.line(ctx, [[20, G0 - 4], [L.core.x0 - 20, G0 - 4]], '#ffffff', 1.5, [30, 30]);

      // brick press + skip-hoist head beside the dock (west of the dock door)
      const bx = 520, hop = shaft.x + shaft.w / 2;
      D.rect(ctx, bx, G0 - 110, 140, 110, '#e5e7eb', '#9aa3ab', 1.5);
      D.rect(ctx, bx + 20, G0 - 70, 100, 50, '#cbd5e1', '#64748b', 1);
      // press ram
      const ram = 18 * Math.sin(TF.ramp(u, 6, 10) * Math.PI);
      D.rect(ctx, bx + 50, G0 - 100 + ram, 40, 16, '#64748b', '#1e293b', 1);
      // brick forms: a lump arrives (from skip), pressed brick appears, stacked, then pallet-ready
      const lump = u >= 0 && u < 6;          // dirt in the hopper tray
      const brick = u >= 10 && u < 18;       // pressed brick on the bed
      const stacked = u >= 18;               // on the outbound pallet
      if (lump) D.circle(ctx, bx + 70, G0 - 24, 12, '#a8a29e', '#78716c', 0.8);
      if (brick) D.rect(ctx, bx + 50, G0 - 20, 36, 12, '#b45309', '#7c2d12', 0.8);
      if (stacked || u < 2) {                // pallet sits across the seam (18-24 and 0-2)
        for (let i = 0; i < 3; i++) D.rect(ctx, bx + 150, G0 - 8 - i * 10, 36, 10, '#b45309', '#7c2d12', 0.7);
      }
      // skip hoist: cage in the shaft, dirt up, rings down
      D.rect(ctx, shaft.x + 20, G0, shaft.w - 40, 4, '#9aa3ab');   // head frame
      D.rect(ctx, shaft.x + 8, G0 - 160, shaft.w - 16, 160, null, '#9aa3ab', 1.5);
      // cage y: 0-4 at bottom (tunnel hopper), 4-8 up, 8-12 at grade (dump to press / load rings), 12-16 down, 16-24 at bottom
      const cageY = TF.keys(u, [[0, G0 + 700], [4, G0 + 700], [8, G0 - 8], [12, G0 - 8], [16, G0 + 700], [24, G0 + 700]]);
      D.rect(ctx, shaft.x + 30, cageY - 40, shaft.w - 60, 40, '#94a3b8', '#334155', 1);
      const dirtUp = u >= 4 && u < 8, ringsDn = u >= 12 && u < 16;
      if (dirtUp) D.circle(ctx, hop, cageY - 16, 12, '#a8a29e', '#78716c', 0.8);
      if (ringsDn) D.rect(ctx, hop - 14, cageY - 20, 28, 8, '#9aa3ab', '#57534e', 0.8);
      // cables
      D.line(ctx, [[shaft.x + 36, G0 - 160], [shaft.x + 36, cageY - 40]], '#6b737b', 1.2);
      D.line(ctx, [[shaft.x + shaft.w - 36, G0 - 160], [shaft.x + shaft.w - 36, cageY - 40]], '#6b737b', 1.2);

      // ----- east lawn -----
      D.rect(ctx, lawn.x, G0 - 6, lawn.w, 8, '#d5ddc8');
      // grass tufts
      if (lod !== 'far') for (let i = 0; i < 14; i++) {
        const x = lawn.x + 30 + i * 38, h = 8 + (i % 3) * 3;
        D.line(ctx, [[x, G0], [x - 2, G0 - h], [x, G0], [x + 3, G0 - h + 2]], '#9aaa7a', 1.2, false);
      }
      // cafeteria window / door already drawn in 1E; a bench + Shiba nap shadow on the lawn
      D.rect(ctx, lawn.x + 40, G0 - 14, 50, 6, '#b98b52', '#7d5a2c', 0.8);
      // gopher hole
      const hole = TF.stage3.gopherHole;
      ctx.beginPath(); ctx.ellipse(hole.x, G0 - 2, 14, 5, 0, 0, Math.PI * 2); ctx.fillStyle = '#44403c'; ctx.fill();
      ctx.beginPath(); ctx.ellipse(hole.x, G0 - 2, 10, 3, 0, 0, Math.PI * 2); ctx.fillStyle = '#1c1917'; ctx.fill();
      // theme decor (leaves / etc.)
      if (theme && theme.decor && theme.decor.lawn) theme.decor.lawn(ctx, lawn, t, lod);
      // Thanksgiving flock (pecking, 24 s) — three small turkeys
      if (theme && theme.name === 'thanksgiving' && lod !== 'far') {
        for (let i = 0; i < 3; i++) {
          const x = lawn.x + 280 + i * 40, peck = 0.06 * Math.sin(u * 4 + i);
          const P = TF3.paint;
          P.begin(ctx, x, G0, M * 0.55, i === 1 ? -1 : 1);
          P.ellipse(ctx, [0, 0.2], 0.22, 0.14, 0, '#b45309', '#7c2d12', 0.8);
          P.circle(ctx, [0.2, 0.28 + peck], 0.08, '#b45309', '#7c2d12', 0.8);
          P.poly(ctx, [[0.26, 0.28 + peck], [0.36, 0.26 + peck], [0.26, 0.24 + peck]], '#ea580c', null);
          P.end(ctx);
        }
      }

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

      // fuel truck (from the east 0-3, hoses 3-4, pumps 4-14, unhooks 14-15, leaves east 15-19)
      let fx = null;
      if (u < 3) fx = TF.lerp(5400, farm.x - 120, TF.ramp(u, 0, 3));
      else if (u < 15) fx = farm.x - 120;
      else if (u < 19) fx = TF.lerp(farm.x - 120, 5400, TF.ramp(u, 15, 19));
      if (fx != null && fx < 5350) {
        D.rect(ctx, fx - 90, G0 - 44, 70, 28, '#94a3b8', '#334155', 1);          // tanker
        D.line(ctx, [[fx - 55, G0 - 44], [fx - 55, G0 - 16]], '#64748b', 2);    // two compartments
        D.rect(ctx, fx - 20, G0 - 50, 40, 34, '#475569', '#1e293b', 1);         // cab
        D.rect(ctx, fx - 12, G0 - 44, 16, 10, '#bae6fd', '#64748b', 0.6);
        D.circle(ctx, fx - 70, G0 - 8, 8, '#1f2937'); D.circle(ctx, fx - 30, G0 - 8, 8, '#1f2937'); D.circle(ctx, fx + 10, G0 - 8, 8, '#1f2937');
        if (u >= 3 && u < 15) {
          D.line(ctx, [[fx - 90, G0 - 30], [farm.x - 3, G0 - 40]], '#64748b', 3);
          if (u >= 4 && u < 14) D.line(ctx, [[fx - 90, G0 - 30], [farm.x - 3, G0 - 40]], '#93c5fd', 1.5);
        }
      }
    } });

  TF.flows.push(
    { item: 'dirt lumps (skip hoist)', from: 'TUNNEL', via: ['SHAFT'], to: 'YARD', sink: 'brick press', owner: 'Yard' },
    { item: 'brick pallet', from: 'YARD', via: ['DOCK'], to: 'DOCK', sink: 'parts-truck backload', owner: 'Yard' },
    { item: 'tunnel ring set (down the shaft)', from: 'DOCK', via: ['SHAFT'], to: 'TUNNEL', sink: 'gantry conveyor', owner: 'Yard' },
    { item: 'LOX + CH4 (fuel truck)', from: 'YARD', via: ['FILL'], to: 'VAULT', sink: 'buried tanks', owner: 'Yard' }
  );
})(typeof window !== 'undefined' ? window : globalThis);
