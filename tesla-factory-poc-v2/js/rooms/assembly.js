// General assembly: column lift lowers the body from the deck, battery pack rises into it ("marriage"),
// arms bolt on wheels fed by an overhead hook line, then the freight lift takes the car down a floor.
(function () {
  const { C, D, M, seg, lerp } = TF;
  const OX = 14, OY = 380;
  const CAR = () => TF.CAR;

  // carriage height (world y) of the column lift at x=420
  function carriageY(t) {
    const ch = CAR(), ph = TF.phaseAt(ch, 11, t);
    if (ph >= 0.8) { const p = TF.chainPos(ch, ch.tauArr[11] + ph); return p && p.x <= 421 ? p.y : 452; }
    return ph < 0.1 ? 642 : lerp(642, 452, seg(ph, 0.1, 0.75));
  }
  // wheel arm: returns hand pos + whether it holds a wheel
  function wheelArm(ph, pick, hub, rest) {
    if (ph < 0.5) return [lerp(rest[0], pick[0], seg(ph, 0.1, 0.5)), lerp(rest[1], pick[1], seg(ph, 0.1, 0.5)), false];
    if (ph < 1.4) return [lerp(pick[0], hub[0], seg(ph, 0.5, 1.4)), lerp(pick[1], hub[1], seg(ph, 0.5, 1.4)), true];
    if (ph < 1.6) return [hub[0], hub[1], false];
    return [lerp(hub[0], rest[0], seg(ph, 1.6, 2.6)), lerp(hub[1], rest[1], seg(ph, 1.6, 2.6)), false];
  }
  const PICK = [[300, 176], [330, 176]], HUB = [[209.4, 254.3], [262.6, 254.3]], REST = [[280, 160], [320, 160]];

  TF.registerRoom({
    id: 'assembly',
    back(ctx, t, th, r) {
      const F = 292;
      // freight lift shaft (car drops through the floor to the row-2 deck)
      for (const x of [30, 142]) D.rect(ctx, x - 3, 30, 6, F - 30, C.m3, C.line, 1.2, 1);
      D.rect(ctx, 27, 26, 118, 6, C.m2, C.line, 1.2, 1);
      M.beacon(ctx, 86, 26, t, '#ff9800', 2);
      M.stripes(ctx, 0, F - 5, 26, 5);
      // counterweight rides opposite the platform; hoist motor on top
      const k14 = TF.liftK(CAR(), 14, t), cw = lerp(200, 40, k14);
      D.line(ctx, [[48, 32], [48, cw]], C.ink, 1.2);
      D.rect(ctx, 38, cw, 20, 34, C.dark, C.ink, 1.2, 2); M.stripes(ctx, 40, cw + 26, 16, 6);
      D.rect(ctx, 60, 4, 52, 22, C.m, C.line, 1.4, 3); M.fan(ctx, 74, 15, 8, t, 2); M.lights(ctx, 88, 15, 3, t, 7);
      M.gauge(ctx, 124, 60, 8, t, 0.5); M.screen(ctx, 68, 46, 44, 24, t, 8);
      D.rect(ctx, 96, 124, 46, 4, '#f4c430', C.ink, 1, 1);
      D.person(ctx, 124, 124, { s: 0.7, face: -1, shirt: '#2e9e6a', hair: 'cap', hat: '#ffffff', armF: 1.6 + TF.osc(t, 1) * 0.4, armB: 0.9 });
      M.lamp(ctx, 76, 32, 18, t, 0); M.lamp(ctx, 112, 32, 30, t, 0.4);
      // column lift mast
      D.rect(ctx, 462, 40, 10, F - 40, C.m2, C.line, 1.4, 1);
      M.piston(ctx, 478, 60, 200, 0.5 + 0.5 * TF.osc(t, 0.25), 6);
      const cy = carriageY(t) - OY;
      D.rect(ctx, 456, cy - 30, 22, 34, '#f4c430', C.ink, 1.2, 2);
      D.line(ctx, [[456, cy + 2], [360, cy + 2]], C.ink, 3);
      D.joint(ctx, 467, cy - 14, 3);
      // stands under the marriage + wheel stations
      for (const cx of [406, 236]) for (const dx of [-40, 40]) {
        D.rect(ctx, cx + dx - 3, 262, 6, 30, C.m3, C.line, 1, 1); D.rect(ctx, cx + dx - 6, 260, 12, 3, C.dark, null, 0, 1);
      }
      // pack lift table (scissor) under slot 12
      const ph12 = TF.phaseAt(CAR(), 12, t);
      const rise = TF.bump(ph12, 0.7, 1.7, 1.8, 2.6);
      const top = 286 - rise * 19;
      D.line(ctx, [[386, F], [426, top + 2]], C.m3, 2); D.line(ctx, [[426, F], [386, top + 2]], C.m3, 2);
      D.rect(ctx, 380, top, 52, 4, C.dark, null, 0, 1);
      // wheel hook line: rail + hooks (wheels drawn in mid pass)
      // ceiling beam for wheel arms
      D.rect(ctx, 200, 98, 140, 7, C.m2, C.line, 1.2, 1);
      for (const x of [206, 334]) D.rect(ctx, x - 2, 0, 4, 98, C.m3, null, 0, 0);
      // upper-left: tool rack, screens, fan, operator on catwalk
      D.rect(ctx, 160, 20, 30, 70, C.m, C.line, 1.4, 2);
      M.lights(ctx, 166, 30, 3, t, 1); M.gauge(ctx, 175, 52, 8, t, 0.5); M.gauge(ctx, 175, 74, 6, t, 0.25, 0.4);
      M.screen(ctx, 360, 108, 44, 24, t, 2); M.screen(ctx, 360, 20, 44, 24, t, 4, '#e31937');
      M.fan(ctx, 430, 22, 12, t, 2);
      // operator at pack panel + Optimus torquing wheel nuts
      M.cabinet(ctx, 312, F, 24, 44, t, 6);
      M.operator(ctx, 346, F, t, 1, '#e67e22', 0.3);
      const ph13 = TF.phaseAt(CAR(), 13, t), tq = TF.bump(ph13, 1.4, 1.6, 1.9, 2.1);
      D.opt(ctx, 168, F, 0.62, { face: 1, hF: [190 + tq * 14 + TF.osc(t, 4) * tq * 2, 266 - tq * 10], hB: [182 + tq * 8, 262 - tq * 6] });
    },
    mid(ctx, t) {
      const ph13 = TF.phaseAt(CAR(), 13, t);
      // wheel arms (ceiling)
      for (let i = 0; i < 2; i++) {
        const [hx, hy, hold] = wheelArm(ph13, PICK[i], HUB[i], REST[i]);
        D.robotArm(ctx, i ? 300 : 240, 104, hx, hy - 4, 60, 60, i ? -1 : 1, 6);
        if (hold) D.wheel(ctx, hx, hy, 7.7, 0);
        D.rect(ctx, hx - 5, hy - 9, 10, 4, C.dark, null, 0, 1);
      }
    },
  });

  // Wheel hook line (world): runs from the wheel machine in the battery room through the wall.
  // Two wheels are picked at 0.5 (slot-13 phase); the line indexes left by 60 px over [1.6, 2.6].
  TF.addLayer('mid', (ctx, t) => {
    const ph = TF.phaseAt(TF.CAR, 13, t);
    D.rect(ctx, 300, 527, 360, 5, C.m3, C.line, 1, 1);
    const e = ph >= 1.6 && ph < 2.6 ? seg(ph, 1.6, 2.6) : 0, first = ph >= 0.5 && ph < 2.6 ? 2 : 0;
    for (let k = 0; k < 13; k++) {
      const x = 314 + 30 * k - 60 * e;
      if (x < 298) continue;
      D.line(ctx, [[x, 532], [x, 546]], C.ink, 1.2);
      if (k >= first) D.wheel(ctx, x, 556, 7.7, 0);
    }
  });

  // Pack belt + packs (world). Pack slots: 780 (inside pack machine) -> 650 -> 535 -> 420 (rises into the car).
  TF.addLayer('back', (ctx, t) => {
    const ph = TF.phaseAt(TF.CAR, 12, t);
    D.belt(ctx, 380, 670, 420, t / TF.LOOP, 0, -1);
    const XS = [780, 650, 535, 420];
    const k = ph >= 2.2 ? seg(ph, 2.2, 4.0) : 0;
    for (let i = 0; i < 3; i++) D.pack(ctx, lerp(XS[i], XS[i + 1], k), 670, 52);
    if (ph < 1.7) D.pack(ctx, 420, 670 - TF.seg(ph, 0.7, 1.7) * 19, 52); // rises into the body, then rides with the car
  });
})();
