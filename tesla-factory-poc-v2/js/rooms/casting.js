// Giga-casting: furnace -> ladle on crane -> shot sleeve -> giga press stamps the frame.
// Upper right: panel press feeds the body-shell hoist that runs through the wall into the body room.
TF.registerRoom({
  id: 'casting',
  back(ctx, t, th, r) {
    const { C, D, M, seg, lerp } = TF;
    const ph = TF.phaseAt(TF.CAR, 0, t); // 0 = new frame formed under the closed die
    const F = 292;
    M.rollers(ctx, 0, r.w, 272, t, 0, 1);
    // furnace
    D.rect(ctx, 0, 132, 72, F - 132, '#b45f3c', '#6e3a22', 1.6, 2);
    for (let y = 140; y < F; y += 12) D.line(ctx, [[0, y], [72, y]], 'rgba(0,0,0,0.18)', 1);
    const glow = 0.75 + 0.25 * TF.osc(t, 2);
    D.rect(ctx, 12, 168, 46, 34, `rgba(255,${120 + 60 * glow | 0},30,1)`, '#6e3a22', 1.6, 3);
    for (let i = 0; i < 4; i++) {
      const fh = 10 + 8 * Math.abs(TF.osc(t, 1.5, i * 0.27));
      D.poly(ctx, [[16 + i * 11, 202], [21 + i * 11, 202 - fh], [26 + i * 11, 202]], '#ffd34d', null);
    }
    D.rect(ctx, 24, 62, 20, 70, C.m2, C.line, 1.4, 1); // chimney into ceiling
    M.gauge(ctx, 36, 226, 9, t, 0.25);
    M.lights(ctx, 16, 250, 6, t, 2);
    M.steam(ctx, 34, 60, t, 1, 6);
    // operator at furnace panel
    M.cabinet(ctx, 76, F, 26, 50, t, 4);
    M.operator(ctx, 112, F, t, -1, '#4a90d9', 0.2);

    // crane: rail + ladle shuttling furnace (x=36) <-> shot sleeve funnel (x=104)
    M.rail(ctx, 4, 300, 30);
    let lx, ly, tilt = 0;
    if (ph < 0.6) { lx = 36; ly = lerp(150, 176, seg(ph, 0, 0.3)) - 26 * seg(ph, 0.35, 0.6); }
    else if (ph < 1.6) { lx = lerp(36, 104, seg(ph, 0.6, 1.6)); ly = 150; }
    else if (ph < 2.6) { lx = 104; ly = 150; tilt = TF.bump(ph, 1.7, 2.0, 2.3, 2.6) * 0.9; }
    else { lx = lerp(104, 36, seg(ph, 2.6, 3.8)); ly = 150; }
    M.hoist(ctx, lx, 30, ly - 22, '#f4c430');
    ctx.save(); ctx.translate(lx, ly); ctx.rotate(tilt);
    D.line(ctx, [[-12, -22], [0, -32], [12, -22]], C.ink, 1.4);
    D.poly(ctx, [[-12, -20], [12, -20], [9, 2], [-9, 2]], '#5d656c', C.ink, 1.4);
    D.rect(ctx, -10, -21, 20, 4, ph < 1.7 || ph > 2.5 ? '#ff8a1f' : '#9c4a12', null, 0, 1);
    ctx.restore();
    if (tilt > 0.5) { // molten pour
      const k = TF.bump(ph, 1.85, 2.0, 2.25, 2.45);
      ctx.strokeStyle = '#ff8a1f'; ctx.lineWidth = 4 * k; ctx.beginPath(); ctx.moveTo(lx + 12, ly - 14); ctx.quadraticCurveTo(lx + 16, ly + 10, 104, 196); ctx.stroke();
    }
    // shot sleeve funnel + injection piston
    D.poly(ctx, [[92, 194], [116, 194], [108, 212], [100, 212]], C.m, C.line, 1.4);
    const inj = TF.bump(ph, 2.5, 3.0, 3.5, 3.9);
    D.rect(ctx, 78, 238, 46, 12, C.m2, C.line, 1.4, 2);
    D.rect(ctx, 104 + inj * 16, 241, 16, 6, '#ffb36b', null, 0, 1);
    D.line(ctx, [[100, 212], [100, 238]], C.m3, 4);

    // trimming arms at slot 1 (frame passes on rollers at y=272)
    const ph1 = TF.phaseAt(TF.CAR, 1, t), w1 = M.act(ph1);
    M.weldArm(ctx, t, 318, F - 7, 345, 258, 380, 258, 0.5, 0, 30, -1, false, w1, [345, 232]);
    M.weldArm(ctx, t, 452, F - 7, 400, 258, 430, 258, 0.5, 0.5, 30, 1, false, w1, [425, 232]);
    // quench spray + steam over the hot frame
    D.rect(ctx, 344, 204, 76, 8, C.m2, C.line, 1.2, 2);
    for (let i = 0; i < 5; i++) {
      const nx = 352 + i * 15;
      D.line(ctx, [[nx, 212], [nx, 216]], C.dark, 2);
      if (ph1 < 2.2) for (let j = 0; j < 3; j++) {
        const q = TF.saw(t, 2, j / 3 + i * 0.13);
        D.circ(ctx, nx + (j - 1) * 3 * q, 218 + q * 34, 1.4, '#7fb3e6', null);
      }
    }
    const sa = 1 - TF.lin(ph1, 2.2, 3.4); M.steam(ctx, 362, 250, t, 5, 6, 1, sa); M.steam(ctx, 398, 250, t, 9, 6, 1, sa);
    D.line(ctx, [[382, 204], [382, 160], [338, 160]], C.m3, 3);
    M.gauge(ctx, 338, 160, 7, t, 0.5);
    // mezzanine for the panel press + ladder climber
    D.rect(ctx, 352, 135, 148, 7, C.m2, C.line, 1.4, 1);
    D.rect(ctx, 356, 142, 4, 60, C.m3, null, 0, 0);
    M.ladder(ctx, 334, 135, 200);
    M.climber(ctx, 340, 140, 200, t, 0.125, 0, '#2e9e6a');
    // panel press piston (stamps while the shell is hidden inside)
    const ph3 = TF.phaseAt(TF.CAR, 3, t);
    M.piston(ctx, 426, 22, 30, TF.bump(ph3, 2.0, 2.3, 2.5, 2.8), 12);
    M.fan(ctx, 300, 70, 12, t, 2);
    M.fan(ctx, 260, 70, 12, t, 2);
    M.screen(ctx, 286, 100, 40, 22, t, 3);
  },
  front(ctx, t, th, r) {
    const { C, D, M, seg, lerp } = TF;
    const ph = TF.phaseAt(TF.CAR, 0, t);
    // giga press: platen closes over [3.0,3.95], opens over [0.3,1.2]; covers the new frame
    let k;
    if (ph < 0.3) k = 1; else if (ph < 1.2) k = 1 - seg(ph, 0.3, 1.2); else if (ph < 3.0) k = 0; else k = seg(ph, 3.0, 3.95);
    const dieY = lerp(112, 236, k);
    D.rect(ctx, 116, 62, 160, 28, C.m2, C.line, 1.8, 3);
    for (const px of [140, 176, 216, 252]) { D.rect(ctx, px - 5, 90, 10, dieY - 90, '#e9ecef', C.line, 1.2, 1); }
    D.rect(ctx, 126, 80, 14, 212, C.m, C.line, 1.8, 2);
    D.rect(ctx, 252, 80, 14, 212, C.m, C.line, 1.8, 2);
    D.rect(ctx, 136, dieY, 120, 40, C.m3, C.ink, 1.6, 3);
    D.rect(ctx, 146, dieY + 8, 100, 6, th.accent, null, 0, 1);
    D.tLogo(ctx, 196, dieY + 27, 14, '#ffffff');
    for (let i = 0; i < 4; i++) D.joint(ctx, 133, 120 + i * 40, 3);
    M.beacon(ctx, 196, 62, t, k > 0.9 ? '#e31937' : '#4caf50', 2);
    D.rect(ctx, 116, 274, 160, 18, C.m3, C.line, 1.6, 2); // press bed below the rollers
    M.lights(ctx, 130, 283, 10, t, 5, 13);
    // panel press housing (shell hidden here until the hoist lifts it out)
    D.rect(ctx, 376, 48, 100, 88, C.m, C.line, 1.8, 3);
    D.rect(ctx, 384, 56, 84, 10, th.accent, null, 0, 2);
    D.tLogo(ctx, 400, 92, 18, C.red);
    M.screen(ctx, 418, 78, 46, 20, t, 7);
    M.lights(ctx, 420, 110, 6, t, 8);
  },
});
