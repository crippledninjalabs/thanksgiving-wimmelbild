// Thanksgiving theme: autumn-leaf garland along the ceilings, a leaf decal on tube capsules, roof banner.
(function (G) {
  const TF = G.TF, D = TF.draw;
  const COLS = ['#d2691e', '#c0392b', '#e1a326', '#8e5a2b'];
  const leaf = (ctx, x, y, r, a, col) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(a);
    ctx.beginPath(); ctx.moveTo(0, -r); ctx.quadraticCurveTo(r * 0.9, -r * 0.2, 0, r); ctx.quadraticCurveTo(-r * 0.9, -r * 0.2, 0, -r);
    ctx.fillStyle = col; ctx.fill(); ctx.restore();
  };
  // roast turkey on a plate (centre x, base y, scale s) and a small live turkey (face = +1/-1)
  const turkey = (ctx, x, y, s) => {
    D.circle(ctx, x - 7 * s, y - 8 * s, 4 * s, '#b45309', '#7c2d12', 0.5); D.circle(ctx, x + 7 * s, y - 8 * s, 4 * s, '#b45309', '#7c2d12', 0.5);   // drumsticks
    D.rect(ctx, x - 9 * s, y - 2 * s, 18 * s, 2 * s, '#f8fafc', '#94a3b8', 0.5);
    ctx.beginPath(); ctx.ellipse(x, y - 7 * s, 8 * s, 6 * s, 0, 0, Math.PI * 2); ctx.fillStyle = '#c2691e'; ctx.fill(); ctx.strokeStyle = '#7c2d12'; ctx.lineWidth = 0.6; ctx.stroke();
    D.circle(ctx, x - 2 * s, y - 9 * s, 1.6 * s, '#e0933f');
  };
  const liveTurkey = (ctx, x, y, f) => {
    for (let k = -2; k <= 2; k++) D.circle(ctx, x - f * 4 + k * 2.2, y - 9 - Math.abs(k) * -0.5, 2.6, COLS[(k + 2) % 4]);
    D.circle(ctx, x, y - 5, 4.5, '#7b4a22', '#4a2c0c', 0.5); D.circle(ctx, x + f * 4, y - 9, 2.2, '#7b4a22');
    D.rect(ctx, x + f * 5.5, y - 8.5, 1.6, 1.4, '#f59e0b'); D.rect(ctx, x + f * 4.5, y - 7, 1.2, 2.2, '#dc2626');
    D.line(ctx, [[x - 1, y - 1], [x - 1, y]], '#f59e0b', 1); D.line(ctx, [[x + 1.5, y - 1], [x + 1.5, y]], '#f59e0b', 1);
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
    slots: {
      food(ctx, x, y, i) {
        const v = ((i % 3) + 3) % 3;
        if (v === 0) { D.poly(ctx, [[x - 6, y], [x + 6, y], [x + 6, y - 5], [x, y - 7], [x - 6, y - 5]], '#d97706', '#7c2d12', 0.5); D.rect(ctx, x - 6, y - 7, 12, 1.2, '#fde68a'); }   // pie
        else if (v === 1) { D.circle(ctx, x, y - 4, 4.5, '#ea580c', '#7c2d12', 0.5); D.line(ctx, [[x, y - 8.5], [x, y - 0.5]], '#9a3412', 0.5); }                             // pumpkin
        else { D.rect(ctx, x - 5, y - 4, 10, 4, '#fde047', '#a16207', 0.5); for (let k = -3; k <= 3; k += 2) D.line(ctx, [[x + k, y - 4], [x + k, y]], '#ca8a04', 0.5); }   // corn
      },
      feastSpread(ctx, x, y) {
        D.rect(ctx, x - 58, y - 3, 116, 3, '#ffffff', '#9aa3ab', 0.6);
        turkey(ctx, x - 28, y - 3, 1.4);                                                                        // roast-turkey centrepiece
        const bowl = (bx, col) => { D.poly(ctx, [[bx - 7, y - 3], [bx + 7, y - 3], [bx + 5, y - 8], [bx - 5, y - 8]], '#e5e7eb', '#6b7280', 0.5); D.rect(ctx, bx - 5, y - 10, 10, 2.5, col); };
        bowl(x + 8, '#f5f0dc'); bowl(x + 24, '#b91c1c'); bowl(x + 40, '#fde047');                                   // mash, cranberry, corn
        D.poly(ctx, [[x + 46, y - 3], [x + 56, y - 3], [x + 56, y - 7], [x + 51, y - 9], [x + 46, y - 7]], '#d97706', '#7c2d12', 0.5);   // pie
      },
      feastMain: (ctx, x, y, k) => { if (k > 0.05) turkey(ctx, x, y - 1, 0.8 * (0.4 + 0.6 * k)); },
      tableJumper: (ctx, x, y, pose) => liveTurkey(ctx, x, y - ((pose && pose.peek) || 0), (pose && pose.face) || 1),
      flock: (ctx, x, y, t) => liveTurkey(ctx, x, y - Math.abs(Math.sin(t * 2)) * 1, 1),
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
