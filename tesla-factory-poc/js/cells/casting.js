// 1. Giga-casting press: ram stamps down, an underbody frame pops out and rides to the chute.
TF.registerCell({
  id: 'casting', name: 'Giga press',
  draw(ctx, p) {
    const { C, D, FY, seg, lerp } = TF;
    const q = TF.frac(p * 2); // 2 stamps per loop
    const down = seg(q, 0.15, 0.28) - seg(q, 0.4, 0.58);
    const ramY = lerp(104, 160, down);

    // hydraulic tank + control panel (left)
    D.rect(ctx, 30, 74, 52, 70, C.m, C.line, 1.8, 6);
    D.gauge(ctx, 56, 100, 11, 0.3 + down * 0.6);
    D.rect(ctx, 40, 122, 32, 8, '#fff', C.line, 1.2, 2);
    D.rect(ctx, 42, 124, 28 * (0.4 + 0.6 * down), 4, C.blue, null, 0, 1);
    D.rect(ctx, 30, 160, 34, 62, C.m, C.line, 1.8, 3);
    const pressing = q > 0.08 && q < 0.2;
    D.circ(ctx, 47, 176, 5, pressing ? '#ff4d4d' : '#b3121f', C.ink, 1.2);
    D.circ(ctx, 47, 194, 3.5, '#4caf50', C.ink, 1);
    D.pipe(ctx, [[56, 74], [56, 64], [200, 64], [200, 72]], 7);
    D.person(ctx, 82, FY, { face: -1, shirt: '#4a90d9', hair: 'cap', hat: '#f4c430',
      armF: 1.2 + 0.5 * (seg(q, 0.04, 0.1) - seg(q, 0.18, 0.24)), bob: TF.wave(p, 6) * 0.6 });

    // press frame
    D.rect(ctx, 118, 70, 18, FY - 70, C.m2, C.line, 1.8, 2);
    D.rect(ctx, 264, 70, 18, FY - 70, C.m2, C.line, 1.8, 2);
    D.rect(ctx, 108, 72, 184, 28, C.m, C.line, 2, 4);
    D.sign(ctx, 228, 77, 44, 18, 'GIGA', { logo: true, size: 9 });
    D.rect(ctx, 180, 100, 40, 14, C.m2, C.line, 1.6, 2);
    D.rect(ctx, 194, 112, 12, ramY - 112, '#e3e6e9', C.line, 1.4, 1);
    D.rect(ctx, 140, ramY, 120, 18, C.m3, C.line, 1.8, 3);
    for (const jx of [146, 254]) D.joint(ctx, jx, ramY + 9);
    D.joint(ctx, 127, 86); D.joint(ctx, 273, 86);
    // die bed
    D.rect(ctx, 130, 192, 140, 30, C.m, C.line, 1.8, 3);
    D.line(ctx, [[134, 198], [266, 198]], C.m3, 1.2);

    // molten blank -> frame
    if (q < 0.28) {
      const glow = 0.6 + 0.4 * TF.wave(p, 20);
      D.rect(ctx, 165, 184, 70, 8, `rgba(255,${120 + 60 * glow | 0},40,1)`, '#b54a10', 1.2, 3);
    } else if (q < 0.95) {
      const fx = lerp(150, 400, seg(q, 0.6, 0.95));
      TF.D.underbody(ctx, fx, 192, 1);
    }
    // steam puffs on impact
    if (q > 0.27 && q < 0.45) {
      const k = TF.lin(q, 0.27, 0.45);
      for (const sx of [-1, 1]) D.circ(ctx, 200 + sx * (68 + 20 * k), 170 - 18 * k, 5 + 8 * k, `rgba(220,226,232,${1 - k})`, null);
    }
    // out-feed belt + chute
    D.belt(ctx, 282, 192, 92, p, 40, 1, 20);
    D.rect(ctx, 368, 150, 58, 72, C.m, C.line, 1.8, 4);
    D.rect(ctx, 368, 168, 10, 30, '#59616a', null, 0, 1);
    D.text(ctx, 'CAST', 402, 162, 9, C.dark);
    D.circ(ctx, 402, 200, 4, q > 0.85 && q < 0.97 ? '#4caf50' : '#9aa1a8', C.ink, 1);
  },
});
