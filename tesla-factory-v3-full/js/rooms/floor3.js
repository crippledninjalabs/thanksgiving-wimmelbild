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
      const pw = R.powder.window(0, 0), fill = TF.mod(s - pw[0] - 0.6, 24), lv = TF.clamp(0.9 - 0.7 * fill / 24, 0.15, 0.9);
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
      K.cabinet(ctx, 3720, hY(1.0), 18, 48, t, 41, lod);
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
      K.cabinet(ctx, 3230, hY(1.0), 18, 46, t, 43, lod);
    },
    draw() {}, front() {} });

  // ================= 3C charging: ONE Optimus (ladder + cell cart, cut jobs #3 + #8) =================
  const LAD = 2600, OX = LAD + 0.17 * M, BOXP = 2720, CART0 = 2665, CART1 = 2215;
  const climb = C.climb(0.17, 0.3);
  const onL = (k, ph) => { const p = climb.sample(Math.min(ph, 0.99999)); p.props = {}; return { p, ay: k * 0.6 + p.advanceY }; };
  const ladSeg = (d, fn) => ({ d, f: (u) => { const r = fn(u); return { x: OX, face: -1, pose: r.p, ay: r.ay }; } });
  const push = (pose) => RG.layer(pose, { handN: [0.45, 0.95], handF: [0.42, 0.95], gripN: 0.9, gripF: 0.9, lean: 0.12 }, ['handN', 'handF', 'gripN', 'gripF', 'lean']);
  const box = A.reach([0.32, 1.05], [0.18, 1.08], { gripN: 0.9, gripF: 0.9 });
  const opt3 = (() => {
    const segs = [A.keyed(1.0, 2700, 1, [[0, A.stand()], [0.5, A.reach([0.4, 1.0], [0.25, 1.0], { lean: 0.2, gripN: 0.9, gripF: 0.9 })], [1, box]]),   // 0 box of fresh cells off the belt end
      A.turn(0.3, 2700, 1, () => box), A.walk(0.9, 2700, OX, { step: 0.4, carry: [0.32, 1.05], carryW: 0.25 }),
      ladSeg(0.4, (u) => ({ p: RG.blend(box, onL(0, 0).p, u), ay: 0 })),
      ladSeg(4.8, (u) => { const q = u * 2, k = Math.min(1, Math.floor(q)); return onL(k, q - k); }),                     // 2.6 .. 7.4 up
      ladSeg(1.0, (u) => { const top = onL(1, 1), p = JSON.parse(JSON.stringify(top.p)); p.handN = [0.22, 1.25 + 0.05 * Math.sin(u * 6)]; p.gripN = u < 0.5 ? 1 : 0; return { p, ay: top.ay }; }),
      ladSeg(4.8, (u) => { const q = 2 - u * 2, k = Math.min(1, Math.floor(q)); return onL(k, q - k); }),                 // 8.4 .. 13.2 down
      ladSeg(0.4, (u) => ({ p: RG.blend(onL(0, 0).p, A.stand(), u), ay: 0 })),
      A.walk(0.5, OX, CART0 + 18, { step: 0.4 }),
      A.keyed(1.0, CART0 + 18, 1, [[0, A.stand()], [0.5, A.reach([0.3, 0.55], null, { lean: 0.45, hipY: 0.8, gripN: 0.9 })], [1, A.stand()]]),   // charged cells into the cart
      A.turn(0.3, CART0 + 18, 1),
      ((w) => ({ d: w.d, f: (u, tl) => { const st = w.f(u, tl); st.pose = push(st.pose); return st; } }))(A.walk(3.6, CART0 + 18, CART1 + 25, { step: 0.55 })),   // push the cart through D3CB
      A.keyed(1.0, CART1 + 25, -1, [[0, push(A.stand())], [0.5, A.reach([0.4, 0.7], null, { lean: 0.35, gripN: 0.9 })], [1, A.stand()]]),          // unload into the pack builder
      A.turn(0.3, CART1 + 25, -1)];
    segs.push(((w) => ({ d: w.d, f: (u, tl) => { const st = w.f(u, tl); st.pose = push(st.pose); return st; } }))(A.walk(24 - A.total(segs) - 0.3, CART1 + 25, 2700, { step: 0.6 })));
    segs.push(A.turn(0.3, 2700, -1));
    return (t) => { const st = A.run(segs, s24(t)); st.ay = st.ay || 0; return st; }; })();
  const cartX = (t) => { const s = s24(t); return TF.keys(s, [[15.9, CART0], [19.5, CART1], [20.8, CART1], [23.7, CART0]]); };
  TF.room({ id: '3C', period: 24, box: L.roomById('3C').box,
    ports: { D3CD: 'in', D3BC: 'out', F3R: 'pass' },
    actors: ['3C.chargeOptimus', '3C.racks', 'peek.shiba3C'],
    flows: [{ item: 'cells (belt)', from: '3D', via: ['D3CD'], to: '3C', sink: 'charged' }, { item: 'charged cells (cart)', from: '3C', via: ['D3BC'], to: '3B', sink: 'packs' }],
    back(ctx, t, theme, lod) {
      const s = s24(t);
      X.upper(ctx, yF, ceil, t, lod, { duct: [2330, 2560, 3.9], fans: [2380], pipes: [2640, 2780, 3.6], valves: [2700], lamps: [2420, 2700] });
      D.rect(ctx, 2470, hY(3.92) - 7, 26, 9, '#c9d0d6', '#7b848c', 1);                         // vent box (Shiba peek)
      X.belt(ctx, 2700, 2790, yF, 1.0, -t * 24, lod); cellsOnBelt(ctx, 2700, 2790, t, lod);
      // charge racks: 4 levels x 8 slots, the charge lights fill level by level over the 24 s loop
      for (let lv = 0; lv < 4; lv++) { const y = hY(0.6 + lv * 0.6); D.rect(ctx, 2340, y, 240, 3, '#8a939b');
        if (lod !== 'far') for (let i = 0; i < 8; i++) cell(ctx, 2355 + i * 29, y, TF.mod(s / 24 + lv * 0.25 + i / 32, 1) > 0.5); }
      for (const x of [2340, 2577]) D.rect(ctx, x, hY(2.4), 3, 2.4 * M, '#8a939b');
      K.ladder(ctx, LAD, yF, 2.4);
      K.cabinet(ctx, 2740, hY(2.1), 18, 30, t, 45, lod);
    },
    draw() {},
    front(ctx, t, theme, lod) {
      const s = s24(t), cx = cartX(t);
      D.rect(ctx, cx - 22, hY(0.5), 44, 6, '#5b8fc9', '#2d4f75', 0.8); D.line(ctx, [[cx + 22, hY(0.45)], [cx + 26, hY(1.0)]], '#4a5560', 1.5);
      for (const w of [cx - 15, cx + 15]) D.circle(ctx, w, yF - 4, 4, '#2a2c2f');
      if (lod !== 'far' && s >= 15.0 && s < 20.3) for (let i = 0; i < 6; i++) cell(ctx, cx - 15 + i * 6, hY(0.5), true);
      if (lod === 'far') return;
      let st = opt3(t);
      if (TF.feastActive && TF.feastActive(t)) {
        const g = TF.gagT(TF.gags.FEAST, t);
        const feast = { id: '3C.feast', x: 2390, face: 1, pose: A.reach([0.45, 0.95 + 0.05 * Math.sin(t * Math.PI * 4)], [0.2, 0.9], { lean: 0.2, gripN: 0.8, head: 0.2 }), ay: 0 };
        const b = g < 1 ? g : (g > 23 ? 24 - g : 1);
        st = { id: '3C.chargeOptimus', x: TF.lerp(st.x, feast.x, b), face: feast.face, pose: b > 0.5 ? feast.pose : st.pose, ay: st.ay * (1 - b) };
      }
      const fig = A.draw(ctx, st, yF - (st.ay || 0) * M);
      if (s < 7.9 && s >= 0.5) { const w = fig.w(fig.sk.wristN); D.rect(ctx, w[0] - 8, w[1] - 2, 16, 10, '#c99b5f', '#7d5a2c', 0.6); }
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
      D.rect(ctx, 1900, hY(0.9), 140, 5, '#9aa3ab', '#6d757d', 0.8);
      for (const k in TF.PB.trips) { const p = TF.PB.trips[k], u = TF.mod(s - p.tb + 3.2, 24);
        if (u < 3.2) { const x = u < 2.7 ? TF.lerp(2010, 1905, TF.ramp(u, 0.2, 2.6)) : TF.lerp(1905, TF.PB.XU + (p.down ? 30 : 0), TF.ramp(u, 2.7, 3.2));
          D.rect(ctx, x - 26, hY(0.9) - (p.big ? 9 : 6), 52, p.big ? 9 : 6, '#2a2e33', '#111', 0.6); } }
      X.press(ctx, 2010, yF, 0.8, 1.7, TF.pulse(TF.mod(t, 4.8), 0.4, 1.6, 0.3), lod);
      K.cabinet(ctx, 2270, hY(1.0), 18, 46, t, 47, lod);
    },
    draw() {},
    front(ctx, t, theme, lod) {
      if (lod === 'far') return;
      // loader arm lifts two Optimus packs into the F3R basket while it waits at its base (2150)
      const home = TF.mod(R.optPacks.dep - 2.0, 24), u = TF.mod(s24(t) - home, 24), k = TF.pulse(u, 0, 2.0, 0.5);
      const tip = [TF.lerp(2210, 2150, k), TF.lerp(hY(1.0), hY(3.3), k)];
      K.arm(ctx, [2215, yF], tip, { l1: 45, l2: 42, toolAng: Math.PI / 2, bend: 1, tool: 6 });
      if (u < 1.2) IT.pack(ctx, tip[0], tip[1] + 8);
    } });

  // ================= 3A wheel shop: ONE ledge Optimus loads the totes (cut job #12) =================
  const LEDGE = [1470, 1600, 2.4], OL = 1535;
  const opt3a = (() => {
    const tote = A.reach([0.32, 1.0], [0.18, 1.02], { gripN: 0.9, gripF: 0.9 });
    const segs = [];
    for (let i = 0; i < 4; i++) segs.push(
      A.keyed(1.2, OL, 1, [[0, A.stand()], [0.5, A.reach([0.45, 0.75], null, { lean: 0.35, gripN: 0.9 })], [1, tote]]),   // tote off the tote lift
      A.keyed(1.4, OL, 1, [[0, tote], [0.5, A.reach([0.35, 1.25], [0.2, 1.1], { gripN: 0.7, head: 0.2 })], [1, tote]]),     // spin-check a wheel
      A.turn(0.3, OL, 1, () => tote), A.keyed(1.6, OL, -1, [[0, tote], [0.6, A.reach([0.3, 1.45], [0.15, 1.4], { gripN: 0.9, gripF: 0.9, head: -0.25 })], [1, A.stand()]]),   // into the basket / staging
      A.turn(0.3, OL, -1));
    segs.push(A.hold(24 - A.total(segs), OL, 1, (tl) => A.reach([0.3 + 0.05 * Math.sin(tl * 3), 0.9], null, { head: 0.3, gripN: 0.4 })));
    return (t) => A.run(segs, s24(t)); })();
  TF.room({ id: '3A', period: 24, box: L.roomById('3A').box,
    ports: { D3AB: 'out', F3R: 'both', 'W3-3': 'both', 'PT-3': 'pass', 'SS-3': 'spare' },
    actors: ['3A.tirePress', '3A.balancer', '3A.ledgeOptimus'],
    flows: [{ item: 'tires + rims (basket)', from: 'DOCK', via: ['W3-3', 'F3R'], to: '3A', sink: 'wheels' },
      { item: 'wheel totes (basket)', from: '3A', via: ['F3R', 'W3-3'], to: '5C', sink: 'on cars (5C, 4B, 2B); empty totes back' },
      { item: 'walk lane', from: '3A', via: ['D3AB'], to: '3B', sink: 'Optimus walk lane' }],
    back(ctx, t, theme, lod) {
      const s = s24(t);
      X.upper(ctx, yF, ceil, t, lod, { duct: [1620, 1810, 4.0], fans: [1760], tray: [1620, 1810, 3.4], lamps: [1700] });
      const TR = IT.R_TIRE;
      X.rack(ctx, 1348, yF, 2.2, 2.0, 2, 4, (c, x, y) => IT.tire(c, x, y, TR), lod);
      X.press(ctx, 1490, yF, 1.1, 2.0, TF.pulse(TF.mod(t, 6), 0.5, 2.0, 0.4), lod);
      X.belt(ctx, 1540, 1660, yF, 0.74, -t * 20, lod);
      if (lod !== 'far') for (let x = 1660 - TF.mod(t * 30, 60); x > 1545; x -= 60) IT.tire(ctx, x, hY(0.74), TR);
      // balancer (spinning wheel) + tote lift to the ledge
      D.rect(ctx, 1670 - 26, hY(0.74), 52, 0.74 * M, '#d5dade', '#7b848c', 1);
      const a = t * Math.PI * 6; IT.tire(ctx, 1670, hY(0.74), TR);
      if (lod !== 'far') D.line(ctx, [[1670, hY(0.74) - TR], [1670 + Math.cos(a) * TR, hY(0.74) - TR + Math.sin(a) * TR]], '#e5e7eb', 1);
      const lift = TF.mod(t, 6) / 6, ly = TF.lerp(hY(0.1), hY(LEDGE[2] + 0.05), TF.smooth(Math.min(1, lift * 1.3)));
      D.line(ctx, [[1612, yF], [1612, hY(LEDGE[2] + 0.4)]], '#8a939b', 3); D.rect(ctx, 1600, ly - 4, 24, 4, '#7b848c'); if (lift < 0.8) IT.tote(ctx, 1612, ly - 4);
      // ledge
      D.rect(ctx, LEDGE[0], hY(LEDGE[2]), LEDGE[1] - LEDGE[0], 6, '#f2c230', '#9c7a12', 1);
      for (const x of [LEDGE[0] + 4, LEDGE[1] - 8]) D.rect(ctx, x, hY(LEDGE[2]) + 6, 4, LEDGE[2] * M - 6, '#9aa3ab');
      K.ladder(ctx, LEDGE[0] - 8, yF, LEDGE[2]);
      K.cabinet(ctx, 1780, hY(1.0), 18, 46, t, 49, lod);
    },
    draw() {},
    front(ctx, t, theme, lod) {
      if (lod === 'far') return;
      const st = opt3a(t), fig = A.draw(ctx, st, hY(LEDGE[2]) - 1), u = TF.mod(s24(t), 4.8);
      if (u >= 0.6 && u < 4.2 && s24(t) < 19.2) { const w = fig.w(fig.sk.wristN); IT.tote(ctx, w[0], w[1] + 6); }
    } });

  TF.peek({ id: 'shiba3C', owner: '3C', kind: 'shiba', P: 109, offset: 33, dur: 5, x: 2483, y: hY(3.92) - 7, face: -1 });
  TF.peek({ id: 'hardhat3E', owner: '3E', kind: 'hardhat', P: 113, offset: 37, dur: 3.5, x: 3467, y: hY(3.5) - 9 });
})(typeof window !== 'undefined' ? window : globalThis);
