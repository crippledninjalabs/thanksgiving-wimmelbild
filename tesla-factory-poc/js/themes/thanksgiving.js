// Thanksgiving theme: turkeys, pies and pumpkins ride the themed conveyors; autumn decorations.
(function () {
  const { D } = TF;

  TF.ITEMS.turkey = (ctx, x, y, s) => {
    const k = s / 14;
    const fan = ['#c0392b', '#e67e22', '#f1c40f', '#e67e22', '#c0392b'];
    fan.forEach((c, i) => {
      const a = -Math.PI * 0.95 + i * 0.36;
      D.circ(ctx, x - 2 * k + Math.cos(a) * 6 * k, y - 1 * k + Math.sin(a) * 6 * k, 3.4 * k, c, null);
    });
    D.circ(ctx, x, y + 1 * k, 5.2 * k, '#8b5a2b', '#5e3b1a', 1);
    D.circ(ctx, x + 4.6 * k, y - 3.4 * k, 2.6 * k, '#8b5a2b', '#5e3b1a', 1);
    D.circ(ctx, x + 6.6 * k, y - 3.6 * k, 1, '#f1c40f', null);
    D.circ(ctx, x + 5.6 * k, y - 1.2 * k, 1.1, '#d03030', null);
  };
  TF.ITEMS.pie = (ctx, x, y, s) => {
    const k = s / 14;
    ctx.beginPath(); ctx.ellipse(x, y + 1 * k, 7.5 * k, 3.6 * k, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#d9a35b'; ctx.fill(); ctx.strokeStyle = '#8a5a24'; ctx.lineWidth = 1; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(x, y, 5.6 * k, 2.4 * k, 0, 0, Math.PI * 2); ctx.fillStyle = '#b5651d'; ctx.fill();
    D.rect(ctx, x - 7.5 * k, y + 1 * k, 15 * k, 3.4 * k, '#d9a35b', '#8a5a24', 1, 1);
  };
  TF.ITEMS.pumpkin = (ctx, x, y, s) => {
    const k = s / 14;
    for (const dx of [-3.5, 3.5, 0]) {
      ctx.beginPath(); ctx.ellipse(x + dx * k, y + 1 * k, 4.4 * k, 5 * k, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#f08a24'; ctx.fill(); ctx.strokeStyle = '#b3591a'; ctx.lineWidth = 1; ctx.stroke();
    }
    D.line(ctx, [[x, y - 3.6 * k], [x + 1.4 * k, y - 6.6 * k]], '#5b7a2e', 2);
  };

  const leaf = (ctx, x, y, r, a, col) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(a);
    ctx.beginPath(); ctx.moveTo(-r, 0); ctx.quadraticCurveTo(0, -r * 0.8, r, 0); ctx.quadraticCurveTo(0, r * 0.8, -r, 0);
    ctx.fillStyle = col; ctx.fill();
    D.line(ctx, [[-r, 0], [r * 0.8, 0]], 'rgba(90,40,10,0.5)', 0.8);
    ctx.restore();
  };
  const LEAF = ['#c0392b', '#e67e22', '#d4a017', '#8e4b1f'];

  // Garland of leaves swagged along the top edge of the header
  TF.DECOR.garland = (ctx, d, p) => {
    const sw = 160;
    for (let x0 = d.x0; x0 < d.x1; x0 += sw) {
      ctx.beginPath(); ctx.moveTo(x0, d.y); ctx.quadraticCurveTo(x0 + sw / 2, d.y + 26, x0 + sw, d.y);
      ctx.strokeStyle = '#7a5230'; ctx.lineWidth = 2; ctx.stroke();
      for (let i = 1; i < 8; i++) {
        const k = i / 8, lx = x0 + sw * k, ly = d.y + 26 * 2 * k * (1 - k);
        leaf(ctx, lx, ly + 3, 6, (i % 2 ? 0.7 : -0.7) + TF.wave(p, 2, k) * 0.12, LEAF[(i + x0 / sw) % 4 | 0]);
      }
      D.circ(ctx, x0, d.y + 2, 3.4, '#f4c430', '#a77d10', 1);
    }
  };
  // Leaves drifting down inside a box (seamless: integer falls per loop)
  TF.DECOR.leaves = (ctx, d, p) => {
    for (let i = 0; i < d.n; i++) {
      const f = TF.frac(p * 2 + i / d.n);
      const x = d.x + ((i * 53) % d.w) + Math.sin(f * Math.PI * 4 + i) * 10;
      leaf(ctx, x, d.y + f * d.h, 5, f * 9 + i, LEAF[i % 4]);
    }
  };
  TF.DECOR.pumpkin = (ctx, d) => TF.ITEMS.pumpkin(ctx, d.x, d.y - 8, d.s || 18);
  TF.DECOR.hay = (ctx, d) => {
    D.rect(ctx, d.x - 22, d.y - 20, 44, 20, '#e2c26a', '#a88a36', 1.4, 3);
    for (const dx of [-12, 12]) D.line(ctx, [[d.x + dx, d.y - 20], [d.x + dx, d.y]], '#a88a36', 1.6);
  };

  TF.registerTheme({
    id: 'thanksgiving',
    label: 'Thanksgiving',
    accent: '#d35400',
    accent2: '#8e5a2b',
    sign: 'Happy Thanksgiving',
    signBg: '#fff4e6', signColor: '#8e3b12',
    payloads: ['turkey', 'pie', 'pumpkin'],
    decor: [
      { type: 'garland', x0: 0, x1: 1600, y: 0 },
      { type: 'leaves', x: 200, y: 22, w: 380, h: 70, n: 5 },
      { type: 'leaves', x: 990, y: 22, w: 110, h: 70, n: 2 },
      { type: 'pumpkin', x: 60, y: 992 }, { type: 'hay', x: 300, y: 992 },
      { type: 'pumpkin', x: 300, y: 972, s: 14 },
      { type: 'pumpkin', x: 560, y: 992 }, { type: 'hay', x: 1040, y: 992 },
      { type: 'pumpkin', x: 1300, y: 992, s: 22 }, { type: 'pumpkin', x: 1550, y: 992 },
    ],
  });
})();
