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
  const ringX = (u) => TF.keys(u, [[30, 2050], [34, 2560], [43, 2560], [47.5, 3420], [49, 3420], [54, 4490]]);
  const ring = (ctx, x, y, arc, bead, xray, lod) => {
    const a0 = -Math.PI / 2 + 0.15, a1 = a0 + arc * (Math.PI * 2 - 0.3);
    ctx.beginPath(); ctx.arc(x, y - RR, RR, a0, a1); ctx.strokeStyle = '#6b737b'; ctx.lineWidth = 9; ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y - RR, RR, a0, a1); ctx.strokeStyle = '#c3c9cf'; ctx.lineWidth = 6; ctx.stroke();
    if (bead > 0) { D.line(ctx, [[x + 3, y - 2 * RR - 4], [x + 3, y - 2 * RR - 4 + 8 * bead]], '#3f454b', 3); }
    if (xray && lod !== 'far') { ctx.globalAlpha = 0.25; D.circle(ctx, x, y - RR, RR + 6, null, '#4ade80', 4); ctx.globalAlpha = 1; }
  };
  const dolly = (ctx, x, y) => { D.rect(ctx, x - 26, y - 9, 52, 7, '#f2c230', '#9c7a12', 0.8); D.circle(ctx, x - 18, y - 2, 2.5, '#1d1f22'); D.circle(ctx, x + 18, y - 2, 2.5, '#1d1f22'); };
  TF.transport({ id: 'F8-ring', owner: '8B', period: 48, layer: 'main', box: { x: L.X0, y: ceil, w: L.X1 - L.X0 + 900, h: 320 },
    draw(ctx, t, theme, lod) {
      const u = s48(t);
      // coil from the BL gate to the 8B uncoiler on the dolly (6.4-9.0); dolly parks back at 8A
      if (u >= 5.75 && u < 9.0) { ctx.save(); ctx.beginPath(); ctx.rect(L.X0, ceil, 900, 320); ctx.clip(); const x = TF.keys(u, [[5.75, 1203], [6.35, 1453], [6.6, 1453], [9.0, 1900]]);
        D.circle(ctx, x, yF - (u >= 6.6 ? 9 : 0) - 24, 24, '#b9c0c7', '#6d757d', 1.5); D.circle(ctx, x, yF - (u >= 6.6 ? 9 : 0) - 24, 8, '#ffffff', '#6d757d', 1); ctx.restore(); }
      dolly(ctx, TF.keys(u, [[6.4, 1453], [9.0, 1900], [9.5, 1900], [12, 1453], [28, 1453], [30, 2050], [34, 2560], [43, 2560], [47.5, 3420], [48, 3420]]), yF);
      // ring life: this cycle's (u) and last cycle's on the trolley (u + 48)
      for (const v of [u, u + 48]) {
        if (v < 9 || v >= 54) continue;
        const arc = TF.clamp((v - 9) / 21, 0.02, 1), x = v < 30 ? 2050 : ringX(v), y = v < 46.8 ? yF - 9 : v < 47.5 ? TF.lerp(yF - 9, yF - 12, TF.ramp(v, 46.8, 47.5)) : yF - 12;
        if (x > L.X1 + 10) { ctx.save(); ctx.beginPath(); ctx.rect(L.X1 - 10, ceil, 900, 320); ctx.clip(); }
        ring(ctx, x, y, arc, TF.lin(v, 34, 40), v >= 40.5 && v < 43, lod);
        if (v >= 47.8 && lod !== 'far') IT.crate(ctx, x, y - RR + 8);   // tile crate packed inside the ring
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
      D.rect(ctx, 1568, hY(4.55), 10, hY(4.3) - 20 - hY(4.55), '#e3e7eb', '#9aa3ab', 0.8);   // collar up to the floor trunk
      D.rect(ctx, 1560, hY(4.3) - 20, 26, 9, '#c9d0d6', '#7b848c', 1);                              // vent box (Shiba peek)
      X.press(ctx, 1555, yF, 0.8, 1.9, TF.pulse(s, 5.3, 6.6, 0.3), lod);
      D.rect(ctx, KILN[0], hY(1.6), KILN[1] - KILN[0], 1.6 * M, '#7d4b3a', '#4a2a20', 1.2);
      const door = TF.pulse(s, 9.7, 12.2, 0.3), glow = 0.5 + 0.2 * Math.sin(t * Math.PI);
      D.rect(ctx, KILN[0] + 10, hY(1.3), 60, 0.8 * M, '#2b1b16'); ctx.globalAlpha = glow; D.rect(ctx, KILN[0] + 12, hY(1.28), 56, 0.76 * M, '#ff7a2a'); ctx.globalAlpha = 1;
      D.rect(ctx, KILN[0] + 8, hY(1.32) - door * 30, 64, 0.84 * M, '#5d3428');
      D.rect(ctx, 1754, hY(0.95) + 4, 4, yF - (hY(0.95) + 4), '#8a939b');
      D.rect(ctx, 1792, hY(0.95) + 4, 4, yF - (hY(0.95) + 4), '#8a939b');
      D.rect(ctx, 1750, hY(0.95), 50, 4, '#9aa3ab'); if (lod !== 'far') { tile(ctx, 1770, hY(0.95), true); if (s >= 17 || s < 1) tile(ctx, 1786, hY(0.95), true); }
      K.wisp(ctx, KILN[0] + 50, hY(1.6), t, 3, lod, 0.2, '#f3f4f6', 24);
      K.cabinet(ctx, 1370, yF - 46, 18, 46, t, 81, lod);
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
      K.cabinet(ctx, 2280, yF - 46, 18, 46, t, 83, lod);
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
      K.cabinet(ctx, 2340, yF - 46, 18, 46, t, 85, lod);
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
  // One Raptor, one place at every instant: stand (u<22.6, >=39.7) -> hoist hook (22.6-25) -> 8E trolley (25-37.1) -> hook (37.1-39.7) -> stand.
  const RX = 3092;   // stand centre (was 3080): clears the H78 drop tube/receiver at 3050-3080
  const raptor = (ctx, x, y, st, lod) => {   // y = base (pad/deck top); st: {nozzle 0 off .. 1 on, pump: 'old'|'new'|null, inj}
    const off = 1 - st.nozzle, nx = x + off * 34, ny = y - 2.0 * M + off * 0.4 * M;   // detached bell rests ON the pad (bottom == y), never below it
    D.poly(ctx, [[nx - 10, ny], [nx + 10, ny], [nx + 30, ny + 1.6 * M], [nx - 30, ny + 1.6 * M]], '#9aa1a8', '#4a5056', 1);
    if (lod !== 'far') for (let k = 1; k < 4; k++) D.line(ctx, [[nx - 10 - k * 5, ny + k * 0.4 * M], [nx + 10 + k * 5, ny + k * 0.4 * M]], '#7b848c', 0.8);
    D.rect(ctx, x - 18, y - 3.0 * M, 36, 0.9 * M, '#5f6b77', '#2b2f34', 1);                         // powerhead
    if (st.pump) D.circle(ctx, x + 26, y - 1.5 * M, 8, st.pump === 'old' ? '#78716c' : '#cbd5e1', '#2b2f34', 1);   // side-mounted turbopump
    if (st.inj) D.rect(ctx, x - 10, y - 2.12 * M, 20, 5, '#ef4444');
  };
  // engine on the stand: nozzle off 41.1-42.3, old pump out 42.8, new pump in 0.7, injectors in 1.7, nozzle on 2.5-6.5
  const rstate = (u) => ({ nozzle: u >= 36 ? 1 - TF.ramp(u, 41.1, 42.3) : u < 2.5 ? 0 : TF.ramp(u, 2.5, 6.5),
    pump: (u >= 42.8 || u < 0.7) ? null : (u >= 37.1 && u < 42.8) ? 'old' : 'new', inj: u >= 1.7 && u < 36 });
  const HXK = [[0, RX], [23.2, RX], [24.4, 3420], [25.8, 3420], [27.8, RX], [35.0, RX], [36.4, 3420], [37.7, 3420], [39.0, RX], [48, RX]];
  const HYK = [[0, -178], [21.8, -178], [22.6, -160], [23.2, -172], [24.4, -172], [25.0, -164], [25.8, -178], [36.4, -178], [37.1, -164], [37.7, -172], [39.0, -172], [39.7, -160], [40.5, -178], [48, -178]];
  const hoistAt = (u) => ({ x: TF.keys(u, HXK), y: yF + TF.keys(u, HYK) });   // hook point; carried Raptor base = hook y + 152 (clamped to the pad)
  const rWhere = (u) => (u < 22.6 || u >= 39.7) ? 'stand' : (u >= 25 && u < 37.1) ? 'trolley' : 'hook';
  const drawHoist = (ctx, u, lod, xa, xb) => {   // drawn by 8D (x<3280) and 8E (x>=3280) so a carried Raptor never depends on which room is culled
    const h = hoistAt(u);
    ctx.save(); ctx.beginPath(); ctx.rect(xa, yF - 420, xb - xa, 460); ctx.clip();
    X.hoist(ctx, h.x, hY(3.7), h.y, 2850, 3460);
    if (rWhere(u) === 'hook') raptor(ctx, h.x, Math.min(h.y + 152, yF - 8), u < 30 ? { nozzle: 1, pump: 'new', inj: true } : { nozzle: 1, pump: 'old', inj: false }, lod);
    ctx.restore();
  };
  const S_ = 3122, P_ = 3045, T_ = 2950;                               // work spot at the Raptor, pendant/receiver spot, basket spot
  const SITE = [RX + 26, yF - 8 - 1.5 * M], INJ = [RX, yF - 8 - 2.12 * M], BOXP = [3021, yF - 22], RECP = [3060, hY(1.75) - 8], RECI = [3072, hY(1.75) - 4];
  const lerp2 = (a, b, k) => [TF.lerp(a[0], b[0], k), TF.lerp(a[1], b[1], k)];
  const SLUMP = A.reach([0.2, 0.6], [0.15, 0.55], { lean: 0.55, head: 0.8, hipY: 0.62, gripN: 0, gripF: 0 });
  // Elon's 8D stop (tour-local tg from win['8D'][0]): tech slumps at the pad ~0.5 s after Elon arrives, Elon walks over (tg 4.45), opens the chest panel, LED on at 6.6, tech rises 6.6-7.6
  const ovrTg = (t) => { const E = TF.elonTour; return E && E.win && E.win['8D'] ? E.g(t) - E.win['8D'][0] : -99; };
  const ovrW = (tg) => TF.smooth(TF.lin(tg, -0.5, 0.5)) * (1 - TF.smooth(TF.lin(tg, 7.2, 8.8)));
  const tech = (() => {
    const low = A.reach([0.4, 0.8], [0.25, 0.85], { lean: 0.3, hipY: 0.86, gripN: 1 }), up = A.reach([0.4, 1.5], [0.25, 1.45], { gripN: 1, head: -0.1 });
    const carryP = A.reach([0.3, 1.15], [0.4, 1.05], { gripN: 0.9, gripF: 0.9, lean: 0.05 }), pumpP = A.reach([0.1, 1.62], [0.3, 1.2], { gripN: 1, gripF: 0.8, head: -0.15 }),
      injP = A.reach([0.25, 1.0], [0.55, 2.0], { gripN: 0.8, gripF: 1, head: -0.3 }), pend = (tl) => A.reach([0.4, 1.05 + 0.012 * Math.sin(tl * 8)], [0.3, 0.9], { gripN: 0.9, lean: 0.05, head: -0.15 + 0.12 * Math.sin(tl * 1.5) }),   // thumb jogs the hoist pendant while the head follows the load
      boxP = A.reach([0.5, 0.42], [0.3, 0.85], { gripN: 1, lean: 0.35, hipY: 0.9 }), recvP = A.reach([0.3, 1.78], [0.54, 1.72], { gripN: 1, gripF: 1, head: -0.2 }),
      grabP = A.reach([0.1, 1.62], null, { gripN: 1, head: -0.15 }), st0 = A.stand();
    const wob = (p, tl, a) => Object.assign({}, p, { handN: [p.handN[0] + a * Math.sin(tl * 7), p.handN[1]] });
    const sg = [
      A.keyed(0.9, S_, -1, [[0, carryP], [0.7, pumpP], [1, pumpP]]),                                   //  0.0 new pump to the side mount (on the Raptor 0.7)
      A.keyed(0.9, S_, -1, [[0, pumpP], [0.45, pumpP], [1, injP]]),                                    //  0.9 injector box up to the powerhead (in at 1.7)
      A.hold(5.2, S_, -1, (tl) => wob(low, tl, 0.03)),                                                  //  1.8 nozzle back on (2.5-6.5)
      A.hold(3.0, S_, -1, (tl) => wob(up, tl, 0.03)),                                                   //  7.0 torque the powerhead
      A.hold(10.0, S_, -1, (tl) => A.reach([0.4 + 0.05 * Math.sin(tl * 2), 1.2], null, { gripN: 0.6, head: 0.1 })),   // 10.0 leak check on the bell
      A.walk(1.5, S_, P_, { step: 0.5 }), A.turn(0.3, P_, -1),                                          // 20.0 to the hoist pendant
      A.hold(4.1, P_, 1, pend),                                                                  // 21.8-25.9 flies the Raptor to the trolley (hoist keys 21.8-27.8)
      A.turn(0.3, P_, 1), A.keyed(0.8, P_, -1, [[0, st0], [1, boxP]]),                                  // 25.9 old pump off the tote box (in hand 26.7)
      A.walk(1.6, P_, T_, { step: 0.5, carry: [0.35, 0.95], carryW: 0.3 }),                             // 27.0 to the basket stop
      A.keyed(1.0, T_, -1, [[0, carryP], [0.5, A.reach([0.3, 1.9], null, { head: -0.3 })], [1, st0]]),  // 28.6 pump into the basket (gone 29.2)
      A.turn(0.3, T_, -1), A.walk(2.0, T_, S_, { step: 0.5 }), A.turn(0.3, S_, 1),                      // 29.6 back to the stand
      A.hold(2.7, S_, -1, (tl) => A.reach([0.5 + 0.12 * Math.sin(tl * 5), 0.2], null, { lean: 0.45, hipY: 0.8, gripN: 0.8 })),   // 32.2 brush the empty pad
      A.walk(1.2, S_, P_, { step: 0.5 }), A.turn(0.3, P_, -1),                                          // 34.9 to the pendant
      A.hold(3.2, P_, 1, pend),                                                                  // 36.4-39.6 flies the old Raptor from the trolley to the stand (hoist 35-39.7)
      A.walk(1.1, P_, S_, { step: 0.5 }), A.turn(0.3, S_, 1),                                           // 39.6
      A.hold(1.4, S_, -1, (tl) => wob(low, tl, 0.03)),                                                  // 41.0 nozzle off (41.1-42.3)
      A.keyed(0.8, S_, -1, [[0, low], [0.6, grabP], [1, grabP]]),                                       // 42.4 grip the old pump (in hand 42.8)
      A.walk(1.4, S_, P_, { step: 0.5, carry: [0.3, 1.0], carryW: 0.3 }),                               // 43.2 carry it to the tote box
      A.keyed(0.7, P_, -1, [[0, carryP], [0.6, boxP], [1, boxP]]), A.turn(0.3, P_, -1),                 // 44.6 set on the box (45.1), turn to the receiver
      A.keyed(0.8, P_, 1, [[0, st0], [0.7, recvP], [1, recvP]]),                                        // 45.6 new pump + injector box off the receiver (45.9 / 46.0)
      A.walk(1.2, P_, S_, { step: 0.5, carry: [0.3, 1.1], carryW: 0.3 }), A.turn(0.3, S_, 1),           // 46.4 carry both to the stand
      A.hold(0.1, S_, -1, () => carryP)];
    const base = (t) => A.run(sg, s48(t));
    return (t) => {
      const st = base(t), w = ovrW(ovrTg(t)); st.id = 'tech-8D';
      if (w <= 0) return st;
      const tg = ovrTg(t), op = RG.blend(SLUMP, st0, TF.smooth(TF.lin(tg, 6.6, 7.6)));
      return Object.assign(st, { x: TF.lerp(st.x, S_, w), face: w > 0.5 ? -1 : st.face, pose: RG.blend(st.pose, op, w), squash: (st.squash || 0) * (1 - w), walking: st.walking && w < 0.5, ovr: w, tg }); };
  })();
  TF.room({ id: '8D', period: 48, box: L.roomById('8D').box,
    ports: { D8CD: 'pass', D8DE: 'both', F8R: 'both', H78: 'in' },
    actors: ['8D.engineStand', '8D.crane', '8D.raptorTech'],
    flows: [{ item: 'old Raptor (trolley)', from: '8E', via: ['D8DE'], to: '8D', sink: 'serviced' }, { item: 'serviced Raptor', from: '8D', via: ['D8DE'], to: '8E', sink: 'trolley to the ship' },
      { item: 'injector sets (window drone)', from: '7E', via: ['H78'], to: '8D', sink: 'in the Raptor' },
      { item: 'old injectors (scrap tote, basket)', from: '8D', via: ['F8R', 'W3-8'], to: 'DOCK', sink: 'parts-truck backload' }],
    back(ctx, t, theme, lod) {
      const u = s48(t);
      X.upper(ctx, yF, ceil, t, lod, { tray: [2810, 2900, 3.6], pipes: [3180, 3260, 3.9], valves: [3220], lamps: [2900, 3200] });
      drawHoist(ctx, u, lod, 0, 3280);
      D.rect(ctx, RX - 42, yF - 8, 108, 8, '#7b848c');
      if (rWhere(u) === 'stand') raptor(ctx, RX, yF - 8, rstate(u), lod);
      { const rs = rstate(u), tw = TF.elonTour && TF.elonTour.at8D(t) && ovrTg(t) < 2.6;                                                  // Raptor diagnostic pedestal (reacts at Elon's lever)
        D.rect(ctx, 2975, hY(1.4), 18, 1.4 * M, '#475569', '#1e293b', 1); D.rect(ctx, 2978, hY(1.35), 12, 8, '#0f172a', '#64748b', 1);
        D.rect(ctx, 2979, hY(1.35) + 5, 10 * (rs && rs.pump ? 1 : 0.4), 2, tw ? '#4ade80' : '#38bdf8');
        D.circle(ctx, 2991, hY(1.2), 3, '#0f172a', '#94a3b8', 1); D.line(ctx, [[2991, hY(1.2)], [2991 - (tw ? 9 : 3), hY(1.2) + (tw ? 6 : -8)]], '#e2e8f0', 2); }
      D.rect(ctx, 3048, hY(1.75), 32, 16, '#dfe4e8', '#7b848c', 1);                                                                       // receiver (drone capsule unloads here 42.05-42.45)
      if (lod !== 'far') {
        if (u >= 42.45 && u < 45.9) D.circle(ctx, RECP[0], RECP[1], 8, '#cbd5e1', '#2b2f34', 1);                                         // new pump: on the receiver until the hand takes it
        if (u >= 42.45 && u < 46.0) D.rect(ctx, RECI[0] - 6, RECI[1] - 4, 12, 8, '#ef4444', '#7f1d1d', 0.8);                              // injector box: same
      }
      D.rect(ctx, 3010, yF - 14, 22, 14, '#7d5a2c', '#4a3420', 1);                                                                        // scrap tote box: always on the floor
      if (lod !== 'far' && (u >= 45.1 || u < 26.4)) D.circle(ctx, BOXP[0], BOXP[1], 8, '#78716c', '#2b2f34', 1);                         // old pump rests on it until the tech takes it to the basket
      K.cabinet(ctx, 2820, yF - 46, 18, 46, t, 87, lod);
    },
    draw() {},
    front(ctx, t, theme, lod) {
      if (lod === 'far') return;
      const u = s48(t), st = tech(t), fig = A.draw(ctx, st, yF), wN = fig.w(fig.sk.wristN), wF = fig.w(fig.sk.wristF), ue = u < 20 ? u + 48 : u, ow = st.ovr || 0;
      const pump = (kind, p) => D.circle(ctx, p[0], p[1], 8, kind === 'old' ? '#78716c' : '#cbd5e1', '#2b2f34', 1), hand = [wN[0], wN[1] + 4];
      if (u >= 42.8 && u < 45.1) pump('old', u < 43.2 ? lerp2(SITE, hand, TF.ramp(u, 42.8, 43.2)) : u >= 44.6 ? lerp2(hand, BOXP, TF.ramp(u, 44.6, 45.1)) : hand);   // Raptor -> hand -> tote box
      if (u >= 26.4 && u < 29.2) pump('old', u < 26.9 ? lerp2(BOXP, hand, TF.ramp(u, 26.4, 26.9)) : hand);                                                  // tote box -> hand -> basket
      if (ue >= 45.9 && ue < 48.7) pump('new', ue < 46.3 ? lerp2(RECP, hand, TF.ramp(ue, 45.9, 46.3)) : ue >= 48.3 ? lerp2(hand, SITE, TF.ramp(ue, 48.3, 48.7)) : hand);   // receiver -> hand -> Raptor
      if (ue >= 46.0 && ue < 49.7) { const p = ue < 46.4 ? lerp2(RECI, wF, TF.ramp(ue, 46.0, 46.4)) : ue >= 49.3 ? lerp2(wF, INJ, TF.ramp(ue, 49.3, 49.7)) : wF; D.rect(ctx, p[0] - 6, p[1] - 3, 12, 8, '#ef4444', '#7f1d1d', 0.8); }
      if (u >= 32.2 && u < 34.9) D.rect(ctx, wN[0] - 6, wN[1] - 1, 12, 4, '#8b6b3d', '#4a3420', 0.8);                                       // pad brush
      { const h = hoistAt(u), k = (TF.ramp(u, 21.8, 22.3) * (1 - TF.ramp(u, 25.4, 25.9)) + TF.ramp(u, 36.4, 36.9) * (1 - TF.ramp(u, 39.2, 39.6))) * (1 - ow),   // hoist pendant: hangs from the trolley, in the tech's hand while he flies the load
          e = lerp2([h.x, yF - 1.3 * M], hand, k), s = [h.x, hY(3.7) + 5];
        D.line(ctx, [s, [(s[0] + e[0]) / 2, (s[1] + e[1]) / 2 + 10], e], '#2b2f34', 1.2); D.rect(ctx, e[0] - 3, e[1] - 1, 6, 11, '#1f2937', '#64748b', 0.8); D.circle(ctx, e[0], e[1] + 3, 1.5, k > 0.5 ? '#4ade80' : '#f59e0b'); }
      if (ow > 0) {   // downed tech: chest panel, red LED while down, Elon opens the panel and reseats the cable, LED green
        const tg = st.tg, rise = TF.smooth(TF.lin(tg, 6.6, 7.6)), c = fig.w([0.18, TF.lerp(0.98, 1.3, rise)]), open = TF.pulse(tg, 4.9, 6.9, 0.3), live = tg >= 6.6;
        D.rect(ctx, c[0] - 5, c[1] - 6, 10, 12, '#1f2937', '#64748b', 0.8);
        if (open > 0) { D.rect(ctx, c[0] - 4, c[1] - 5, 8, 10, '#0f172a'); D.line(ctx, [[c[0] - 2, c[1] + 2], [c[0] - 6 - 4 * open, c[1] + 8], [c[0] - 12 * open, c[1] + 12]], '#38bdf8', 1.3); }
        D.circle(ctx, c[0], c[1] - 9, 2.2, live ? '#4ade80' : (Math.floor(t * 4) % 2 ? '#ef4444' : '#7f1d1d'));
        if (tg > -0.5 && tg < 0.6) K.sparks(ctx, c[0], c[1], t, lod, 0.7); }
    } });

  // ================= 8E bridge gate: trolley over the sky-bridge =================
  const trolleyX = (u) => TF.keys(u, [[0, 3420], [1, 3420], [6, 4490], [7, 4490], [12, 3420], [24, 3420], [25, 3420], [30, 4490], [31, 4490], [36, 3420], [48, 3420]]);
  TF.room({ id: '8E', period: 48, box: { x: L.roomById('8E').box.x, y: L.roomById('8E').box.y, w: 1300, h: 300 },
    ports: { D8DE: 'both', S78: 'in', S89: 'pass', B8: 'out', F8R: 'both' },
    actors: ['8E.trolley', '8E.loaderArm', '8E.bridgeDoor'],
    flows: [{ item: 'ring + tile crate / serviced Raptor (trolley)', from: '8E', via: ['B8'], to: 'TOWER', sink: 'ship (ring to the transporter, Raptor into the engine bay)' },
      { item: 'ship food crate (basket)', from: '1D', via: ['F1R', 'W3-1', 'W3-8', 'F8R'], to: '8E', sink: 'carried over the bridge by crew-up' },
      { item: 'crew-up robots', from: '7E', via: ['S78'], to: '8E', sink: 'sky-bridge' }],
    back(ctx, t, theme, lod) {
      const u = s48(t), tx = trolleyX(u);
      X.upper(ctx, yF, ceil, t, lod, { duct: [3290, 3550, 4.4], fans: [3330], pipes: [3290, 3560, 3.8], valves: [3400], lamps: [3400, 3600] });
      // sky-bridge deck out of the east door, trolley rail, door with the go-lamp (9E controller presses go at 0 / 24)
      D.rect(ctx, 3740, yF - 4, 820, 6, '#c3c9d0', '#9aa3ab', 1); D.line(ctx, [[3300, yF - 3], [4560, yF - 3]], '#7b848c', 2);
      const dOpen = Math.max(TF.pulse(u, 0.6, 12.5, 0.5), TF.pulse(u, 24.6, 36.5, 0.5));
      D.rect(ctx, 3742, hY(3.0), 16, 3.0 * M * (1 - dOpen) + 2, '#9aa3ab', '#6d757d', 1);
      K.beacon(ctx, 3735, hY(3.2), t, (u < 1) || (u >= 24 && u < 25), '#4ade80');
      D.rect(ctx, tx - 40, yF - 12, 80, 8, '#5f6b77', '#2b2f34', 1); D.circle(ctx, tx - 30, yF - 4, 4, '#1d1f22'); D.circle(ctx, tx + 30, yF - 4, 4, '#1d1f22');
      if (u >= 25 && u < 37.1) { const st = u < 30.5 ? { nozzle: 1, pump: 'new', inj: true } : { nozzle: 1, pump: 'old', inj: false }; ctx.save(); ctx.beginPath(); ctx.rect(3280, ceil, 1300, 330); ctx.clip(); raptor(ctx, tx, yF - 12, st, lod); ctx.restore(); }   // swap at the ship end while the trolley is parked (30-31)
      drawHoist(ctx, u, lod, 3280, 4600);
      // food-crate shelf: unloaded from the basket at its stop, picked up by the passing crew-up robot at t%24 = 18.0
      const w = R.foodCrate.window(0, 0), s = s24(t), on = TF.mod(s - TF.mod(w[0] + 0.6, 24), 24) < TF.mod(18.0 - w[0] - 0.6, 24) - 0.02;
      { const go = (u < 1) || (u >= 24 && u < 25) || dOpen > 0.3, pull = TF.elonTour && TF.elonTour.at8E(t);                          // sky-bridge control pedestal
        D.rect(ctx, 3702, hY(1.55), 30, 1.55 * M, '#475569', '#1e293b', 1); D.rect(ctx, 3708, hY(1.5), 18, 8, '#0f172a', '#64748b', 1);
        K.beacon(ctx, 3717, hY(1.5) + 4, t, go, '#4ade80');
        D.circle(ctx, 3704, hY(1.35), 3, '#0f172a', '#94a3b8', 1); D.line(ctx, [[3704, hY(1.35)], [3704 + (pull ? 10 : 2), hY(1.35) + (pull ? 9 : -9)]], '#e2e8f0', 2); }
      D.rect(ctx, 3644, hY(1.0) + 4, 4, yF - (hY(1.0) + 4), '#8a939b');
      D.rect(ctx, 3672, hY(1.0) + 4, 4, yF - (hY(1.0) + 4), '#8a939b');
      D.rect(ctx, 3640, hY(1.0), 40, 4, '#9aa3ab'); if (on && !R.foodCrate.grip(t, 0)) IT.foodcrate(ctx, 3660, hY(1.0));   // drone owns it until it lands
      // tile crate: staging table by the loader arm; arm carries it into the waiting ring (47.8)
      const uDrop = TF.mod(R.tiles.window(0, 0)[0] + 0.6, 48), idle = [3350, hY(1.6)], pick = [3365, hY(1.0)], drop = [3420, yF - 12 - RR + 8];
      D.rect(ctx, 3355, hY(1.0) + 4, 4, yF - (hY(1.0) + 4), '#8a939b'); D.rect(ctx, 3371, hY(1.0) + 4, 4, yF - (hY(1.0) + 4), '#8a939b');
      D.rect(ctx, 3352, hY(1.0), 26, 4, '#9aa3ab');
      if (u >= uDrop && u < 46.8 && !R.tiles.grip(t, 0)) IT.crate(ctx, 3365, hY(1.0));
      const mix = (a, b, k) => [TF.lerp(a[0], b[0], k), TF.lerp(a[1], b[1], k)];
      let tip = idle;
      if (u >= 46 && u < 46.8) tip = mix(idle, pick, TF.ramp(u, 46, 46.8));
      else if (u >= 46.8 && u < 47.8) tip = mix(pick, [drop[0], drop[1] - 4], TF.ramp(u, 46.8, 47.8));
      else if (u >= 47.8) tip = mix([drop[0], drop[1] - 4], idle, TF.ramp(u, 47.8, 48.8));
      else if (u < 0.8) tip = mix([drop[0], drop[1] - 4], idle, TF.ramp(u + 48, 47.8, 48.8));
      K.arm(ctx, [3330, yF], tip, { l1: 46, l2: 42, toolAng: Math.PI / 2, bend: 1, tool: 6 });
      if (u >= 46.8 && u < 47.8 && lod !== 'far') IT.crate(ctx, tip[0], tip[1] + 4);
      K.cabinet(ctx, 3300, yF - 46, 16, 46, t, 89, lod);
    },
    draw() {}, front() {} });

  TF.peek({ id: 'shiba8A', owner: '8A', kind: 'shiba', P: 167, offset: 27, dur: 5, x: 1573, y: hY(4.3) - 20, face: -1 });
  TF.peek({ id: 'hardhat8C', owner: '8C', kind: 'hardhat', P: 173, offset: 7, dur: 3.5, x: 2700, y: hY(3.6) - 4 });
})(typeof window !== 'undefined' ? window : globalThis);
