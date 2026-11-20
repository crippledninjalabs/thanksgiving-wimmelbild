// Body-in-white: weld arms at slots 2 and 4, body shell lowered by the hoist at slot 3.
// The hoist rail runs through the wall from the casting room's panel press.
(function () {
  const { C, D, M, seg, lerp } = TF;
  const OX = 526, OY = 74; // room origin (world)

  TF.registerRoom({
    id: 'body',
    back(ctx, t, th, r) {
      const F = 292;
      M.rollers(ctx, 0, r.w, 272, t, 0, 1);
      // ceiling beams for upside-down arms
      D.rect(ctx, 10, 146, 170, 8, C.m2, C.line, 1.4, 1);
      D.rect(ctx, 380, 146, 168, 8, C.m2, C.line, 1.4, 1);
      for (const x of [14, 176, 384]) D.rect(ctx, x - 2, 0, 4, 146, C.m3, null, 0, 0);
      // slot 2 welding
      const w2 = M.act(TF.phaseAt(TF.CAR, 2, t)), w4 = M.act(TF.phaseAt(TF.CAR, 4, t));
      const weld = (bx, by, x0, x1, y, off, bend, up) => {
        const rest = [bx + (bx < 274 ? 16 : -16), up ? by + 44 : by - 44];
        M.weldArm(ctx, t, bx, by, x0, y, x1, y, 0.5, off, 32, bend, up, bx < 300 ? w2 : w4, rest);
      };
      weld(40, 285, 60, 90, 262, 0, -1, false);
      weld(150, 285, 95, 125, 262, 0.4, 1, false);
      weld(90, 154, 70, 110, 248, 0.2, 1, true);
      weld(390, 285, 420, 450, 262, 0.1, -1, false);
      weld(520, 285, 460, 490, 262, 0.6, 1, false);
      weld(420, 154, 410, 440, 246, 0.3, -1, true);
      weld(490, 154, 455, 485, 246, 0.8, 1, true);
      // slot 3: Optimus guides the shell down
      const ph3 = TF.phaseAt(TF.CAR, 3, t);
      const g = TF.bump(ph3, 0.6, 0.9, 1.3, 1.6);
      D.opt(ctx, 206, F, 0.62, { face: 1, hF: [214 + g * 10, 262 - g * 10], hB: [210 + g * 8, 258 - g * 6] });
      D.opt(ctx, 344, F, 0.62, { face: -1, hF: [334 - g * 10, 262 - g * 10], hB: [338 - g * 8, 258 - g * 6] });
      // glass control booth upper right
      D.rect(ctx, 384, 70, 156, 66, '#e4ecf2', C.line, 1.6, 3);
      M.screen(ctx, 392, 78, 40, 22, t, 1); M.screen(ctx, 438, 78, 40, 22, t, 2); M.screen(ctx, 484, 78, 46, 22, t, 3);
      M.operator(ctx, 420, 134, t, 1, '#ffffff', 0.1, '#e31937');
      M.operator(ctx, 500, 134, t, -1, '#4a90d9', 0.6);
      M.lights(ctx, 392, 110, 6, t, 4);
      // fans + scissor lift with inspector
      M.fan(ctx, 210, 110, 13, t, 2); M.fan(ctx, 246, 110, 13, t, 2); M.fan(ctx, 330, 110, 13, t, 2);
      const sl = 0.5 + 0.5 * TF.osc(t, 0.125);
      const top = F - 22 - sl * 40;
      for (let i = 0; i < 3; i++) {
        const y0 = F - 6 - (i * (F - 6 - top)) / 3, y1 = F - 6 - ((i + 1) * (F - 6 - top)) / 3;
        D.line(ctx, [[296, y0], [326, y1]], C.m3, 2); D.line(ctx, [[326, y0], [296, y1]], C.m3, 2);
      }
      D.rect(ctx, 290, F - 6, 42, 6, C.dark, null, 0, 1);
      D.rect(ctx, 290, top - 4, 42, 5, '#f4c430', C.ink, 1, 1);
      D.person(ctx, 316, top - 4, { s: 0.75, face: -1, shirt: '#2e9e6a', hair: 'cap', hat: '#ffffff', armF: 1.8 + TF.osc(t, 1) * 0.3 });
      M.cabinet(ctx, 520, 140, 24, 48, t, 9);
    },
  });

  // Shell hoist (world coords, spans casting + body). Synced to the car arriving at slot 3.
  TF.addLayer('mid', (ctx, t) => {
    const u = TF.phaseAt(TF.CAR, 3, t), v = u < 0.3 ? u + 4 : u;
    const RY = 140, pickX = 440, dropX = 800;
    M.rail(ctx, 380, 840, RY);
    let x, yb, carry;
    if (v < 1.2) { x = dropX; yb = lerp(181, 346, seg(v, 0.3, 1.2)); carry = true; }
    else if (v < 1.6) { x = dropX; yb = lerp(315, 150, seg(v, 1.2, 1.6)); carry = false; }
    else if (v < 3.1) { x = lerp(dropX, pickX, seg(v, 1.6, 2.8)); yb = 150; carry = false; }
    else { x = lerp(pickX, dropX, seg(v, 3.3, 4.3)); yb = 181; carry = true; }
    const hookY = carry ? yb - 31 : yb;
    M.hoist(ctx, x, RY, hookY, '#f4c430');
    if (carry) {
      D.line(ctx, [[x, hookY], [x - 30, hookY + 6]], C.ink, 1); D.line(ctx, [[x, hookY], [x + 30, hookY + 6]], C.ink, 1);
      D.car(ctx, x - 45.5, yb, TF.CAR_S, '#d7dce1', { dir: 1, wheels: false, glassA: 0 });
    }
  });
})();
