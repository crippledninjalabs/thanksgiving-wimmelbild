// 6A — Giga press + panel press (FACTORY-MAP §2 Floor 6; cut jobs #1 and #11c).
// Ingot rolls off the BL cage into the furnace; the ladle fills at the spout, pours into the shot sleeve of the
// closed giga press; the platen opens on a glowing frame that rolls east through D6AB. On the mezzanine the panel
// press stamps doors + hood + rear quarter panel from basket blanks onto the F6H hanger; the carrier Optimus takes
// the quarter panel off the hanger winch and walks it through D6AB onto the car in 6B. The ladder Optimus climbs
// to the coolant valve when the gauge drifts toward red and turns it back to green.
(function (G) {
  const TF = G.TF, TF3 = G.TF3, R = TF3.rig, C = TF3.clips, L = TF.layout, D = TF.draw, K = TF.kit, A = TF.act, M = TF.M;
  const ln = TF.line6, yF = ln.yF, hY = ln.hY;
  const room = L.roomById('6A');

  // ---------- geometry ----------
  const FUR = { x0: 1405, x1: 1472, h: 2.3 }, DECK = { x0: 1360, x1: 1522, h: 2.6 };
  const PRESS = { x0: 1420, x1: 1505 };                    // panel press on the deck
  const GP = { col: [[1560, 1574], [1806, 1818]], crown: [2.78, 3.05], px0: 1572, px1: 1818, closed: 0.6, open: 1.66, ph: 1.1 };
  const LADLE = { home: 1488, pour: 1552, rail: 2.47 }, FUNNEL = [1567, hY(1.05)];
  const LADDER = 1372, CLIMB_X = LADDER + 0.17 * M, VALVE = [1365, hY(2.3)], GAUGE = [1392, hY(2.2)];
  const INGOT_FROM = (L.core.shafts.BL[0] + L.core.shafts.BL[1]) / 2 + L.ingotDx, INGOT_TABLE = 1392;

  // ---------- timelines ----------
  const platenH = (t) => { const u = TF.mod(t, 12); // bottom height of the platen (m)
    return u < 3.0 ? GP.closed : u < 3.8 ? TF.lerp(GP.closed, GP.open, TF.ramp(u, 3.0, 3.8)) : u < 10.8 ? GP.open : u < 11.6 ? TF.lerp(GP.open, GP.closed, TF.ramp(u, 10.8, 11.6)) : GP.closed; };
  const ladle = (t) => { const u = TF.mod(t, 12);
    const x = TF.keys(u, [[0.8, LADLE.pour], [1.8, LADLE.home], [10.0, LADLE.home], [11.0, LADLE.pour]]);
    const tilt = TF.keys(u, [[0.4, 1], [0.8, 0], [11.2, 0], [11.6, 1]]) * 0.9;
    const fill = u >= 9 && u < 10 ? TF.lin(u, 9, 10) : u >= 10 && u < 11.6 ? 1 : u >= 11.6 ? 1 - (u - 11.6) / 0.8 : u < 0.4 ? 1 - (u + 0.4) / 0.8 : 0;
    return { x, tilt, fill, pouring: u >= 11.6 || u < 0.4, filling: u >= 9 && u < 10 };
  };
  const melt = (t) => { const u = TF.mod(t, 24); return 2 * TF.ramp(u, 10, 13) - TF.ramp(u, 9, 10) - TF.ramp(u, 21, 22); };
  const gauge = (t) => { const u = TF.mod(t, 24); return u >= 10.6 && u < 12.6 ? TF.lerp(0.78, 0.2, TF.ramp(u, 10.6, 12.6)) : 0.2 + 0.58 * TF.mod(u - 12.6, 24) / 22; };
  const valveAng = (t) => Math.PI * 2 * TF.ramp(TF.mod(t, 24), 10.8, 12.4);
  const strokes = (t) => { const u = TF.mod(t, 12); return Math.max(TF.pulse(u, 0.5, 2.0, 0.5), TF.pulse(u, 3.0, 4.5, 0.5)); };

  // climber (24 s): idle -> climb one loop -> turn valve -> climb down -> idle
  const climb = C.climb(0.17, 0.3);
  const onLadder = (ph) => { const p = climb.sample(Math.min(ph, 0.99999)); const ay = p.advanceY; p.props = {}; return { p, ay }; };
  const valvePose = (u) => { // u 0..1 around the wheel
    const top = onLadder(1), p = JSON.parse(JSON.stringify(top.p));
    const a = valveAng(10.8 + u * 1.6) + 0.6, c = A.local(CLIMB_X, yF - top.ay * M, -1, VALVE[0], VALVE[1]);
    p.handN = [c[0] + Math.cos(a) * 0.1, c[1] + Math.sin(a) * 0.1]; p.gripN = 0.9; p.handAngN = 2.6; p.curlN = -1; p.head = -0.15;
    return { p, ay: top.ay };
  };
  const climber = (t) => {
    const u = TF.mod(t, 24);
    let st;
    if (u < 7.8 || u >= 15.4) st = { pose: A.idle(u), ay: 0 };
    else if (u < 8.2) { const a = onLadder(0); st = { pose: R.blend(A.idle(u), a.p, TF.ramp(u, 7.8, 8.2)), ay: 0 }; }
    else if (u < 10.6) { const a = onLadder((u - 8.2) / 2.4); st = { pose: a.p, ay: a.ay }; }
    else if (u < 12.6) { const k = TF.ramp(u, 10.6, 10.9) - TF.ramp(u, 12.3, 12.6), v = valvePose(TF.lin(u, 10.8, 12.4)), top = onLadder(1);
      st = { pose: R.blend(top.p, v.p, k), ay: top.ay }; }
    else if (u < 15.0) { const a = onLadder(1 - (u - 12.6) / 2.4); st = { pose: a.p, ay: a.ay }; }
    else { const a = onLadder(0); st = { pose: R.blend(a.p, A.idle(u), TF.ramp(u, 15.0, 15.4)), ay: 0 }; }
    return { x: CLIMB_X, face: -1, pose: st.pose, y: yF - st.ay * M };
  };

  // carrier (12 s): quarter panel from the hanger winch (6A east) -> D6AB -> onto the car in 6B
  // carrier (12 s): quarter panel from the hanger winch (6A east) -> D6AB -> the quarter-panel fixture in 6B,
  // where the 6B fitter Optimus takes it onto the car
  const PICK = 1780, FIX = (ln.QFIX = { c: [1872, hY(0.85)], on: [11.1, 11.7] }), PLACE = FIX.c[0] - 0.42 * M, PANEL_C = [0.4, 1.12];
  const carryUp = (pose, c = PANEL_C, k = 1) => R.layer(pose, { handN: [c[0] + 0.1, c[1] - 0.02], handF: [c[0] - 0.1, c[1] + 0.03], gripN: 0.9, gripF: 0.9,
    handAngN: 0.3, handAngF: 0.4, curlN: 1, curlF: 1, lean: (pose.lean || 0) + 0.08 }, ['handN', 'handF', 'gripN', 'gripF', 'handAngN', 'handAngF', 'curlN', 'curlF', 'lean'], k);
  const placeC = [0.42, 0.85], C0 = 10.4;
  const carrierSegs = [
    A.keyed(0.7, PLACE, 1, [[0, carryUp(A.stand())], [1, Object.assign(carryUp(A.stand(), placeC), { lean: 0.22, head: 0.15 })]]),
    A.keyed(0.15, PLACE, 1, [[0, Object.assign(carryUp(A.stand(), placeC), { lean: 0.22 })], [1, Object.assign(carryUp(A.stand(), placeC), { lean: 0.22, gripN: 0, gripF: 0 })]]),
    A.turn(0.3, PLACE, 1),
    A.walk(3.0, PLACE, PICK),
    A.turn(0.3, PICK, -1),
    A.hold(3.55, PICK, 1),
    A.keyed(0.6, PICK, 1, [[0, A.stand()], [1, Object.assign(carryUp(A.stand()), { gripN: 0.2, gripF: 0.2, head: -0.1 })]]),
    A.keyed(0.5, PICK, 1, [[0, Object.assign(carryUp(A.stand()), { gripN: 0.2, gripF: 0.2 })], [1, carryUp(A.stand())]]),
    ((w) => ({ d: w.d, f: (u, tl) => { const st = w.f(u, tl); st.pose = carryUp(st.pose); return st; } }))(A.walk(2.9, PICK, PLACE)),
  ];
  const carrier = (t) => A.run(carrierSegs, TF.mod(t - C0, 12));
  const panelOnCarrier = (t) => { const u = TF.mod(t, 12); return u >= 7.0 && u < FIX.on[0]; };

  // ---------- drawing ----------
  function back(ctx, t, theme, lod) {
    const near = lod === 'near', mid = lod !== 'far';
    TF.rollers.draw(ctx, 1560, 1830, ln.rollTop, yF, ln.rollerAng(t), lod);
    // coolant riser (from the west wall) -> valve -> furnace; branch along the floor to the giga press
    const flowing = TF.mod(t, 12) < 3.0 ? t * 40 : null;
    K.pipe(ctx, [[1361, hY(0.25)], [1364, hY(0.25)], [1364, hY(2.42)], [1430, hY(2.42)], [1430, hY(FUR.h)]], '#5b8fc9', 5, t * 30, lod);
    K.pipe(ctx, [[1364, hY(0.25)], [1560, hY(0.25)]], '#5b8fc9', 5, flowing, lod);
    // deck (mezzanine)
    D.rect(ctx, DECK.x0, hY(DECK.h), DECK.x1 - DECK.x0, 6, '#9aa3ac', '#6d757d', 1);
    if (mid) for (let x = DECK.x0 + 4; x < DECK.x1; x += 12) D.line(ctx, [[x, hY(DECK.h) - 12], [x, hY(DECK.h)]], '#b9c0c7', 1);
    D.line(ctx, [[DECK.x0, hY(DECK.h) - 12], [DECK.x1, hY(DECK.h) - 12]], '#9aa3ac', 1.5);
    D.rect(ctx, 1474, hY(DECK.h) + 6, 5, (DECK.h - FUR.h) * M - 6, '#8a939b');
    // panel press on the deck
    const pb = hY(DECK.h), s = strokes(t);
    D.rect(ctx, PRESS.x0, pb - 1.7 * M, 8, 1.7 * M, '#5f6b77'); D.rect(ctx, PRESS.x1 - 8, pb - 1.7 * M, 8, 1.7 * M, '#5f6b77');
    D.rect(ctx, PRESS.x0 - 3, pb - 1.82 * M, PRESS.x1 - PRESS.x0 + 6, 0.16 * M, '#4c5762');
    D.rect(ctx, PRESS.x0 + 8, pb - 0.6 * M, PRESS.x1 - PRESS.x0 - 16, 0.6 * M, '#7a8794');                      // bolster
    D.rect(ctx, PRESS.x0 + 10, pb - (1.55 - 0.85 * s) * M, PRESS.x1 - PRESS.x0 - 20, 0.28 * M, '#d0453b', '#8e2a23', 1);  // ram
    D.rect(ctx, PRESS.x0 + 30, pb - 1.66 * M, 6, (0.11 + 0.85 * s) * M, '#aab2ba');
    if (mid) D.tLogo(ctx, (PRESS.x0 + PRESS.x1) / 2, pb - 1.74 * M, 7);
    // blank sliding from the basket into the press
    const u = TF.mod(t, 12);
    for (const [a, b] of [[0.6, 0.9], [3.1, 3.4]]) if (u >= a && u < b + 0.4) {
      const k = TF.ramp(u, a, b), x = TF.lerp(1405, 1452, k);
      if (u < b + 0.1) D.rect(ctx, x - 13, hY(3.36) - 2, 26, 3, '#c9d0d6', '#7b848c', 0.6);
    }
    // furnace (under the deck): melt window, charging door, spout
    D.rect(ctx, FUR.x0, hY(FUR.h), FUR.x1 - FUR.x0, FUR.h * M, '#7d4b3a', '#4a2a20', 1.5);
    D.rect(ctx, FUR.x0 + 4, hY(FUR.h) + 4, FUR.x1 - FUR.x0 - 8, 10, '#5d3428');
    const lv = 0.45 + 0.18 * melt(t), wx = FUR.x0 + 16, ww = FUR.x1 - FUR.x0 - 32, wy0 = hY(1.9), wh = 1.2 * M;
    D.rect(ctx, wx, wy0, ww, wh, '#2b1b16');
    D.rect(ctx, wx, wy0 + wh * (1 - lv), ww, wh * lv, '#ff7a2a');
    if (mid) D.line(ctx, [[wx, wy0 + wh * (1 - lv)], [wx + ww, wy0 + wh * (1 - lv)]], '#ffd27a', 1.5);
    const door = TF.pulse(TF.mod(t, 24), 8.0, 9.8, 0.4);
    D.rect(ctx, FUR.x0 - 3, yF - 0.62 * M - door * 0.5 * M, 6, 0.62 * M, '#4a2a20');
    D.poly(ctx, [[FUR.x1, hY(1.42)], [FUR.x1 + 14, hY(1.36)], [FUR.x1 + 14, hY(1.3)], [FUR.x1, hY(1.3)]], '#5d3428');
    // ingot: off the BL cage (6.9) -> table -> into the furnace door
    const iu = TF.mod(t, 24);
    if (iu >= 6.9 && iu < 9.3) {
      const x = iu < 7.6 ? TF.lerp(INGOT_FROM, INGOT_TABLE, TF.ramp(iu, 6.9, 7.6)) : iu < 8.4 ? INGOT_TABLE : TF.lerp(INGOT_TABLE, 1440, TF.ramp(iu, 8.4, 9.2));
      ctx.save(); ctx.beginPath(); ctx.rect(1100, yF - 100, FUR.x0 - 1100, 100); ctx.clip();
      TF.parts.ingot(ctx, x, yF, lod, 0); ctx.restore();
    }
    // gauge + valve on the riser
    if (mid) { K.gauge(ctx, GAUGE[0], GAUGE[1], 7, gauge(t), lod); K.valve(ctx, VALVE[0], VALVE[1], 6, valveAng(t)); }
    K.ladder(ctx, LADDER, yF, DECK.h);
    // giga press frame (columns, crown, rams), shot sleeve + funnel
    for (const [a, b] of GP.col) D.rect(ctx, a, hY(GP.crown[1]), b - a, GP.crown[1] * M, '#55606b', '#39424b', 1);
    D.rect(ctx, 1556, hY(GP.crown[1]), 1822 - 1556, (GP.crown[1] - GP.crown[0]) * M, '#4c5762', '#323a42', 1);
    if (mid) D.tLogo(ctx, 1689, hY((GP.crown[0] + GP.crown[1]) / 2), 10);
    // press control screen: clamp-force trace rises while the die is closed (pure function of t)
    if (mid) D.screen(ctx, 1764, hY(3.0), 36, 9, (x, y, w, h) => {
      ctx.beginPath(); for (let i = 0; i <= 24; i++) { const tt = t - 3 + i * 0.125, f = 1 - (platenH(tt) - GP.closed) / (GP.open - GP.closed);
        const yy = y + h - 1 - f * (h - 3); i ? ctx.lineTo(x + i * w / 24, yy) : ctx.moveTo(x, yy); }
      ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 0.9; ctx.stroke(); });
    // hydraulic power unit: pump turns and the pressure gauge rises while the platen moves / holds
    const hp = Math.min(1, Math.abs(platenH(t + 0.05) - platenH(t - 0.05)) * 6 + (platenH(t) < 0.7 ? 0.7 : 0.15));
    D.rect(ctx, 1480, hY(0.85), 36, 0.85 * M, '#8a96a3', '#5d656d', 1);
    if (mid) { D.fan(ctx, 1492, hY(0.45), 7, K.spin(t, 12, 0.3, 2.5, [[0, 3.8], [10.6, 12]])); K.gauge(ctx, 1508, hY(0.66), 5, hp, lod); K.pipe(ctx, [[1516, hY(0.3)], [1560, hY(0.3)]], '#2b2f34', 2.5, null, lod); D.tLogo(ctx, 1504, hY(0.2), 5); }
    const pt = platenH(t) + GP.ph;
    for (const x of [1640, 1750]) D.rect(ctx, x - 5, hY(GP.crown[0]), 10, (GP.crown[0] - pt) * M, '#aab2ba', '#7b848c', 0.8);
    D.rect(ctx, 1540, hY(0.72), 34, 0.22 * M, '#6d7883', '#454e57', 1);                                     // shot sleeve
    const plunger = TF.pulse(TF.mod(t, 12), 0.4, 2.6, 0.5);
    D.rect(ctx, 1520 + plunger * 18, hY(0.68), 22, 0.14 * M, '#9aa3ac');
    D.poly(ctx, [[FUNNEL[0] - 9, FUNNEL[1]], [FUNNEL[0] + 9, FUNNEL[1]], [FUNNEL[0] + 3, hY(0.72)], [FUNNEL[0] - 3, hY(0.72)]], '#6d7883', '#454e57', 1);
    // ladle crane (rail under the deck)
    const la = ladle(t), ly = hY(1.25);
    D.line(ctx, [[1478, hY(LADLE.rail)], [1560, hY(LADLE.rail)]], '#6f7983', 3);
    D.rect(ctx, la.x - 7, hY(LADLE.rail) - 3, 14, 7, '#4f5861');
    D.line(ctx, [[la.x, hY(LADLE.rail)], [la.x, ly - 16]], '#59626b', 2);
    ctx.save(); ctx.translate(la.x, ly); ctx.rotate(la.tilt);
    D.poly(ctx, [[-11, -16], [11, -16], [8, 4], [-8, 4]], '#6b4a3a', '#3d2a20', 1.2);
    if (la.fill > 0.02) D.rect(ctx, -10, -15, 20, 3 + la.fill * 2, '#ff8a3d');
    ctx.restore();
    if (la.filling) D.line(ctx, [[FUR.x1 + 14, hY(1.33)], [la.x - 4, ly - 14]], '#ff9a4a', 2.4);
    if (la.pouring) D.line(ctx, [[la.x + 12, ly - 10], [FUNNEL[0], FUNNEL[1]]], '#ff9a4a', 2.4);
    // furnace fume duct: from the deck up the west wall to the ceiling; fan runs faster while the furnace melts
    D.rect(ctx, 1366, L.ceilY(6), 14, hY(DECK.h) - L.ceilY(6), '#dfe4e8', '#9aa3ab', 1);
    D.rect(ctx, 1362, hY(3.72), 26, 10, '#c9d0d6', '#7b848c', 1);                           // junction box (peek hatch on top)
    if (mid) D.fan(ctx, 1373, hY(4.55), 9, K.spin(t, 24, 0.5, 2, [[10, 13]]));
    if (theme.decor.garland) theme.decor.garland(ctx, room.inner.x, room.inner.x + room.inner.w, room.inner.y, t, lod);
  }
  function front(ctx, t, theme, lod) {
    // platen + lower die (hide the casting until the press opens)
    const ph = platenH(t);
    D.rect(ctx, GP.px0, hY(ph + GP.ph), GP.px1 - GP.px0, GP.ph * M, '#6a7682', '#3f4851', 1.5);
    D.rect(ctx, GP.px0 + 8, hY(ph + GP.ph) + 6, GP.px1 - GP.px0 - 16, 6, '#56616c');
    D.rect(ctx, GP.px0, hY(GP.closed), GP.px1 - GP.px0, (GP.closed - 0.3) * M, '#5f6b77', '#3f4851', 1);
    if (lod === 'far') return;
    // ladder Optimus
    const c = climber(t);
    A.draw(ctx, c, c.y);
    // carrier Optimus + quarter panel
    const cs = carrier(t), u = TF.mod(t, 12);
    if (panelOnCarrier(t)) {
      const sx = cs.face * (1 - (cs.squash || 0)), fig = { w: (q) => [cs.x + sx * q[0] * M, yF - q[1] * M] };
      const k = TF.ramp(u, C0, FIX.on[0]), onHands = [PANEL_C[0] + (placeC[0] - PANEL_C[0]) * k, PANEL_C[1] + (placeC[1] - PANEL_C[1]) * k];
      let p = fig.w(onHands);
      if (u >= 7.0 && u < 7.5) { const from = [1800, ln.hY(L.rail.hangerLo) + 7 + 14 + 125 + 20]; p = [TF.lerp(from[0], p[0], TF.ramp(u, 7.0, 7.5)), TF.lerp(from[1], p[1], TF.ramp(u, 7.0, 7.5))]; }
      ln.drawPiece(ctx, 'quarter', p[0], p[1], lod);   // carried at its side (behind the body, hands on it)
    }
    A.draw(ctx, cs, yF);
  }

  TF.room({
    id: '6A', period: 24, box: room.box,
    ports: { 'BL-6': 'in', 'W3-6': 'both', F6R: 'both', RISER: 'in', D6AB: 'out', F6H: 'both', 'PT-6': 'pass', 'SS-6': 'pass', 'W4-6': 'spare' },
    actors: ['6A.climber', '6A.carrier', '6A.ladle', '6A.gigapress', '6A.panelpress', 'peek.shiba6A'],
    flows: [
      { item: 'ingot', from: 'DOCK', via: ['BL-6'], to: '6A', sink: 'melted -> frames' },
      { item: 'panel blanks (basket)', from: 'DOCK', via: ['W3-6', 'F6R'], to: '6A', sink: 'stamped; empty basket back to DOCK' },
      { item: 'coolant', from: 'BA', via: ['RISER'], to: '6A', sink: 'closed loop' },
      { item: 'Model Y frame/body', from: '6A', via: ['D6AB', 'D6BC', 'D6CD', 'D6DE', 'L65'], to: '5E', sink: 'floor 5 line' },
      { item: 'rear quarter panel', from: '6A', via: ['D6AB'], to: '6B', sink: 'set in the 6B fixture, fitted and welded onto the body' },
      { item: 'doors + hood (hanger)', from: '6A', via: ['F6H'], to: '6C', sink: 'hung on the body; empty hanger loops back' },
    ],
    back, front,
  });
  TF.peek({ id: 'shiba6A', owner: '6A', kind: 'shiba', P: 47, offset: 17, dur: 5, x: 1375, y: hY(3.72), face: 1 });
  TF.debug6A = { platenH, ladle, gauge, climber, carrier };
})(typeof window !== 'undefined' ? window : globalThis);
