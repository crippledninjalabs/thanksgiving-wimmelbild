// 6. Cybertruck roll-out: the bay door rolls up, the truck rolls out, poses, drives off; door closes.
// The bay is open on its right side, so the truck emerges cleanly with nothing drawn over it.
TF.registerCell({
  id: 'cybertruck', name: 'Cybertruck roll-out',
  draw(ctx, p) {
    const { C, D, FY, seg, lerp } = TF;
    const q = p; // once per loop (Elon watches the pause)
    const open = seg(q, 0.3, 0.42) - seg(q, 0.9, 0.99);
    const tx = q < 0.62 ? lerp(52, 250, seg(q, 0.42, 0.62)) : lerp(250, 460, seg(q, 0.8, 0.95));
    const s = 0.9, bayT = 124, bayL = 50, bayR = 214;

    // spotlight (behind everything)
    const sa = -0.5 + 0.25 * TF.wave(p, 2);
    const ray = (d) => [404 + Math.cos(Math.PI + sa + d) * 220, 150 + Math.sin(Math.PI + sa + d) * 220];
    D.poly(ctx, [[404, 150], ray(-0.2), ray(0.2)], 'rgba(255,230,120,0.18)', null);
    D.rect(ctx, 398, 144, 14, 12, C.dark, C.ink, 1.2, 2);
    D.line(ctx, [[405, 156], [405, FY]], C.m3, 3);
    D.joint(ctx, 405, 150);

    // bay interior + back corner post (both behind the truck)
    D.rect(ctx, bayL, bayT, bayR - bayL, FY - bayT, '#59616a', null, 0, 0);
    D.rect(ctx, bayR - 10, bayT, 10, FY - bayT, '#8e969d', C.line, 1.2, 0);
    D.cybertruck(ctx, tx, FY, s, { spin: tx / 11 });

    // front: left wall, header with sign, roof slab, roll-up door
    D.rect(ctx, 20, 84, bayL - 20, FY - 84, C.m, C.line, 1.8, 0);
    D.rect(ctx, 20, 84, bayR - 20, bayT - 84, C.m, C.line, 1.8, 0);
    D.rect(ctx, 14, 76, bayR - 8, 8, C.m2, C.line, 1.6, 2);
    D.sign(ctx, 50, 90, 138, 26, 'CYBERTRUCK', { logo: true, bg: '#1f2328', color: '#e8ecef', stroke: '#111', size: 11 });
    const doorB = lerp(FY, bayT + 4, open);
    if (doorB > bayT + 2) {
      D.rect(ctx, bayL, bayT, bayR - bayL, doorB - bayT, '#cfd5da', C.line, 1.4, 0);
      for (let y = doorB - 8; y > bayT + 2; y -= 9) D.line(ctx, [[bayL + 2, y], [bayR - 2, y]], '#aab2b9', 1.2);
    }
    const blink = TF.frac(p * 14) < 0.5;
    D.circ(ctx, 202, 103, 4, open > 0.05 && blink ? '#ffb020' : '#9aa1a8', C.ink, 1);
    // worker on the roof waving
    D.person(ctx, 150, 76, { face: 1, shirt: '#e74c3c', hair: 'short', armF: Math.PI - 0.4 + TF.wave(p, 10) * 0.4, armB: -0.2 });
  },
});
