// TF.tube — clear pneumatic tube with whooshing capsules (FACTORY-MAP round 3: small parts).
(function (G) {
  const TF = G.TF, D = TF.draw;
  TF.tube = {
    R: 6,
    draw(ctx, path, lod) {
      D.line(ctx, path.pts, 'rgba(170,205,230,0.55)', this.R * 2 + 2);
      D.line(ctx, path.pts, 'rgba(255,255,255,0.75)', this.R * 2 - 2);
      if (lod !== 'far') D.line(ctx, path.pts, 'rgba(150,190,220,0.6)', 1);
    },
    // capsule at distance s; speed in units/s (for the whoosh streak); decal(ctx) optional theme decor
    capsule(ctx, path, s, speed, lod, decal, col = '#3f8fd0') {
      const [x, y] = path.at(s), a = path.dir(s), L = 16;
      if (lod !== 'far' && Math.abs(speed) > 250) {
        const back = Math.sign(speed) * Math.min(70, Math.abs(speed) * 0.06);
        for (let i = 1; i <= 3; i++) {
          const p = path.at(s - back * i / 3);
          D.line(ctx, [[p[0], p[1]], path.at(s - back * (i / 3 + 0.25))], `rgba(120,170,210,${0.45 - i * 0.12})`, 4 - i);
        }
      }
      ctx.save(); ctx.translate(x, y); ctx.rotate(a);
      D.rect(ctx, -L / 2, -4.5, L, 9, col, '#245c88', 1);
      D.rect(ctx, -L / 2, -4.5, 3, 9, '#245c88');
      if (decal && lod !== 'far') decal(ctx);
      ctx.restore();
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
