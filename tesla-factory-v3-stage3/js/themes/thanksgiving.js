// Thanksgiving theme: autumn-leaf garland along the ceilings, a leaf decal on tube capsules, roof banner.
(function (G) {
  const TF = G.TF, D = TF.draw;
  const COLS = ['#d2691e', '#c0392b', '#e1a326', '#8e5a2b'];
  const leaf = (ctx, x, y, r, a, col) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(a);
    ctx.beginPath(); ctx.moveTo(0, -r); ctx.quadraticCurveTo(r * 0.9, -r * 0.2, 0, r); ctx.quadraticCurveTo(-r * 0.9, -r * 0.2, 0, -r);
    ctx.fillStyle = col; ctx.fill(); ctx.restore();
  };
  TF.theme({
    name: 'thanksgiving',
    food: ['pie', 'pumpkin', 'corn'],
    decor: {
      garland(ctx, x0, x1, y, t, lod) {
        if (lod === 'far') { D.line(ctx, [[x0, y + 8], [x1, y + 8]], '#d58a3a', 3); return; }
        const span = 120, n = Math.max(1, Math.round((x1 - x0) / span)), w = (x1 - x0) / n;
        for (let i = 0; i < n; i++) {
          const a = x0 + i * w, sag = 16;
          ctx.beginPath(); ctx.moveTo(a, y + 4); ctx.quadraticCurveTo(a + w / 2, y + 4 + sag * 2, a + w, y + 4);
          ctx.strokeStyle = '#7b5a2e'; ctx.lineWidth = 1.2; ctx.stroke();
          for (let k = 1; k < 8; k++) {
            const u = k / 8, px = a + w * u, py = y + 4 + sag * 2 * 2 * u * (1 - u);
            const sway = 0.15 * Math.sin((t / 24) * Math.PI * 2 + i + k);   // gentle 24 s sway (seamless)
            leaf(ctx, px, py + 3, 5, sway + (k % 2 ? 0.5 : -0.5), COLS[(i + k) % 4]);
          }
        }
      },
      capsuleDecal(ctx) { leaf(ctx, 1, 0, 3.6, Math.PI / 2, '#e1a326'); },
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
