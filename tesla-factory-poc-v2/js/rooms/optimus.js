// Optimus factory: robots built on stands, a treadmill gait test, an activation pad where each new
// Optimus (walker copies, see layout.js) gets its head check before walking off through the doorways.
TF.registerRoom({
  id: 'optimus',
  back(ctx, t, th, r) {
    const { C, D, M } = TF;
    const F = 292;
    // paint-lift guides coming down from the floor above
    for (const x of [358, 472]) D.rect(ctx, x - 3, 0, 6, 76, C.m3, C.line, 1.2, 1);
    // parts shelves on the back wall
    for (let row = 0; row < 3; row++) {
      D.rect(ctx, 12, 110 + row * 30, 150, 4, C.m2, C.line, 1, 1);
      for (let i = 0; i < 6; i++) {
        D.rect(ctx, 16 + i * 24, 94 + row * 30, 20, 16, i % 2 ? '#e9edf0' : '#d5dbe0', C.line, 1, 2);
        D.circ(ctx, 26 + i * 24, 100 + row * 30, 2, TF.saw(t, 0.5, TF.hash(i + row * 6)) < 0.3 ? '#4caf50' : '#aab1b8', null);
      }
    }
    // build stands with arms working on half-built robots
    for (const [x, off] of [[60, 0]]) {
      D.rect(ctx, x - 16, F - 8, 32, 8, C.m3, C.line, 1.2, 1);
      D.rect(ctx, x - 3, F - 60, 6, 52, C.m2, C.line, 1, 1);
      D.opt(ctx, x, F - 8, 0.6, { face: 1, hF: [x + 22, F - 66 + TF.osc(t, 0.5, off) * 3], hB: [x - 20, F - 64] });
      M.weldArm(ctx, t, x + 34, F, x + 6, F - 50, x + 12, F - 30, 0.5, off, 26, -1);
      M.weldArm(ctx, t, x - 34, 216, x - 10, F - 56, x - 4, F - 40, 0.5, off + 0.25, 24, 1, true);
    }
    D.rect(ctx, 16, 210, 100, 6, C.m2, C.line, 1.2, 1);
    D.rect(ctx, 112, 260, 26, 4, C.m3, C.line, 1, 1); D.rect(ctx, 122, 264, 4, 28, C.m3, null, 0, 0); // dispenser ledge (box slides out here)
    // treadmill gait test
    D.rect(ctx, 214, F - 12, 76, 12, C.dark, C.ink, 1.2, 4);
    ctx.save(); ctx.beginPath(); ctx.rect(218, F - 11, 68, 10); ctx.clip();
    for (let x = 214 + TF.saw(t, 2) * -12; x < 300; x += 12) D.line(ctx, [[x, F - 11], [x + 4, F - 1]], '#8b939b', 2);
    ctx.restore();
    D.rect(ctx, 284, F - 70, 6, 58, C.m2, C.line, 1, 1);
    M.screen(ctx, 268, F - 100, 40, 26, t, 4, '#4caf50');
    D.opt(ctx, 246, F - 12, 0.6, { face: 1, walk: t * Math.PI * 4, bob: -Math.abs(Math.sin(t * Math.PI * 4)) * 1.2,
      hF: [252 + Math.sin(t * Math.PI * 4) * 6, F - 46], hB: [240 - Math.sin(t * Math.PI * 4) * 6, F - 46] });
    // activation pad (Optimus walkers stand here for [2,4.5] of every 8 s)
    const q = TF.mod(t, 8), on = TF.bump(q, 2.1, 2.5, 3.9, 4.3);
    D.rect(ctx, 360, F - 4, 48, 4, '#3d8bfd', C.ink, 1, 2);
    if (on > 0) { ctx.fillStyle = `rgba(61,139,253,${0.18 * on})`; ctx.fillRect(362, F - 60, 44, 56); }
    D.rect(ctx, 300, 96, 110, 7, C.m2, C.line, 1.2, 1);
    const [hx, hy] = M.arm(ctx, 330, 104, TF.lerp(352, 382, on), TF.lerp(150, F - 47, on), 50, 46, -1, 6, true);
    D.circ(ctx, hx, hy + 2, 4, on > 0.9 ? '#5aa9ff' : C.m3, C.ink, 1);
    // console + operator
    M.cabinet(ctx, 316, F, 30, 56, t, 5);
    M.operator(ctx, 306, F, t, 1, '#ffffff', 0.2, '#3d8bfd');
    M.fan(ctx, 250, 110, 14, t, 2); M.fan(ctx, 210, 110, 10, t, 3);
    M.lights(ctx, 200, 140, 8, t, 2);
  },
  front(ctx, t, th) {
    const { C, D, M } = TF;
    // parts dispenser: boxes slide out of the hatch onto the ledge for the carrier Optimus
    D.rect(ctx, 136, 214, 44, 78, C.m, C.line, 1.8, 3);
    D.rect(ctx, 136, 238, 6, 30, '#263039', null, 0, 1);
    M.lights(ctx, 146, 224, 4, t, 3); M.gauge(ctx, 158, 278, 7, t, 0.5);
    D.tLogo(ctx, 158, 252, 14, C.red);
    // charging closet: walkers leave/enter here
    D.rect(ctx, 452, 196, 48, 96, C.m, C.line, 1.8, 3);
    D.rect(ctx, 458, 206, 36, 22, '#263039', null, 0, 2);
    D.rect(ctx, 461, 220, 30 * (0.5 + 0.5 * TF.osc(t, 0.25)), 4, '#4caf50', null, 0, 1);
    D.tLogo(ctx, 476, 248, 16, C.red);
    M.lights(ctx, 460, 272, 4, t, 6);
  },
});
