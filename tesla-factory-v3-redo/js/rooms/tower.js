// Tower + sky-bridge end + chopsticks + tower lift (FACTORY-MAP §5, §6). Faces do not cross:
// north/east = TL (G, BR, CG); south/front = CS (G, BR, ENG); west face is plain.
(function (G) {
  const TF = G.TF, L = TF.layout, D = TF.draw, K = TF.kit, A = TF.act, M = TF.M, IT = TF.supply.items;
  TF.claimedZones = Object.assign(TF.claimedZones || {}, { TOWER: 1 });
  const T = L.zoneById('TOWER').box, G0 = L.G;
  const CX = T.x + T.w / 2, yBR = L.floorY(8), yG = G0, yCG = TF.stage3.deckY(TF.stage3.DCK.header) - 6;
  const yENG = TF.stage3.deckY(TF.stage3.DCK.eng) + 20;
  const s24 = (t) => TF.mod(t, 24), s48 = (t) => TF.mod(t, 48);
  const BRX = 4490;   // trolley handoff (matches floor8 trolleyX)

  // CS carriage y vs 48 s schedule
  // A: 0-6 wait BR, 6-7 take ring, 7-11 down to G, 11-12 ring onto transporter, 12-16 to ENG,
  //    16-22 pull old Raptor, 22-24 up to BR
  // B: 0-6 wait, 6-7 swap, 7-8 down to ENG, 8-13 install, 13-14 up to BR, 14-24 parked
  const DECK = 1.1 * M, yRingG = G0 - DECK - 1.3 * M;   // R3-2: transporter deck top 1.1 m
  const csY = (u) => TF.keys(u, [
    [0, yBR], [6, yBR], [7, yBR], [11, yRingG], [12, yRingG], [16, yENG], [22, yENG], [24, yBR],
    [30, yBR], [31, yBR], [32, yENG], [37, yENG], [38, yBR], [48, yBR]
  ]);
  TF.stage3.csRelease = { x: T.x + 40, y: csY(37) + 20 };   // where the CS lets go of the serviced Raptor at u48 37 (ship.js carries it on to the empty mount)
  // ---- finished odd Optimus (hand-off from 7C robotAt at t mod 24 = 20.5): sky-bridge -> TL -> CG -> arm -> ship alcove ----
  // a = seconds since hand-off. 0-14 walk 3800->car, 14-19.6 ride BR->CG, 19.6-23 walk arm + hatch -> alcove, 23-25.5 in alcove, door shut 25.5
  const CR0 = 20.5, SB = L.zoneById('SHIP').box, ALC = TF.stage3.alc, CARX = T.x + T.w - 14;
  const ALCX = SB.x + ALC.x0 + ALC.pitch * ALC.pick + ALC.w / 2;
  const crewA = (t) => TF.mod(t - CR0, 24);
  const idleF = (tl) => A.idle(tl);
  const fcC = [0.35, 1.05], fcIdle = (tl) => Object.assign(A.carry(A.idle(tl), fcC, 0.3), { head: -0.05 - 0.3 * Math.max(0, Math.sin(tl * Math.PI / 2)) });   // waiting for the TL car: glance up at its level indicator every 4 s
  const cLook = (p) => (tl) => Object.assign({}, p, { head: -0.05 - 0.3 * Math.max(0, Math.sin(tl * Math.PI / 2)) });
  const crewSegs = [A.walk(14, 3800, CARX, { step: 0.62, carry: fcC, carryW: 0.3 }), A.hold(5.6, CARX, 1, fcIdle), A.walk(3.4, CARX, ALCX, { step: 0.6, carry: fcC, carryW: 0.3 }), A.hold(2.5, ALCX, 1, idleF)];
  const carY = (a) => {   // TL car y vs a (24 s period): G rest, up to BR for the robot, ride to CG, back down to G
    if (a < 2.6) return TF.lerp(yCG, yG - 8, TF.ramp(a + 24, 23.3, 26.6));
    if (a < 8) return yG - 8;
    if (a < 13) return TF.lerp(yG - 8, yBR, TF.ramp(a, 8, 13));
    if (a < 14.6) return yBR;
    if (a < 19.6) return TF.lerp(yBR, yCG, TF.ramp(a, 14.6, 19.6));
    if (a < 23.3) return yCG;   // dwell for the outbound crew robot to board
    return TF.lerp(yCG, yG - 8, TF.ramp(a, 23.3, 26.6));
  };
  const tlY = (u) => carY(TF.mod(u - CR0, 24));
  // 42 gag (beat k=1): this robot lifts the plate off the TL car floor (a 14-16), carries it, bolts it on the west skirt in stride (a 20.5-21.1); same route timing
  const XB = SB.x - 34, cBend = A.reach([0.26, 0.2], [0.18, 0.25], { lean: 0.35, hipY: 0.8, gripN: 0.8 }), cCarry = A.carry(A.stand(), [0.36, 1.0], 0.3);
  const cBolt = A.reach([0.5, 0.0], [0.35, 0.3], { lean: 0.35, hipY: 0.82, gripN: 0.8 });
  const crewSegsG = [A.walk(14, 3800, CARX, { step: 0.62, carry: fcC, carryW: 0.3 }), A.keyed(2.0, CARX, 1, [[0, A.stand()], [0.45, cBend], [0.55, cBend], [1, cCarry]]), A.hold(3.6, CARX, 1, cLook(cCarry)),
    A.walk(0.9, CARX, XB, { step: 0.6, carry: [0.36, 1.0], carryW: 0.3 }), A.keyed(0.6, XB, 1, [[0, cCarry], [0.45, cBolt], [0.6, cBolt], [1, A.stand()]]),
    A.walk(1.9, XB, ALCX, { step: 0.8 }), A.hold(2.5, ALCX, 1, idleF)];
  const crewAt = (a, t0) => {   // t0 = absolute start time of this robot's 24 s walk
    if (a < 0 || a >= 25.5) return null;   // TODO C6: ship.js takes over inside the alcove (robot stays visible at ALCX until then)
    const gag = TF.fortyTwo(t0 + 15).k === 1;
    const kk = Math.round((t0 - 32.5) / 12), id = 'crew-' + TF.mod(Math.round((kk - 1) / 2), 2);   // same actor as the F7 odd robot it continues
    return { st: Object.assign(A.run(gag ? crewSegsG : crewSegs, a, 0.25, false), { id }), y: a < 14 ? yBR : a < 19.6 ? carY(a) : yCG, gag, fc: a < 22.78 };
  };
  TF.stage3.crewUp = {
    list: (t) => { const a = crewA(t), r = [crewAt(a, t - a), crewAt(a + 24, t - a - 24)]; return r.filter(Boolean); },
    closeFrac: (t) => { const a = crewA(t); return a < 1.5 ? TF.ramp(a, 0, 1.5) : a < 20 ? 1 : a < 21.5 ? 1 - TF.ramp(a, 20, 21.5) : 0; },
    hatch: (t) => { const a = crewA(t); return a < 18.5 ? 0 : a < 19.5 ? TF.ramp(a, 18.5, 19.5) : a < 22 ? 1 : a < 23 ? 1 - TF.ramp(a, 22, 23) : 0; }
  };
  // outbound crew (C6; same walk as ship.js's alcove exit): hatch -> arm -> TL car (boards 23.3, rides to G) -> west along the ground. rr = seconds since the crew-up hand-off clock
  const WEND = 5400,   // R3-core-crewout: walks EAST along the ground in front of the launch mount, empty crate in hand, until fully off the world's east edge (L.W 5300 + 40)
     crewOutSegs = (() => {
    const X0 = SB.x, crateX = X0 + SB.w / 2 + 70, AX0 = X0 + ALC.x0 + ALC.w / 2, cb = { step: 0.62, carry: fcC, carryW: 0.3 };
    return [A.hold(1.0, AX0, 1), A.walk(2.4, AX0, crateX - 12, { step: 0.5 }), A.keyed(1.0, crateX - 12, 1, [[0, A.stand()], [0.5, cBend], [1, cCarry]]),
      A.turn(0.4, crateX - 12, 1, () => cCarry), A.walk(3.2, crateX - 12, X0 - 26, cb), A.walk(2.3, X0 - 26, CARX, cb), A.hold(4.7, CARX, -1, cLook(cCarry)),
      A.walk(12.5, CARX, WEND, { step: 0.55, carry: fcC, carryW: 0.3 })];   // ~58 px/s = 1.16 m/s
  })(), crewOutEnd = 12 + A.total(crewOutSegs);
  const crewOutAt = (rr, id) => {
    if (rr < 12 || rr >= crewOutEnd) return null;
    const y = rr < 23.3 ? yCG : rr < 27 ? carY(rr) : TF.lerp(yG - 8, yG, TF.ramp(rr, 27, 27.6));
    return { st: Object.assign(A.run(crewOutSegs, rr - 12, 0.25, false), { id }), y, fc: rr >= 15.9, fcK: TF.ramp(rr, 15.9, 16.4) };
  };
  TF.stage3.crewOut = { at: crewOutAt };
  // tile Optimus (24 s): restack 0-3, pick 3-5.4, carry to the fixture 5.4-10.4, fit 10.4-12 / press 12-14.6, withdraw, carry back, set on pile
  const TP = T.x - 64, TFX = 4696, TC = [0.36, 1.0], QDP = 4725, CART = 4664;
  const tBend = A.reach([0.55, 0.5], [0.4, 0.45], { lean: 0.35, hipY: 0.8, gripN: 0.8 });
  const tCar = A.carry(A.stand(), TC, 0.3), tFit0 = A.reach([0.38, 1.03], [0.26, 1.0], { gripN: 0.9, lean: 0.1 });
  const tSq = (tl) => A.reach([0.55 + 0.03 * Math.sin(tl * 3), 0.5], [0.4, 0.45 + 0.04 * Math.sin(tl * 3 + 1)], { lean: 0.35, hipY: 0.8, gripN: 0.8 });
  const tSegs = [A.hold(3, TP, 1, tSq), A.keyed(2.4, TP, 1, [[0, tBend], [0.5, tBend], [1, tCar]]),
    A.walk(5, TP, TFX, { step: 0.5, carry: TC, carryW: 0.3 }), A.keyed(1.6, TFX, 1, [[0, tCar], [1, tFit0]]),
    A.hold(2.6, TFX, 1, (tl) => A.reach([0.38, 1.03 + 0.02 * Math.sin(tl * 5)], [0.26, 1.0], { gripN: 0.9, lean: 0.1 })),
    A.keyed(1.4, TFX, 1, [[0, tFit0], [1, tCar]]), A.turn(0.6, TFX, 1, () => tCar),
    A.walk(5, TFX, TP, { step: 0.5, carry: TC, carryW: 0.3 }), A.turn(0.6, TP, -1, () => tCar),
    A.keyed(1.8, TP, 1, [[0, tCar], [0.5, tBend], [1, tBend]])];

  // 42 gag variants of the tile cycle (same 24 s, same start/end pose). V1 = beat k=0: after the fit check fetch the bent plate by the QD, carry it on top of the tile,
  // set the tile on the pile and hammer the plate straight. V2 = beat k=1: plate from the pile onto the TL car (at G until u 4.5), then a compressed tile run.
  const tPick = A.reach([TC[0] + 0.105, TC[1] - 0.02], [0.38, 0.1], { lean: 0.35, hipY: 0.8, gripN: 0.8, gripF: 0.9 });
  const tPickM = A.reach([0.55, 0.5], [0.35, 0.05], { lean: 0.35, hipY: 0.8, gripF: 0.9 });
  const tTap = (tl) => A.reach([0.5, 0.55], [0.66, 0.55 + 0.25 * (0.5 - 0.5 * Math.cos((2 * Math.PI) * (tl - 0.25) / 0.5))], { lean: 0.3, hipY: 0.8, gripN: 0.8, gripF: 1 });
  const tPlace = A.reach([0.46, 0.2], [0.3, 0.3], { lean: 0.3, hipY: 0.85, gripN: 0.8 });
  const tFitShake = (tl) => A.reach([0.38, 1.03 + 0.02 * Math.sin(tl * 5)], [0.26, 1.0], { gripN: 0.9, lean: 0.1 });
  const fill = (segs) => { segs.push(A.hold(24 - A.total(segs), TP, 1, tSq)); return segs; };
  const tSegs1 = fill([A.hold(1.0, TP, 1, tSq), A.keyed(1.6, TP, 1, [[0, tBend], [0.5, tBend], [1, tCar]]),
    A.walk(4.4, TP, TFX, { step: 0.5, carry: TC, carryW: 0.3 }), A.keyed(1.2, TFX, 1, [[0, tCar], [1, tFit0]]), A.hold(1.0, TFX, 1, tFitShake),
    A.keyed(0.8, TFX, 1, [[0, tFit0], [1, tCar]]), A.walk(0.7, TFX, QDP, { step: 0.5, carry: TC, carryW: 0.3 }),
    A.keyed(1.5, QDP, 1, [[0, tCar], [0.5, tPick], [0.7, tPick], [1, tCar]]), A.turn(0.6, QDP, 1, () => tCar),
    A.walk(5.4, QDP, TP, { step: 0.5, carry: TC, carryW: 0.3 }), A.turn(0.6, TP, -1, () => tCar),
    A.keyed(1.4, TP, 1, [[0, tCar], [0.5, tBend], [1, tBend]]), A.keyed(0.8, TP, 1, [[0, tBend], [1, tPickM]]), A.hold(1.5, TP, 1, tTap),
    A.keyed(0.9, TP, 1, [[0, tTap(1.5)], [0.5, tPickM], [1, tBend]])]);
  const tSegs2 = fill([A.keyed(1.0, TP, 1, [[0, tBend], [0.5, tBend], [1, tCar]]), A.walk(2.9, TP, CART, { step: 0.6, carry: TC, carryW: 0.3 }),
    A.keyed(0.8, CART, 1, [[0, tCar], [0.45, tPlace], [0.55, tPlace], [1, tCar]]), A.turn(0.5, CART, 1, () => tCar), A.walk(3.0, CART, TP, { step: 0.6 }),
    A.turn(0.4, TP, -1), A.keyed(1.2, TP, 1, [[0, tBend], [0.5, tBend], [1, tCar]]), A.walk(3.2, TP, TFX, { step: 0.7, carry: TC, carryW: 0.3 }),
    A.keyed(0.8, TFX, 1, [[0, tCar], [1, tFit0]]), A.hold(0.8, TFX, 1, tFitShake), A.keyed(0.7, TFX, 1, [[0, tFit0], [1, tCar]]), A.turn(0.4, TFX, 1, () => tCar),
    A.walk(3.2, TFX, TP, { step: 0.7, carry: TC, carryW: 0.3 }), A.turn(0.4, TP, -1, () => tCar), A.keyed(1.2, TP, 1, [[0, tCar], [0.5, tBend], [1, tBend]])]);
  const TILE = [{ segs: tSegs, hand: [4.2, 23.1], led: [12, 14.6] }, { segs: tSegs1, hand: [1.8, 19.5], led: [8.2, 9.2] }, { segs: tSegs2, hand: [9.2, 19.9], led: [13.8, 14.6] }];

  TF.transport({ id: 'Tower', period: 48, layer: 'main', box: { x: 3300, y: T.y - 40, w: T.x - 80 + T.w + 200 - 3300, h: T.h + 80 },   // west edge 3300: owns the sky-bridge walk (3800->CARX) and the crew-out walk into 1E (ends before the 48 s wrap)
    draw(ctx, t, theme, lod) {
      const u = s24(t), u48 = s48(t);
      // lattice
      D.rect(ctx, T.x, T.y, T.w, T.h, '#e8ebef', '#9aa3ab', 2);
      for (let y = T.y; y < T.y + T.h - 40; y += 70) {
        D.line(ctx, [[T.x, y], [T.x + T.w, y + 70]], '#c3c9d0', 1.4);
        D.line(ctx, [[T.x + T.w, y], [T.x, y + 70]], '#c3c9d0', 1.4);
        D.line(ctx, [[T.x, y + 70], [T.x + T.w, y + 70]], '#d0d5da', 1);
      }
      // west face stays plain (no extra ladder)
      // east face: TL rail
      D.rect(ctx, T.x + T.w - 18, T.y + 10, 10, T.h - 20, '#cbd5e1', '#64748b', 1);
      const ty = tlY(u);
      D.rect(ctx, T.x + T.w - 28, ty - 96, 28, 96, '#94a3b8', '#334155', 1.2);
      D.rect(ctx, T.x + T.w - 24, ty - 92, 20, 16, '#bae6fd', '#64748b', 0.8);
      // south/front face: CS rail + carriage
      D.rect(ctx, T.x + 8, T.y + 10, 8, T.h - 20, '#94a3b8', '#334155', 1);
      const cy = csY(u48);
      // chopsticks: boom pivots at the carriage, tips reach OUT to the trolley deck (k=1), clamp, lift, fold home (k=0), carry; release at the transporter
      const RR = 1.3 * M, rampU = (a0, a1) => TF.ramp(u48, a0, a1), hx = T.x + 40;
      const ringW = u48 >= 6 && u48 < 12, oldR = u48 >= 16 && u48 < 30.5, newR = u48 >= 30.5 && u48 < 37;
      const kRing = Math.max(rampU(5.2, 6) - rampU(6.9, 7.9), 0), kRap = Math.max(rampU(29.5, 30.1) - rampU(30.5, 31), 0);
      const k = u48 < 12 ? kRing : kRap;
      const lf = 14 * rampU(6.5, 6.9) * (1 - rampU(6.9, 7.9));                          // ring lifted clear of the cart (cart stays)
      const rel = u48 >= 11 && u48 < 12.6 ? rampU(11.5, 11.9) * (1 - rampU(12.1, 12.5)) : 0;   // prongs slide out from the ring after it sits on the transporter
      const hov = (24 * k * (1 - rampU(30.1, 30.5))) * (u48 >= 29.5 && u48 < 30.5 ? 1 : 0) + (u48 >= 30.5 && u48 < 31 ? 24 * rampU(30.5, 30.8) * k : 0);
      const ringY = TF.lerp(cy, yBR - 12 - RR, k) - lf, rapY = TF.lerp(cy + 20, yBR - 12, k) - hov;
      const pX = TF.lerp(hx, BRX, k) - 30 * rel, payY = (u48 >= 6 && u48 < 12) ? ringY : (oldR || newR) ? rapY - 20 : cy;
      const tipY = payY - 12, jaw = (ringW && u48 < 11.5) ? rampU(6, 6.5) : (oldR || newR) ? (u48 >= 29.5 && u48 < 30.5 ? 1 - rampU(30.1, 30.5) : u48 >= 30.5 && u48 < 31.2 ? rampU(30.5, 30.8) : 1) : 0;
      D.rect(ctx, T.x + 4, cy - 14, 16, 28, '#64748b', '#1e293b', 1);
      for (const o of [-6, 6]) D.line(ctx, [[T.x + 20, cy + o], [pX, tipY + o * 0.6]], '#475569', 5);
      D.rect(ctx, pX - 3, tipY - 10, 6, 12 + 10 * jaw, '#334155');   // hook jaw drops over the rim as it closes
      const drawRing = (x, y) => {
        ctx.beginPath(); ctx.arc(x, y, RR, 0, Math.PI * 2); ctx.strokeStyle = '#6b737b'; ctx.lineWidth = 8; ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, RR, 0, Math.PI * 2); ctx.strokeStyle = '#c3c9cf'; ctx.lineWidth = 5; ctx.stroke();
        if (lod !== 'far') IT.crate(ctx, x, y + 8);
      };
      if (ringW) drawRing(pX + 0, u48 >= 11.5 ? cy : ringY);   // on cart -> on hook -> on transporter deck (u12)
      if (oldR || newR) TF.stage3.raptor(ctx, pX, rapY, { pump: 1 });

      // ship QD arm (tower to ship hatch) at CG height: extended while the crew robot crosses (u 10.5-18.6)
      const armY = yCG - 20, armL = 50 + 26 * (TF.ramp(u, 9.5, 10.5) - TF.ramp(u, 18.6, 19.6));
      D.rect(ctx, T.x + T.w, armY - 5, armL, 10, '#7b848c', '#2b2f34', 1);
      D.rect(ctx, T.x + T.w, yCG, armL, 5, '#9aa3ab', '#2b2f34', 0.8);   // walkway
      if (lod !== 'far') for (const r of TF.stage3.crewUp.list(t)) if (r.st.x < SB.x) { const f = A.draw(ctx, r.st, r.y); if (r.gag) TF.gag42.held(ctx, t, 'crew', f); if (r.fc) { const w = f.w(f.sk.wristN); IT.foodcrate(ctx, w[0], w[1] + 5); } }

    } });

  // R3-2: self-propelled heavy transporter (SPMT-style flatbed + driver cab) at yard scale: 7.5 m long, wheels r 0.45 M, deck 1.1 m, cab 2.6 m.
  // Parked 47.5-19.5 (ring aboard 12-19.5), drives east 19.5-23.5 (~5 m/s avg) until fully past the world edge, returns empty 43.5-47.5. Main layer: in front of the mount, behind the tower-foot walkers (registered before them).
  const VX0 = T.x + 40, VX_OFF = 5600, VR = 0.45 * M;   // vx = ring-centre x
  TF.transport({ id: 'Ring-transporter', period: 48, layer: 'main', box: { x: 4300, y: G0 - 140, w: 1500, h: 170 },
    draw(ctx, t, theme, lod) {
      const u = s48(t);
      let vx, hasRing = false;
      if (u >= 43.5 && u < 47.5) vx = TF.lerp(VX_OFF, VX0, TF.ramp(u, 43.5, 47.5));
      else if (u >= 47.5 || u < 19.5) { vx = VX0; hasRing = u >= 12 && u < 19.5; }
      else if (u < 23.5) { vx = TF.lerp(VX0, VX_OFF, TF.ramp(u, 19.5, 23.5)); hasRing = true; }
      else return;
      if (vx - 230 >= 5300 + 4) return;   // fully past the world edge
      const dT = G0 - DECK;
      D.rect(ctx, vx - 230, dT, 315, 18, '#64748b', '#1e293b', 1);   // flatbed
      D.rect(ctx, vx - 222, dT + 18, 300, 8, '#334155');              // bogie frame
      for (let i = 0; i < 7; i++) {                                   // wheel pairs (side view), turn with distance
        const wx = vx - 205 + 48 * i, a = (vx - VX0) / VR;
        D.circle(ctx, wx, G0 - VR, VR, '#1f2937', '#0f172a', 1);
        D.circle(ctx, wx, G0 - VR, VR * 0.45, '#94a3b8', '#334155', 0.8);
        D.line(ctx, [[wx - Math.cos(a) * VR * 0.8, G0 - VR - Math.sin(a) * VR * 0.8], [wx + Math.cos(a) * VR * 0.8, G0 - VR + Math.sin(a) * VR * 0.8]], '#cbd5e1', 2);
      }
      D.rect(ctx, vx + 88, G0 - 2.6 * M, 58, 2.6 * M - DECK + 18, '#475569', '#1e293b', 1);   // driver / control cab, 2.6 m
      D.rect(ctx, vx + 112, G0 - 2.6 * M + 10, 28, 24, '#bae6fd', '#64748b', 0.8);
      D.rect(ctx, vx + 84, dT - 12, 10, 12, '#fbbf24', '#92400e', 0.8);   // beacon base on deck edge
      if (hasRing) {
        const cy = G0 - DECK - 1.3 * M;
        D.rect(ctx, vx - 40, dT - 8, 16, 8, '#334155'); D.rect(ctx, vx + 24, dT - 8, 16, 8, '#334155');   // ring cradle blocks
        ctx.beginPath(); ctx.arc(vx, cy, 1.3 * M, 0, Math.PI * 2); ctx.strokeStyle = '#6b737b'; ctx.lineWidth = 8; ctx.stroke();
        ctx.beginPath(); ctx.arc(vx, cy, 1.3 * M, 0, Math.PI * 2); ctx.strokeStyle = '#c3c9cf'; ctx.lineWidth = 5; ctx.stroke();
        if (lod !== 'far') IT.crate(ctx, vx, cy + 8);
      }
    } });

  // R3-2: tower-foot walkers, 42-plate gag world and tile fixture drawn AFTER the transporter so they pass in front of it (timings unchanged)
  TF.transport({ id: 'Tower-foot', period: 48, layer: 'main', box: { x: 3300, y: T.y - 40, w: 5460 - 3300, h: T.h + 80 },   // east edge 5460: owns the ground walk off screen
    draw(ctx, t, theme, lod) {
      const ty = tlY(s24(t));
      TF.gag42.world(ctx, t, lod, ty);
      if (lod !== 'far') {   // outbound crew robot past the hatch plane (ship.js owns x >= SB.x - 2); empty crate stays in hand
        const rr = TF.mod(t - CR0, 24), mm = Math.round((t - CR0 - rr) / 24), cid = (c) => 'crew-out-' + (TF.mod(c, 2) === 1 ? 0 : 1);
        for (const [k, r] of [[0, TF.stage3.crewOut.at(rr, cid(mm - 2))], [1, TF.stage3.crewOut.at(rr + 24, cid(mm - 3))]]) if (r) {
          ctx.save(); ctx.beginPath(); ctx.rect(-1e6, -1e6, 2e6 + (rr + 24 * k >= 21 ? 0 : SB.x - 2 - 1e6), 2e6); ctx.clip();   // before 21 s ship.js owns x >= hull plane; afterwards the robot is fully on the tower side / ground
          const f = A.draw(ctx, r.st, r.y); if (r.fc) { const w = f.w(f.sk.wristN); IT.foodcrate(ctx, w[0], w[1] + 5); }
          ctx.restore();
        }
      }
      // tile pile at G + fit-check fixture by the booster QD; the tile Optimus carries the top tile there and back
      const tt = s24(t), gz = TF.fortyTwo(t), TV = TILE[gz.k + 1], inHand = tt >= TV.hand[0] && tt < TV.hand[1];
      D.rect(ctx, T.x - 40, G0 - 8, 28, 8, '#f3f4f6', '#6b737b', 0.6);
      D.rect(ctx, T.x - 36, G0 - 16, 20, 8, '#f3f4f6', '#6b737b', 0.6);
      if (!inHand) D.rect(ctx, T.x - 36, G0 - 24, 20, 8, '#f3f4f6', '#6b737b', 0.6);
      D.rect(ctx, 4712, G0 - 20, 16, 20, '#6b737b', '#2b2f34', 1);
      D.rect(ctx, 4716, G0 - 80, 8, 60, '#9aa3ab', '#475569', 1);
      D.circle(ctx, 4720, G0 - 88, 3, tt >= TV.led[0] && tt < TV.led[1] ? '#4ade80' : '#9aa3ab', '#2b2f34', 0.6);
      if (lod !== 'far') {
        const fig = A.draw(ctx, A.run(TV.segs, tt), G0);
        if (inHand) { const w = fig.w(fig.sk.wristN); D.rect(ctx, w[0] - 13, w[1] - 8, 26, 8, '#f3f4f6', '#6b737b', 0.6); }
        TF.gag42.held(ctx, t, 'tile', fig);
      }
    } });

  TF.flows.push(
    { item: 'ring + tile crate (trolley)', from: '8E', via: ['B8', 'CS'], to: 'TOWER', sink: 'ring transporter', owner: 'Tower' },
    { item: 'serviced Raptor (trolley)', from: '8E', via: ['B8', 'CS'], to: 'SHIP', sink: 'engine bay', owner: 'Tower' },
    { item: 'old Raptor (chopsticks)', from: 'SHIP', via: ['CS', 'B8'], to: '8E', sink: 'trolley back to 8D', owner: 'Tower' },
    { item: 'crew-up + food crate', from: '8E', via: ['B8', 'TL', 'AA'], to: 'SHIP', sink: 'cargo / galley', owner: 'Tower' }
  );
})(typeof window !== 'undefined' ? window : globalThis);
