// Thanksgiving theme: leaves, pies, a turkey flock, and a turkey table-jumper.
(function (G) {
  const TF = G.TF, D = TF.draw, P = G.TF3.paint, M = TF.M;
  const COLS = ['#d2691e', '#c0392b', '#e1a326', '#8e5a2b'];
  const leaf = (ctx, x, y, r, a, col) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(a);
    ctx.beginPath(); ctx.moveTo(0, -r); ctx.quadraticCurveTo(r * 0.9, -r * 0.2, 0, r); ctx.quadraticCurveTo(-r * 0.9, -r * 0.2, 0, -r);
    ctx.fillStyle = col; ctx.fill(); ctx.restore();
  };
  const turkey = (ctx, x, y, face, pose) => {
    const peck = (pose && pose.peck) || 0, scale = (pose && pose.scale) || 0.7;
    P.begin(ctx, x, y, M * scale, face || 1);
    P.ellipse(ctx, [0, 0.2], 0.22, 0.14, 0, '#b45309', '#7c2d12', 0.8);
    P.circle(ctx, [0.2, 0.28 + peck], 0.08, '#b45309', '#7c2d12', 0.8);
    P.poly(ctx, [[0.26, 0.28 + peck], [0.36, 0.26 + peck], [0.26, 0.24 + peck]], '#ea580c', null);
    P.ellipse(ctx, [-0.16, 0.22], 0.08, 0.1, -0.4, '#c2410c', '#7c2d12', 0.6);
    P.end(ctx);
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
            const sway = 0.15 * Math.sin((t / 24) * Math.PI * 2 + i + k);
            leaf(ctx, px, py + 3, 5, sway + (k % 2 ? 0.5 : -0.5), COLS[(i + k) % 4]);
          }
        }
      },
      capsuleDecal(ctx) { leaf(ctx, 1, 0, 3.6, Math.PI / 2, '#e1a326'); },
      lawn(ctx, lawn, t, lod) { if (lod === 'far') return; for (let i = 0; i < 6; i++) leaf(ctx, lawn.x + 80 + i * 70, lawn.y + lawn.h - 16, 6, 0.4 * Math.sin(t + i), COLS[i % 4]); },
    },
    slots: {
      feastMain: (ctx, x, y) => {
        // bolts piled into a turkey shape with two wrench "drumsticks"
        ctx.beginPath(); ctx.ellipse(x, y - 8, 10, 7, 0, 0, Math.PI * 2); ctx.fillStyle = '#9aa3ab'; ctx.fill(); ctx.strokeStyle = '#57534e'; ctx.lineWidth = 0.8; ctx.stroke();
        D.rect(ctx, x - 16, y - 10, 8, 3, '#78716c', '#3f3f46', 0.6);
        D.rect(ctx, x + 8, y - 10, 8, 3, '#78716c', '#3f3f46', 0.6);
        D.circle(ctx, x, y - 14, 3, '#78716c');
      },
      tableJumper: (ctx, x, y, pose) => turkey(ctx, x, y, (pose && pose.face) || 1, pose),
      windowPet: (ctx, x, y, pose) => turkey(ctx, x, y, -1, Object.assign({ scale: 0.65 }, pose)),
      flock: (ctx, lawn, t, lod) => {
        if (lod === 'far') return;
        const G0 = lawn.y + lawn.h;
        for (let i = 0; i < 3; i++) {
          const x = lawn.x + 280 + i * 40, peck = 0.06 * Math.sin(TF.mod(t, 24) * 4 + i);
          turkey(ctx, x, G0, i === 1 ? -1 : 1, { peck, scale: 0.55 });
        }
      },
      lawnDecor: (ctx, lawn, t, lod) => {},
      treeTopper: (ctx, x, y) => {},
      platterFood: (ctx, x, y) => { D.circle(ctx, x, y - 5, 6, '#b45309', '#7c2d12', 0.7); D.rect(ctx, x - 8, y - 3, 5, 2, '#f59e0b', '#b45309', 0.5); },
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
