// Cybertruck line: stainless coil -> panel press (upper), trucks emerge from the framing tower,
// get welded + glazed, lights come on, then roll out the garage door in the building's left wall.
// Above: the row-2 car deck carries Model Ys from the freight lift towards the test room.
(function () {
  const { C, D, M, seg, lerp } = TF;
  const P = 8, XS = [460, 330, 190, -160]; // truck slots (local x); slot 0 hidden in the tower, 3 outside
  const TS = 0.62, TL = 150 * TS;

  function truck(ctx, x, tau, spin) {
    ctx.save(); ctx.translate(x, 300); ctx.scale(-1, 1);
    D.cybertruck(ctx, -TL / 2, 0, TS, {
      spin, glassA: TF.lin(tau, 2.6, 6.5), lights: TF.lin(tau, P + 2.6, P + 5),
    });
    ctx.restore();
  }

  TF.registerRoom({
    id: 'cybertruck',
    back(ctx, t, th, r) {
      const F = 300;
      // freight-lift guides between ceiling and deck
      for (const x of [30, 142]) D.rect(ctx, x - 3, 0, 6, 150, C.m3, C.line, 1.2, 1);
      const cw = lerp(40, 110, TF.liftK(TF.CAR, 14, t));
      D.line(ctx, [[48, 0], [48, cw]], C.ink, 1.2);
      D.rect(ctx, 38, cw, 20, 26, C.dark, C.ink, 1.2, 2);
      M.gauge(ctx, 110, 30, 8, t, 0.25); M.lights(ctx, 76, 60, 4, t, 2);
      const pr = [[162, 4], [162, 98], [180, 98]];
      D.pipe(ctx, pr, 5);
      ctx.save(); ctx.setLineDash([3, 8]); ctx.lineDashOffset = -TF.saw(t, 2) * 11; D.line(ctx, pr, th.blob || C.blue, 2.4); ctx.restore();
      M.lamp(ctx, 12, 0, 22, t, 0.2); M.lamp(ctx, 176, 0, 14, t, 0.7);
      M.drone(ctx, 230 + 40 * TF.osc(t, 0.125, 0.3), 16 + 3 * TF.osc(t, 0.5), t);
      // stainless coil -> sheet -> panel press (above the deck)
      const a = t * Math.PI * 2 * 0.25;
      D.circ(ctx, 196, 62, 26, '#d5dbe0', C.line, 1.6);
      for (let i = 0; i < 4; i++) D.circ(ctx, 196, 62, 8 + i * 5, null, '#aab3bb', 1);
      D.line(ctx, [[196, 62], [196 + Math.cos(a) * 24, 62 + Math.sin(a) * 24]], C.line, 2);
      D.joint(ctx, 196, 62, 4);
      D.rect(ctx, 180, 88, 32, 22, C.m2, C.line, 1.2, 1);
      ctx.save(); ctx.setLineDash([10, 4]); ctx.lineDashOffset = -TF.saw(t, 1) * 14;
      D.line(ctx, [[220, 82], [290, 82]], '#c6ccd1', 4); ctx.restore();
      const st = TF.bump(TF.saw(t, 0.5), 0.3, 0.45, 0.55, 0.8);
      D.rect(ctx, 290, 30, 70, 70, C.m, C.line, 1.6, 3);
      D.rect(ctx, 300, 40 + st * 24, 50, 12, C.m3, C.ink, 1.2, 2);
      D.rect(ctx, 296, 84, 58, 6, th.accent, null, 0, 1);
      M.lights(ctx, 300, 94, 7, t, 3);
      M.steam(ctx, 356, 30, t, 2, 5, 0.5);
      M.screen(ctx, 380, 40, 48, 28, t, 6); M.gauge(ctx, 446, 54, 10, t, 0.25);
      M.fan(ctx, 480, 54, 13, t, 2);
      // weld cell frame under the deck
      D.rect(ctx, 250, 150, 240, 6, C.m2, C.line, 1.2, 1);
      for (const x of [254, 486]) D.rect(ctx, x - 2, 156, 4, F - 156, C.m3, null, 0, 0);
      // trucks
      const u = t / P, K = Math.floor(u), ph = (u - K) * P, k = seg(ph, 0, 2.2);
      for (let i = 0; i < 3; i++) truck(ctx, lerp(XS[i], XS[i + 1], k), i * P + ph, -lerp(XS[i], XS[i + 1], k) / 8);
      // arms at slot 1
      const w = M.act(ph, 2.3, 2.8, 6.8, 7.4);
      M.weldArm(ctx, t, 290, F - 7, 300, 270, 330, 270, 0.5, 0, 30, -1, false, w, [300, 250]);
      M.weldArm(ctx, t, 380, F - 7, 340, 266, 368, 266, 0.5, 0.5, 30, 1, false, w, [360, 250]);
      M.weldArm(ctx, t, 330, 156, 300, 246, 350, 246, 0.5, 0.25, 34, 1, true, w, [330, 210]);
      // Optimus glazing + worker polishing at slot 2
      D.opt(ctx, 404, F, 0.6, { face: -1, hF: [380 - w * 10, 262 - w * 8], hB: [384 - w * 8, 266 - w * 6] });
      const pol = M.act(ph, 2.4, 2.8, 7.0, 7.5);
      const px = 190 + TF.osc(t, 1) * 18 * pol;
      D.person(ctx, 128, F, { s: 0.8, face: 1, shirt: '#4a90d9', hair: 'cap', hat: '#f4c430', armF: 1.4 + pol * 0.3, armB: 1.2 });
      D.line(ctx, [[137, F - 18], [px - 20, F - 28]], C.dark, 2);
      D.circ(ctx, px - 20, F - 28, 4, '#e9ecef', C.ink, 1);
      M.operator(ctx, 60, F, t, 1, '#e67e22', 0.5);
      M.cabinet(ctx, 70, F, 22, 40, t, 4);
    },
    front(ctx, t, th) {
      // framing tower hides the next truck being framed
      D.rect(ctx, 410, 160, 90, 140, C.m, C.line, 1.8, 3);
      D.rect(ctx, 418, 170, 74, 10, th.accent, null, 0, 2);
      D.tLogo(ctx, 455, 214, 26, C.red);
      M.screen(ctx, 424, 240, 60, 24, t, 9, '#c6ccd1');
      M.lights(ctx, 424, 278, 9, t, 1);
      M.beacon(ctx, 455, 160, t, '#ff9800', 1);
    },
  });
})();
