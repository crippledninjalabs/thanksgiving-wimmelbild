// Paint shop: two spray booths turn the grey shell red (colour is a function of journey time),
// paint tanks feed the booths, then the lift drops the body through the floor to the row-1 deck.
TF.registerRoom({
  id: 'paint',
  back(ctx, t, th, r) {
    const { C, D, M } = TF;
    const F = 292;
    M.rollers(ctx, 0, 354, 272, t, 0, 1);
    // tanks + feed pipes with flowing paint
    const cols = ['#e31937', '#e9ecef', '#2b3036'];
    cols.forEach((c, i) => {
      const x = 30 + i * 52;
      M.tank(ctx, x, 104, 38, 56, 0.55 + 0.3 * TF.osc(t, 0.125, i / 3), c);
      M.gauge(ctx, x + 19, 36, 6, t, 0.5, i * 0.2);
    });
    const feed = [[68, 104], [68, 128], [240, 128], [240, 150]];
    D.pipe(ctx, feed, 5, C.m);
    ctx.save(); ctx.setLineDash([3, 7]); ctx.lineDashOffset = -TF.saw(t, 2) * 10; D.line(ctx, feed, '#e31937', 2.4); ctx.restore();
    D.pipe(ctx, [[120, 104], [120, 150]], 5, C.m);
    // booths (back panel)
    for (const bx of [34, 184]) {
      D.rect(ctx, bx, 150, 130, 122, '#e9edf0', C.line, 1.6, 2);
      D.rect(ctx, bx + 30, 136, 70, 14, C.m2, C.line, 1.4, 2);
      M.fan(ctx, bx + 65, 128, 10, t, 3);
    }
    // spray arms (hang from booth ceilings)
    const spray = (bx, slot, i) => {
      const w = TF.M.act(TF.phaseAt(TF.CAR, slot, t), 0.1, 0.4, 2.0, 2.3), on = w > 0.95;
      const cx = TF.CAR.slots[slot][0] - 1086;
      const k = TF.tri(t, 0.5, i * 0.5);
      const tx = TF.lerp(bx + 25 + i * 80, cx - 36 + k * 72, w), ty = TF.lerp(186, 222 + i * 8, w);
      const [hx, hy] = M.arm(ctx, bx + 30 + i * 70, 156, tx, ty, 32, 30, i ? 1 : -1, 6, true);
      D.rect(ctx, hx - 3, hy, 6, 6, C.dark, null, 0, 1);
      if (on) {
        ctx.fillStyle = 'rgba(227,25,55,0.22)';
        ctx.beginPath(); ctx.moveTo(hx, hy + 5); ctx.lineTo(hx - 14, hy + 30); ctx.lineTo(hx + 14, hy + 30); ctx.closePath(); ctx.fill();
        for (let j = 0; j < 5; j++) {
          const q = TF.saw(t, 4, j / 5 + i * 0.1);
          D.circ(ctx, hx + (j - 2) * 5 * q, hy + 6 + q * 22, 1.3, '#e31937', null);
        }
      }
    };
    spray(34, 5, 0); spray(34, 5, 1); spray(184, 6, 0); spray(184, 6, 1);
    // lift shaft guides + controls
    for (const x of [356, 472]) D.rect(ctx, x - 3, 150, 6, F - 150, C.m3, C.line, 1.2, 1);
    D.rect(ctx, 353, 146, 122, 6, C.m2, C.line, 1.2, 1);
    M.beacon(ctx, 364, 146, TF.phaseAt(TF.CAR, 7, t) < 2 ? t : 0, '#ff9800', 2);
    M.beacon(ctx, 464, 146, TF.phaseAt(TF.CAR, 7, t) < 2 ? t : 0, '#ff9800', 2);
    M.stripes(ctx, 340, F - 5, 14, 5);
    // inspection drone hovering over the lift shaft
    M.drone(ctx, 414 + 38 * TF.osc(t, 0.125), 176 + 8 * TF.osc(t, 0.25, 0.2), t);
    // control desk + operators
    D.rect(ctx, 344, 60, 110, 70, C.m, C.line, 1.6, 3);
    M.screen(ctx, 352, 68, 44, 24, t, 5, '#e31937'); M.screen(ctx, 402, 68, 44, 24, t, 6);
    M.lights(ctx, 354, 102, 13, t, 3);
    M.gauge(ctx, 372, 118, 7, t, 0.25); M.gauge(ctx, 398, 118, 7, t, 0.5, 0.3); M.gauge(ctx, 424, 118, 7, t, 0.25, 0.6);
    M.operator(ctx, 334, 146, t, 1, '#ffffff', 0.4, '#e31937');
    D.rect(ctx, 300, 146, 52, 5, C.m2, C.line, 1, 1); M.ladder(ctx, 304, 151, F);
    M.climber(ctx, 310, 160, F, t, 0.125, 0.5, '#4a90d9');
  },
  front(ctx, t, th) {
    const { C, D, M } = TF;
    for (const bx of [34, 184]) {
      D.rect(ctx, bx, 150, 130, 122, 'rgba(205,225,240,0.28)', C.line, 2, 2);
      D.line(ctx, [[bx + 2, 160], [bx + 30, 270]], 'rgba(255,255,255,0.5)', 3);
      D.rect(ctx, bx, 262, 130, 10, C.m2, C.line, 1.4, 1);
      M.lights(ctx, bx + 10, 267, 6, t, bx, 8);
      D.tLogo(ctx, bx + 115, 257, 10, C.red);
    }
  },
});
