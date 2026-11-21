// Valentine's theme: heart garland, a cupid table-jumper, chocolate on the platter.
(function (G) {
  const TF = G.TF, D = TF.draw;
  const heart = (ctx, x, y, r, col) => {
    ctx.save(); ctx.translate(x, y); ctx.beginPath();
    ctx.moveTo(0, r * 0.3);
    ctx.bezierCurveTo(r, -r * 0.6, r * 0.5, -r * 1.1, 0, -r * 0.45);
    ctx.bezierCurveTo(-r * 0.5, -r * 1.1, -r, -r * 0.6, 0, r * 0.3);
    ctx.fillStyle = col || '#e11d48'; ctx.fill(); ctx.restore();
  };
  const cupid = (ctx, x, y, face, pose) => {
    const peek = (pose && pose.peek) || 0, s = ((pose && pose.scale) || 0.7);
    D.circle(ctx, x, y - 14 * s - peek, 7 * s, '#fed7aa', '#d6a07a', 0.7);
    D.circle(ctx, x, y - 4 * s - peek, 8 * s, '#fda4af', '#e11d48', 0.6);
    // bow
    D.line(ctx, [[x + 8 * s * (face || 1), y - 10 * s - peek], [x + 16 * s * (face || 1), y - 14 * s - peek]], '#78350f', 1.4);
    heart(ctx, x - 8 * s, y - 18 * s - peek, 3 * s, '#fb7185');
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
      lawn(ctx, lawn, t, lod) {},
    },
    slots: {
      feastMain: (ctx, x, y) => { heart(ctx, x, y - 8, 8, '#e11d48'); D.circle(ctx, x - 3, y - 4, 2, '#78716c'); D.circle(ctx, x + 3, y - 5, 2, '#78716c'); },
      tableJumper: (ctx, x, y, pose) => cupid(ctx, x, y, (pose && pose.face) || 1, pose),
      windowPet: (ctx, x, y, pose) => cupid(ctx, x, y, -1, pose),
      flock: (ctx, lawn, t, lod) => {},
      lawnDecor: (ctx, lawn, t, lod) => { if (lod === 'far') return; const G0 = lawn.y + lawn.h; for (let i = 0; i < 4; i++) heart(ctx, lawn.x + 100 + i * 80, G0 - 12, 6, '#fb7185'); },
      treeTopper: (ctx, x, y) => heart(ctx, x, y, 6, '#e11d48'),
      platterFood: (ctx, x, y) => { D.rect(ctx, x - 6, y - 5, 12, 5, '#7c2d12', '#431407', 0.6); heart(ctx, x, y - 8, 4, '#e11d48'); },
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
