// Christmas theme: light garland, snow-dust capsule decal; red ornament / small tree slot art.
(function (G) {
  const TF = G.TF, D = TF.draw;
  const ornament = (ctx, x, y, r) => {
    D.circle(ctx, x, y - r, r, '#b91c1c', '#7f1d1d', 0.8);
    D.rect(ctx, x - 1.5, y - r * 2 - 3, 3, 3.5, '#fbbf24', '#a16207', 0.5);
    ctx.save(); ctx.beginPath(); ctx.ellipse(x - r * 0.35, y - r * 1.4, r * 0.35, r * 0.18, -0.5, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fill(); ctx.restore();
  };
  const tree = (ctx, x, y, h) => {
    D.rect(ctx, x - 1.5, y - 3, 3, 3, '#7c4a1e');
    for (let i = 0; i < 3; i++) D.poly(ctx, [[x, y - 3 - h + i * h * 0.28], [x + h * (0.35 + i * 0.12), y - 3 - i * h * 0.18], [x - h * (0.35 + i * 0.12), y - 3 - i * h * 0.18]], '#15803d', '#14532d', 0.5);
    D.circle(ctx, x, y - 3 - h, 1.6, '#fbbf24');
  };
  TF.theme({
    name: 'christmas',
    food: ['cookie', 'pudding', 'orange'],
    decor: {
      garland(ctx, x0, x1, y, t, lod) {
        D.line(ctx, [[x0, y + 8], [x1, y + 8]], '#15803d', 3);
        if (lod === 'far') return;
        const n = Math.max(2, Math.round((x1 - x0) / 40));
        for (let i = 0; i < n; i++) D.circle(ctx, x0 + (i + 0.5) * (x1 - x0) / n, y + 8, 3, (Math.floor(t * 2) + i) % 2 === 0 ? '#ef4444' : '#fbbf24', '#7f1d1d', 0.5);   // 0.5 s blink, seamless
      },
      capsuleDecal(ctx) { D.circle(ctx, 0, -2, 3, '#ffffff'); },
    },
    slots: {
      food(ctx, x, y, i) {
        const v = ((i % 3) + 3) % 3;
        if (v === 0) { D.circle(ctx, x, y - 3, 3.6, '#c08457', '#7c4a1e', 0.5); D.circle(ctx, x - 1, y - 4, 0.6, '#5b2c12'); D.circle(ctx, x + 1.2, y - 2.5, 0.6, '#5b2c12'); }   // cookie
        else if (v === 1) { D.circle(ctx, x, y - 3.5, 4, '#5b2c12', '#2a1408', 0.5); D.circle(ctx, x, y - 7, 1.2, '#15803d'); D.circle(ctx, x + 1, y - 7.5, 0.8, '#dc2626'); }   // pudding
        else D.circle(ctx, x, y - 3.5, 3.6, '#f97316', '#9a3412', 0.5);                                                                                                    // orange
      },
      feastSpread(ctx, x, y) {
        D.rect(ctx, x - 55, y - 3, 110, 3, '#ffffff', '#9aa3ab', 0.6);
        const f = TF.slot('christmas', 'food');
        for (let i = 0; i < 6; i++) f(ctx, x - 44 + i * 18, y - 3, i);
        tree(ctx, x + 50, y - 3, 14);
      },
      feastMain(ctx, x, y, k) { if (k > 0.05) { D.rect(ctx, x - 8, y - 6 * k, 16, 6 * k, '#5b2c12', '#2a1408', 0.5); D.circle(ctx, x, y - 6 * k - 1, 2.2, '#15803d'); } },
      tableJumper: (ctx, x, y, pose) => ornament(ctx, x, y - ((pose && pose.peek) || 0), 7 * ((pose && pose.scale) || 1)),
      flock: (ctx, x, y, t) => tree(ctx, x, y - Math.abs(Math.sin(t * 2)), 10),
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
