// Quality / test: freight lift brings cars down from the deck, dyno run (wheels spin, fan blows),
// scanner arch sweeps; upstairs a Cybercab laps a small test loop.
TF.registerRoom({
  id: 'test',
  back(ctx, t, th, r) {
    const { C, D, M } = TF;
    const F = 300;
    for (const x of [60, 168]) D.rect(ctx, x - 3, 96, 6, F - 96, C.m3, C.line, 1.2, 1);
    D.rect(ctx, 57, 92, 114, 6, C.m2, C.line, 1.2, 1);
    M.beacon(ctx, 114, 92, t, '#ff9800', 2);
    // dyno pit under slot 19 (wheels at x 267 / 321)
    const ph19 = TF.phaseAt(TF.CAR, 19, t), run = TF.bump(ph19, 0.2, 0.4, 2.0, 2.3);
    D.rect(ctx, 246, F - 8, 96, 8, C.dark, null, 0, 1);
    for (const wx of [267, 321]) for (const dx of [-6, 6]) {
      const a = t * Math.PI * 2 * 4 * run;
      D.circ(ctx, wx + dx, F - 6, 4, C.m, C.ink, 1);
      D.line(ctx, [[wx + dx, F - 6], [wx + dx + Math.cos(a) * 4, F - 6 + Math.sin(a) * 4]], C.ink, 1);
    }
    // cooling fan in front of the dyno car
    D.rect(ctx, 372, F - 30, 6, 30, C.m3, null, 0, 1);
    M.fan(ctx, 375, F - 40, 18, t, 3);
    if (run > 0.5) for (let i = 0; i < 4; i++) { const q = TF.saw(t, 2, i / 4); D.line(ctx, [[360 - q * 30, F - 48 + i * 6], [352 - q * 30, F - 48 + i * 6]], 'rgba(61,139,253,0.6)', 1.4); }
    // dyno console + operator
    D.rect(ctx, 190, F - 64, 40, 64, C.m, C.line, 1.4, 2);
    M.screen(ctx, 194, F - 60, 32, 20, t, 3, '#4caf50');
    M.gauge(ctx, 210, F - 26, 9, t, 1, 0); M.lights(ctx, 196, F - 10, 5, t, 2);
    M.operator(ctx, 238, F, t, -1, '#4a90d9', 0.1);
    // mezzanine with Cybercab test loop
    D.rect(ctx, 180, 186, 368, 7, C.m2, C.line, 1.4, 1);
    for (const x of [186, 404, 542]) D.rect(ctx, x - 2, 193, 4, F - 193, C.m3, null, 0, 0);
    D.rect(ctx, 208, 140, 292, 46, null, '#9aa3ab', 3, 23);
    const u = TF.saw(t, 0.125);
    const cab = (x, y, s, dir, sq) => D.cybercab(ctx, x, y, s, { dir, squash: sq, spin: x / 6 });
    let x, y, s, dir = 1, sq = 1;
    if (u < 0.4) { x = TF.lerp(240, 470, u / 0.4); y = 184; s = 0.62; }
    else if (u < 0.5) { const k = (u - 0.4) / 0.1; x = 470 + Math.sin(k * Math.PI) * 14; y = TF.lerp(184, 152, k); s = TF.lerp(0.62, 0.5, k); sq = Math.max(0.12, Math.abs(Math.cos(k * Math.PI))); dir = k < 0.5 ? 1 : -1; }
    else if (u < 0.9) { x = TF.lerp(470, 240, (u - 0.5) / 0.4); y = 152; s = 0.5; dir = -1; }
    else { const k = (u - 0.9) / 0.1; x = 240 - Math.sin(k * Math.PI) * 14; y = TF.lerp(152, 184, k); s = TF.lerp(0.5, 0.62, k); sq = Math.max(0.12, Math.abs(Math.cos(k * Math.PI))); dir = k < 0.5 ? -1 : 1; }
    cab(x, y, s, dir, sq);
    D.rect(ctx, 200, 182, 308, 4, '#7d868f', null, 0, 1);
    for (const cx of [225, 485]) { D.rect(ctx, cx - 6, 160, 12, 22, '#f4c430', C.ink, 1, 2); M.beacon(ctx, cx, 160, t, '#4caf50', 1); }
    // utility corner above the deck: duct, fans, tanks, ladder
    D.rect(ctx, 6, 14, 168, 22, C.m, C.line, 1.4, 3);
    M.fan(ctx, 24, 25, 9, t, 3); M.fan(ctx, 48, 25, 9, t, 3); M.lights(ctx, 66, 25, 6, t, 9);
    M.tank(ctx, 120, 90, 22, 46, 0.5 + 0.3 * TF.osc(t, 0.25), '#7fb3e6');
    M.tank(ctx, 146, 90, 22, 46, 0.5 + 0.3 * TF.osc(t, 0.25, 0.4), '#f4c430');
    M.steam(ctx, 104, 40, t, 4, 5);
    M.ladder(ctx, 176, 40, 186); M.climber(ctx, 182, 50, 186, t, 0.125, 0.75, '#e67e22');
    // QA wall above the dyno
    M.screen(ctx, 190, 20, 60, 34, t, 7); M.screen(ctx, 258, 20, 60, 34, t, 8, '#e31937');
    M.lights(ctx, 194, 64, 16, t, 5);
    M.fan(ctx, 342, 36, 14, t, 2);
    M.operator(ctx, 452, 186, t, -1, '#ffffff', 0.5, '#4caf50');
  },
  front(ctx, t, th) {
    const { C, D, M } = TF;
    // scanner arch around slot 20 (x 464)
    const ph = TF.phaseAt(TF.CAR, 20, t), on = TF.bump(ph, 0.2, 0.35, 2.0, 2.2);
    D.rect(ctx, 408, 200, 10, 100, C.m, C.line, 1.6, 2);
    D.rect(ctx, 510, 200, 10, 100, C.m, C.line, 1.6, 2);
    D.rect(ctx, 404, 194, 120, 12, C.m2, C.line, 1.6, 2);
    D.tLogo(ctx, 464, 200, 9, C.red);
    if (on > 0) {
      const sx = 420 + TF.tri(t, 1) * 88;
      ctx.fillStyle = `rgba(61,139,253,${0.25 * on})`; ctx.fillRect(sx - 6, 206, 12, 94);
      D.line(ctx, [[sx, 206], [sx, 300]], `rgba(227,25,55,${on})`, 1.4);
    }
    M.lights(ctx, 412, 214, 1, t, 1); M.lights(ctx, 514, 214, 1, t, 2);
  },
});
