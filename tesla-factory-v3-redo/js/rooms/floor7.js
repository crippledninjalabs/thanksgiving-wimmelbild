// Floor 7 — Optimus line, W -> E, 12 s pitch (FACTORY-MAP §2 floor 7). 7A builds actuators from DOCK magnets, 7B
// fits fingers + visor/cameras (sensors by window drone), 7C assembles the robot on a stand (bare actuators first:
// legs -> torso + pack -> arms -> head, then the white shells, then the 9B computer lights the visor), 7D activates and
// walk-tests it. Odd robots walk to 7E and climb the S78 stair to the 8E crew gate; even robots walk back to the 7A
// SL71 chute and slide down to the 1B crating. Two Optimus (§10): the line feeder (7A -> 7B -> 7C) and the bay Optimus
// (head check + treadmill console at 7D, 7E window bay). Robot k is born at t = 12k on the 7C stand.
(function (G) {
  const TF = G.TF, TF3 = G.TF3, RG = TF3.rig, C = TF3.clips, L = TF.layout, D = TF.draw, K = TF.kit, A = TF.act, M = TF.M, X = TF.mx, S = TF.supply, IT = S.items, R = TF.R;
  const F = 7, yF = L.floorY(F), hY = (m) => yF - m * M, ceil = L.ceilY(F), yF8 = L.floorY(8);
  const s24 = (t) => TF.mod(t, 24), s12 = (t) => TF.mod(t, 12);
  const STAND = 2700, PAD = 3000, STAIR = [3600, 3690], CHUTE = 1372;

  // ---------- product robots ----------
  const standPose = A.reach([-0.32, 1.22], [-0.38, 1.18], { gripN: 0.3, gripF: 0.3 });
  const fcCarry = [0.35, 1.05];
  const W7D = A.walk(3.0, STAND, PAD, { step: 0.55 }), WEVEN = A.walk(17.6, PAD, CHUTE + 8, { step: 0.62 }), WODD = A.walk(5.5, PAD, STAIR[0], { step: 0.6 });
  const W8segs = [A.walk(0.8, STAIR[1], 3670, { step: 0.5 }),
    A.keyed(0.6, 3670, -1, [[0, A.stand()], [0.4, A.reach([0.4, 0.95], [0.25, 0.95], { lean: 0.15, gripN: 0.9, gripF: 0.9 })], [1, A.carry(A.stand(), fcCarry, 0.3)]]),
    A.turn(0.3, 3670, -1, () => A.carry(A.stand(), fcCarry, 0.3)),
    A.walk(1.8, 3670, 3800, { step: 0.65, carry: fcCarry, carryW: 0.3 })];
  const walkLoop = C.walk('optimus');
  const robotAt = (a, even) => {   // -> {x, y, face, pose, stage}
    if (a < 9) return { x: STAND, y: yF, face: 1, pose: standPose, build: a };
    if (a < 12) { const st = W7D.f((a - 9) / 3, a - 9); return { x: st.x, y: yF, face: 1, pose: st.pose }; }
    if (a < 15) return { x: PAD, y: yF, face: 1, pose: a < 13.5 ? A.idle(a) : Object.assign(A.stand(), { head: 0.25 }), pad: a < 13.5 };
    if (a < 20) return { x: PAD, y: yF, face: 1, pose: walkLoop.sample((a - 15) / walkLoop.duration), tread: true };
    if (a < 21) return { x: PAD, y: yF, face: even ? (a < 20.5 ? 1 : -1) : 1, squash: even ? 0.85 * (1 - Math.abs(Math.cos(Math.PI * (a - 20)))) : 0, pose: A.idle(a) };
    if (even) { if (a < 38.6) { const st = WEVEN.f((a - 21) / 17.6, a - 21); return { x: st.x, y: yF, face: -1, pose: st.pose }; }
      return a < 39 ? { x: CHUTE + 8, y: yF, face: -1, pose: RG.blend(A.stand(), A.reach([0.35, 0.75], [0.2, 0.8], { hipY: 0.45, lean: -0.2 }), TF.ramp(a, 38.6, 39)) } : null; }
    if (a < 26.5) { const st = WODD.f((a - 21) / 5.5, a - 21); return { x: st.x, y: yF, face: 1, pose: st.pose }; }
    if (a < 29) { const k = (a - 26.5) / 2.5; return { x: TF.lerp(STAIR[0], STAIR[1], k), y: TF.lerp(yF, yF8, k), face: 1, pose: walkLoop.sample(k * 2) }; }
    if (a < 32.5) { const st = A.run(W8segs, a - 29, 0.1, false); return { x: st.x, y: yF8, face: st.face, pose: st.pose, fc: a >= 30.0 }; }
    return null; };
  // build stages on the stand (age): legs 0.5, torso 2.0, pack 3.0, arms 4.5, head 6.0, shells 7.5, computer 8.3
  const drawBuild = (ctx, r, a, lod) => {
    const x = r.x, regions = [];
    if (a >= 0.5) regions.push([x - 40, hY(0.95), 80, 0.95 * M + 2]);
    if (a >= 2.0) regions.push([x - 0.13 * M, hY(1.47), 40, 0.52 * M]);
    if (a >= 4.5) regions.push([x - 40, hY(1.47), 80, 0.52 * M]);
    if (a >= 6.0) regions.push([x - 40, hY(2.0), 80, 0.6 * M]);
    if (!regions.length) return;
    ctx.save(); ctx.beginPath(); regions.forEach((q) => ctx.rect(q[0], q[1], q[2], q[3])); ctx.clip();
    if (a < 7.5) ctx.filter = 'brightness(0.5) saturate(0)';
    A.draw(ctx, r, yF); ctx.restore();
    if (a >= 3.0) D.rect(ctx, x - 0.2 * M - 6, hY(1.38), 8, 0.4 * M, '#2a2e33', '#111', 0.6);   // Optimus pack on the back
    if (a >= 8.3 && lod !== 'far') { ctx.globalAlpha = 0.5; D.circle(ctx, x + 4, hY(1.62), 4, '#4da3ff'); ctx.globalAlpha = 1; }
  };
  TF.transport({ id: 'F7-robots', owner: '7C', period: 24, layer: 'front', box: { x: L.X0, y: L.ceilY(8), w: L.X1 - L.X0 + 100, h: 620 },
    draw(ctx, t, theme, lod) {
      if (lod === 'far') return;
      for (let k = Math.floor((t - 40) / 12); k <= Math.floor(t / 12); k++) {
        const a = t - 12 * k; if (a < 0 || a >= 40) continue;
        const r = robotAt(a, TF.mod(k, 2) === 0); if (!r) continue;
        if (a >= 26.5) r.id = 'crew-' + TF.mod((k - 1) / 2, 2);   // odd k only; Tower continues the same id from a=32.5
        if (r.build !== undefined) drawBuild(ctx, r, a, lod);
        else { if (a >= 26.5 && a < 29) { ctx.save(); ctx.beginPath(); ctx.rect(3560, yF8 - 120, 220, yF - yF8 + 120); ctx.clip(); A.draw(ctx, r, r.y); ctx.restore(); } else { const f = A.draw(ctx, r, r.y); if (r.fc) { const w = f.w(f.sk.wristN); IT.foodcrate(ctx, w[0], w[1] + 5); } } }
      }
    } });

  // ================= 7A actuators =================
  const feeder = (() => {
    const tray = A.reach([0.4, 1.0], [0.25, 1.0], { gripN: 0.9, gripF: 0.9 }), low = A.reach([0.45, 0.9], [0.3, 0.9], { lean: 0.2, gripN: 0.6 });
    const segs = [A.keyed(1.2, 1700, 1, [[0, A.stand()], [0.5, low], [1, tray]]), A.walk(4.5, 1700, 2180, { step: 0.6, carry: [0.35, 1.0], carryW: 0.3 }),
      A.keyed(1.0, 2180, 1, [[0, tray], [1, low]]), A.keyed(1.0, 2180, 1, [[0, low], [1, tray]]), A.walk(2.0, 2180, 2410, { step: 0.55, carry: [0.35, 1.0], carryW: 0.3 }),
      A.keyed(1.0, 2410, 1, [[0, tray], [1, low]]), A.turn(0.3, 2410, 1), A.keyed(0.7, 2410, -1, [[0, A.stand()], [1, tray]]),
      A.walk(7.0, 2410, 1700, { step: 0.6, carry: [0.35, 1.0], carryW: 0.3 }), A.keyed(1.0, 1700, -1, [[0, tray], [1, low]]), A.turn(0.3, 1700, -1)];
    segs.push(A.hold(24 - A.total(segs), 1700, 1, (tl) => A.reach([0.4 + 0.05 * Math.sin(tl * 4), 1.05], [0.25, 1.0], { gripN: 0.8, head: 0.2 })));   // load magnets into the actuator press
    return (t) => A.run(segs, s24(t)); })();
  TF.room({ id: '7A', period: 24, box: L.roomById('7A').box,
    ports: { D7AB: 'out', 'PT-7': 'in', 'W3-7': 'pass', 'SS-7': 'spare', SL71: 'out' },
    actors: ['7A.actuatorPress', '7A.testRig', '7A.lineFeeder'],
    flows: [{ item: 'magnets + motors (capsule)', from: 'DOCK', via: ['PT-7'], to: '7A', sink: 'actuators' },
      { item: 'actuators (feeder)', from: '7A', via: ['D7AB'], to: '7B', sink: 'hands + heads' },
      { item: 'even Optimus (chute + slide)', from: '7A', via: ['SL71'], to: '1B', sink: 'crated' }],
    back(ctx, t, theme, lod) {
      const s = s24(t);
      X.upper(ctx, yF, ceil, t, lod, { duct: [1400, 1700, 4.3], fans: [1460], pipes: [1400, 1820, 3.7], valves: [1520, 1760], lamps: [1500, 1700] });
      D.rect(ctx, 1470, hY(1.85), 20, 16, '#dfe4e8', '#7b848c', 1);                                // PT receiver
      X.press(ctx, 1560, yF, 0.8, 1.9, TF.pulse(TF.mod(t, 3), 0.4, 1.6, 0.3), lod);
      D.rect(ctx, 1600, hY(1.0), 50, 0.9 * M, '#d5dade', '#7b848c', 1);                           // test rig
      const a = t * Math.PI * 4; D.circle(ctx, 1625, hY(1.2), 7, '#9aa1a8', '#4a5056', 1);
      if (lod !== 'far') D.line(ctx, [[1625, hY(1.2)], [1625 + Math.cos(a) * 6, hY(1.2) + Math.sin(a) * 6]], '#e5e7eb', 1);
      D.rect(ctx, 1719, hY(0.9) + 4, 4, yF - (hY(0.9) + 4), '#8a939b');
      D.rect(ctx, 1747, hY(0.9) + 4, 4, yF - (hY(0.9) + 4), '#8a939b');
      D.rect(ctx, 1715, hY(0.9), 40, 4, '#9aa3ab'); if (lod !== 'far' && (s < 1.0 || s >= 18)) for (let i = 0; i < 4; i++) D.rect(ctx, 1720 + i * 9, hY(0.9) - 8, 6, 8, '#6b737b', '#2b2f34', 0.5);
      if (lod !== 'far' && (s >= 19.9 || s < 0.6)) IT.tote(ctx, 1705, hY(0.9));
      // SL71 chute inlet in the west wall (the chute crosses the core to the SS spiral)
      TF.tube.draw(ctx, TF.track.path(TF.SL71.pts.slice(0, 2)), lod);
      D.rect(ctx, 1360, hY(0.5), 22, 0.5 * M, '#e9d9a8', '#c9b071', 1);
      K.cabinet(ctx, 1790, yF - 46, 18, 46, t, 71, lod);
    },
    draw() {},
    front(ctx, t, theme, lod) { if (lod === 'far') return; const st = feeder(t), f = A.draw(ctx, st, yF), s = s24(t);
      if ((s >= 0.6 && s < 6.2) || (s >= 6.7 && s < 10.2) || (s >= 11.3 && s < 20)) { const w = f.w(f.sk.wristN); IT.tote(ctx, w[0], w[1] + 6); } } });

  // ================= 7B hands + heads =================
  TF.room({ id: '7B', period: 24, box: L.roomById('7B').box,
    ports: { D7AB: 'in', D7BC: 'out', F7R: 'pass' },
    actors: ['7B.fingerArm', '7B.visorArm', 'peek.shiba7B'],
    flows: [{ item: 'actuators', from: '7A', via: ['D7AB'], to: '7B', sink: 'fingers + head' },
      { item: 'sensors (window drone capsule)', from: 'LAWN', via: ['O7E'], to: '7B', sink: 'cameras in the head' },
      { item: 'hand + head sets (feeder)', from: '7B', via: ['D7BC'], to: '7C', sink: 'on the robot' }],
    back(ctx, t, theme, lod) {
      const s = s12(t);
      X.upper(ctx, yF, ceil, t, lod, { duct: [1850, 2150, 4.2], fans: [2100], tray: [1850, 2100, 3.5], lamps: [1950, 2150] });
      D.rect(ctx, 1958, hY(4.55), 10, hY(4.2) - 20 - hY(4.55), '#e3e7eb', '#9aa3ab', 0.8);   // collar up to the floor trunk
      D.rect(ctx, 1950, hY(4.2) - 20, 26, 9, '#c9d0d6', '#7b848c', 1);                                // vent box (Shiba peek)
      D.rect(ctx, 1990, hY(2.15), 20, 16, '#dfe4e8', '#7b848c', 1);                                   // sensor receiver
      D.rect(ctx, 2060, hY(0.9), 220, 5, '#9aa3ab', '#6d757d', 0.8);
      if (lod !== 'far' && s24(t) >= 6.2 && s24(t) < 6.7) IT.tote(ctx, 2205, hY(0.9));
      for (const x of [2070, 2275]) D.rect(ctx, x, hY(0.9) + 5, 4, 0.86 * M, '#8a939b');
      if (lod !== 'far') { D.circle(ctx, 2110, hY(0.9) - 9, 9, '#f3f4f5', '#2c3136', 1); D.circle(ctx, 2112, hY(0.9) - 10, 6, '#0b0d10'); // head on its jig
        for (let i = 0; i < 4; i++) D.rect(ctx, 2150 + i * 5, hY(0.9) - 10 - 3 * Math.min(1, TF.ramp(s, 1 + i * 2, 2 + i * 2)), 3, 10, '#141619'); }   // fingers going in
      const tip1 = [2160 + 10 * Math.sin(t * Math.PI), hY(1.1)], tip2 = [2112, hY(1.0) + 4 * Math.sin(t * Math.PI * 2)];
      K.arm(ctx, [2200, yF], tip1, { l1: 34, l2: 30, toolAng: Math.PI / 2, bend: 1, tool: 6 }); K.arm(ctx, [2080, hY(2.6)], tip2, { l1: 30, l2: 28, hang: true, bend: -1, toolAng: Math.PI / 2, tool: 6 });
      D.rect(ctx, 2066, ceil, 2, (hY(2.6) - 4) - ceil, '#9aa3ab');
      D.rect(ctx, 2114, ceil, 2, (hY(2.6) - 4) - ceil, '#9aa3ab');
      D.rect(ctx, 2060, hY(2.6) - 4, 60, 4, '#9aa3ab');
      K.cabinet(ctx, 1860, yF - 46, 18, 46, t, 73, lod);
    },
    draw() {}, front() {} });

  // ================= 7C body build =================
  TF.room({ id: '7C', period: 12, box: L.roomById('7C').box,
    ports: { D7BC: 'in', D7CD: 'out', F7R: 'both', 'PT-7': 'in' },
    actors: ['7C.buildStand', '7C.armL', '7C.armR'],
    flows: [{ item: 'hand + head sets', from: '7B', via: ['D7BC'], to: '7C', sink: 'on the robot' },
      { item: 'Optimus packs (basket)', from: '3B', via: ['F3R', 'W3-3', 'W3-7', 'F7R'], to: '7C', sink: 'in the robot' },
      { item: 'computers (capsule)', from: '9B', via: ['PT-7'], to: '7C', sink: 'in the robot' },
      { item: 'new robot', from: '7C', via: ['D7CD'], to: '7D', sink: 'activation' }],
    back(ctx, t, theme, lod) {
      const s = s12(t);
      X.upper(ctx, yF, ceil, t, lod, { duct: [2330, 2520, 4.2], fans: [2380], pipes: [2600, 2780, 3.7], valves: [2700], lamps: [2450, 2700] });
      D.rect(ctx, 2410, hY(2.05), 20, 16, '#dfe4e8', '#7b848c', 1);                                     // computer receiver
      X.rack(ctx, 2340, yF, 0.9, 1.3, 2, 3, (c, x, y) => IT.pack(c, x + 4, y), lod);
      D.rect(ctx, 2434, hY(1.0) + 4, 4, yF - (hY(1.0) + 4), '#8a939b');
      D.rect(ctx, 2472, hY(1.0) + 4, 4, yF - (hY(1.0) + 4), '#8a939b');
      D.rect(ctx, 2430, hY(1.0), 50, 4, '#9aa3ab'); if (lod !== 'far') { const held7C = TF.elonTour && TF.elonTour.holding7C(t); for (let i = 0; i < 2; i++) { if (i === 0 && held7C) continue; IT.tote(ctx, 2445 + i * 22, hY(1.0)); }   // left tote (2445) is drawn by floor9 while Elon holds it
       if (s >= 10.2 && s < 11.3) IT.tote(ctx, 2420, hY(1.0)); }
      D.rect(ctx, STAND - 30, yF - 6, 60, 6, '#7b848c'); D.rect(ctx, STAND - 34, hY(2.2), 6, 2.2 * M, '#9aa3ab'); D.rect(ctx, STAND - 34, hY(2.2), 26, 5, '#9aa3ab');
      K.cabinet(ctx, 2750, yF - 46, 16, 46, t, 75, lod);
    },
    draw() {},
    front(ctx, t, theme, lod) {
      if (lod === 'far') return;
      const s = s12(t), tg = s < 2 ? hY(0.55) : s < 4.5 ? hY(1.15) : s < 6 ? hY(1.35) : s < 7.5 ? hY(1.6) : hY(1.0), on = s >= 0.3 && s < 8.6;
      const tl = [STAND - 20 + 6 * Math.sin(t * Math.PI * 2), tg], tr = [STAND + 18, tg + 4 * Math.sin(t * Math.PI * 2)];
      K.arm(ctx, [STAND - 70, yF], on ? tl : [STAND - 60, hY(1.0)], { l1: 40, l2: 36, toolAng: 0.2, bend: -1, tool: 8 });
      K.arm(ctx, [STAND + 65, yF], on ? tr : [STAND + 55, hY(1.0)], { l1: 40, l2: 36, toolAng: Math.PI - 0.2, bend: 1, tool: 8 });
    } });

  // ================= 7D wake-up + walk test (bay Optimus) =================
  const OB = 3045;
  const bay = (() => {
    const head = A.reach([0.3, 1.62], null, { gripN: 0.4, head: -0.1 }), cons = A.reach([0.45, 1.0], null, { gripN: 0.6, lean: 0.15 });
    const segs = [A.hold(1.5, OB, -1, (tl) => Object.assign(A.idle(tl), { head: 0.1 })), A.keyed(1.5, OB, -1, [[0, A.stand()], [0.3, head], [0.8, head], [1, A.stand()]]),
      A.turn(0.3, OB, -1), A.keyed(1.5, OB, 1, [[0, A.stand()], [0.4, cons], [1, cons]]),
      A.walk(1.8, OB, 3082, { step: 0.6 }), A.hold(2.4, 3082, 1, (tl) => A.reach([0.46 + 0.03 * Math.sin(tl * 6), 1.38 + 0.04 * Math.sin(tl * 6 + 1)], null, { gripN: 0.7, head: -0.15 })),   // wipe the 7D pad screen (x 3105-3135, hY~1.2-1.5 m): hand lands at x~3105 on its glass
      A.turn(0.3, 3082, 1), A.walk(1.8, 3082, OB, { step: 0.6 })];
    segs.push(A.turn(12 - A.total(segs), OB, -1));
    return (t) => A.run(segs, s12(t)); })();
  TF.room({ id: '7D', period: 12, box: L.roomById('7D').box,
    ports: { D7CD: 'in', D7DE: 'out', F7R: 'pass' },
    actors: ['7D.pad', '7D.treadmill', '7D.bayOptimus'],
    flows: [{ item: 'new robot', from: '7C', via: ['D7CD'], to: '7D', sink: 'activated + walk-tested' },
      { item: 'odd robots (crew)', from: '7D', via: ['D7DE'], to: '7E', sink: 'S78 stair to 8E' },
      { item: 'even robots (walk lane)', from: '7D', via: ['D7CD', 'D7BC', 'D7AB'], to: '7A', sink: 'SL71 chute' }],
    back(ctx, t, theme, lod) {
      const s = s12(t);
      X.upper(ctx, yF, ceil, t, lod, { duct: [2810, 3260, 4.2], fans: [2860, 3200], tray: [2810, 3100, 3.5], lamps: [2950, 3150] });
      const tread = s >= 3 && s < 8, glow = s < 1.5;
      X.belt(ctx, PAD - 45, PAD + 45, yF, 0.12, tread ? -t * 40 : 0, lod);
      if (glow) { ctx.globalAlpha = 0.35; D.rect(ctx, PAD - 40, yF - 10, 80, 4, '#4da3ff'); ctx.globalAlpha = 1; }
      D.rect(ctx, 3110, hY(1.1), 20, 1.1 * M, '#d5dade', '#7b848c', 1); D.screen(ctx, 3105, hY(1.5), 30, 16, (x, y, w, h) => { if (tread) for (let i = 0; i < 5; i++) D.rect(ctx, x + 3 + i * 5, y + h - 3 - 8 * TF.hash(i, Math.floor(t * 4) % 192), 3, 8 * TF.hash(i, Math.floor(t * 4) % 192), '#4ade80'); });
      K.cabinet(ctx, 2820, yF - 46, 18, 46, t, 77, lod);
    },
    draw() {},
    front(ctx, t, theme, lod) { if (lod === 'far') return; A.draw(ctx, bay(t), yF); } });

  // ================= 7E drone window bay + S78 stair =================
  TF.room({ id: '7E', period: 24, box: L.roomById('7E').box,
    ports: { D7DE: 'in', S78: 'out', O7E: 'in', SL97: 'pass', F7R: 'pass' },
    actors: ['7E.stairGate', 'peek.wave7E'],
    flows: [{ item: 'crew-up robots', from: '7E', via: ['S78'], to: '8E', sink: 'sky-bridge' }, { item: 'robots', from: '7D', via: ['D7DE'], to: '7E', sink: 'stair' },
      { item: 'injector sets (window drone capsule)', from: 'LAWN', via: ['O7E', 'H78'], to: '8D', sink: 'Raptor service' }],
    back(ctx, t, theme, lod) {
      X.upper(ctx, yF, ceil, t, lod, { duct: [3290, 3540, 4.4], fans: [3330], pipes: [3290, 3540, 3.8], valves: [3400], lamps: [3400] });
      // stair S78 up through the slab hole
      for (let i = 0; i <= 10; i++) { const k = i / 10; D.rect(ctx, TF.lerp(STAIR[0] - 10, STAIR[1], k), TF.lerp(yF, yF8, k) - 2, 16, 3, '#9aa3ab'); }
      D.line(ctx, [[STAIR[0] - 10, yF], [STAIR[1] + 6, yF8]], '#7b848c', 2);
      // catwalk along the window wall (wave-peek hatch), drone window
      D.rect(ctx, 3300, ceil, 2, (hY(3.0)) - ceil, '#9aa3ab');
      D.rect(ctx, 3480, ceil, 2, (hY(3.0)) - ceil, '#9aa3ab');
      D.rect(ctx, 3290, hY(3.0), 200, 5, '#9aa3ac', '#6d757d', 1); D.line(ctx, [[3290, hY(3.0) - 22], [3490, hY(3.0) - 22]], '#9aa3ac', 1.5);
      for (let x = 3292; x <= 3490; x += 25) D.line(ctx, [[x, hY(3.0) - 22], [x, hY(3.0)]], '#b9c0c7', 1);
      D.rect(ctx, 3741, hY(4.4), 18, 1.6 * M, '#dbeefc', '#7b848c', 1.2);
      // tube console (Elon tweaks it on his tour: lamps race and the riser whooshes)
      const tw = TF.elonTour && TF.elonTour.at7E(t);
      D.rect(ctx, 3513, hY(1.65), 54, 1.65 * M, '#334155', '#1e293b', 1);
      for (let i = 0; i < 3; i++) D.rect(ctx, 3520 + i * 16, hY(1.55), 12, 10, tw && (Math.floor(t * 6) + i) % 3 === 0 ? '#4ade80' : '#38bdf8');
      D.circle(ctx, 3551, hY(1.15), 4, '#0f172a', '#94a3b8', 1);                                                                    // lever pivot
      D.line(ctx, [[3551, hY(1.15)], [3551 + (tw ? 8 : -8), hY(1.15) - (tw ? 8 : 10)]], '#e2e8f0', 2);                              // lever flips on tour
      if (tw && lod !== 'far') { ctx.globalAlpha = 0.35 + 0.2 * Math.sin(t * Math.PI * 8); D.rect(ctx, 3516, hY(1.5), 48, 6, '#67e8f9'); ctx.globalAlpha = 1; }
      K.cabinet(ctx, 3300, yF - 46, 18, 46, t, 79, lod);
    },
    draw() {}, front() {} });

  TF.peek({ id: 'shiba7B', owner: '7B', kind: 'shiba', P: 151, offset: 11, dur: 5, x: 1963, y: hY(4.2) - 20, face: 1 });
  TF.peek({ id: 'wave7E', owner: '7E', kind: 'wave', P: 163, offset: 23, dur: 5.5, x: 3420, y: hY(3.0), face: 1 });
})(typeof window !== 'undefined' ? window : globalThis);
