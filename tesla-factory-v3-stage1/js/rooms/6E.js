// 6E — Oven + drop lift L65 (FACTORY-MAP §2, §6 L65). The red body rolls into the oven, the shutters close and it
// bakes (elements and window glow, the paint turns glossy); the east shutter opens, the body rolls onto the L65 drop
// table, which lowers it through the slab into 5E (hidden behind the slab) and comes back up empty.
(function (G) {
  const TF = G.TF, L = TF.layout, D = TF.draw, K = TF.kit, A = TF.act, M = TF.M;
  const ln = TF.line6, yF = ln.yF, hY = ln.hY;
  const room = L.roomById('6E');
  const OV = [3284, 3532, 2.25], LIFT = [3497, 3743];
  const heat = (t) => TF.pulse(TF.mod(t, 12), 0.3, 4.9, 0.6);
  const shutterW = (t) => { const u = TF.mod(t, 12); return u >= 8.0 ? TF.ramp(u, 8.0, 8.5) : u < 0.3 ? 1 - TF.ramp(u, 0, 0.3) : 0; };
  const shutterE = (t) => TF.pulse(TF.mod(t, 12), 4.6, 7.3, 0.4);
  // L65: car on the table 6.8, QC polish + scan until 9.3, down 9.4-10.9, table back up empty 11.0-12.4 (wraps)
  const liftDrop = (t) => { const u = TF.mod(t, 12); return u < 0.4 ? 300 * (1 - TF.ramp(u + 12, 11.0, 12.4)) : u < 9.4 ? 0 : u < 11.0 ? 300 * TF.ramp(u, 9.4, 10.9) : 300 * (1 - TF.ramp(u, 11.0, 12.4)); };
  // QC Optimus between oven and lift: polishes the tailgate, then sweeps the scanner over the body (green lamp = pass)
  const QX = 3483, CW = 3.8, CAT = hY(3.3);
  const tail = A.local(QX, yF, 1, ln.S[5] - 2.3 * M, hY(1.15));
  const scanP = A.reach([0.3, 1.3], [0.15, 1.05], { gripN: 1, gripF: 0.4, angN: 0.1, head: 0.05 });
  const polishP = (tl) => A.reach([tail[0] + 0.05 * Math.cos(tl * 14), tail[1] + 0.05 * Math.sin(tl * 14)], null, { lean: 0.3, gripN: 0.9, head: 0.2 });
  // round 4 — no idle: while the next body bakes the QC Optimus wipes the oven window, walks back, polishes the
  // tailgate, scans the body, confirms the pass on the post button, watches the table drop, turns for the next round
  const win = (tl) => A.reach([0.26 + 0.06 * Math.cos(tl * 8), 1.3 + 0.08 * Math.sin(tl * 8)], [0.1, 1.05], { gripN: 0.8, head: -0.05, angN: 0.6 });
  const BTN = A.local(QX, yF, 1, 3494, hY(1.45));
  const btnP = (k) => A.reach([BTN[0] - 0.03 * (1 - k), BTN[1]], null, { gripN: 0.3, head: 0.05 });
  const qsegs = [
    A.walk(1.2, QX, 3420, { step: 0.5 }), A.hold(1.6, 3420, -1, (tl) => win(tl)),                         // 0.0 .. 2.8
    A.walk(0.6, 3420, 3370, { step: 0.5 }), A.hold(1.6, 3370, -1, (tl) => win(tl + 3)),                   // 2.8 .. 5.0
    A.turn(0.3, 3370, -1), A.walk(1.3, 3370, QX, { step: 0.65 }), A.hold(0.3, QX, 1),                     // 5.0 .. 6.9
    A.keyed(0.3, QX, 1, [[0, A.stand()], [1, polishP(0)]]), A.hold(0.9, QX, 1, (tl) => polishP(tl)),      // 6.9 .. 8.1
    A.keyed(0.2, QX, 1, [[0, polishP(0.9)], [1, scanP]]), A.hold(1.0, QX, 1, () => scanP),                // 8.1 .. 9.3
    A.keyed(0.3, QX, 1, [[0, scanP], [1, btnP(0)]]), A.keyed(0.5, QX, 1, [[0, btnP(0)], [0.5, btnP(1)], [1, btnP(0)]]),   // 9.3 .. 10.1 confirm
    A.keyed(1.6, QX, 1, [[0, btnP(0)], [0.3, Object.assign(A.stand(), { head: 0.45, lean: 0.08 })], [1, Object.assign(A.stand(), { head: 0.4 })]]),  // 10.1 .. 11.7 watch the drop
  ];
  qsegs.push(A.turn(12 - A.total(qsegs), QX, 1));
  const qc = (t) => A.run(qsegs, TF.mod(t, 12));
  const shutter = (ctx, x, open) => {
    const h = OV[2] * M * (1 - open);
    D.rect(ctx, x - 4, hY(OV[2]), 8, h, '#8b6b5c', '#5a4337', 1);
    for (let y = hY(OV[2]) + 6; y < hY(OV[2]) + h; y += 6) D.line(ctx, [[x - 4, y], [x + 4, y]], '#6e5448', 0.8);
  };
  TF.room({
    id: '6E', period: 12, box: room.box,
    ports: { D6DE: 'in', L65: 'out', F6R: 'pass' },
    actors: ['6E.oven', '6E.liftL65', '6E.qcOptimus', 'peek.drone6E', 'peek.wave6E'],
    flows: [{ item: 'baked Model Y top half', from: '6E', via: ['L65'], to: '5E', sink: 'floor-5 line (glass, seats, wheels, pack)' }],
    back(ctx, t, theme, lod) {
      TF.rollers.draw(ctx, 3280, OV[1], ln.rollTop, yF, ln.rollerAng(t, true), lod);
      // oven body + heating elements
      const h = heat(t);
      D.rect(ctx, OV[0], hY(OV[2]), OV[1] - OV[0], OV[2] * M, '#efe6df', '#8b6b5c', 1.6);
      D.rect(ctx, OV[0] - 6, hY(OV[2]) - 10, OV[1] - OV[0] + 12, 12, '#8b6b5c');
      for (let k = 0; k < 3; k++) D.line(ctx, [[OV[0] + 20, hY(1.95 - k * 0.04)], [OV[1] - 20, hY(1.95 - k * 0.04)]], D.mix('#9a7d70', '#ff5a1f', h), 2);
      D.line(ctx, [[OV[0] + 60, hY(OV[2]) - 10], [OV[0] + 60, hY(OV[2] + 0.6)]], '#9aa3ab', 6);   // exhaust stack
      if (lod !== 'far' && h > 0.3) for (let i = 0; i < 3; i++) { const k = TF.mod(t * 0.5 + i / 3, 1); ctx.globalAlpha = 0.35 * (1 - k) * h; D.circle(ctx, OV[0] + 60 + 6 * Math.sin(k * 6 + i), hY(OV[2] + 0.6) - k * 30, 5 + 6 * k, '#cfd4d9'); ctx.globalAlpha = 1; }
      shutter(ctx, OV[1], shutterE(t));
      // L65 drop table: posts, slab pit, platform (clipped above the floor: below the slab it is in 5E)
      const d = liftDrop(t);
      D.rect(ctx, LIFT[0] - 6, hY(2.7), 6, 2.7 * M, '#9aa3ab'); D.rect(ctx, LIFT[1], hY(2.7), 4, 2.7 * M, '#9aa3ab');
      D.rect(ctx, LIFT[0] - 6, hY(2.7) - 6, LIFT[1] - LIFT[0] + 10, 6, '#7b848c');
      D.rect(ctx, LIFT[0], yF, LIFT[1] - LIFT[0], L.slab, '#3a3f45');
      ctx.save(); ctx.beginPath(); ctx.rect(LIFT[0] - 10, hY(3), LIFT[1] - LIFT[0] + 20, 3 * M + L.slab); ctx.clip();
      D.rect(ctx, LIFT[0], ln.rollTop + d + 9, LIFT[1] - LIFT[0], 8, '#e0a43a', '#9a6b1c', 1);
      TF.rollers.draw(ctx, LIFT[0] + 4, LIFT[1] - 4, ln.rollTop + d, ln.rollTop + d + 9, ln.rollerAng(t, true), lod);
      D.line(ctx, [[LIFT[0] - 3, hY(2.7)], [LIFT[0] - 3, ln.rollTop + d + 9]], '#59626b', 1.5);
      D.line(ctx, [[LIFT[1] + 2, hY(2.7)], [LIFT[1] + 2, ln.rollTop + d + 9]], '#59626b', 1.5);
      ctx.restore();
      if (lod !== 'far') D.text(ctx, 'L65', (LIFT[0] + LIFT[1]) / 2, hY(2.7) - 14, 10, '#7b848c');
      // oven exhaust: stack up to 4.6 m, across to the air-handling unit (fan faster while baking), AHU out to the ceiling
      const ahuSpin = K.spin(t, 12, 0.3, 2.5, [[0.3, 4.9]]);
      D.rect(ctx, OV[0] + 54, hY(4.72), 12, hY(OV[2] + 0.6) - hY(4.72), '#dfe4e8', '#9aa3ab', 1);
      D.rect(ctx, OV[0] + 54, hY(4.72), 3505 - OV[0] - 54, 12, '#dfe4e8', '#9aa3ab', 1);
      if (lod !== 'far') D.fan(ctx, OV[0] + 60, hY(3.7), 10, ahuSpin);
      D.rect(ctx, 3505, hY(4.95), 62, 0.7 * M, '#d5dade', '#7b848c', 1.2);
      D.rect(ctx, 3527, L.ceilY(6), 16, hY(4.95) - L.ceilY(6), '#dfe4e8', '#9aa3ab', 1);
      if (lod !== 'far') { D.fan(ctx, 3536, hY(4.6), 11, ahuSpin + 0.7); for (let k = 0; k < 4; k++) D.line(ctx, [[3552, hY(4.88) + k * 7], [3563, hY(4.88) + k * 7]], '#9aa3ab', 1); }
      // oven temperature screen: curve over the last 12 s + bar (rises during the bake)
      if (lod !== 'far') D.screen(ctx, 3392, hY(2.95), 40, 17, (x, y, w, hh) => {
        ctx.beginPath(); for (let i = 0; i <= 40; i++) { const v = heat(t - 12 + i * 0.3); const yy = y + hh - 2 - v * (hh - 5); i ? ctx.lineTo(x + i, yy) : ctx.moveTo(x, yy); }
        ctx.strokeStyle = '#fb923c'; ctx.lineWidth = 0.9; ctx.stroke(); });
      { const u = TF.mod(t, 12), moving = u < 0.4 || (u >= 9.4 && u < 12.4);
        K.beacon(ctx, LIFT[0] - 3, hY(2.7) - 10, t, moving);
        if (shutterE(t) > 0.2) K.wisp(ctx, OV[1] - 4, hY(2.0), t, 2, lod, 0.2 * shutterE(t), '#eadfd8', 30); }
      K.cabinet(ctx, 3690, CAT - 20, 18, 20, t, 13, lod);
      // maintenance catwalk over the L65 hoist (wave-peek hatch), hung from the ceiling, ladder at the east wall
      D.rect(ctx, 3470, CAT, 270, 5, '#9aa3ac', '#6d757d', 1);
      D.line(ctx, [[3470, CAT - 22], [3740, CAT - 22]], '#9aa3ac', 1.5);
      for (let x = 3472; x <= 3740; x += 24) D.line(ctx, [[x, CAT - 22], [x, CAT]], '#b9c0c7', 1);
      for (const x of [3480, 3730]) D.line(ctx, [[x, CAT], [x, L.ceilY(6)]], '#9aa3ab', 1.5);
      K.ladder(ctx, 3736, yF, 3.3);
      // L65 drive on the catwalk: motor + chain drum turning while the table moves, hydraulic accumulator with gauge,
      // cable tray along the upper wall with service cables
      { const d = liftDrop(t), mv = Math.abs(liftDrop(t + 0.05) - liftDrop(t - 0.05)) > 0.5;
        D.rect(ctx, 3672, CAT - 22, 26, 22, '#8a96a3', '#5d656d', 1); D.circle(ctx, 3708, CAT - 12, 9, '#c9d0d6', '#5d656d', 1);
        if (lod !== 'far') { const a = d / 9; D.line(ctx, [[3708 + Math.cos(a) * 8, CAT - 12 + Math.sin(a) * 8], [3708 - Math.cos(a) * 8, CAT - 12 - Math.sin(a) * 8]], '#5d656d', 1.2); }
        D.line(ctx, [[3716, CAT - 12], [3716, hY(2.7) - 6]], '#4a5056', 1.6, lod === 'near' ? [3, 2] : null);
        D.rect(ctx, 3636, CAT - 30, 16, 30, '#cfd5db', '#7b848c', 1); D.circle(ctx, 3644, CAT - 30, 8, '#cfd5db', '#7b848c', 1);
        K.gauge(ctx, 3644, CAT - 16, 5, mv ? 0.75 : 0.35, lod);
        D.rect(ctx, 3626, hY(4.22), 110, 5, '#9aa3ab', '#6d757d', 0.8);
        if (lod !== 'far') for (let k = 0; k < 3; k++) K.cable(ctx, [3634 + k * 34, hY(4.22) + 5], [3664 + k * 34, hY(4.22) + 5], t, [6, 8, 12][k], 6 + k, 1.2, '#3f4851', 1); }
      // QC screen on the lift post: scan progress, green lamp when the car passes
      if (lod !== 'far') D.screen(ctx, 3440, hY(2.45), 26, 14, (x, y, w, hh) => {
        const u = TF.mod(t, 12); D.rect(ctx, x + 2, y + hh - 5, (w - 4) * TF.lin(u, 8.3, 9.3) * (u < 10.9 ? 1 : 0), 3, '#60a5fa');
        D.circle(ctx, x + w / 2, y + 5, 3, u >= 9.3 && u < 10.9 ? '#4ade80' : '#334155'); });
      if (theme.decor.garland) theme.decor.garland(ctx, room.inner.x, room.inner.x + room.inner.w, room.inner.y, t, lod);
    },
    draw() {},
    front(ctx, t, theme, lod) {
      const h = heat(t);
      // oven front window (glass with bake glow) + west shutter
      ctx.globalAlpha = 0.1 + 0.3 * h; D.rect(ctx, OV[0] + 6, hY(OV[2] - 0.15), 3500 - OV[0] - 6, (OV[2] - 0.3) * M, '#ff7a2a'); ctx.globalAlpha = 1;
      D.rect(ctx, OV[0] + 6, hY(OV[2] - 0.15), 3500 - OV[0] - 6, (OV[2] - 0.3) * M, null, '#8b6b5c', 2);
      shutter(ctx, OV[0] + 2, shutterW(t));
      if (lod === 'near') { D.circle(ctx, OV[0] + 30, hY(OV[2]) - 4, 3, h > 0.5 ? '#ff5a1f' : '#6b4a3a'); }
      // high window in the east wall (the drone peeks in here)
      D.rect(ctx, 3741, hY(4.6), 18, 0.9 * M, '#dbeefc', '#7b848c', 1.2); D.line(ctx, [[3750, hY(4.6)], [3750, hY(3.7)]], '#7b848c', 1);
      if (lod === 'far') return;
      // QC Optimus + scanner beam / polishing cloth
      D.rect(ctx, 3489, hY(1.55), 9, 12, '#d5dade', '#5d656d', 0.6); D.circle(ctx, 3493.5, hY(1.45), 2, TF.mod(t, 12) >= 9.6 && TF.mod(t, 12) < 10.9 ? '#4ade80' : '#7b848c');   // confirm button on the post
      const st = qc(t), fig = A.draw(ctx, st, yF), w = fig.w(fig.sk.wristN), u = TF.mod(t, 12);
      if (u >= 7.2 && u < 8.1) D.rect(ctx, w[0] - 3, w[1] - 3, 7, 6, '#3b82f6');
      if (u >= 8.1 && u < 9.6) {
        D.rect(ctx, w[0] - 2, w[1] - 5, 9, 6, '#334155', '#111827', 0.6);
        if (u >= 8.3 && u < 9.3) { const tx = ln.S[5] + (-2.3 + 4.6 * TF.lin(u, 8.3, 9.3)) * M, ty = hY(1.0 + 0.15 * Math.sin(u * 9));
          ctx.globalAlpha = 0.5; D.line(ctx, [[w[0] + 7, w[1] - 2], [tx, ty]], '#4ade80', 1.4); ctx.globalAlpha = 1; D.circle(ctx, tx, ty, 2.2, '#4ade80'); }
      }
    },
  });
  TF.peek({ id: 'drone6E', owner: '6E', kind: 'drone', P: 79, offset: 41, dur: 6, x: 3778, y: hY(4.15), face: 1 });
  TF.peek({ id: 'wave6E', owner: '6E', kind: 'wave', P: 83, offset: 23, dur: 5.5, x: 3600, y: CAT, face: -1 });
  TF.debug6E = { qc, liftDrop, heat };
})(typeof window !== 'undefined' ? window : globalThis);
