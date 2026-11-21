// Floor 1 — ground floor (FACTORY-MAP §2 floor 1). 1A: final test (dyno, scanner arch, Supercharger / Megacharger)
// for every vehicle — Model Y + Cybercab out of the BL cage, Cybertruck + Semi down L21 — then they back out through
// the core front lane (X1A) onto the car carrier in the yard; the Semi drives off. ONE plug-in Optimus (§10).
// 1B: Roadster + Starman turntable; even Optimus come down the slide and step into a crate; the AGV forklift takes the
// crate to the carrier. 1C: glass blanks -> bending oven -> panes back into the shuttle basket. 1D: ONE cook (groceries
// in, meal out through the serving door, ship food crate up the W3). 1E: ONE server sets / clears the table,
// leftovers into the food-bank crate; the Shiba keeps its spot by the window (table-gag stage, neutral).
(function (G) {
  const TF = G.TF, TF3 = G.TF3, RG = TF3.rig, L = TF.layout, D = TF.draw, K = TF.kit, A = TF.act, M = TF.M, X = TF.mx, S = TF.supply, IT = S.items, V = TF.bodies, R = TF.R;
  const F = 1, yF = L.floorY(F), hY = (m) => yF - m * M, ceil = L.ceilY(F), G0 = L.G;
  const s24 = (t) => TF.mod(t, 24);
  const STN = 1610, gy = (x) => (x > L.X0 - 6 ? yF : G0);

  // ---------- car carrier in the yard (front lane): arrives 1-3 from the west, leaves 23-25 ----------
  const cs = (t) => { const s = s24(t); return s < 1 ? -1100 * TF.ramp(s + 24, 23, 25) : s < 3 ? -1100 * (1 - TF.ramp(s, 1, 3)) : s < 23 ? 0 : -1100 * TF.ramp(s, 23, 25); };
  const DECK = { L: G0 - 23, U: G0 - 115 };
  const exitTo = (slot, deck) => deck === 'L' ? [[1360, yF], [1335, G0], [800, G0], [725, DECK.L], [slot, DECK.L]] : [[1360, yF], [1335, G0], [880, G0], [765, DECK.U], [slot, DECK.U]];
  // vehicles: t0 (tau of entry), kind, keys [[u, x, y]], slot. After the last key they ride the carrier until it leaves.
  const VEH = [];
  const veh = (kind, t0, keys, extra = {}) => {
    const v = { kind, t0, keys, extra }; v.uDep = TF.mod(23 - t0, 24); if (v.uDep < keys[keys.length - 1][0]) v.uDep += 24; v.life = v.uDep + 2.0; VEH.push(v); return v; };
  // slide duration must match the BL cage off-window so the car is drawn once, clipped at the gate
  const bl = (kind, t0, tOff, slot, deck) => { const p = exitTo(slot, deck), slide = tOff - t0, k = [[0, 1225, yF], [slide, 1475, yF], [Math.max(slide + 0.4, 1.25), STN, yF], [2.75, STN, yF]]; let u = 2.75;
    p.forEach((q, i) => { const pr = i ? p[i - 1] : [STN, yF]; u += Math.max(0.25, Math.hypot(q[0] - pr[0], q[1] - pr[1]) / 320); k.push([u, q[0], q[1]]); }); return veh(kind, t0, k); };
  bl('modelY', 22.95, 23.55, 300, 'L'); bl('modelY', 10.95, 11.8, 380, 'U'); bl('cab', 15.95, 16.8, 600, 'U');
  { const p = exitTo(480, 'L'), k = [[0, STN, yF], [1.5, STN, yF]]; let u = 1.5; p.forEach((q, i) => { const pr = i ? p[i - 1] : [STN, yF]; u += Math.max(0.25, Math.hypot(q[0] - pr[0], q[1] - pr[1]) / 320); k.push([u, q[0], q[1]]); }); veh('ct', 3.9, k); }
  const testing = (t) => VEH.some((v) => { const u = TF.mod(t - v.t0, 24); return v.kind !== 'crate' && u >= (v.kind === 'ct' ? 0 : 1.25) && u < (v.kind === 'ct' ? 1.5 : 2.75); });
  const vAt = (v, u) => { const k = v.keys, last = k[k.length - 1]; if (u <= last[0]) { let i = 1; while (i < k.length - 1 && k[i][0] <= u) i++;
      const a = k[i - 1], b = k[i], w = TF.smooth(TF.clamp((u - a[0]) / (b[0] - a[0]), 0, 1)); return [a[1] + (b[1] - a[1]) * w, a[2] + (b[2] - a[2]) * w, (b[1] - a[1]) * w]; }
    return [last[1] + (u >= v.uDep ? -1100 * TF.ramp(u, v.uDep, v.uDep + 2) : 0), last[2], 0]; };
  const semiX = (a) => TF.keys(a, [[13.5, STN], [14.0, STN], [16.6, 960], [19.6, -700]]);

  TF.transport({ id: 'F1-vehicles', owner: '1A', period: 24, layer: 'main', box: { x: -1300, y: ceil, w: 3200, h: 330 },
    draw(ctx, t, theme, lod) {
      // carrier: tractor (west end) + two-deck trailer with ramps
      const c = cs(t);
      ctx.save(); ctx.translate(c, 0);
      D.rect(ctx, 40, G0 - 2.6 * M, 150, 2.0 * M, '#eef0f2', '#6b7280', 1.2); D.rect(ctx, 48, G0 - 2.4 * M, 40, 0.6 * M, '#22292f');
      D.rect(ctx, 190, DECK.L, 600, 5, '#7b848c', '#4a5056', 1); D.rect(ctx, 230, DECK.U, 560, 5, '#7b848c', '#4a5056', 1);
      for (const x of [240, 480, 740]) D.line(ctx, [[x, DECK.L], [x, DECK.U]], '#9aa3ab', 3);
      D.line(ctx, [[790, DECK.L + 3], [725, DECK.L + 3]], '#7b848c', 2); D.line(ctx, [[880, G0 - 3], [790, DECK.L]], '#9aa3ab', 2); D.line(ctx, [[790, DECK.U + 3], [870, G0 - 4]], '#9aa3ab', 1.5);
      for (const x of [70, 160, 640, 720]) { D.circle(ctx, x, G0 - 0.45 * M, 0.45 * M, '#1d1f22'); D.circle(ctx, x, G0 - 0.45 * M, 0.2 * M, '#9aa1a8'); }
      ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.rect(-1300, ceil, L.X1 + 1300, yF - ceil + 20); ctx.clip();
      for (const v of VEH) for (const u of [TF.mod(t - v.t0, 24), TF.mod(t - v.t0, 24) + 24]) {
        if (u >= v.life) continue;
        const [x, y, dx] = vAt(v, u);
        const test = u >= (v.kind === 'ct' ? 0 : 1.25) && u < (v.kind === 'ct' ? 1.5 : 2.75);
        const wa = test ? -t * 18 : -x / (0.4 * M);
        // during the BL unload, F1 only draws the part of the car already east of the gate; the cage draws the rest at the same x
        ctx.save(); if (v.keys[0][1] === 1225 && u < v.keys[1][0] + 0.15) { ctx.beginPath(); ctx.rect(L.X0, ceil, 600, 320); ctx.clip(); }
        V.finished(ctx, v.kind, x, y, lod, { wheelAng: wa }); ctx.restore();
      }
      // the Semi: charged on the L21 table, then drives off west through the yard
      { const a = TF.mod(t - 7.6, 24); if (a >= 13.5 && a < 19.6) { const x = semiX(a); V.finished(ctx, 'semi', x, gy(x), lod, { wheelAng: -x / (0.52 * M) }); } }
      // crate on the carrier (forklift drops it on the lower deck at 10.8)
      const s = s24(t); if (s >= 10.8 || s < 1.0) { const x = 660 + c; { D.rect(ctx, x - 15, DECK.L - 2.0 * M, 30, 2.0 * M, '#d6b07a', '#7d5a2c', 1); D.tLogo(ctx, x, DECK.L - 1.0 * M, 10); } }
      ctx.restore();
    } });

  // ================= 1A final test + exit (ONE plug-in Optimus) =================
  const OP = 1735;
  const plugs = [[0.2, 1.7], [3.9, 5.4], [12.2, 13.7], [17.2, 18.7], [21.0, 21.6]];
  const plugged = (t) => { const s = s24(t); return plugs.some(([a, b]) => s >= a && s < b); };
  const opt1a = (() => {
    const plug = A.reach([0.5, 0.9], [0.3, 0.95], { lean: 0.2, gripN: 0.9, head: 0.15 });
    const ev = (d, k) => A.keyed(d, OP, -1, [[0, A.stand()], [0.3, plug], [k, plug], [1, A.stand()]]);
    const segs = [ev(2.0, 0.8), A.hold(1.6, OP, -1, (tl) => A.reach([0.25, 1.2], null, { head: 0.1, gripN: 0.4 })), ev(1.8, 0.85),    // 0 .. 5.4
      A.turn(0.3, OP, -1), A.walk(1.4, OP, 1555, { step: 0.6 }), A.turn(0.3, 1555, 1),
      A.hold(3.0, 1555, -1, (tl) => A.reach([0.3 + 0.08 * Math.cos(tl * 7), 1.5 + 0.1 * Math.sin(tl * 7)], null, { gripN: 0.7, head: -0.2 })),   // wipe the scanner arch
      A.turn(0.3, 1555, -1), A.walk(1.4, 1555, OP, { step: 0.6 }), A.turn(0.3, OP, 1),                                           // 7.0 .. 12.0
      ev(1.9, 0.85), A.hold(3.3, OP, -1, (tl) => A.reach([0.35, 0.6 + 0.05 * Math.sin(tl * 4)], null, { lean: 0.3, gripN: 0.6 })),   // coil the cable
      ev(1.8, 0.85), A.hold(2.0, OP, -1, (tl) => A.reach([0.25, 1.2], null, { head: 0.1, gripN: 0.4 }))];
    segs.push(A.keyed(24 - A.total(segs), OP, -1, [[0, A.stand()], [0.4, plug], [1, A.stand()]]));                         // Megacharger on the Semi
    return (t) => A.run(segs, s24(t)); })();
  TF.room({ id: '1A', period: 24, box: L.roomById('1A').box,
    ports: { 'BL-1': 'in', L21: 'in', X1A: 'out', D1AB: 'in', 'W3-1': 'pass', 'PT-1': 'pass', 'SS-1': 'spare' },
    actors: ['1A.plugOptimus', '1A.dyno', '1A.scanner', '1A.chargers', 'peek.hardhat1A'],
    flows: [{ item: 'Model Y + Cybercab (BL)', from: '5A', via: ['BL-5', 'BL-1'], to: '1A', sink: 'tested -> carrier' },
      { item: 'Cybertruck + Semi (L21)', from: '2A', via: ['L21'], to: '1A', sink: 'tested; Semi drives off' },
      { item: 'Optimus crate', from: '1B', via: ['D1AB'], to: '1A', sink: 'carrier' },
      { item: 'vehicles + crates', from: '1A', via: ['X1A'], to: 'YARD', sink: 'car carrier leaves west' }],
    back(ctx, t, theme, lod) {
      const s = s24(t), on = testing(t);
      X.upper(ctx, yF, ceil, t, lod, { pipes: [1360, 1820, 3.9], valves: [1450], duct: [1360, 1820, 4.4], fans: [1700], lamps: [1500, 1720] });
      D.rect(ctx, 1795, hY(3.9) - 5, 22, 5, '#7b848c');
      X.dyno(ctx, STN, yF, on ? t * 18 : 0, lod);
      D.line(ctx, [[1520, yF], [1520, hY(2.3)], [1560, hY(2.3)], [1560, yF]], '#9aa3ab', 3);
      if (on && lod !== 'far') { ctx.globalAlpha = 0.18 + 0.1 * Math.sin(t * Math.PI * 4); D.rect(ctx, 1522, hY(2.25), 36, 2.25 * M, '#4ade80'); ctx.globalAlpha = 1; }
      X.charger(ctx, 1790, yF, on ? 0.3 + 0.6 * TF.mod(s, 1.5) / 1.5 : 0.15, null, lod, t);
      X.charger(ctx, 1810, yF, s >= 21 && s < 21.6 ? 0.8 : 0.15, null, lod, t);
      D.screen(ctx, 1600, hY(2.6), 34, 18, (x, y, w, h) => { D.circle(ctx, x + w / 2, y + h / 2, 4, on ? '#4ade80' : '#334155'); });
      K.cabinet(ctx, 1365, hY(2.2), 18, 30, t, 61, lod);
    },
    draw() {},
    front(ctx, t, theme, lod) {
      if (lod === 'far') return;
      const st = opt1a(t), fig = A.draw(ctx, st, yF);
      if (plugged(t)) { const w = fig.w(fig.sk.wristN); K.cable(ctx, [1796, hY(0.9)], w, t, 6, 10, 1, '#1d2125', 1.6); }
    } });

  // ================= 1B lobby: Roadster turntable + Optimus crating =================
  // SL71: chute from the 7A west wall across the core into the SS spiral at the floor-6 level, then down the SS
  const SS6 = TF.core.ssPath.pts.filter((p) => p[1] > L.floorY(6) - 40);
  const SL = (TF.SL71 = TF.track.path([[1372, L.floorY(7) - 14], [975, L.floorY(6) - 40]].concat(SS6))), s7 = 0;
  const CR = 1955;
  const prodWalk = A.walk(10.7, 915, CR, { step: 0.62 });
  const prod = (t) => { const s = s24(t);   // even Optimus: slide 15-19 from floor 7, stand 19-19.3, walk to the crate 19.3-6.0, step in 6-7
    if (s >= 15 && s < 19) { const p = SL.at(s7 + (SL.total - s7) * TF.lin(s, 15, 19)); return { slide: true, x: p[0], y: p[1] + 20 }; }
    const w = prodWalk, u = TF.mod(s - 19.3, 24);
    if (u < 10.7) { const st = w.f(u / 10.7, u); return { st, y: gy(st.x) }; }
    return { st: { x: CR, face: 1, pose: A.idle(u) }, y: yF, inCrate: true }; };
  const roadster = (ctx, x, y, a, lod) => {
    // swap through drawn views (side, 3/4, front/rear) — never squash the side sprite
    const P = TF3.paint, c = Math.cos(a), sn = Math.sin(a), side = Math.abs(c), face = c >= 0 ? 1 : -1, isFront = sn >= 0;
    const RED = '#c8202e', REDD = '#7a1018', TIRE = '#1d1f22', RIM = '#9aa1a8', WHT = '#f3f4f5', GRY = '#8a939b';
    const starman = (px, py, sc) => {
      P.circle(ctx, [px, py + 0.22 * sc], 0.17 * sc, WHT, GRY, 1);
      P.poly(ctx, [[px - 0.16 * sc, py], [px + 0.16 * sc, py], [px + 0.17 * sc, py + 0.28 * sc], [px - 0.17 * sc, py + 0.28 * sc]], WHT, GRY, 1);
    };
    const wheel = (ax, y0, rx, ry) => { P.ellipse(ctx, [ax, y0], rx, ry, 0, TIRE, null); P.ellipse(ctx, [ax, y0], rx * 0.48, ry * 0.48, 0, RIM, null); };
    if (side > 0.82) {
      P.begin(ctx, x, y, M, face);
      P.poly(ctx, [[1.95, 0.35], [2.02, 0.55], [1.15, 0.70], [0.35, 0.92], [-0.55, 0.92], [-1.85, 0.72], [-2.02, 0.50], [-2.0, 0.35]], RED, REDD, 1.2);
      P.poly(ctx, [[0.22, 0.88], [-0.50, 0.88], [-0.52, 1.12], [0.14, 1.12]], WHT, GRY, 1);
      starman(-0.16, 0.92, 1);
      wheel(1.30, 0.30, 0.30, 0.30); wheel(-1.25, 0.30, 0.30, 0.30);
      P.end(ctx);
    } else if (side > 0.28) {
      P.begin(ctx, x, y, M, face);
      const Lh = 1.15 + 0.85 * side, deep = 0.22 + 0.18 * (1 - side), rx = 0.12 + 0.18 * side;
      // near side + a sliver of the far shoulder so the turn reads as a 3/4 view
      P.poly(ctx, [[Lh, 0.35], [Lh + 0.04, 0.52], [0.7 * Lh, 0.70], [0.2 * Lh, 0.92], [-0.28 * Lh, 0.92], [-0.90 * Lh, 0.74], [-Lh, 0.50], [-Lh, 0.35],
        [-Lh + deep, 0.32], [Lh - deep * 0.4, 0.32]], RED, REDD, 1.2);
      P.poly(ctx, [[0.14 * Lh, 0.88], [-0.24 * Lh, 0.88], [-0.25 * Lh, 1.10], [0.08 * Lh, 1.10]], WHT, GRY, 1);
      starman(-0.08 * Lh, 0.92, 0.92);
      wheel(0.64 * Lh, 0.30, rx, 0.30); wheel(-0.62 * Lh, 0.30, rx, 0.30);
      // far wheels: slightly inward and up, still on their axles
      wheel(0.64 * Lh - deep * 0.45, 0.27, rx * 0.62, 0.22); wheel(-0.62 * Lh - deep * 0.45, 0.27, rx * 0.62, 0.22);
      P.end(ctx);
    } else {
      P.begin(ctx, x, y, M, 1);
      const rx = 0.14 + 0.08 * side;
      if (isFront) {
        wheel(-0.62, 0.30, rx, 0.30); wheel(0.62, 0.30, rx, 0.30);
        P.poly(ctx, [[-0.86, 0.35], [0.86, 0.35], [0.92, 0.54], [0.74, 0.78], [0.38, 0.96], [0, 1.02], [-0.38, 0.96], [-0.74, 0.78], [-0.92, 0.54]], RED, REDD, 1.2);
        P.poly(ctx, [[-0.42, 0.82], [0.42, 0.82], [0.32, 1.10], [-0.32, 1.10]], '#c5d0d8', GRY, 1);
        P.ellipse(ctx, [-0.54, 0.62], 0.16, 0.07, 0, '#f8fafc', GRY, 0.6);
        P.ellipse(ctx, [0.54, 0.62], 0.16, 0.07, 0, '#f8fafc', GRY, 0.6);
        P.poly(ctx, [[-0.22, 0.48], [0.22, 0.48], [0.20, 0.58], [-0.20, 0.58]], '#1d1f22', null);
        starman(0, 0.86, 0.82);
      } else {
        wheel(-0.62, 0.30, rx, 0.30); wheel(0.62, 0.30, rx, 0.30);
        P.poly(ctx, [[-0.88, 0.35], [0.88, 0.35], [0.92, 0.54], [0.80, 0.82], [0.34, 0.96], [-0.34, 0.96], [-0.80, 0.82], [-0.92, 0.54]], RED, REDD, 1.2);
        P.ellipse(ctx, [-0.56, 0.68], 0.15, 0.06, 0, '#ef4444', '#7a1018', 0.6);
        P.ellipse(ctx, [0.56, 0.68], 0.15, 0.06, 0, '#ef4444', '#7a1018', 0.6);
        P.poly(ctx, [[-0.20, 0.70], [0.20, 0.70], [0.18, 0.84], [-0.18, 0.84]], '#4a5056', null);
      }
      P.end(ctx);
    }
  };
  TF.room({ id: '1B', period: 24, box: L.roomById('1B').box,
    ports: { D1AB: 'out', D1BC: 'pass', F1R: 'both' },
    actors: ['1B.turntable', '1B.crateFolder'],
    flows: [{ item: 'Optimus crate kit (basket)', from: 'DOCK', via: ['W3-1', 'F1R'], to: '1B', sink: 'folded around the Optimus' },
      { item: 'even Optimus (slide SL71)', from: '7A', via: ['SL71'], to: '1B', sink: 'crated' },
      { item: 'crated Optimus', from: '1B', via: ['D1AB'], to: '1A', sink: 'carrier' }],
    back(ctx, t, theme, lod) {
      const s = s24(t);
      X.upper(ctx, yF, ceil, t, lod, { duct: [1850, 2290, 4.3], fans: [2240], lamps: [2000, 2200], tray: [1850, 2050, 3.6] });
      X.turntable(ctx, 2170, yF, 2.2, s / 24 * Math.PI * 2, lod);
      roadster(ctx, 2170, yF - 8, s / 24 * Math.PI * 2, lod);
      // crate station: flat kit from the basket (window w) folded into a box around the Optimus 6.0-7.0, rollers to 1A 7.6-8.0
      const w = R.crates.window(0, 0), kit = TF.mod(s - w[0] - 0.6, 24);
      D.rect(ctx, CR - 30, yF - 4, 60, 4, '#7b848c');
      if (kit < TF.mod(6.0 - w[0] - 0.6, 24)) D.rect(ctx, CR - 26, yF - 8, 52, 4, '#d6b07a', '#7d5a2c', 0.8);
      K.arm(ctx, [CR + 45, yF], s >= 5.5 && s < 7.2 ? [CR + 18, hY(2.0) + 30 * TF.ramp(s, 6.4, 7.0)] : [CR + 40, hY(1.4)], { l1: 40, l2: 36, toolAng: Math.PI, bend: 1, tool: 6 });
      K.cabinet(ctx, 2280, hY(1.0), 18, 46, t, 63, lod);
    },
    draw() {},
    front(ctx, t, theme, lod) {
      const s = s24(t);
      if (lod !== 'far') { const p = prod(t);
        if (p.slide) A.draw(ctx, { x: p.x, face: 1, pose: A.reach([0.35, 0.75], [0.2, 0.8], { hipY: 0.45, lean: -0.2, gripN: 0.4 }) }, p.y);
        else if (s < 7.0 || s >= 15) A.draw(ctx, p.st, p.y); }
      // crate walls rise around it 6.0-7.0, then the closed crate rolls out to the forklift 7.6-8.2
      if (s >= 6.0 && s < 8.2) { const k = TF.ramp(s, 6.0, 7.0), x = s < 7.6 ? CR : TF.lerp(CR, 1800, TF.ramp(s, 7.6, 8.2));
        D.rect(ctx, x - 15, yF - 2.0 * M * k, 30, 2.0 * M * k, '#d6b07a', '#7d5a2c', 1); if (k > 0.9) D.tLogo(ctx, x, yF - 1.0 * M, 10); }
    } });

  // ================= 1C glass shop =================
  TF.room({ id: '1C', period: 24, box: L.roomById('1C').box,
    ports: { D1BC: 'pass', D1CD: 'pass', F1R: 'both' },
    actors: ['1C.bendOven', '1C.loaderArm', 'peek.shiba1C'],
    flows: [{ item: 'glass blanks (basket)', from: 'DOCK', via: ['W3-1', 'F1R'], to: '1C', sink: 'bent panes' },
      { item: 'glass panes (basket)', from: '1C', via: ['F1R', 'W3-1'], to: '5E', sink: 'cars (5E, 4C, 2C)' }],
    back(ctx, t, theme, lod) {
      const s = s24(t), w = R.glass.window(0, 0), u = TF.mod(s - w[0], 24);
      X.upper(ctx, yF, ceil, t, lod, { duct: [2330, 2520, 4.3], fans: [2380], pipes: [2330, 2780, 3.7], valves: [2440, 2720], lamps: [2450, 2700] });
      D.rect(ctx, 2700, hY(4.3) - 20, 26, 9, '#c9d0d6', '#7b848c', 1);                                // vent box (Shiba peek)
      // bending oven tunnel with glowing elements, glass moving through on rollers, cooling rack
      D.rect(ctx, 2360, hY(1.7), 190, 1.0 * M, '#efe6df', '#8b6b5c', 1.2);
      if (lod !== 'far') { ctx.globalAlpha = 0.3 + 0.1 * Math.sin(t * Math.PI); D.rect(ctx, 2364, hY(1.65), 182, 0.9 * M, '#ff9a4a'); ctx.globalAlpha = 1;
        for (let x = 2550 - TF.mod(t * 15, 60); x > 2365; x -= 60) D.poly(ctx, [[x - 12, hY(0.95)], [x + 12, hY(0.95)], [x + 9, hY(1.05)], [x - 9, hY(1.05)]], 'rgba(150,190,220,0.8)', '#5d7d96', 0.6); }
      TF.rollers.draw(ctx, 2340, 2570, hY(0.7) - 5, yF, t * Math.PI, lod);
      X.rack(ctx, 2680, yF, 0.8, 1.4, 2, u < 2.6 ? 4 : 1, (c, x, y) => IT.pane(c, x + 2, y), lod);
      // loader arm: blanks out of the basket into the oven, panes from the rack into the basket (during the stop)
      const k = TF.pulse(u, 0.2, 3.2, 0.6), tip = [TF.lerp(2620, 2600, k), TF.lerp(hY(1.2), hY(1.9), k)];
      K.arm(ctx, [2630, yF], tip, { l1: 40, l2: 36, toolAng: -Math.PI / 2, bend: -1, tool: 6 });
      K.cabinet(ctx, 2330, hY(1.0), 18, 46, t, 65, lod);
    },
    draw() {}, front() {} });

  // ================= 1D kitchen: ONE cook =================
  const food = (ctx, theme, x, y, n = 3) => (theme.food || ['burger', 'fries', 'pizza']).slice(0, n).forEach((f, i) => {
    const cx = x - 8 + i * 8, c = { burger: '#b45309', fries: '#facc15', pizza: '#f97316', pie: '#d97706', pumpkin: '#ea580c', corn: '#fde047' }[f] || '#a16207';
    D.circle(ctx, cx, y - 3, 3.2, c, '#7c2d12', 0.5); });
  const wg = R.groceries.window(0, 0), w0 = TF.mod(wg[0] + 0.6, 24);
  const cook = (() => {
    const up = A.reach([0.4, 1.75], [0.25, 1.7], { gripN: 0.9, gripF: 0.9, head: -0.3 }), stir = (tl) => A.reach([0.4 + 0.06 * Math.cos(tl * 6), 1.0 + 0.04 * Math.sin(tl * 6)], [0.3, 0.95], { gripN: 1, head: 0.25 });
    const plate = A.reach([0.4, 0.98], [0.25, 0.98], { gripN: 0.9, gripF: 0.9 });
    const segs = [A.keyed(0.6, 2975, -1, [[0, A.stand()], [1, up]]), A.keyed(0.6, 2975, -1, [[0, up], [1, A.stand()]]),          // groceries out, food crate in
      A.walk(0.5, 2975, 2925, { step: 0.4 }), A.hold(4.0, 2925, -1, (tl) => stir(tl)),                                          // cook at the stove
      A.turn(0.3, 2925, -1), A.walk(1.5, 2925, 3075, { step: 0.55 }), A.hold(1.7, 3075, 1, () => plate),                          // plate up
      A.walk(1.5, 3075, 3235, { step: 0.55, carry: [0.35, 1.0], carryW: 0.3 }), A.keyed(0.8, 3235, 1, [[0, plate], [1, A.reach([0.6, 1.05], null, { gripN: 0 })]]),   // through the serving door
      A.turn(0.3, 3235, 1), A.walk(1.6, 3235, 3080, { step: 0.55 }), A.turn(0.3, 3080, -1),
      A.hold(2.2, 3080, 1, (tl) => A.reach([0.4, 0.95 + 0.05 * Math.sin(tl * 5)], [0.25, 0.95], { gripN: 0.8 })),             // pack the ship food crate
      A.walk(1.2, 3080, 3155, { step: 0.5 }), A.hold(2.0, 3155, 1, (tl) => stir(tl)),                                          // wash the pans
      A.turn(0.3, 3155, 1), A.walk(2.2, 3155, 2855, { step: 0.6, carry: [0.35, 1.0], carryW: 0.3 }), A.hold(1.6, 2855, -1, (tl) => stir(tl)),   // mixer
      A.turn(0.3, 2855, -1)];
    segs.push(A.walk(24 - A.total(segs), 2855, 2975, { step: 0.5 }));
    return (t) => A.run(segs, TF.mod(t - w0 + 0.3, 24)); })();
  TF.room({ id: '1D', period: 24, box: L.roomById('1D').box,
    ports: { D1CD: 'pass', D1DE: 'out', F1R: 'both' },
    actors: ['1D.cook'],
    flows: [{ item: 'groceries (basket)', from: 'DOCK', via: ['W3-1', 'F1R'], to: '1D', sink: 'cooked' },
      { item: 'meal platter', from: '1D', via: ['D1DE'], to: '1E', sink: 'served' },
      { item: 'ship food crate (basket)', from: '1D', via: ['F1R', 'W3-1', 'W3-8', 'F8R'], to: '8E', sink: 'galley' }],
    back(ctx, t, theme, lod) {
      const u = TF.mod(t - w0 + 0.3, 24);
      X.upper(ctx, yF, ceil, t, lod, { duct: [2800, 3260, 4.4], fans: [2900, 3200], pipes: [3050, 3260, 3.8], valves: [3150], lamps: [3000, 3150] });
      D.rect(ctx, 2880, hY(0.95), 70, 0.95 * M, '#e5e7eb', '#6b7280', 1); D.rect(ctx, 2905, hY(1.0), 28, 4, '#374151');   // stove
      if (u >= 1.7 && u < 5.7) K.wisp(ctx, 2919, hY(1.05), t, 2, lod, 0.3, '#f3f4f6', 30);
      D.rect(ctx, 3060, hY(0.9), 90, 4, '#9aa3ab'); D.rect(ctx, 3065, hY(0.9) + 4, 4, 0.86 * M, '#8a939b'); D.rect(ctx, 3140, hY(0.9) + 4, 4, 0.86 * M, '#8a939b');
      if (u >= 7.5 && u < 9.2 && lod !== 'far') { D.rect(ctx, 3085, hY(0.9) - 3, 30, 3, '#ffffff', '#9aa3ab', 0.6); food(ctx, theme, 3100, hY(0.9) - 3); }
      if (u >= 13.7 && u < 20.4 && lod !== 'far') IT.foodcrate(ctx, 3115, hY(0.9));
      D.rect(ctx, 3170, hY(0.9), 40, 0.9 * M, '#cbd5e1', '#6b7280', 1); D.rect(ctx, 2820, hY(1.1), 30, 1.1 * M, '#dfe4e8', '#7b848c', 1);
      if (lod !== 'far') D.line(ctx, [[2835, hY(1.1)], [2835 + 8 * Math.cos(t * Math.PI * 2), hY(1.1) - 6 + 4 * Math.sin(t * Math.PI * 2)]], '#4a5056', 1.5);
      K.cabinet(ctx, 3220, hY(1.8), 18, 30, t, 67, lod);
    },
    draw() {},
    front(ctx, t, theme, lod) {
      if (lod === 'far') return;
      const u = TF.mod(t - w0 + 0.3, 24), st = cook(t), fig = A.draw(ctx, st, yF), w = fig.w(fig.sk.wristN);
      if (u >= 9.2 && u < 11.5) { D.rect(ctx, w[0] - 15, w[1] - 2, 30, 3, '#ffffff', '#9aa3ab', 0.6); food(ctx, theme, w[0], w[1] - 2); }
      if (u >= 20.4 || u < 0.9) IT.foodcrate(ctx, w[0], w[1] + 6);
    } });

  // ================= 1E cafeteria: ONE server =================
  const SV = (() => {
    const set = (tl) => A.reach([0.45, 0.95], [0.3, 0.95], { lean: 0.15, gripN: 0.6, head: 0.2 }), wipe = (tl) => A.reach([0.45 + 0.08 * Math.sin(tl * 6), 0.92], null, { lean: 0.2, gripN: 0.7 });
    const segs = [A.walk(1.4, 3300, 3460, { step: 0.55, carry: [0.35, 1.0], carryW: 0.3 }), A.hold(1.5, 3460, 1, set), A.walk(1.0, 3460, 3560, { step: 0.5 }),
      A.hold(3.0, 3560, 1, set), A.hold(1.4, 3560, 1, wipe), A.turn(0.3, 3560, 1), A.walk(1.0, 3560, 3460, { step: 0.5 }), A.hold(3.0, 3460, -1, wipe),
      A.hold(2.5, 3460, -1, set), A.turn(0.3, 3460, -1), A.walk(0.9, 3460, 3540, { step: 0.5, carry: [0.35, 1.0], carryW: 0.3 }),
      A.keyed(1.6, 3540, 1, [[0, A.stand()], [0.5, A.reach([0.4, 0.5], null, { lean: 0.4, hipY: 0.82 })], [1, A.reach([0.3, 1.85], null, { head: -0.3, gripN: 0.9 })]]),   // leftovers -> food-bank crate -> basket
      A.turn(0.3, 3540, 1), A.walk(1.9, 3540, 3300, { step: 0.6 }), A.hold(2.6, 3300, 1, (tl) => A.reach([0.4 + 0.08 * Math.sin(tl * 6), 1.1], null, { gripN: 0.7 }))];
    segs.push(A.turn(24 - A.total(segs), 3300, -1));
    return segs; })();
  const sv0 = TF.mod(w0 - 0.3 + 11.5, 24);   // the cook hands the platter through the door at cook-time 11.5
  const server = (t) => A.run(SV, TF.mod(t - sv0, 24));
  TF.room({ id: '1E', period: 24, box: L.roomById('1E').box,
    ports: { D1DE: 'in', F1R: 'both', O1E: 'pass' },
    actors: ['1E.server', '1E.shibaTail'],
    flows: [{ item: 'meal platter', from: '1D', via: ['D1DE'], to: '1E', sink: 'eaten' },
      { item: 'food-bank crate (basket)', from: '1E', via: ['F1R', 'W3-1'], to: 'DOCK', sink: 'parts-truck backload' }],
    back(ctx, t, theme, lod) {
      const u = TF.mod(t - sv0, 24);
      X.upper(ctx, yF, ceil, t, lod, { duct: [3290, 3480, 4.2], fans: [3330], pipes: [3600, 3740, 3.9], valves: [3680], lamps: [3400, 3600] });
      // table with platter + plates, food-bank crate, window + lawn door in the east wall
      D.rect(ctx, 3420, hY(0.8), 200, 5, '#b98b52', '#7d5a2c', 1); for (const x of [3430, 3610]) D.rect(ctx, x, hY(0.8) + 5, 5, 0.7 * M, '#7d5a2c');
      if (lod !== 'far') { if (u >= 2.9 && u < 15.5) { D.rect(ctx, 3500, hY(0.8) - 3, 30, 3, '#ffffff', '#9aa3ab', 0.6); food(ctx, theme, 3515, hY(0.8) - 3); }
        for (const x of [3445, 3580, 3600]) D.rect(ctx, x - 7, hY(0.8) - 2, 14, 2, '#ffffff', '#9aa3ab', 0.5); }
      if (u < 21.4 || u >= 22.8) IT.foodcrate(ctx, 3580, yF);
      D.rect(ctx, 3738, hY(2.4), 14, 1.2 * M, '#dbeefc', '#7b848c', 1);
      D.rect(ctx, 3738, hY(2.1), 14, 2.1 * M, '#e5e7eb', '#7b848c', 1);
      // the Shiba's spot by the window: lying down, tail wag (24 s)
      const P = TF3.paint, wag = Math.sin(t * Math.PI * 2 / 0.5) * TF.pulse(TF.mod(t, 24), 4, 9, 0.5) * 0.4;
      P.begin(ctx, 3690, yF, M, -1);
      P.ellipse(ctx, [0, 0.18], 0.32, 0.15, 0, '#d98a3d', '#8a5222', 0.8); P.circle(ctx, [0.32, 0.3], 0.13, '#d98a3d', '#8a5222', 0.8);
      P.ellipse(ctx, [0.38, 0.27], 0.07, 0.05, 0, '#f6e7cf', null); P.poly(ctx, [[0.26, 0.4], [0.29, 0.52], [0.34, 0.42]], '#d98a3d', null); P.poly(ctx, [[0.33, 0.42], [0.38, 0.52], [0.4, 0.4]], '#d98a3d', null);
      P.circle(ctx, [0.37, 0.33], 0.018, '#222', null);
      P.at(ctx, [-0.3, 0.25], 0.6 + wag, () => P.ellipse(ctx, [0.07, 0], 0.09, 0.04, 0, '#d98a3d', null));
      P.end(ctx);
      K.cabinet(ctx, 3300, hY(1.8), 18, 30, t, 69, lod);
    },
    draw() {},
    front(ctx, t, theme, lod) {
      if (lod === 'far') return;
      const u = TF.mod(t - sv0, 24), st = server(t), fig = A.draw(ctx, st, yF), w = fig.w(fig.sk.wristN);
      if (u < 1.4) { D.rect(ctx, w[0] - 15, w[1] - 2, 30, 3, '#ffffff', '#9aa3ab', 0.6); food(ctx, theme, w[0], w[1] - 2); }
    } });

  TF.peek({ id: 'hardhat1A', owner: '1A', kind: 'hardhat', P: 139, offset: 35, dur: 3.5, x: 1806, y: hY(3.9) - 5 });
  TF.peek({ id: 'shiba1C', owner: '1C', kind: 'shiba', P: 149, offset: 19, dur: 5, x: 2713, y: hY(4.3) - 20, face: -1 });
})(typeof window !== 'undefined' ? window : globalThis);
