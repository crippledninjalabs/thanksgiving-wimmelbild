// TF.hanger — overhead power-and-free hanger rail (F6H style). Each hanger runs its own schedule along a
// closed rail loop (outbound lower rail, return upper rail) and can drop on its cords at stations.
(function (G) {
  const TF = G.TF, D = TF.draw;
  TF.hanger = {
    rail(ctx, x0, x1, yLo, yHi, lod) {
      D.line(ctx, [[x0, yLo], [x1, yLo]], '#6f7983', 3);
      D.line(ctx, [[x0, yHi], [x1, yHi]], '#97a0a8', 2.2);
      ctx.beginPath(); ctx.arc(x1, (yLo + yHi) / 2, (yLo - yHi) / 2, -Math.PI / 2, Math.PI / 2); ctx.strokeStyle = '#6f7983'; ctx.lineWidth = 2.2; ctx.stroke();
      ctx.beginPath(); ctx.arc(x0, (yLo + yHi) / 2, (yLo - yHi) / 2, Math.PI / 2, Math.PI * 1.5); ctx.stroke();
      if (lod === 'far') return;
      for (let x = x0 + 40; x < x1; x += 160) D.line(ctx, [[x, yHi - 2], [x, yHi - 30]], '#b3bac1', 1.5); // ceiling drops
    },
    // trolley at (x, y), cords drop `drop`; bar of half-length `half`; returns bar y
    draw(ctx, x, y, drop, half, lod) {
      const by = y + 7 + drop;
      D.rect(ctx, x - 8, y - 5, 16, 8, '#4f5861');
      // carrier frame: twin hanger rods from the trolley yoke down to a hook bar (cords pay out when it drops)
      D.rect(ctx, x - half * 0.55, y + 3, half * 1.1, 4, '#5e6872');
      for (const s of [-1, 1]) D.line(ctx, [[x + s * half * 0.5, y + 7], [x + s * half * 0.5, by]], drop > 2 ? '#59626b' : '#6f7983', drop > 2 ? 1 : 3);
      D.rect(ctx, x - half, by - 2.5, 2 * half, 5, '#5e6872', '#3f4851', 0.8);
      if (lod !== 'far') for (let k = -half + 10; k < half; k += 20) D.line(ctx, [[x + k, by + 2], [x + k, by + 6], [x + k + 3, by + 6]], '#3f4851', 1);
      return by;
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
