// Floor 3 — cells, packs, wheels (FACTORY-MAP §2 floor 3). Cells run E -> W: 3E coats the electrode web (powder +
// foil from the DOCK basket) and doffs a roll every 24 s, 3D winds + cans cells onto the belt slot D3DC, 3C charges
// them in racks: ONE Optimus (§10) carries the fresh box up the ladder to the top rack, loads charged cells into the
// cart and pushes it through D3CB to 3B; 3B fills pack trays and sends car/Semi packs into the PB paternoster and
// Optimus packs up the F3R basket. 3A presses + balances wheels; ONE ledge Optimus loads the wheel totes into the basket.
(function (G) {
  const TF = G.TF, TF3 = G.TF3, RG = TF3.rig, C = TF3.clips, L = TF.layout, D = TF.draw, K = TF.kit, A = TF.act, M = TF.M, X = TF.mx, S = TF.supply, IT = S.items, R = TF.R;
  const F = 3, yF = L.floorY(F), hY = (m) => yF - m * M, ceil = L.ceilY(F);
  const s24 = (t) => TF.mod(t, 24);
  const cell = (ctx, x, y, lit) => { D.rect(ctx, x - 2.5, y - 7, 5, 7, '#9aa1a8', '#4a5056', 0.5); if (lit !== undefined) D.rect(ctx, x - 1.5, y - 6, 3, 2, lit ? '#4ade80' : '#334155'); };
  const BELT_Y = hY(1.0);

  // ================= 3E electrode coating =================
  TF.room({ id: '3E', period: 24, box: L.roomById('3E').box,
    ports: { D3DE: 'out', F3R: 'both' },
    actors: ['3E.coater', 'peek.hardhat3E'],
    flows: [{ item: 'powder + foil (basket)', from: 'DOCK', via: ['W3-3', 'F3R'], to: '3E', sink: 'coated web' },
      { item: 'electrode roll', from: '3E', via: ['D3DE'], to: '3D', sink: 'wound into cells' }],
    back(ctx, t, theme, lod) {
      const s = s24(t), ph = t * Math.PI * 10;
      X.upper(ctx, yF, ceil, t, lod, { duct: [3290, 3740, 4.2], fans: [3330, 3700], pipes: [3290, 3480, 3.5], valves: [3360], lamps: [3380, 3650] });
      // powder hopper (refilled when the basket stops), coater head, dryer tunnel, foil unwind + rewind rolls
      // R3-core-f1238: the basket sets the bags on a shelf (1.0 m); a bag hoist slides them east, lifts them past the head and tips them over the hopper mouth (0.0-2.3 s after the set-down);
      // the hopper level rises as they go in (hidden behind the hopper's front)
      const pw = R.powder.window(0, 0), TA = TF.mod(pw[0] + 1.1, 24), hs = TF.mod(s - TA, 24), fill = TF.mod(s - (TA + 2.4), 24);
      const lv = fill < 0.4 ? 0.2 + 0.7 * TF.ramp(fill, 0, 0.4) : 0.9 - 0.7 * (fill - 0.4) / 23.6;
      D.rect(ctx, 3548, hY(1.0), 72, 3, '#9aa3ab', '#6d757d', 0.6); for (const x of [3552, 3614]) D.rect(ctx, x, hY(1.0) + 3, 3, 1.0 * M - 3, '#8a939b');
      D.rect(ctx, 3626, hY(3.1), 4, 3.1 * M, '#8a939b'); D.rect(ctx, 3560, hY(3.1), 70, 3, '#8a939b');   // hoist mast + top rail
      if (lod !== 'far' && hs < 2.3) for (let j = 0; j < 2; j++) { const ox = (j - 0.5) * 9, e1 = TF.ramp(hs, 0, 0.6), e2 = TF.ramp(hs, 0.6, 1.4), e3 = TF.ramp(hs, 1.4, 1.9), e4 = TF.ramp(hs, 1.9, 2.3);
        IT.powder(ctx, hs < 0.6 ? TF.lerp(3560 + ox, 3612 + ox, e1) : hs < 1.4 ? 3612 + ox : hs < 1.9 ? TF.lerp(3612 + ox, 3565 + ox, e3) : 3565 + ox,
          hs < 0.6 ? hY(1.0) + 1 : hs < 1.4 ? TF.lerp(hY(1.0) + 1, hY(2.8), e2) : hs < 1.9 ? hY(2.8) : TF.lerp(hY(2.8), hY(2.6) + 10, e4)); }
      D.poly(ctx, [[3540, hY(2.6)], [3590, hY(2.6)], [3575, hY(1.9)], [3555, hY(1.9)]], '#dfe4e8', '#7b848c', 1);
      D.poly(ctx, [[3545, hY(1.9 + 0.7 * lv)], [3585, hY(1.9 + 0.7 * lv)], [3575, hY(1.9)], [3555, hY(1.9)]], '#c08457');
      D.rect(ctx, 3550, hY(1.9), 30, 0.5 * M, '#5f6b77', '#3f4851', 1);
      D.rect(ctx, 3380, hY(1.75), 150, 0.6 * M, '#efe6df', '#8b6b5c', 1.2);
      if (lod !== 'far') { ctx.globalAlpha = 0.25 + 0.1 * Math.sin(t * Math.PI); D.rect(ctx, 3384, hY(1.7), 142, 0.5 * M, '#ff9a4a'); ctx.globalAlpha = 1; }
      const unR = 0.55 - 0.3 * s / 24, reR = 0.15 + 0.35 * TF.clamp(s / 22, 0, 1);
      D.circle(ctx, 3680, hY(1.3), unR * M, '#d1d5db', '#6b737b', 1); D.circle(ctx, 3680, hY(1.3), 4, '#4a5056');
      D.line(ctx, [[3680, hY(1.3) + unR * M], [3550, hY(1.45)], [3380, hY(1.45)], [3330, hY(1.3) + reR * M]], '#7c5a3a', 2);
      if (s < 22) { D.circle(ctx, 3330, hY(1.3), reR * M, '#6b4a2a', '#3d2a1a', 1); D.circle(ctx, 3330, hY(1.3), 4, '#4a5056'); }
      if (lod !== 'far') for (const [x, r] of [[3680, unR], [3330, reR]]) D.line(ctx, [[x, hY(1.3)], [x + Math.cos(ph / 10) * r * M, hY(1.3) + Math.sin(ph / 10) * r * M]], '#e5e7eb', 0.8);
      // doffed roll rolls on its cart through D3DE to the 3D winder (22 .. 24)
      if (s >= 22) { const x = TF.lerp(3330, 3220, TF.ramp(s, 22, 24)); D.circle(ctx, x, hY(1.3), 0.5 * M, '#6b4a2a', '#3d2a1a', 1); D.rect(ctx, x - 20, hY(0.75), 40, 0.75 * M, '#9aa3ab', '#6d757d', 0.8); }
      K.cabinet(ctx, 3720, yF - 48, 18, 48, t, 41, lod);
      D.rect(ctx, 3455, hY(3.5) - 9, 24, 6, '#9aa3ab');
    },
    draw() {}, front() {} });

  // ================= 3D winding + canning =================
  const cellsOnBelt = (ctx, x0, x1, t, lod) => { if (lod === 'far') return; for (let x = x1 - TF.mod(t * 24, 24); x > x0; x -= 24) cell(ctx, x, BELT_Y); };
  TF.room({ id: '3D', period: 24, box: L.roomById('3D').box,
    ports: { D3DE: 'in', D3CD: 'out', F3R: 'pass' },
    actors: ['3D.winder', '3D.canPress'],
    flows: [{ item: 'electrode roll', from: '3E', via: ['D3DE'], to: '3D', sink: 'jelly rolls' }, { item: '4680 cells (belt)', from: '3D', via: ['D3CD'], to: '3C', sink: 'charged' }],
    back(ctx, t, theme, lod) {
      const s = s24(t);
      X.upper(ctx, yF, ceil, t, lod, { duct: [2810, 3260, 3.9], fans: [3200], tray: [2810, 3060, 3.3], lamps: [2900, 3150] });
      // roll feeding the winder (big at 0, used up by 22 when the next roll arrives), winding mandrel spinning
      const rr = 0.5 - 0.35 * TF.clamp(s / 22, 0, 1), a = t * Math.PI * 4;
      D.circle(ctx, 3200, hY(1.3), rr * M, '#6b4a2a', '#3d2a1a', 1);
      D.line(ctx, [[3200, hY(1.3) - rr * M], [3080, hY(1.4)]], '#7c5a3a', 1.5);
      D.rect(ctx, 3040, hY(1.9), 70, 1.1 * M, '#d5dade', '#7b848c', 1);
      D.circle(ctx, 3075, hY(1.4), 10, '#9aa1a8', '#4a5056', 1); if (lod !== 'far') D.line(ctx, [[3075, hY(1.4)], [3075 + Math.cos(a) * 9, hY(1.4) + Math.sin(a) * 9]], '#e5e7eb', 1);
      X.press(ctx, 2960, yF, 0.9, 1.9, TF.pulse(TF.mod(t, 1), 0.2, 0.8, 0.2), lod);
      X.belt(ctx, 2800, 3040, yF, 1.0, -t * 24, lod);
      cellsOnBelt(ctx, 2800, 3000, t, lod);
      K.cabinet(ctx, 3230, yF - 46, 18, 46, t, 43, lod);
    },
    draw() {}, front() {} });

  // ================= 3C charging: ONE Optimus (ladder + cell cart, cut jobs #3 + #8) =================
  const LAD = 2600, OX = LAD + 0.17 * M, BOXP = 2720, HOFF = 0.45 * M + 24, RX0 = 2700, CART0 = RX0 - HOFF, CART1 = 2215, RX1 = CART1 + HOFF, PUSH0 = 15.4;   // HOFF: robot x minus cart x while hands are on the handle (robot east of cart, always facing west)
  const climb = C.climb(0.17, 0.3);
  const onL = (k, ph) => { const p = climb.sample(Math.min(ph, 0.99999)); p.props = {}; return { p, ay: k * 0.6 + p.advanceY }; };
  const ladSeg = (d, fn) => ({ d, f: (u) => { const r = fn(u); return { x: OX, face: -1, pose: r.p, ay: r.ay }; } });
  const push = (pose) => RG.layer(pose, { handN: [0.45, 0.95], handF: [0.42, 0.95], gripN: 0.9, gripF: 0.9, lean: 0.12 }, ['handN', 'handF', 'gripN', 'gripF', 'lean']);
  const box = A.reach([0.32, 1.05], [0.18, 1.08], { gripN: 0.9, gripF: 0.9 });
  // gag-cycle slide + feast window (see feastDraw); WIN0 = s24 at which the feast window starts
  const WIN0 = 9.6, FX = OX;
  const rc = (hN, hF, lean, o) => A.reach(hN, hF, Object.assign({ lean: lean === undefined ? 0.2 : lean, gripN: 0.9, gripF: 0.9 }, o || {}));
  const FW = [[0.2, A.stand()], [0.4, rc([0.5, 1.32], null)], [0.55, rc([0.5, 1.28], null)],             // N hand to the crate lid, grab
    [0.7, rc([0.88, 1.38], [0.24, 1.12], 0.3)], [0.9, rc([0.88, 1.38], [0.24, 1.12], 0.3)],              // tip bolts in, drop AAs; F hand to oil can
    [1.05, rc([0.86, 1.3], [0.86, 1.4], 0.32, { angF: 0.9 })], [1.2, rc([0.88, 1.28], [0.88, 1.4], 0.32, { angF: 0.9 })], // oil drip over the pan
    [1.5, rc([0.3, 1.55], [0.24, 1.12], 0.1)], [1.8, rc([0.88, 1.28], null, 0.25)],                        // bite 1 (can set down)
    [2.1, rc([0.3, 1.55], null, 0.1)], [2.4, rc([0.88, 1.28], null, 0.25)], [2.7, rc([0.3, 1.55], null, 0.1)],   // bites 2, 3
    [3.0, rc([0.12, 0.95], [0.45, 1.32], 0.12)], [3.15, rc([0.16, 0.99], [0.45, 1.25], 0.12)],              // pat tummy, F hand closes lid
    [3.3, rc([0.12, 0.95], [0.45, 1.2], 0.12)], [3.45, rc([0.16, 0.99], [0.45, 1.2], 0.12)], [3.6, rc([0.12, 0.95], [0.45, 1.2], 0.12)]];
  const mkOpt = (gag) => {
    const segs = [A.keyed(1.0, 2700, 1, [[0, A.stand()], [0.5, A.reach([0.4, 1.0], [0.25, 1.0], { lean: 0.2, gripN: 0.9, gripF: 0.9 })], [1, box]]),   // 0 box of fresh cells off the belt end
      A.turn(0.3, 2700, 1, () => box), A.walk(0.9, 2700, OX, { step: 0.4, carry: [0.32, 1.05], carryW: 0.25 }),
      ladSeg(0.4, (u) => ({ p: RG.blend(box, onL(0, 0).p, u), ay: 0 })),
      ladSeg(4.8, (u) => { const q = u * 2, k = Math.min(1, Math.floor(q)); return onL(k, q - k); }),                     // 2.6 .. 7.4 up
      ladSeg(1.0, (u) => { const top = onL(1, 1), p = JSON.parse(JSON.stringify(top.p)); p.handN = [0.22, 1.25 + 0.05 * Math.sin(u * 6)]; p.gripN = u < 0.5 ? 1 : 0; return { p, ay: top.ay }; })];
    if (!gag) segs.push(ladSeg(4.8, (u) => { const q = 2 - u * 2, k = Math.min(1, Math.floor(q)); return onL(k, q - k); }),                 // 8.4 .. 13.2 down
      ladSeg(0.4, (u) => ({ p: RG.blend(onL(0, 0).p, A.stand(), u), ay: 0 })),
      A.walk(0.5, OX, RX0, { step: 0.4 }));
    else segs.push(ladSeg(1.2, (u) => { const top = onL(1, 1); return { p: rc([0.17, 1.25], [0.17, 1.12], 0.02, { gripN: 1, gripF: 1 }), ay: top.ay * (1 - Math.pow(u, 1.6)) }; }),   // 8.4 .. 9.6 slide down the rails
      A.turn(0.2, FX, -1),                                                                                    // 9.6 .. 9.8 face the shelf
      A.keyed(3.4, FX, 1, FW.map(([w, p]) => [(w - 0.2) / 3.4, p])),                                          // 9.8 .. 13.2 feast
      A.walk(0.9, FX, RX0, { step: 0.4 }));                                                            // 13.2 .. 14.1 (normal walk ends 14.1)
    segs.push(A.keyed(1.0, RX0, -1, [[0, A.stand()], [0.5, A.reach([0.8, 0.55], null, { lean: 0.45, hipY: 0.8, gripN: 0.9 })], [1, A.stand()]]),   // charged cells into the cart
      A.hold(0.3, RX0, -1, () => A.stand()),
      ((w) => ({ d: w.d, f: (u, tl) => { const st = w.f(u, tl); st.pose = push(st.pose); return st; } }))(A.walk(3.6, RX0, RX1, { step: 0.55 })),   // push the cart through D3CB
      A.keyed(1.0, RX1, -1, [[0, push(A.stand())], [0.5, A.reach([0.85, 0.7], null, { lean: 0.35, gripN: 0.9 })], [1, A.stand()]]),          // unload into the pack builder
      A.hold(0.3, RX1, -1, () => push(A.stand())));
    segs.push(((w) => ({ d: w.d, f: (u, tl) => { const st = w.f(1 - u, w.d * (1 - u)); st.pose = push(st.pose); return st; } }))(A.walk(24 - A.total(segs) - 0.3, RX0, RX1, { step: 0.6 })));   // pull the cart back east: west-walk played in reverse, still facing the handle
    segs.push(A.turn(0.3, 2700, -1));
    return segs; };
  const SEGS = [mkOpt(false), mkOpt(true)];
  // variant chosen per 24 s robot cycle (gag active when this cycle's feast window starts) so it never switches mid-cycle
  const feastCycle = (t) => TF.gagActive(feast, t - s24(t) + WIN0);
  const opt3 = (t) => { const st = A.run(SEGS[feastCycle(t) ? 1 : 0], s24(t)); st.ay = st.ay || 0; return st; };
  // Robot-feast gag (P 48 (R3-retime), one cycle, offset 8 so the whole 9.6-13.2 s window of robot cycle 0 lies inside it): wall shelf east of the ladder
  // (snack crate, oil can, hot-plate + pan, all within arm reach of opt3 standing at the ladder foot facing east). The robot cooks and eats;
  // nothing moves by itself. Outside the gag: crate closed, pan empty, plate cold.
  const feast = TF.gagHook({ id: 'feast', P: 48, offset: 8, cycles: 1, room: '3C', trigger: 'the charge Optimus slides down the ladder, tips bolts + AA batteries + oil into a pan on a hot-plate, eats it in 3 bites, pats its tummy and shuts the crate' });
  const SH = hY(1.0), PAN = [2654, SH - 9], CAN = [2620.5, SH - 5], CRATE = [2633, SH - 6];
  const feastDraw = (ctx, t, theme, lod) => {
    const on = feastCycle(t), w = on ? s24(t) - WIN0 : -1, inW = w >= 0 && w <= 3.6, W = inW ? w : -1;
    const open = inW ? TF.ramp(W, 0.2, 0.45) - TF.ramp(W, 3.1, 3.5) : 0, gl = inW ? TF.ramp(W, 0.6, 1.0) * (1 - TF.ramp(W, 3.0, 3.6)) : 0;
    let k = 0;
    if (inW) { k = 0.5 * TF.ramp(W, 0.65, 0.75) + 0.3 * TF.ramp(W, 0.9, 1.0) + 0.2 * TF.ramp(W, 1.05, 1.2); for (let i = 0; i < 3; i++) k -= TF.ramp(W, 1.3 + 0.6 * i, 1.5 + 0.6 * i) / 3; k = Math.max(0, k); }
    const st = inW ? opt3(t) : null, hp = (h) => [st.x + st.face * h[0] * M, yF - h[1] * M];
    const hN = inW ? hp(st.pose.handN) : null, hF = inW ? hp(st.pose.handF) : null;
    D.rect(ctx, 2616, SH, 58, 3, '#8a939b', '#4a5056', 0.6); D.poly(ctx, [[2622, SH + 3], [2622, SH + 12], [2632, SH + 3]], '#7b848c'); D.poly(ctx, [[2660, SH + 3], [2660, SH + 12], [2650, SH + 3]], '#7b848c');
    // snack crate (lid hinged on its left edge)
    D.rect(ctx, 2626, SH - 11, 14, 11, '#c99b5f', '#7d5a2c', 0.8);
    ctx.save(); ctx.translate(2626, SH - 11); ctx.rotate(-1.7 * open); D.rect(ctx, 0, -2.5, 14, 2.5, '#b98b52', '#7d5a2c', 0.8); ctx.restore();
    if (open > 0.3) D.rect(ctx, 2628, SH - 11, 10, 2, '#3b2a18');
    const crateFull = inW && W < 0.55 && open > 0.3;
    if (crateFull && lod !== 'far') { TF.themeArt.bolt(ctx, 2630, SH - 13); TF.themeArt.bolt(ctx, 2634, SH - 13); TF.themeArt.battery(ctx, 2637, SH - 13, 0); }
    // oil can (on the shelf unless the F hand holds it)
    const held = inW && W >= 0.9 && W < 1.5, tilt = held ? TF.ramp(W, 0.95, 1.1) * (1 - TF.ramp(W, 1.25, 1.45)) : 0;
    if (lod !== 'far') { ctx.save(); const c = held ? [hF[0], hF[1] + 3] : CAN; ctx.translate(c[0], c[1]); ctx.rotate(0.9 * tilt);
      D.rect(ctx, -3, -4, 6, 8, '#d6453d', '#7f1d1d', 0.6); D.line(ctx, [[3, -3], [8, -6]], '#9ca3af', 1.2); ctx.restore(); }
    // hot-plate + pan
    const hot = (c) => ({ r: Math.round(59 + 196 * c), g: Math.round(59 + 47 * c), b: Math.round(63 - 21 * c) });
    const h = hot(gl);
    D.rect(ctx, 2641, SH - 4, 26, 4, `rgb(${h.r},${h.g},${h.b})`, '#1f2937', 0.8);
    if (gl > 0 && lod !== 'far') { ctx.globalAlpha = 0.3 * gl; D.circle(ctx, 2654, SH - 4, 16, '#ff8a3a'); ctx.globalAlpha = 1; }
    D.poly(ctx, [[2644, SH - 4], [2664, SH - 4], [2662, SH - 9], [2646, SH - 9]], '#4a5056', '#1f2937', 0.8); D.line(ctx, [[2664, SH - 8], [2671, SH - 10]], '#1f2937', 1.5);
    if (lod === 'far' || !inW) return;
    TF.slot(theme, 'feastMain')(ctx, PAN[0], SH - 6, k);
    if (gl > 0.5) K.wisp(ctx, 2654, SH - 12, t, 2, lod, 0.3, '#f3f4f6', 24);
    // N hand carries the bolts + AAs crate -> pan (0.55 .. 0.75), AAs drop in (0.75 .. 0.95)
    if (W >= 0.55 && W < 0.75) { TF.themeArt.bolt(ctx, hN[0], hN[1] - 2); TF.themeArt.bolt(ctx, hN[0] + 3, hN[1] - 3); }
    if (W >= 0.55 && W < 0.75) TF.themeArt.battery(ctx, hN[0] - 3, hN[1] - 3, 0);
    for (let i = 0; i < 2; i++) { const u = (W - 0.75 - 0.1 * i) / 0.15; if (u >= 0 && u <= 1) TF.themeArt.battery(ctx, PAN[0] - 3 + 6 * i, TF.lerp(hN[1], PAN[1] - 4, u), 6 * u); }
    // oil drip from the can spout
    if (W >= 1.0 && W < 1.25) for (let i = 0; i < 2; i++) { const u = TF.mod((W - 1.0) * 5 + i * 0.5, 1); D.circle(ctx, PAN[0] + 2, TF.lerp(hF[1] + 2, PAN[1] - 3, u), 1.2, '#a16207'); }
    // bites: a morsel rides the N hand pan -> visor, crunch lines on arrival
    for (let i = 0; i < 3; i++) { const a = 1.2 + 0.6 * i;
      if (W >= a + 0.05 && W < a + 0.3) D.circle(ctx, hN[0], hN[1] - 1, 1.6, '#6b7280');
      if (W >= a + 0.3 && W < a + 0.55) for (const d of [-1, 0, 1]) D.line(ctx, [[hN[0] + 4, hN[1] - 8 + d * 4], [hN[0] + 9, hN[1] - 8 + d * 6]], '#374151', 0.8); }
  };
  const cartX = (t) => { const s = s24(t); return s < PUSH0 ? CART0 : Math.min(CART0, Math.max(CART1, opt3(t).x - HOFF)); };   // cart follows the robot's hands (push west, pull east); parked otherwise
  // top charge rack = box slot conveyor: 8 slots, one-slot shift (east -> west) during s 23..24; box placed at 7.9; drone takes the west-end box at 17.5
  const SLX = (i) => 2355 + 33 * i, RY = hY(2.4), DRX = SLX(0), DYD = RY - 38, DYU = ceil - 48;
  const crate = (ctx, x, y) => D.rect(ctx, x - 8, y - 10, 16, 10, '#c99b5f', '#7d5a2c', 0.6);
  const rackBoxes = (ctx, s, lod) => {
    const sh = TF.ramp(s, 23, 24), ph = 33 * sh;
    D.rect(ctx, 2580, RY, 14, 3, '#8a939b');
    if (lod !== 'far') for (let i = 0; i < 8; i++) { const x = SLX(i) + 16 - ph; if (x > 2340 && x < 2594) { D.circle(ctx, x, RY + 7, 3, '#6d757d', '#4a5056', 0.6); D.line(ctx, [[x, RY + 7], [x + Math.cos(ph / 3) * 2.5, RY + 7 + Math.sin(ph / 3) * 2.5]], '#e5e7eb', 0.8); } }
    if (lod !== 'far') D.line(ctx, [[2340, RY + 11], [2594, RY + 11]], '#59626b', 1, [3, 3]);
    for (let i = 0; i < 8; i++) { if (i === 7 ? s < 7.9 : (i === 0 && s >= 17.5)) continue; crate(ctx, SLX(i) - (i > 0 ? ph : 0), RY); }
  };
  const droneDraw = (ctx, s, lod) => {
    const open = TF.ramp(s, 13, 14) - TF.ramp(s, 20.5, 21.5), lw = 30 * (1 - open);
    D.rect(ctx, DRX - 30, ceil - 2, lw, 5, '#8a939b', '#4a5056', 0.6); D.rect(ctx, DRX + 30 - lw, ceil - 2, lw, 5, '#8a939b', '#4a5056', 0.6);   // ceiling hatch doors
    if (s < 14 || s > 20.5) return;
    const ez = (a, b) => { const k = TF.ramp(s, a, b); return k * k * (3 - 2 * k); };
    const y = s < 17.5 ? TF.lerp(DYU, DYD, ez(14, 17)) : TF.lerp(DYD, DYU, ez(17.5, 20.5));
    ctx.save(); ctx.beginPath(); ctx.rect(DRX - 60, ceil, 120, 600); ctx.clip();                  // flies up through the hatch and is hidden by the ceiling slab
    TF.basket.draw(ctx, DRX, y, 0, lod, s >= 17.5 ? (c, x, b) => crate(c, x, b) : null);
    ctx.restore();
  };
  TF.room({ id: '3C', period: 24, box: L.roomById('3C').box,
    ports: { D3CD: 'in', D3BC: 'out', F3R: 'pass' },
    actors: ['3C.chargeOptimus', '3C.racks', 'peek.shiba3C'],
    flows: [{ item: 'cells (belt)', from: '3D', via: ['D3CD'], to: '3C', sink: 'charged' }, { item: 'charged cells (cart)', from: '3C', via: ['D3BC'], to: '3B', sink: 'packs' }],
    back(ctx, t, theme, lod) {
      const s = s24(t);
      X.upper(ctx, yF, ceil, t, lod, { duct: [2330, 2560, 3.9], fans: [2380], pipes: [2640, 2780, 3.6], valves: [2700], lamps: [2420, 2700] });
      D.rect(ctx, 2478, hY(4.55), 10, hY(3.92) - 7 - hY(4.55), '#e3e7eb', '#9aa3ab', 0.8);
      D.rect(ctx, 2470, hY(3.92) - 7, 26, 9, '#c9d0d6', '#7b848c', 1);                         // vent box (Shiba peek)
      X.belt(ctx, 2700, 2790, yF, 1.0, -t * 24, lod); cellsOnBelt(ctx, 2700, 2790, t, lod);
      // charge racks: 4 levels x 8 slots, the charge lights fill level by level over the 24 s loop
      for (let lv = 0; lv < 4; lv++) { const y = hY(0.6 + lv * 0.6); D.rect(ctx, 2340, y, 240, 3, '#8a939b');
        if (lod !== 'far' && lv < 3) for (let i = 0; i < 8; i++) cell(ctx, 2355 + i * 29, y, TF.mod(s / 24 + lv * 0.25 + i / 32, 1) > 0.5); }
      for (const x of [2340, 2577]) D.rect(ctx, x, hY(2.4), 3, 2.4 * M, '#8a939b');
      rackBoxes(ctx, s, lod);
      K.ladder(ctx, LAD, yF, 2.4);
      K.cabinet(ctx, 2740, yF - 46, 18, 46, t, 45, lod);
      feastDraw(ctx, t, theme, lod);
      droneDraw(ctx, s, lod);
    },
    draw() {},
    front(ctx, t, theme, lod) {
      const s = s24(t), cx = cartX(t);
      D.rect(ctx, cx - 22, hY(0.5), 44, 6, '#5b8fc9', '#2d4f75', 0.8); D.line(ctx, [[cx + 22, hY(0.45)], [cx + 24, hY(1.0)]], '#4a5560', 1.5);
      for (const w of [cx - 15, cx + 15]) D.circle(ctx, w, yF - 4, 4, '#2a2c2f');
      if (lod !== 'far' && s >= 14.6 && s < 19.5) for (let i = 0; i < 6; i++) cell(ctx, cx - 15 + i * 6, hY(0.5), true);
      if (lod === 'far') return;
      const st = opt3(t), fig = A.draw(ctx, st, yF - st.ay * M);
      if (s < 7.9 && s >= 0.5) { const w = fig.w(fig.sk.wristN), k = TF.ramp(s, 7.4, 7.9); crate(ctx, TF.lerp(w[0], SLX(7), k), TF.lerp(w[1] + 8, RY, k)); }   // hand -> top rack slot 7
    } });

  // ================= 3B pack builder -> PB (car + Semi packs) and F3R basket (Optimus packs) =================
  TF.room({ id: '3B', period: 24, box: L.roomById('3B').box,
    ports: { D3AB: 'pass', D3BC: 'in', PB: 'out', F3R: 'both', 'W3-3': 'pass' },
    actors: ['3B.packBuilder', '3B.loaderArm'],
    flows: [{ item: 'charged cells (cart)', from: '3C', via: ['D3BC'], to: '3B', sink: 'packs' },
      { item: 'car + Semi packs', from: '3B', via: ['PB'], to: '5B', sink: 'in the cars (5B, 4B, 2B)' },
      { item: 'Optimus packs (basket)', from: '3B', via: ['F3R', 'W3-3', 'W3-7', 'F7R'], to: '7C', sink: 'in the robots' }],
    back(ctx, t, theme, lod) {
      const s = s24(t);
      X.upper(ctx, yF, ceil, t, lod, { duct: [1960, 2120, 4.0], fans: [2000], pipes: [2180, 2300, 3.4], valves: [2240], lamps: [2000, 2250] });
      // drum filler + tray filling + lid press, out-table to the PB stop
      D.circle(ctx, 2080, hY(1.4), 0.45 * M, '#d5dade', '#7b848c', 1.2);
      if (lod !== 'far') for (let k = 0; k < 8; k++) { const a = t * Math.PI / 2 + k * Math.PI / 4; cell(ctx, 2080 + Math.cos(a) * 16, hY(1.4) + Math.sin(a) * 16 + 3); }
      D.rect(ctx, 1908, hY(0.9) + 5, 4, yF - (hY(0.9) + 5), '#6d757d');
      D.rect(ctx, 2028, hY(0.9) + 5, 4, yF - (hY(0.9) + 5), '#6d757d');
      D.rect(ctx, 1900, hY(0.9), 140, 5, '#9aa3ab', '#6d757d', 0.8);
      for (const k in TF.PB.trips) { const p = TF.PB.trips[k], u = TF.mod(s - p.tb + 3.2, 24);
        if (u < 3.2) { const x = u < 2.7 ? TF.lerp(2010, 1905, TF.ramp(u, 0.2, 2.6)) : TF.lerp(1905, TF.PB.XU + (p.down ? 30 : 0), TF.ramp(u, 2.7, 3.2)), w = TF.PB.w(p), th = TF.PB.th(p);
          const yy = u < 2.7 ? hY(0.9) - th : TF.lerp(hY(0.9) - th, yF - TF.PB.rise() - th, TF.ramp(u, 2.7, 3.2));
          D.rect(ctx, x - w / 2, yy, w, th, '#2a2e33', '#111', 0.6); } }
      X.press(ctx, 2010, yF, 0.8, 1.7, TF.pulse(TF.mod(t, 4.8), 0.4, 1.6, 0.3), lod);
      K.cabinet(ctx, 2270, yF - 46, 18, 46, t, 47, lod);
    },
    draw() {},
    front(ctx, t, theme, lod) {
      if (lod === 'far') return;
      // loader arm lifts Optimus packs from staging stand into the F3R basket while it loads at its base (2150, s24 = 8.6)
      const home = TF.mod(R.optPacks.dep - 2.0, 24), u = TF.mod(s24(t) - home, 24), k = TF.pulse(u, 0, 2.6, 0.8);
      const tip = [TF.lerp(2210, 2150, k), TF.lerp(hY(1.0), hY(3.3), k)];
      D.rect(ctx, 2198, hY(1.0) + 4, 24, 4, '#9aa3ab'); D.rect(ctx, 2208, hY(1.0) + 8, 4, 1.0 * M - 8, '#8a939b');
      if (u >= 2.6) IT.pack(ctx, 2210, hY(1.0) + 4);
      K.arm(ctx, [2215, yF], tip, { l1: 45, l2: 42, toolAng: Math.PI / 2, bend: 1, tool: 6 });
      if (u < 1.6) IT.pack(ctx, tip[0], tip[1] + 8);
    } });

  // ================= 3A wheel shop: ONE ledge Optimus loads the totes (cut job #12) =================
  const LEDGE = [1470, 1600, 2.4], OL = 1535;
  // R3-10 tyre station (24 s): hook hoist rack -> belt (press pulse) -> balancer -> tote lift -> ledge Optimus -> staging table -> F3R basket.
  // v = s24 - S0 (S0 = basket tyres landed on the rack table). Hook: 4 refill steps (1.2 s) then 4 picks (4.8 s); tyre n reaches the lift at PH + 4.8 n.
  const RT = IT.R_TIRE, HB = 4.8, RAIL = ceil + 14, YTOP = RAIL + 22;
  const S0 = TF.mod(R.tires.window(0, 0)[0] + 1.1, 24), PH = TF.mod(S0 + HB + 9.6, 24);
  const QX = 1395, QY = hY(1.0) + 1, QOFF = [-9, 0, 9, 18];
  const RXC = [0, 1].map((c) => 1328 + 19.5 + c * (1.72 * M - 12) * 47 / 74);
  const SLOT = [[RXC[0], hY(0.8) + 2], [RXC[0], hY(1.6) + 2], [RXC[0], hY(2.4) + 2], [RXC[1], hY(2.4) + 2]];   // refill order; picks go top first
  const DROPX = 1440, BEND = 1640, BV = 50, BAL = [1670, hY(1.25)], PLX = 1612, BELTC = hY(0.7) - RT, PLAT = yF - 2;
  const STG = [0, 1, 2, 3].map((j) => 1500 + (j - 1.5) * RT * 1.1), hkY = (bottom) => bottom - 2 * RT - 3;
  const kf = (v, ks) => { for (let i = 1; i < ks.length; i++) if (v <= ks[i][0]) { const a = ks[i - 1], b = ks[i], e = TF.ramp(v, a[0], b[0]); return [TF.lerp(a[1], b[1], e), TF.lerp(a[2], b[2], e)]; } const l = ks[ks.length - 1]; return [l[1], l[2]]; };
  const hoist = (v) => {
    if (v < 4.8) { const r = Math.floor(v / 1.2), w = v - 1.2 * r, qx = QX + QOFF[r], sl = SLOT[r], nx = r < 3 ? QX + QOFF[r + 1] : RXC[1];
      return { p: kf(w, [[0, qx, YTOP], [0.3, qx, hkY(QY)], [0.6, qx, YTOP], [1.0, sl[0], hkY(sl[1])], [1.2, nx, YTOP]]), held: w > 0.3 && w < 1.0 }; }
    const w0 = v - 4.8, n = Math.min(3, Math.floor(w0 / HB)), w = w0 - HB * n, sl = SLOT[3 - n], nx = n < 3 ? SLOT[2 - n][0] : QX + QOFF[0];
    return { p: kf(w, [[0, sl[0], YTOP], [0.9, sl[0], hkY(sl[1])], [1.8, sl[0], YTOP], [3.0, DROPX, YTOP], [3.4, DROPX, hkY(hY(0.7))], [4.8, nx, YTOP]]), held: w > 0.9 && w < 3.4 };
  };
  const ledgeY = hY(LEDGE[2] + 0.05);
  const liftAt = (so) => { let ly = yF + 10, tote = 0;   // tote: 1 empty on the platform, 2 loaded (tyre in it)
    for (let k = 0; k < 4; k++) { const d = TF.mod(so - HB * k + 0.9, 24) - 0.9;
      if (d < -0.5) { ly = TF.lerp(yF + 10, PLAT, TF.ramp(d, -0.9, -0.5)); tote = 1; } else if (d < 0) { ly = PLAT; tote = 1; }
      else if (d < 0.6) { ly = TF.lerp(PLAT, ledgeY, TF.ramp(d, 0, 0.6)); tote = 2; } else if (d < 1.2) ly = ledgeY;
      else if (d < 3.7) ly = TF.lerp(ledgeY, yF + 10, TF.ramp(d, 1.2, 3.7)); }
    return { ly, tote }; };
  const opt3a = (() => {
    const tote = A.reach([0.32, 1.0], [0.18, 1.02], { gripN: 0.9, gripF: 0.9 });
    const segs = [];
    for (let i = 0; i < 4; i++) segs.push(
      A.keyed(1.2, OL, 1, [[0, A.stand()], [0.5, A.reach([0.45, 0.75], null, { lean: 0.35, gripN: 0.9 })], [1, tote]]),   // tote off the tote lift
      A.keyed(1.4, OL, 1, [[0, tote], [0.5, A.reach([0.35, 1.25], [0.2, 1.1], { gripN: 0.7, head: 0.2 })], [1, tote]]),     // spin-check a wheel
      A.turn(0.3, OL, 1, () => tote), A.keyed(1.6, OL, -1, [[0, tote], [0.6, A.reach([0.3, 1.45], [0.15, 1.4], { gripN: 0.9, gripF: 0.9, head: -0.25 })], [1, A.stand()]]),   // into the basket / staging
      A.turn(0.3, OL, -1));
    segs.push(A.hold(24 - A.total(segs), OL, 1, (tl) => A.reach([0.3 + 0.05 * Math.sin(tl * 3), 0.9], null, { head: 0.3, gripN: 0.4 })));
    return (t) => A.run(segs, TF.mod(s24(t) - PH, 24)); })();
  const wrist42 = () => [OL - 0.3 * M, hY(LEDGE[2]) - 1 - 1.45 * M];   // wrist position at u = 4.2 (no dummy A.draw)
  TF.room({ id: '3A', period: 24, box: L.roomById('3A').box,
    ports: { D3AB: 'out', F3R: 'both', 'W3-3': 'both', 'PT-3': 'pass', 'SS-3': 'spare' },
    actors: ['3A.tirePress', '3A.balancer', '3A.ledgeOptimus'],
    flows: [{ item: 'tires + rims (basket)', from: 'DOCK', via: ['W3-3', 'F3R'], to: '3A', sink: 'wheels' },
      { item: 'wheel totes (basket)', from: '3A', via: ['F3R', 'W3-3'], to: '5C', sink: 'on cars (5C, 4B, 2B); empty totes back' },
      { item: 'walk lane', from: '3A', via: ['D3AB'], to: '3B', sink: 'Optimus walk lane' }],
    back(ctx, t, theme, lod) {
      const s = s24(t);
      X.upper(ctx, yF, ceil, t, lod, { duct: [1620, 1810, 4.0], fans: [1760], tray: [1620, 1810, 3.4], lamps: [1700] });
      X.rack(ctx, 1328, yF, 1.72, 2.4, 3, 0, () => {}, lod);   // R3-10: tyres below are tracked individually
      const v = TF.mod(s - S0, 24), so = TF.mod(s - PH, 24), tys = [];   // tys: tyres on the belt / balancer / roll-in: [x, y, ang]
      let pk = 0;
      for (let n = 0; n < 4; n++) { const u = TF.mod(s - (S0 + HB + HB * n), 24); pk = Math.max(pk, TF.pulse(u, 3.45, 4.05, 0.25));
        if (u < 3.4 || u >= 9.6) continue;
        if (u < 7.4) { const x = DROPX + BV * (u - 3.4); tys.push([x, BELTC, (x - DROPX) / RT]); }
        else if (u < 7.9) { const e = TF.ramp(u, 7.4, 7.9); tys.push([TF.lerp(BEND, BAL[0], e), TF.lerp(BELTC, BAL[1], e), (BEND - DROPX) / RT]); }
        else if (u < 9.1) tys.push([BAL[0], BAL[1], (BAL[0] - DROPX) / RT + 14 * (u - 7.9)]);
        else { const e = TF.ramp(u, 9.1, 9.6); tys.push([TF.lerp(BAL[0], PLX, e), TF.lerp(BAL[1], PLAT - 12 - RT, e), (BAL[0] - DROPX) / RT + 14 * 1.2 - (BAL[0] - TF.lerp(BAL[0], PLX, e)) / RT]); } }
      X.press(ctx, 1440, yF, 0.7, 2.0, pk, lod);
      X.belt(ctx, 1424, BEND, yF, 0.7, t * BV, lod);
      if (lod !== 'far') {
        D.rect(ctx, 1374, QY, 44, 3, '#aab2ba'); D.rect(ctx, 1452, QY, 100, 3, '#aab2ba');   // rack landing table; wheel staging table
        for (const x of [1456, 1546]) D.rect(ctx, x, QY + 3, 4, yF - QY - 3, '#9aa3ab');
        for (let r = 0; r < 4; r++) if (v >= 1.2 * r + 1.0 && v < 4.8 + HB * (3 - r) + 0.9) IT.tire(ctx, SLOT[r][0], SLOT[r][1]);   // rack slots: refilled, then picked top-first
        for (let r = 0; r < 4; r++) if (v < 1.2 * r + 0.3) IT.tire(ctx, QX + QOFF[r], QY);                                         // landed basket tyres waiting for the hook
        if (v > 22.9) { const b = R.tires.at(t, 0), e = TF.ramp(v - 24, -0.5, 0); IT.tire(ctx, QX + QOFF[3], TF.lerp(b.y + b.drop + 1, QY, e)); }   // 4th tyre leaves the basket gripper
        const h = hoist(v), hx = h.p[0], hy = h.p[1];
        D.rect(ctx, 1330, RAIL - 3, 128, 5, '#6b737b'); D.rect(ctx, hx - 7, RAIL - 5, 14, 9, '#3d4650'); D.line(ctx, [[hx, RAIL + 4], [hx, hy]], '#4a5056', 1.5); D.circle(ctx, hx, hy, 2.5, '#3d4650');
        if (h.held) IT.tire(ctx, hx, hy + 3 + 2 * RT);
        for (const q of tys) IT.tireAt(ctx, q[0], q[1], RT, { ang: q[2] });
      }
      // balancer stand + tote lift synced to opt3a (4 picks per 24 s from PH; s_o = s24 - PH)
      D.rect(ctx, 1655, hY(1.0), 30, 1.0 * M, '#d5dade', '#7b848c', 1);
      const L8 = liftAt(so), ly = L8.ly;
      D.line(ctx, [[1612, yF], [1612, hY(LEDGE[2] + 0.4)]], '#8a939b', 3);
      ctx.save(); ctx.beginPath(); ctx.rect(1570, ceil, 90, yF - ceil); ctx.clip();
      D.rect(ctx, 1600, ly - 4, 24, 4, '#7b848c'); if (L8.tote) IT.wtote(ctx, 1612, ly - 4); if (L8.tote === 2) IT.tire(ctx, 1612, ly - 12);
      ctx.restore();
      if (lod !== 'far') { const hold = TF.mod(R.wheels.dep - 0.5 - PH, 24); for (let j = 0; j < 4; j++) if (so >= HB * j + 4.7 && so < hold) IT.wheels(ctx, STG[j], QY); }   // staged wheel totes until the basket lifts them
      // ledge
      D.rect(ctx, LEDGE[0], hY(LEDGE[2]), LEDGE[1] - LEDGE[0], 6, '#f2c230', '#9c7a12', 1);
      for (const x of [LEDGE[0] + 4, LEDGE[1] - 8]) D.rect(ctx, x, hY(LEDGE[2]) + 6, 4, LEDGE[2] * M - 6, '#9aa3ab');
      K.ladder(ctx, LEDGE[0] - 8, yF, LEDGE[2]);
      K.cabinet(ctx, 1780, yF - 46, 18, 46, t, 49, lod);
    },
    draw() {},
    front(ctx, t, theme, lod) {
      if (lod === 'far') return;
      const st = opt3a(t), fig = A.draw(ctx, st, hY(LEDGE[2]) - 1), so = TF.mod(s24(t) - PH, 24), u = TF.mod(so, HB);
      if (u >= 0.6 && u < 4.2 && so < 19.2) { const w = fig.w(fig.sk.wristN); IT.wtote(ctx, w[0], w[1] + 6); IT.tire(ctx, w[0], w[1] - 2); }
      else if (u >= 4.2 && u < 4.7 && so < 19.2) { const w = wrist42(), e = TF.ramp(u, 4.2, 4.7), y = TF.lerp(w[1] + 6, QY, e);   // tote + wheel drops to the staging table
        IT.wtote(ctx, TF.lerp(w[0], STG[Math.floor(so / HB)], e), y); IT.tire(ctx, TF.lerp(w[0], STG[Math.floor(so / HB)], e), y - 8); }
    } });

  TF.peek({ id: 'shiba3C', owner: '3C', kind: 'shiba', P: 109, offset: 33, dur: 5, x: 2483, y: hY(3.92) - 7, face: -1 });
  TF.peek({ id: 'hardhat3E', owner: '3E', kind: 'hardhat', P: 113, offset: 37, dur: 3.5, x: 3467, y: hY(3.5) - 9 });
})(typeof window !== 'undefined' ? window : globalThis);
