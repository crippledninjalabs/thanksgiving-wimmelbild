// Valentine's theme: heart garland and capsule decal; cupid / heart slot art.
(function (G) {
  const TF = G.TF, D = TF.draw;
  const heart = (ctx, x, y, r, col) => {
    ctx.save(); ctx.translate(x, y); ctx.beginPath(); ctx.moveTo(0, r * 0.3);
    ctx.bezierCurveTo(r, -r * 0.6, r * 0.5, -r * 1.1, 0, -r * 0.45); ctx.bezierCurveTo(-r * 0.5, -r * 1.1, -r, -r * 0.6, 0, r * 0.3);
    ctx.fillStyle = col || '#e11d48'; ctx.fill(); ctx.restore();
  };
  const cupid = (ctx, x, y, face, s) => {
    D.circle(ctx, x, y - 14 * s, 7 * s, '#fed7aa', '#d6a07a', 0.7); D.circle(ctx, x, y - 5 * s, 8 * s, '#fda4af', '#e11d48', 0.6);
    D.line(ctx, [[x + 8 * s * face, y - 10 * s], [x + 16 * s * face, y - 14 * s]], '#78350f', 1.4);
    heart(ctx, x - 8 * s * face, y - 18 * s, 3 * s, '#fb7185');
  };
  TF.theme({
    name: 'valentines',
    food: ['chocolate', 'tart', 'berries'],
    decor: {
      garland(ctx, x0, x1, y, t, lod) {
        D.line(ctx, [[x0, y + 8], [x1, y + 8]], '#fb7185', 2);
        if (lod === 'far') return;
        const n = Math.max(2, Math.round((x1 - x0) / 50));
        for (let i = 0; i < n; i++) heart(ctx, x0 + (i + 0.5) * (x1 - x0) / n, y + 10, 5, i % 2 ? '#e11d48' : '#fb7185');
      },
      capsuleDecal(ctx) { heart(ctx, 0, 0, 3, '#e11d48'); },
    },
    slots: {
      food(ctx, x, y, i) {
        const v = ((i % 3) + 3) % 3;
        if (v === 0) { D.rect(ctx, x - 4, y - 5, 8, 5, '#7c2d12', '#431407', 0.5); heart(ctx, x, y - 6, 3, '#e11d48'); }            // chocolate heart box
        else if (v === 1) { D.poly(ctx, [[x - 5, y], [x + 5, y], [x + 4, y - 4], [x - 4, y - 4]], '#fcd34d', '#a16207', 0.5); heart(ctx, x, y - 5, 2.6, '#e11d48'); }   // tart
        else { for (const k of [-2.5, 0, 2.5]) D.circle(ctx, x + k, y - 2.5 - (k === 0) * 2, 2, '#be123c', '#7f1d1d', 0.4); }     // berries
      },
      feastSpread(ctx, x, y) {
        D.rect(ctx, x - 55, y - 3, 110, 3, '#ffffff', '#9aa3ab', 0.6);
        heart(ctx, x - 28, y - 12, 14, '#e11d48');                                                                                 // heart-shaped cake
        const f = TF.slot('valentines', 'food');
        for (let i = 0; i < 4; i++) f(ctx, x + 2 + i * 15, y - 3, i);
      },
      feastMain(ctx, x, y, k) { if (k > 0.05) { heart(ctx, x, y - 3 - 7 * k, 3 + 6 * k, '#e11d48'); D.circle(ctx, x - 3, y - 1.5, 1.6, '#78716c'); } },
      tableJumper: (ctx, x, y, pose) => cupid(ctx, x, y - ((pose && pose.peek) || 0), (pose && pose.face) || 1, (pose && pose.scale) || 0.7),
      flock: (ctx, x, y, t) => heart(ctx, x, y - 5 - Math.abs(Math.sin(t * 2)) * 1.5, 5, '#fb7185'),
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
