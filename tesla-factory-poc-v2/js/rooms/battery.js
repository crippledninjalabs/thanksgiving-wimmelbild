// Battery cell line: cells march from the hopper into the pack builder (spinning drum),
// packs leave on the floor belt through the wall to the marriage station; wheel machine feeds the hook line.
TF.registerRoom({
  id: 'battery',
  back(ctx, t, th, r) {
    const { C, D, M } = TF;
    const F = 292;
    // cell belt (cells march left into the builder)
    D.belt(ctx, 318, 232, 170, t / TF.LOOP, 32, -1);
    for (let i = 0; i < 17; i++) {
      const x = 480 - TF.frac((i * 10 + t * 20) / 170) * 170;
      if (x > 322) D.battCell(ctx, x, 232, 0.8);
    }
    // pick-and-place arms over the belt
    for (const [bx, off] of [[360, 0], [420, 0.5]]) {
      const k = TF.ease(TF.tri(t, 1, off));
      M.arm(ctx, bx, 120, TF.lerp(bx - 20, bx + 16, k), 214 - Math.sin(k * Math.PI) * 18, 30, 30, 1, 5, true);
    }
    D.rect(ctx, 330, 112, 120, 8, C.m2, C.line, 1.2, 1);
    // electrolyte tanks + cooling
    M.tank(ctx, 250, 140, 30, 44, 0.5 + 0.35 * TF.osc(t, 0.25), '#9be2a8');
    M.tank(ctx, 284, 140, 30, 44, 0.5 + 0.35 * TF.osc(t, 0.25, 0.5), '#7fb3e6');
    D.pipe(ctx, [[265, 140], [265, 150], [300, 150], [300, 170]], 4);
    M.fan(ctx, 200, 112, 14, t, 2); M.fan(ctx, 200, 146, 10, t, 3);
    // AGV shuttling cell trays
    const ax = 30 + 70 * (1 - Math.cos(TF.saw(t, 0.125) * Math.PI * 2)) / 2;
    M.agv(ctx, ax, F, 36);
    for (let i = 0; i < 3; i++) D.battCell(ctx, ax - 9 + i * 9, F - 9, 0.7);
    // catwalk + ladder + climber
    D.rect(ctx, 0, 112, 110, 5, C.m2, C.line, 1.2, 1);
    M.ladder(ctx, 92, 117, F);
    M.climber(ctx, 98, 126, F, t, 0.125, 0.25, '#e67e22');
    M.cabinet(ctx, 10, 112, 30, 40, t, 3); M.cabinet(ctx, 44, 112, 30, 40, t, 7);
    M.operator(ctx, 214, F, t, 1, '#4a90d9', 0.7);
    M.screen(ctx, 470, 116, 54, 28, t, 8, '#4caf50');
  },
  front(ctx, t, th) {
    const { C, D, M } = TF;
    // cell hopper
    D.poly(ctx, [[470, 150], [530, 150], [520, 200], [480, 200]], C.m, C.line, 1.6);
    for (let i = 0; i < 6; i++) D.battCell(ctx, 482 + i * 7, 166, 0.7);
    D.rect(ctx, 478, 200, 46, 40, C.m, C.line, 1.6, 2);
    M.lights(ctx, 486, 214, 5, t, 2);
    // pack builder with spinning cell drum
    D.rect(ctx, 222, 186, 108, 106, C.m, C.line, 1.8, 3);
    D.circ(ctx, 270, 224, 26, '#e9edf0', C.line, 1.6);
    const a = t * Math.PI * 2 * 0.5;
    for (let i = 0; i < 10; i++) {
      const b = a + (i * Math.PI) / 5;
      D.battCell(ctx, 270 + Math.cos(b) * 17, 224 + Math.sin(b) * 17 + 6, 0.55);
    }
    D.joint(ctx, 270, 224, 4);
    D.rect(ctx, 232, 258, 88, 8, th.accent, null, 0, 1);
    M.lights(ctx, 236, 276, 12, t, 9);
    D.tLogo(ctx, 316, 202, 12, C.red);
    // drop bin for the carrier Optimus (box sinks in behind the front)
    D.rect(ctx, 398, 266, 34, 26, C.m, C.line, 1.6, 3);
    D.rect(ctx, 402, 272, 26, 4, th.accent, null, 0, 1);
    M.lights(ctx, 404, 284, 3, t, 5);
    // wheel machine feeding the hook line through the wall
    D.rect(ctx, 104, 132, 66, 66, C.m, C.line, 1.8, 3);
    D.wheel(ctx, 137, 160, 12, t * Math.PI * 2);
    M.lights(ctx, 114, 188, 7, t, 4);
  },
});
