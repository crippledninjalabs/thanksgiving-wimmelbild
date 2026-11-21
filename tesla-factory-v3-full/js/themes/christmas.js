// Christmas theme: wreaths, a lawn tree, a red ornament jumper, snow-dust caps on capsules.
(function (G) {
  const TF = G.TF, D = TF.draw, M = TF.M;
  const ornament = (ctx, x, y, pose) => {
    const r = ((pose && pose.scale) || 1) * 8, bounce = (pose && pose.peek) || 0;
    D.circle(ctx, x, y - r - bounce, r, '#b91c1c', '#7f1d1d', 1);
    D.rect(ctx, x - 2, y - r * 2 - bounce - 3, 4, 4, '#fbbf24', '#a16207', 0.6);
    ctx.save(); ctx.beginPath(); ctx.ellipse(x - r * 0.3, y - r * 1.3 - bounce, r * 0.4, r * 0.2, -0.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fill(); ctx.restore();
  };
  const tree = (ctx, x, y, h) => {
    D.rect(ctx, x - 4, y - 10, 8, 10, '#7c4a1e', '#4a2c0c', 0.6);
    for (let i = 0; i < 3; i++) {
      const top = y - 10 - h + i * (h / 3.2);
      D.poly(ctx, [[x, top], [x + 22 - i * 4, y - 10 - i * 6], [x - 22 + i * 4, y - 10 - i * 6]], '#15803d', '#14532d', 0.8);
    }
    D.circle(ctx, x, y - 10 - h, 4, '#fbbf24', '#a16207', 0.6);
  };
  TF.theme({
    name: 'christmas',
    food: ['cookie', 'pudding', 'orange'],
    decor: {
      garland(ctx, x0, x1, y, t, lod) {
        D.line(ctx, [[x0, y + 8], [x1, y + 8]], '#15803d', 3);
        if (lod === 'far') return;
        const n = Math.max(2, Math.round((x1 - x0) / 40));
        for (let i = 0; i < n; i++) {
          const x = x0 + (i + 0.5) * (x1 - x0) / n, on = (Math.floor(t * 2) + i) % 2 === 0;
          D.circle(ctx, x, y + 8, 3, on ? '#ef4444' : '#fbbf24', '#7f1d1d', 0.5);
        }
      },
      capsuleDecal(ctx) { D.circle(ctx, 0, -2, 3, '#ffffff'); },
      lawn(ctx, lawn, t, lod) {},
    },
    slots: {
      feastMain: (ctx, x, y) => { D.rect(ctx, x - 8, y - 8, 16, 8, '#f8fafc', '#94a3b8', 0.6); D.circle(ctx, x, y - 12, 5, '#ef4444', '#7f1d1d', 0.6); },
      tableJumper: (ctx, x, y, pose) => ornament(ctx, x, y, pose),
      windowPet: (ctx, x, y, pose) => ornament(ctx, x, y, pose),
      flock: (ctx, lawn, t, lod) => {},
      lawnDecor: (ctx, lawn, t, lod) => { const G0 = lawn.y + lawn.h; tree(ctx, lawn.x + 200, G0, 70); if (lod !== 'far') for (let i = 0; i < 5; i++) D.circle(ctx, lawn.x + 80 + i * 90, G0 - 4, 2, '#ffffff'); },
      treeTopper: (ctx, x, y) => D.circle(ctx, x, y, 5, '#fbbf24', '#a16207', 0.6),
      platterFood: (ctx, x, y) => { D.circle(ctx, x, y - 4, 5, '#f8fafc', '#94a3b8', 0.6); D.circle(ctx, x, y - 5, 2, '#ef4444'); },
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
