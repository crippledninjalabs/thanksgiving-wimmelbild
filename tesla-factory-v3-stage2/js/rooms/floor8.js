// Floor 8 — Starship parts, W -> E (FACTORY-MAP §2 floor 8; heavy items on the 48 s cycle). 8A presses + fires heat
// tiles from DOCK silica and tap-checks them (ONE tile Optimus for 8A-8B, §10); the ring coil comes up the BL on A
// cycles and an AGV dolly takes it to 8B, which rolls it into an open ring; 8C welds the seam and X-rays it; 8D services
// one Raptor (nozzle off, turbopump swap, new injectors from the window drone, nozzle on; ONE Raptor tech, also loading
// the trolley); 8E: the trolley takes the ring (A) or the serviced Raptor (B) over the sky-bridge, the crew-up robots
// from S78 pick up the ship food crate here. Tau48 = t mod 48 (A cycle 0-24, B cycle 24-48).
(function (G) {
  const TF = G.TF, TF3 = G.TF3, RG = TF3.rig, L = TF.layout, D = TF.draw, K = TF.kit, A = TF.act, M = TF.M, X = TF.mx, S = TF.supply, IT = S.items, R = TF.R;
  const F = 8, yF = L.floorY(F), hY = (m) => yF - m * M, ceil = L.ceilY(F);
  const s24 = (t) => TF.mod(t, 24), s48 = (t) => TF.mod(t, 48);
  const RR = 1.3 * M;   // ring radius (face-on, cartoon scale)

  // ---------- ring (48 s): coil 5.75 -> dolly to 8B 6.4-9, rolled 9-30, to 8C 30-34, weld 34-40, X-ray 40-43, to 8E 43-47.5, trolley 48+0-6 ----------
  const ringX = (u) => TF.keys(u, [[30, 2050], [34, 2560], [43, 2560], [47.5, 3420], [48.3, 3420], [54, 3950]]);
  const ring = (ctx, x, y, arc, bead, xray, lod) => {
    const a0 = -Math.PI / 2 + 0.15, a1 = a0 + arc * (Math.PI * 2 - 0.3);
    ctx.beginPath(); ctx.arc(x, y - RR, RR, a0, a1); ctx.strokeStyle = '#6b737b'; ctx.lineWidth = 9; ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y - RR, RR, a0, a1); ctx.strokeStyle = '#c3c9cf'; ctx.lineWidth = 6; ctx.stroke();
    if (bead > 0) { D.line(ctx, [[x + 3, y - 2 * RR - 4], [x + 3, y - 2 * RR - 4 + 8 * bead]], '#3f454b', 3); }
    if (xray && lod !== 'far') { ctx.globalAlpha = 0.25; D.circle(ctx, x, y - RR, RR + 6, null, '#4ade80', 4); ctx.globalAlpha = 1; }
  };
  const dolly = (ctx, x, y) => { D.rect(ctx, x - 26, y - 9, 52, 7, '#f2c230', '#9c7a12', 0.8); D.circle(ctx, x - 18, y - 2, 2.5, '#1d1f22'); D.circle(ctx, x + 18, y - 2, 2.5, '#1d1f22'); };
  TF.transport({ id: 'F8-ring', owner: '8B', period: 48, layer: 'main', box: { x: L.X0, y: ceil, w: L.X1 - L.X0 + 400, h: 320 },
    draw(ctx, t, theme, lod) {
      const u = s48(t);
      // coil from the BL gate to the 8B uncoiler on the dolly (6.4-9.0); dolly parks back at 8A
      if (u >= 5.75 && u < 9.0) { ctx.save(); ctx.beginPath(); ctx.rect(L.X0, ceil, 900, 320); ctx.clip(); const x = TF.keys(u, [[5.75, 1203], [6.35, 1453], [6.6, 1453], [9.0, 1900]]);
        D.circle(ctx, x, yF - (u >= 6.6 ? 9 : 0) - 24, 24, '#b9c0c7', '#6d757d', 1.5); D.circle(ctx, x, yF - (u >= 6.6 ? 9 : 0) - 24, 8, '#ffffff', '#6d757d', 1); ctx.restore(); }
      dolly(ctx, TF.keys(u, [[6.4, 1453], [9.0, 1900], [9.5, 1900], [12, 1453], [28, 1453], [30, 2050], [34, 2560], [43, 2560], [47.5, 3420], [48, 3420]]), yF);
      // ring life: this cycle's (u) and last cycle's on the trolley (u + 48)
      for (const v of [u, u + 48]) {
        if (v < 9 || v >= 54) continue;
        const arc = TF.clamp((v - 9) / 21, 0.02, 1), x = v < 30 ? 2050 : ringX(v), y = v >= 48 ? yF - 14 : yF - 9;
        if (x > L.X1 + 10) { ctx.save(); ctx.beginPath(); ctx.rect(L.X1 - 10, ceil, 400, 320); ctx.clip(); }
        ring(ctx, x, y, arc, TF.lin(v, 34, 40), v >= 40.5 && v < 43, lod);
        if (v >= 46 && lod !== 'far') IT.crate(ctx, x, y - RR + 8);   // tile crate packed inside the ring
        if (x > L.X1 + 10) ctx.restore();
      }
    } });

  // ================= 8A tile kiln (ONE tile Optimus, 24 s) =================
  const KILN = [1640, 1740], tile = (ctx, x, y, black) => D.rect(ctx, x - 7, y - 4, 14, 4, black ? '#1f2329' : '#f3f4f6', '#6b737b', 0.6);
  const tileOpt = (() => {
    const up = A.reach([0.35, 1.9], [0.2, 1.85], { gripN: 0.9, head: -0.35 }), hand = A.reach([0.42, 1.0], [0.28, 1.0], { gripN: 0.9, gripF: 0.9 });
    const tap = (tl) => A.reach([0.4, 1.0 + 0.04 * Math.abs(Math.sin(tl * 9))], [0.25, 0.95], { gripN: 1, head: 0.3 });
    const segs = [A.hold(1.6, 1480, -1, (tl) => A.reach([0.3, 1.2], null, { head: -0.2, gripN: 0.3 })), A.keyed(1.0, 1480, -1, [[0, A.stand()], [0.5, up], [1, hand]]),   // blank off the silica basket
      A.turn(0.3, 1480, -1, () => hand), A.walk(0.6, 1480, 1520, { step: 0.4, carry: [0.35, 1.0], carryW: 0.3 }), A.keyed(1.0, 1520, 1, [[0, hand], [1, A.reach([0.5, 0.9], null, { lean: 0.2 })]]),
      A.hold(1.6, 1520, 1, (tl) => A.reach([0.4, 1.2], null, { gripN: 0.8, head: 0.1 })), A.keyed(1.0, 1520, 1, [[0, A.stand()], [0.5, A.reach([0.5, 0.9], null, { lean: 0.2 })], [1, hand]]),   // press, unload
      A.walk(1.0, 1520, 1610, { step: 0.5, carry: [0.35, 1.0], carryW: 0.3 }), A.keyed(1.0, 1610, 1, [[0, hand], [1, A.reach([0.55, 0.85], null, { lean: 0.3 })]]),   // into the kiln
      A.keyed(2.0, 1610, 1, [[0, A.stand()], [0.4, A.reach([0.55, 0.85], null, { lean: 0.3, gripN: 0.9 })], [1, hand]]),                                          // fired tile out
      A.walk(0.8, 1610, 1765, { step: 0.55, carry: [0.35, 1.0], carryW: 0.3 }), A.hold(2.0, 1765, 1, tap), A.keyed(1.2, 1765, 1, [[0, hand], [1, A.reach([0.4, 0.95], null, { gripN: 0 })]]),   // tap check, into the crate
      A.turn(0.3, 1765, 1), A.walk(1.6, 1765, 1715, { step: 0.4 }), A.keyed(2.0, 1715, -1, [[0, A.stand()], [0.5, up], [1, A.stand()]]),                       // crate up into the tiles basket
      A.walk(1.6, 1715, 1480, { step: 0.55 })];
    segs.push(A.hold(24 - A.total(segs), 1480, -1, (tl) => A.reach([0.3 + 0.06 * Math.sin(tl * 5), 0.5], null, { lean: 0.4, hipY: 0.82, head: 0.4, gripN: 0.6 })));   // sweep silica dust
    return (t) => A.run(segs, s24(t)); })();
  TF.room({ id: '8A', period: 48, box: L.roomById('8A').box,
    ports: { 'BL-8': 'in', D8AB: 'out', F8R: 'both', 'W3-8': 'both', 'PT-8': 'pass', 'SS-8': 'spare' },
    actors: ['8A.tilePress', '8A.kiln', '8A.tileOptimus', 'peek.shiba8A'],
    flows: [{ item: 'silica blanks (basket)', from: 'DOCK', via: ['W3-8', 'F8R'], to: '8A', sink: 'heat tiles' },
      { item: 'ring steel coil (BL, A cycles)', from: 'DOCK', via: ['BL-8', 'D8AB'], to: '8B', sink: 'rolled ring' },
      { item: 'heat tiles (basket)', from: '8A', via: ['F8R'], to: '8E', sink: 'tile crate inside the ring' }],
    back(ctx, t, theme, lod) {
      const s = s24(t);
      X.upper(ctx, yF, ceil, t, lod, { duct: [1400, 1600, 4.3], fans: [1450], pipes: [1360, 1820, 3.6], valves: [1500, 1780], lamps: [1500, 1700] });
      D.rect(ctx, 1560, hY(4.3) - 20, 26, 9, '#c9d0d6', '#7b848c', 1);                              // vent box (Shiba peek)
      X.press(ctx, 1555, yF, 0.8, 1.9, TF.pulse(s, 5.3, 6.6, 0.3), lod);
      D.rect(ctx, KILN[0], hY(1.6), KILN[1] - KILN[0], 1.6 * M, '#7d4b3a', '#4a2a20', 1.2);
      const door = TF.pulse(s, 9.7, 12.2, 0.3), glow = 0.5 + 0.2 * Math.sin(t * Math.PI);
      D.rect(ctx, KILN[0] + 10, hY(1.3), 60, 0.8 * M, '#2b1b16'); ctx.globalAlpha = glow; D.rect(ctx, KILN[0] + 12, hY(1.28), 56, 0.76 * M, '#ff7a2a'); ctx.globalAlpha = 1;
      D.rect(ctx, KILN[0] + 8, hY(1.32) - door * 30, 64, 0.84 * M, '#5d3428');
      D.rect(ctx, 1750, hY(0.95), 50, 4, '#9aa3ab'); if (lod !== 'far') { tile(ctx, 1770, hY(0.95), true); if (s >= 17 || s < 1) tile(ctx, 1786, hY(0.95), true); }
      K.wisp(ctx, KILN[0] + 50, hY(1.6), t, 3, lod, 0.2, '#f3f4f6', 24);
      K.cabinet(ctx, 1370, hY(1.8), 18, 30, t, 81, lod);
    },
    draw() {},
    front(ctx, t, theme, lod) { if (lod === 'far') return; const s = s24(t), st = tileOpt(t), f = A.draw(ctx, st, yF), w = f.w(f.sk.wristN);
      if ((s >= 2.2 && s < 4.5)) tile(ctx, w[0], w[1] + 4, false); if ((s >= 9.0 && s < 10.6) || (s >= 12.4 && s < 16.3)) tile(ctx, w[0], w[1] + 4, s >= 12); } });

  // ================= 8B ring roller =================
  TF.room({ id: '8B', period: 48, box: L.roomById('8B').box,
    ports: { D8AB: 'in', D8BC: 'out', F8R: 'pass' },
    actors: ['8B.rollBender'],
    flows: [{ item: 'ring coil', from: '8A', via: ['D8AB'], to: '8B', sink: 'open ring' }, { item: 'open ring (dolly)', from: '8B', via: ['D8BC'], to: '8C', sink: 'weld' }],
    back(ctx, t, theme, lod) {
      const u = s48(t), on = u >= 9 && u < 30;
      X.upper(ctx, yF, ceil, t, lod, { duct: [2150, 2300, 4.3], fans: [2240], tray: [1850, 2100, 4.4], lamps: [1950, 2200] });
      // uncoiler (coil shrinks while rolling), three-roll bender feeding the ring
      const r = u >= 9 && u < 30 ? 24 * (1 - 0.7 * TF.lin(u, 9, 30)) : u >= 6.4 && u < 9 ? 0 : 0;
      if (r > 0) { D.circle(ctx, 1880, hY(0.7), r, '#b9c0c7', '#6d757d', 1.5); D.circle(ctx, 1880, hY(0.7), 6, '#4a5056'); }
      D.rect(ctx, 1950, hY(0.9), 40, 0.9 * M, '#5f6b77', '#3f4851', 1);
      for (const [dx, dy] of [[0, 0.2], [-14, 0.45], [14, 0.45]]) { D.circle(ctx, 1970 + dx, hY(dy), 6, '#9aa1a8', '#4a5056', 1);
        if (on && lod !== 'far') { const a = t * Math.PI * 2; D.line(ctx, [[1970 + dx, hY(dy)], [1970 + dx + Math.cos(a) * 5, hY(dy) + Math.sin(a) * 5]], '#e5e7eb', 1); } }
      if (on) D.line(ctx, [[1880, hY(0.7) - r], [1970, hY(0.3)], [2050, yF - 9]], '#c3c9cf', 2.5);
      K.cabinet(ctx, 2280, hY(1.0), 18, 46, t, 83, lod);
    },
    draw() {}, front() {} });

  // ================= 8C ring weld + X-ray =================
  TF.room({ id: '8C', period: 48, box: L.roomById('8C').box,
    ports: { D8BC: 'in', D8CD: 'out', F8R: 'pass' },
    actors: ['8C.weldRobot', '8C.xray', 'peek.hardhat8C'],
    flows: [{ item: 'open ring', from: '8B', via: ['D8BC'], to: '8C', sink: 'welded + X-rayed' }, { item: 'ring', from: '8C', via: ['D8CD', 'D8DE'], to: '8E', sink: 'trolley' }],
    back(ctx, t, theme, lod) {
      const u = s48(t), pass = u >= 40.5 && u < 43;
      X.upper(ctx, yF, ceil, t, lod, { pipes: [2330, 2780, 4.4], valves: [2400, 2700], duct: [2650, 2780, 3.8], fans: [2720], lamps: [2450, 2650] });
      D.line(ctx, [[2470, yF], [2470, hY(3.0)], [2650, hY(3.0)], [2650, yF]], pass ? '#4ade80' : '#9aa3ab', 4);
      D.rect(ctx, 2540, hY(3.0) - 10, 40, 10, '#5f6b77');
      D.rect(ctx, 2300 + 380, hY(3.6) - 4, 40, 4, '#7b848c');
      K.cabinet(ctx, 2340, hY(1.0), 18, 46, t, 85, lod);
    },
    draw() {},
    front(ctx, t, theme, lod) {
      if (lod === 'far') return;
      const u = s48(t), top = [2563, yF - 9 - 2 * RR - 4], on = u >= 34 && u < 40;
      const tip = on ? [top[0], top[1] + 8 * TF.lin(u, 34, 40)] : [2620, hY(2.0)];
      K.arm(ctx, [2640, yF], tip, { l1: 60, l2: 56, toolAng: Math.PI / 2 + 0.4, bend: 1 });
      if (on) K.sparks(ctx, tip[0], tip[1], t, lod, 0.8);
    } });

  // ================= 8D Raptor service (ONE Raptor tech, 48 s) =================
  const RX = 3080;
  const raptor = (ctx, x, y, st, lod) => {   // st: {nozzle 0 off .. 1 on, pump: 'old'|'new'|null, inj}
    D.rect(ctx, x - 18, y - 3.0 * M, 36, 0.9 * M, '#5f6b77', '#2b2f34', 1);                         // powerhead
    if (st.pump) D.circle(ctx, x + 16, y - 2.7 * M, 9, st.pump === 'old' ? '#78716c' : '#cbd5e1', '#2b2f34', 1);
    if (st.inj) D.rect(ctx, x - 10, y - 2.12 * M, 20, 5, '#ef4444');
    const ny = y - 2.0 * M + (1 - st.nozzle) * 1.4 * M;
    D.poly(ctx, [[x - 10, ny], [x + 10, ny], [x + 30, ny + 1.6 * M], [x - 30, ny + 1.6 * M]], '#9aa1a8', '#4a5056', 1);
    if (lod !== 'far') for (let k = 1; k < 4; k++) D.line(ctx, [[x - 10 - k * 5, ny + k * 0.4 * M], [x + 10 + k * 5, ny + k * 0.4 * M]], '#7b848c', 0.8);
  };
  // engine on the stand 37 .. 24(+48); nozzle off 38-41, pump swap 41-46, injectors in at 46 (capsule), nozzle on 49-54 (=1-6)
  const rstate = (u) => ({ nozzle: u >= 37 ? 1 - TF.ramp(u, 38, 41) : u < 1 ? 0 : TF.ramp(u, 1, 6), pump: u >= 41 && u < 43.5 ? null : u >= 37 && u < 41 ? 'old' : 'new', inj: u < 37 ? true : u >= 46 });
  const tech = (() => {
    const low = A.reach([0.4, 0.8], [0.25, 0.85], { lean: 0.3, hipY: 0.86, gripN: 1 }), up = A.reach([0.4, 1.5], [0.25, 1.45], { gripN: 1, head: -0.1 });
    const segs = [A.hold(2.0, 3240, -1, (tl) => A.reach([0.45, 1.1], null, { gripN: 0.8, lean: 0.2 })),           // A0: help the loader arm sit the ring on the trolley
      A.walk(1.5, 3240, 3130, { step: 0.5 }), A.hold(4.0, 3130, -1, (tl) => low),                                  // nozzle back on (1-6)
      A.hold(3.0, 3130, -1, (tl) => { const p = up; return Object.assign({}, p, { handN: [0.4 + 0.03 * Math.sin(tl * 9), 1.5] }); }),   // torque the powerhead
      A.keyed(1.0, 3130, -1, [[0, A.stand()], [1, low]]), A.hold(1.0, 3130, -1, () => low),                       // scrap tote of old injectors to the basket stop
      A.walk(0.8, 3130, 2950, { step: 0.5, carry: [0.35, 0.9], carryW: 0.3 }), A.keyed(1.0, 2950, -1, [[0, A.stand()], [0.5, A.reach([0.3, 1.9], null, { head: -0.3 })], [1, A.stand()]]),
      A.turn(0.3, 2950, -1), A.walk(0.8, 2950, 3130, { step: 0.5 }), A.hold(8.6, 3130, -1, (tl) => A.reach([0.4 + 0.05 * Math.sin(tl * 2), 1.2], null, { gripN: 0.6, head: 0.1 })),   // leak check, logs
      A.walk(1.0, 3130, 3240, { step: 0.5 }), A.hold(3.0, 3240, 1, (tl) => A.reach([0.45, 1.0], null, { gripN: 0.8, lean: 0.2 }))];   // 24-27: serviced Raptor onto the trolley
    const rest = [A.walk(1.0, 3240, 3130, { step: 0.5 }), A.hold(8.0, 3130, -1, (tl) => A.reach([0.4 + 0.08 * Math.sin(tl * 3), 0.6], null, { lean: 0.4, hipY: 0.82, gripN: 0.6 })),   // clean the stand
      A.walk(1.0, 3130, 3240, { step: 0.5 }), A.hold(2.0, 3240, 1, (tl) => A.reach([0.45, 1.0], null, { gripN: 0.8 })),   // 36-37 old Raptor off the trolley
      A.walk(1.0, 3240, 3130, { step: 0.5 }), A.hold(3.0, 3130, -1, () => low), A.hold(5.0, 3130, -1, (tl) => up)];   // nozzle off, pump swap
    const all = segs.concat(rest);
    all.push(A.keyed(48 - A.total(all), 3130, -1, [[0, up], [0.5, A.reach([0.35, 1.25], null, { gripN: 1 })], [1, A.stand()]]));   // injectors in
    return (t) => A.run(all, s48(t)); })();
  TF.room({ id: '8D', period: 48, box: L.roomById('8D').box,
    ports: { D8CD: 'pass', D8DE: 'both', F8R: 'both', H78: 'in' },
    actors: ['8D.engineStand', '8D.crane', '8D.raptorTech'],
    flows: [{ item: 'old Raptor (trolley)', from: '8E', via: ['D8DE'], to: '8D', sink: 'serviced' }, { item: 'serviced Raptor', from: '8D', via: ['D8DE'], to: '8E', sink: 'trolley to the ship' },
      { item: 'injector sets (window drone)', from: '7E', via: ['H78'], to: '8D', sink: 'in the Raptor' },
      { item: 'old injectors (scrap tote, basket)', from: '8D', via: ['F8R', 'W3-8'], to: 'DOCK', sink: 'parts-truck backload' }],
    back(ctx, t, theme, lod) {
      const u = s48(t);
      X.upper(ctx, yF, ceil, t, lod, { tray: [2810, 2900, 3.6], pipes: [3180, 3260, 3.9], valves: [3220], lamps: [2900, 3200] });
      X.hoist(ctx, RX + (u >= 38 && u < 41 ? 0 : 0), hY(3.6), u >= 37 || u < 6 ? hY(3.0) : hY(3.4), 2850, 3250);
      D.rect(ctx, RX - 40, yF - 8, 80, 8, '#7b848c');
      if (u >= 37 || u < 24.5) raptor(ctx, RX, yF - 8, rstate(u), lod);
      if (u >= 41 && u < 43.5 && lod !== 'far') D.circle(ctx, 3140, hY(1.0), 9, TF.lin(u, 41, 43.5) < 0.5 ? '#78716c' : '#cbd5e1', '#2b2f34', 1);
      D.rect(ctx, 3050, hY(1.75), 20, 16, '#dfe4e8', '#7b848c', 1);
      K.cabinet(ctx, 2820, hY(1.0), 18, 46, t, 87, lod);
    },
    draw() {},
    front(ctx, t, theme, lod) { if (lod === 'far') return; A.draw(ctx, tech(t), yF); } });

  // ================= 8E bridge gate: trolley over the sky-bridge =================
  const trolleyX = (u) => TF.keys(u, [[0, 3420], [1, 3420], [6, 4100], [7, 4100], [12, 3420], [24, 3420], [25, 3420], [30, 4100], [31, 4100], [36, 3420], [48, 3420]]);
  TF.room({ id: '8E', period: 48, box: { x: L.roomById('8E').box.x, y: L.roomById('8E').box.y, w: 860, h: 300 },
    ports: { D8DE: 'both', S78: 'in', B8: 'out', F8R: 'both' },
    actors: ['8E.trolley', '8E.loaderArm', '8E.bridgeDoor'],
    flows: [{ item: 'ring + tile crate / serviced Raptor (trolley)', from: '8E', via: ['B8'], to: 'TOWER', sink: 'ship (ring to the transporter, Raptor into the engine bay)' },
      { item: 'ship food crate (basket)', from: '1D', via: ['F1R', 'W3-1', 'W3-8', 'F8R'], to: '8E', sink: 'carried over the bridge by crew-up' },
      { item: 'crew-up robots', from: '7E', via: ['S78'], to: '8E', sink: 'sky-bridge' }],
    back(ctx, t, theme, lod) {
      const u = s48(t), tx = trolleyX(u);
      X.upper(ctx, yF, ceil, t, lod, { duct: [3290, 3550, 4.4], fans: [3330], pipes: [3290, 3560, 3.8], valves: [3400], lamps: [3400, 3600] });
      // sky-bridge deck out of the east door, trolley rail, door with the go-lamp (9E controller presses go at 0 / 24)
      D.rect(ctx, 3740, yF - 4, 400, 6, '#c3c9d0', '#9aa3ab', 1); D.line(ctx, [[3300, yF - 3], [4140, yF - 3]], '#7b848c', 2);
      const dOpen = Math.max(TF.pulse(u, 0.6, 12.5, 0.5), TF.pulse(u, 24.6, 36.5, 0.5));
      D.rect(ctx, 3742, hY(3.0), 16, 3.0 * M * (1 - dOpen) + 2, '#9aa3ab', '#6d757d', 1);
      K.beacon(ctx, 3735, hY(3.2), t, (u < 1) || (u >= 24 && u < 25), '#4ade80');
      D.rect(ctx, tx - 40, yF - 12, 80, 8, '#5f6b77', '#2b2f34', 1); D.circle(ctx, tx - 30, yF - 4, 4, '#1d1f22'); D.circle(ctx, tx + 30, yF - 4, 4, '#1d1f22');
      if ((u >= 24 && u < 36) || (u >= 36 && u < 37)) { const st = u < 30 ? { nozzle: 1, pump: 'new', inj: true } : { nozzle: 1, pump: 'old', inj: true }; ctx.save(); ctx.beginPath(); ctx.rect(3280, ceil, 900, 330); ctx.clip(); raptor(ctx, tx, yF - 12, st, lod); ctx.restore(); }
      // food-crate shelf: unloaded from the basket at its stop, taken by the passing crew-up robot (~17.6)
      const w = R.foodCrate.window(0, 0), s = s24(t), on = TF.mod(s - TF.mod(w[0] + 0.6, 24), 24) < TF.mod(17.6 - w[0] - 0.6, 24);
      D.rect(ctx, 3480, hY(1.0), 40, 4, '#9aa3ab'); if (on) IT.foodcrate(ctx, 3500, hY(1.0));
      K.arm(ctx, [3330, yF], [TF.lerp(3360, tx, TF.pulse(u, 46, 48, 0.5)), hY(1.6)], { l1: 46, l2: 42, toolAng: Math.PI / 2, bend: 1, tool: 6 });
      K.cabinet(ctx, 3300, hY(2.0), 16, 30, t, 89, lod);
    },
    draw() {}, front() {} });

  TF.peek({ id: 'shiba8A', owner: '8A', kind: 'shiba', P: 167, offset: 27, dur: 5, x: 1573, y: hY(4.3) - 20, face: -1 });
  TF.peek({ id: 'hardhat8C', owner: '8C', kind: 'hardhat', P: 173, offset: 7, dur: 3.5, x: 2700, y: hY(3.6) - 4 });
})(typeof window !== 'undefined' ? window : globalThis);
