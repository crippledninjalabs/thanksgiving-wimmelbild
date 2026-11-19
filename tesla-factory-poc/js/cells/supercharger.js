// 8. Supercharger stalls: red/white posts, cars plugged in, charge bars fill.
TF.registerCell({
  id: 'supercharger', name: 'Supercharger',
  draw(ctx, p) {
    const { C, D, FY } = TF;
    // canopy
    for (const x of [30, 426]) { D.rect(ctx, x - 4, 82, 8, FY - 82, C.m2, C.line, 1.4, 1); D.joint(ctx, x, 86); }
    D.rect(ctx, 22, 76, 412, 12, C.m, C.line, 1.8, 3);
    D.sign(ctx, 152, 44, 136, 24, 'SUPERCHARGER', { logo: true, size: 10 });
    D.line(ctx, [[180, 68], [180, 76]], C.line, 2); D.line(ctx, [[260, 68], [260, 76]], C.line, 2);

    const stalls = [[150, '#f4f5f6', 0], [270, '#22272c', 0.33], [390, '#3d6fb6', 0.66]];
    stalls.forEach(([sx, col, off], i) => {
      const f = TF.frac(p * 2 + off);
      const lvl = TF.seg(f, 0, 0.8);
      const full = f > 0.8;
      // car reversed in: rear (charge port) next to the post
      D.car(ctx, sx - 104, FY, 0.68, col, { dir: -1 });
      // post
      D.rect(ctx, sx - 8, FY - 52, 16, 52, '#ffffff', C.ink, 1.6, 6);
      D.rect(ctx, sx - 8, FY - 52, 16, 14, C.red, C.ink, 1.6, 6);
      D.rect(ctx, sx - 3, FY - 30, 6, 10, C.glass, null, 0, 1);
      // short cable from post to the car's rear charge port
      ctx.beginPath(); ctx.moveTo(sx - 8, FY - 26);
      ctx.quadraticCurveTo(sx - 14, FY - 4, sx - 22, FY - 20);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke();
      // energy pulses along the cable
      for (let j = 0; j < 2; j++) {
        const k = TF.frac(p * 10 + j / 2 + i * 0.3);
        const bx = (1 - k) * (1 - k) * (sx - 8) + 2 * k * (1 - k) * (sx - 14) + k * k * (sx - 22);
        const by = (1 - k) * (1 - k) * (FY - 26) + 2 * k * (1 - k) * (FY - 4) + k * k * (FY - 20);
        if (!full) D.circ(ctx, bx, by, 2, '#5ad16a', null);
      }
      // charge bar
      const bx = sx - 92, by = 106;
      D.rect(ctx, bx, by, 68, 12, '#fff', C.line, 1.4, 3);
      D.rect(ctx, bx + 2, by + 2, 64 * lvl, 8, full && TF.frac(p * 16) < 0.5 ? '#9be7a5' : '#3fbf55', null, 0, 2);
      D.poly(ctx, [[bx + 76, by - 2], [bx + 71, by + 7], [bx + 75, by + 7], [bx + 73, by + 14], [bx + 79, by + 4], [bx + 75, by + 4]], '#f4c430', '#b8901a', 1);
      D.line(ctx, [[bx + 34, 88], [bx + 34, by]], C.m3, 1.4);
    });
  },
});
