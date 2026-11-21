// Starship + booster cutaway + launch mount (FACTORY-MAP §5). See-through decks; never launches.
(function (G) {
  const TF = G.TF, L = TF.layout, D = TF.draw, K = TF.kit, A = TF.act, M = TF.M, IT = TF.supply.items;
  TF.claimedZones = Object.assign(TF.claimedZones || {}, { SHIP: 1, BOOSTER: 1, MOUNT: 1 });
  const S = L.zoneById('SHIP').box, B = L.zoneById('BOOSTER').box, MT = L.zoneById('MOUNT').box;
  const CX = S.x + S.w / 2, X0 = S.x, X1 = S.x + S.w, W = S.w;
  const s24 = (t) => TF.mod(t, 24), s48 = (t) => TF.mod(t, 48);
  const deckY = (f) => S.y + S.h * f;
  const ALC = { x0: 22, w: 34, pitch: 38, h: 92, n: 3, pick: 2 };   // cargo rack alcoves (west end, beside the hatch)
  // deck top edges (fractions of ship height)
  const DCK = { bridge: 0.10, crew: 0.22, galley: 0.34, cargo: 0.46, header: 0.58, ch4: 0.66, lox: 0.78, eng: 0.88, bot: 1 };

  const hullPath = (ctx, b, nose) => {
    const x0 = b.x, x1 = b.x + b.w, y0 = b.y, y1 = b.y + b.h, cx = x0 + b.w / 2, n = nose || 220;
    ctx.beginPath();
    ctx.moveTo(x0, y1); ctx.lineTo(x0, y0 + n);
    ctx.quadraticCurveTo(x0, y0, cx, y0);
    ctx.quadraticCurveTo(x1, y0, x1, y0 + n);
    ctx.lineTo(x1, y1); ctx.closePath();
  };
  const raptor = (ctx, x, y, st) => {
    D.rect(ctx, x - 12, y - 1.7 * M, 24, 0.55 * M, '#5f6b77', '#2b2f34', 0.8);
    if (st && st.pump) D.circle(ctx, x + 10, y - 1.5 * M, 6, '#cbd5e1', '#2b2f34', 0.7);
    D.poly(ctx, [[x - 7, y - 1.15 * M], [x + 7, y - 1.15 * M], [x + 18, y], [x - 18, y]], '#9aa1a8', '#4a5056', 0.8);
  };
  TF.stage3 = TF.stage3 || {};
  TF.stage3.raptor = raptor;
  TF.stage3.shipCX = CX;
  TF.stage3.deckY = deckY;
  TF.stage3.alc = ALC;
  TF.stage3.DCK = DCK;
  TF.stage3.engBay = { x: CX, y: deckY(DCK.bot), mounts: 6 };

  // tank fill 0..1: ship/booster stay steady (inflow = vent)
  const tank = (ctx, x, y, w, h, fill, col, frost) => {
    D.rect(ctx, x, y, w, h, '#e8eef3', '#7b848c', 1);
    const fh = h * fill;
    D.rect(ctx, x + 2, y + h - fh, w - 4, fh, col);
    if (frost) D.line(ctx, [[x + 4, y + h - fh], [x + w - 4, y + h - fh]], '#bfdbfe', 2);
    D.rect(ctx, x, y, w, h, null, '#7b848c', 1);
  };
  const plume = (ctx, x, y, t, a) => {
    const tau = TF.mod(t, 24);
    const u = TF.mod(tau * 0.7 + a, 24) / 24;
    ctx.globalAlpha = 0.22 + 0.1 * Math.sin(tau * 2 + a);
    D.circle(ctx, x + Math.sin(tau * 1.4 + a) * 3, y - 10 - u * 28, 6 + u * 8, '#e5e7eb', null);
    ctx.globalAlpha = 1;
  };

  // residents (24 s), loadmaster carries the food crate cargo -> galley
  const pilot = (t) => {
    const reach = A.reach([0.4, 1.05], [0.2, 1.0], { gripN: 0.7, head: -0.15 });
    return A.run([A.hold(8, CX - 20, 1, () => reach),
      A.hold(4, CX - 20, 1, (tl) => A.reach([0.45, 1.05 + 0.04 * Math.sin(tl * 6)], [0.2, 1.0], { gripN: 0.8 })),
      A.hold(12, CX - 20, 1, () => reach)], s24(t));
  };
  const chef = (t) => {
    const flip = (tl) => A.reach([0.5, 1.05 + 0.08 * Math.abs(Math.sin(tl * 3))], [0.15, 0.95], { gripN: 1, lean: 0.15 });
    return A.run([A.hold(6, CX + 30, -1, flip), A.hold(18, CX + 30, -1, (tl) => A.reach([0.4, 1.0], [0.2, 0.95], { gripN: 0.5, head: 0.1 }))], s24(t));
  };
  const loadmaster = (t) => {
    const u = s24(t), yCargo = deckY(DCK.header) - 4, yGalley = deckY(DCK.cargo) - 4;
    // yFloor is the deck under the feet; cargo deck floor = deckY(header) is the HEADER top = cargo floor
    // cargo floor = deckY(DCK.header) wait: deckY(cargo)=top of cargo, floor of cargo = deckY(header)
    return { u };
  };

  // crew B on the bunk deck (24 s chore loop): smooth the bunk, walk to the towel, straighten it, walk back
  const bA = X0 + 112, bT = X1 - 62;
  const bunkP = (tl) => A.reach([0.45 + 0.05 * Math.sin(tl * 2.5), 0.85], [0.3, 0.7 + 0.1 * Math.sin(tl * 2.5 + 1)], { lean: 0.2, gripN: 0.6 });
  const towelP = (tl) => A.reach([0.4, 1.0 + 0.06 * Math.sin(tl * 3)], [0.25, 0.95], { gripN: 0.7 });
  const bSegs = [A.hold(3.4, bA, -1, bunkP), A.turn(0.6, bA, -1), A.walk(5, bA, bT, { step: 0.5 }), A.hold(4.4, bT, 1, towelP), A.turn(0.6, bT, 1), A.walk(5, bT, bA, { step: 0.5 })];
  bSegs.push(A.hold(24 - A.total(bSegs), bA, -1, bunkP));
  const crewB = (t) => A.run(bSegs, s24(t));

  TF.transport({ id: 'Starship', period: 48, layer: 'back', box: { x: MT.x - 20, y: S.y - 40, w: MT.w + 40, h: MT.y + MT.h - S.y + 40 },
    draw(ctx, t, theme, lod) {
      const u = s24(t), u48 = s48(t);
      // ----- mount -----
      D.poly(ctx, [[MT.x, MT.y + MT.h], [MT.x + 40, MT.y], [MT.x + MT.w - 40, MT.y], [MT.x + MT.w, MT.y + MT.h]], '#d8dce1', '#9aa3ab', 1.5);
      D.rect(ctx, MT.x + 50, MT.y - 18, MT.w - 100, 18, '#c3c9d0', '#7b848c', 1);
      // hold-down clamps
      for (const x of [CX - 70, CX + 70]) D.poly(ctx, [[x - 10, MT.y], [x + 10, MT.y], [x + 6, MT.y - 22], [x - 6, MT.y - 22]], '#6b737b', '#2b2f34', 1);
      // booster QD (fueling arm from the west / trench)
      const qdY = B.y + B.h * 0.72, qOn = u >= 4 && u < 14;
      D.rect(ctx, S.x - 70, qdY - 6, 70, 10, '#7b848c', '#2b2f34', 1);
      D.circle(ctx, S.x, qdY, 8, qOn ? '#93c5fd' : '#9aa3ab', '#2b2f34', 1);
      if (qOn && lod !== 'far') { ctx.globalAlpha = 0.5; D.line(ctx, [[S.x, qdY], [S.x + 18, qdY]], '#bfdbfe', 3); ctx.globalAlpha = 1; }

      // ----- booster cutaway -----
      D.rect(ctx, B.x, B.y, B.w, B.h, '#eef1f4', '#9aa3ab', 2);
      // skin strips
      D.rect(ctx, B.x, B.y, 10, B.h, '#d5dae0'); D.rect(ctx, B.x + B.w - 10, B.y, 10, B.h, '#d5dae0');
      // CH4 / LOX
      tank(ctx, B.x + 22, B.y + 20, B.w - 44, B.h * 0.32, 0.62, '#ecfccb', false);
      tank(ctx, B.x + 22, B.y + B.h * 0.36, B.w - 44, B.h * 0.32, 0.70, '#dbeafe', true);
      // 33-engine bay: 3 visible rows (11+11+11)
      const ey = B.y + B.h * 0.78, eh = B.h * 0.22;
      D.rect(ctx, B.x + 8, ey, B.w - 16, eh - 8, '#d4d9de', '#7b848c', 1);
      const blink = qOn && Math.sin(u * 8) > 0;
      for (let row = 0; row < 3; row++) for (let k = 0; k < 11; k++) {
        const x = B.x + 22 + k * ((B.w - 44) / 10), y = ey + 16 + row * 28;
        D.circle(ctx, x, y, 7, '#6b737b', '#2b2f34', 0.7);
        D.circle(ctx, x, y, 3, '#9aa1a8');
      }
      // three valve lights
      for (let i = 0; i < 3; i++) D.circle(ctx, B.x + 30 + i * 18, ey - 8, 4, blink ? '#4ade80' : '#365314', '#14532d', 0.6);
      // grid fins (folded, mid-body)
      for (const side of [-1, 1]) {
        const fx = side < 0 ? B.x - 6 : B.x + B.w + 6;
        D.rect(ctx, fx - 8, B.y + B.h * 0.18, 16, 70, '#c3c9d0', '#6b737b', 1);
        for (let k = 0; k < 4; k++) D.line(ctx, [[fx - 6, B.y + B.h * 0.18 + 12 + k * 14], [fx + 6, B.y + B.h * 0.18 + 12 + k * 14]], '#9aa3ab', 1);
      }
      plume(ctx, CX, B.y + 16, t, 1.2);

      // ----- ship hull -----
      hullPath(ctx, S, 240);
      ctx.fillStyle = '#eef1f4'; ctx.fill();
      ctx.strokeStyle = '#9aa3ab'; ctx.lineWidth = 2.4; ctx.stroke();
      // clip interiors to the hull
      ctx.save();
      hullPath(ctx, S, 240); ctx.clip();
      // edge skin
      D.rect(ctx, X0, S.y, 12, S.h, '#d5dae0'); D.rect(ctx, X1 - 12, S.y, 12, S.h, '#d5dae0');

      const slab = (f0, f1, fill) => D.rect(ctx, X0 + 12, deckY(f0), W - 24, deckY(f1) - deckY(f0), fill || '#f7f8fa');
      const floor = (f) => D.rect(ctx, X0 + 12, deckY(f) - 6, W - 24, 6, '#c3c9d0');

      // Bridge
      slab(0, DCK.crew, '#f4f7fb');
      D.rect(ctx, CX - 50, deckY(DCK.bridge) + 20, 100, 16, '#1d2733', '#5d656d', 1);   // windows / consoles
      for (let i = 0; i < 4; i++) D.rect(ctx, CX - 42 + i * 22, deckY(DCK.bridge) + 24, 16, 8, '#38bdf8');
      // Crew bunks
      slab(DCK.crew, DCK.galley);
      D.rect(ctx, X0 + 28, deckY(DCK.galley) - 22, 70, 10, '#d6d3d1', '#78716c', 0.8);
      D.rect(ctx, X0 + 28, deckY(DCK.galley) - 48, 70, 10, '#d6d3d1', '#78716c', 0.8);
      D.rect(ctx, X1 - 40, deckY(DCK.galley) - 70, 6, 36, '#a8a29e');   // towel hook
      D.rect(ctx, X1 - 52, deckY(DCK.galley) - 70, 16, 22, '#e7e5e4', '#78716c', 0.7);  // towel
      // Occupy Mars sticker
      D.rect(ctx, CX + 40, deckY(DCK.crew) + 16, 28, 22, '#7c2d12', '#9a3412', 0.6);
      D.circle(ctx, CX + 54, deckY(DCK.crew) + 26, 6, '#ea580c');
      // Galley
      slab(DCK.galley, DCK.cargo);
      D.rect(ctx, CX - 70, deckY(DCK.cargo) - 50, 36, 44, '#e5e7eb', '#7b848c', 1);   // fridge
      D.rect(ctx, CX + 10, deckY(DCK.cargo) - 28, 50, 10, '#6b737b', '#2b2f34', 1);  // grill
      const flameOn = u < 6;
      if (flameOn) {
        const flare = 1; // gag 61 is the big flare; base is a small flame
        for (let i = 0; i < 3; i++) {
          ctx.globalAlpha = 0.7;
          D.poly(ctx, [[CX + 22 + i * 10, deckY(DCK.cargo) - 28], [CX + 18 + i * 10, deckY(DCK.cargo) - 40 - 4 * Math.sin(u * 10 + i)], [CX + 26 + i * 10, deckY(DCK.cargo) - 28]], '#f97316', null);
          ctx.globalAlpha = 1;
        }
      }
      // Cargo
      slab(DCK.cargo, DCK.header, '#f1f5f9');
      // rack of 3 crew alcoves (recesses; doors + LEDs drawn with the residents)
      for (let i = 0; i < ALC.n; i++) D.rect(ctx, X0 + ALC.x0 + i * ALC.pitch, deckY(DCK.header) - 6 - ALC.h, ALC.w, ALC.h, '#64748b', '#475569', 1);
      D.rect(ctx, CX + 20, deckY(DCK.header) - 28, 36, 22, '#a8a29e', '#57534e', 1);   // mars-soil crate (closed)
      // cargo door (east); the 42 plate now lives on the west skirt (gags.js, drawn with the tower)
      const doorY = deckY((DCK.cargo + DCK.header) / 2) - 20;
      D.rect(ctx, X1 - 16, doorY, 16, 40, '#cbd5e1', '#64748b', 1.2);
      // Header / CH4 / LOX
      slab(DCK.header, DCK.ch4, '#eef2f7');
      tank(ctx, X0 + 28, deckY(DCK.header) + 8, W - 56, deckY(DCK.ch4) - deckY(DCK.header) - 14, 0.55, '#e2e8f0', false);
      slab(DCK.ch4, DCK.lox);
      tank(ctx, X0 + 28, deckY(DCK.ch4) + 8, W - 56, deckY(DCK.lox) - deckY(DCK.ch4) - 14, 0.68, '#ecfccb', false);
      slab(DCK.lox, DCK.eng);
      tank(ctx, X0 + 28, deckY(DCK.lox) + 8, W - 56, deckY(DCK.eng) - deckY(DCK.lox) - 14, 0.72, '#dbeafe', true);
      // Engine bay: 6 raptors; one mount empty while CS is installing (u48 32-37)
      slab(DCK.eng, DCK.bot, '#e2e6ea');
      const empty = (u48 >= 32 && u48 < 37) ? 2 : -1;   // middle-right mount
      for (let i = 0; i < 6; i++) {
        const x = X0 + 36 + i * ((W - 72) / 5);
        if (i === empty) { D.circle(ctx, x, deckY(DCK.bot) - 8, 10, null, '#94a3b8', 1.2); continue; }
        raptor(ctx, x, deckY(DCK.bot) - 2, { pump: 1 });
      }
      // ship QD arm inlet (west, mid cargo)
      D.circle(ctx, X0 + 8, doorY + 10, 6, u >= 4 && u < 14 ? '#93c5fd' : '#9aa3ab', '#2b2f34', 1);

      for (const f of Object.values(DCK)) floor(f);

      // inner ladder CH (cargo..bridge)
      K.ladder(ctx, CX - 70, deckY(DCK.header) - 6, (deckY(DCK.header) - 6 - deckY(DCK.bridge)) / M, 0.28);
      ctx.restore();

      // nose windows (outside the clip is fine — redraw a couple on the skin)
      for (const dx of [-30, 0, 30]) D.rect(ctx, CX + dx - 8, S.y + 70, 16, 10, '#bae6fd', '#64748b', 0.8);
      plume(ctx, CX, S.y + 8, t, 0.4);

      // ----- residents (skip far lod for figures) -----
      if (lod === 'far') return;
      const yBridge = deckY(DCK.crew) - 6, yCrew = deckY(DCK.galley) - 6, yGalley = deckY(DCK.cargo) - 6, yCargo = deckY(DCK.header) - 6;
      A.draw(ctx, pilot(t), yBridge);
      A.draw(ctx, crewB(t), yCrew);
      A.draw(ctx, chef(t), yGalley);
      // west hatch (opens for the arriving crew robot), the robot once inside, then the alcove doors + status LEDs
      const cu = TF.stage3.crewUp, hOpen = cu ? cu.hatch(t) : 0, cF = cu ? cu.closeFrac(t) : 1;
      D.rect(ctx, X0 - 2, yCargo - 88, 14, 88, '#1d2733');
      D.rect(ctx, X0 - 2, yCargo - 88, 14, 88 * (1 - hOpen), '#cbd5e1', '#64748b', 1);
      if (cu) for (const r of cu.list(t)) if (r.st.x >= X0) { const f = A.draw(ctx, r.st, r.y); if (r.fc) { const w = f.w(f.sk.wristN); IT.foodcrate(ctx, w[0], w[1] + 5); } }
      for (let i = 0; i < ALC.n; i++) {
        const c = i === ALC.pick ? cF : 1, ax = X0 + ALC.x0 + i * ALC.pitch, ay = yCargo - ALC.h;
        D.rect(ctx, ax, ay, ALC.w, ALC.h * c, '#e2e8f0', '#94a3b8', 1);
        D.circle(ctx, ax + ALC.w / 2, ay - 6, 2.6, c >= 1 ? '#4ade80' : '#f59e0b', '#14532d', 0.5);
      }
      // loadmaster + food crate (24 s): continuous handoff with crewUp at ALCX (t%24=19.3), no teleport
      // 0-7.5 galley, 7.5-8.5 walk to ladder, 8.5-11.5 down ladder, 11.5-13.5 walk to hatch, 13.5-15.5 walk to ALCX, 15.5-19.3 wait at ALCX, 19.3-20.5 walk to ladder w/ crate, 20.5-23.2 up ladder, 23.2-24 walk to galley
      const alcX = X0 + ALC.x0 + ALC.pitch * ALC.pick + ALC.w / 2;
      const lmY = u < 8.5 ? yGalley : u < 11.5 ? TF.lerp(yGalley, yCargo, TF.ramp(u, 8.5, 11.5)) : u < 20.5 ? yCargo : u < 23.2 ? TF.lerp(yCargo, yGalley, TF.ramp(u, 20.5, 23.2)) : yGalley;
      const lmX = u < 7.5 ? CX - 20 : u < 8.5 ? TF.lerp(CX - 20, CX - 70, TF.ramp(u, 7.5, 8.5))
        : u < 11.5 ? CX - 70 : u < 13.5 ? TF.lerp(CX - 70, CX + 40, TF.ramp(u, 11.5, 13.5))
        : u < 15.5 ? TF.lerp(CX + 40, alcX + 18, TF.ramp(u, 13.5, 15.5)) : u < 19.28 ? alcX + 18
        : u < 20.5 ? TF.lerp(alcX + 18, CX - 70, TF.ramp(u, 19.28, 20.5)) : u < 23.2 ? CX - 70 : TF.lerp(CX - 70, CX - 20, TF.ramp(u, 23.2, 24));
      const carry = (u >= 7.5 && u < 13.5) || u >= 19.28;
      const lmFace = (u >= 11.5 && u < 13.5) || u >= 19.28 ? 1 : -1;
      const lmSt = carry ? { x: lmX, face: lmFace, pose: A.carry(A.stand(), [0.3, 1.1], 0.35) } : { x: lmX, face: lmFace, pose: A.idle(t) };
      A.draw(ctx, lmSt, lmY);
      if (u < 7.5) IT.foodcrate(ctx, CX - 10, yGalley);
      else if (carry) IT.foodcrate(ctx, lmX + lmFace * 8, lmY - 30);
    } });

  TF.flows.push(
    { item: 'serviced Raptor', from: 'TOWER', via: ['CS', 'EB'], to: 'SHIP', sink: 'engine bay mount', owner: 'Starship' },
    { item: 'old Raptor', from: 'SHIP', via: ['EB', 'CS'], to: 'TOWER', sink: 'trolley back to 8D', owner: 'Starship' },
    { item: 'ship food crate', from: 'TOWER', via: ['AA', 'CH'], to: 'SHIP', sink: 'galley', owner: 'Starship' },
    { item: 'crew-up robots', from: 'TOWER', via: ['AA'], to: 'SHIP', sink: 'cargo rack (1 in, 1 out later)', owner: 'Starship' },
    { item: 'LOX + CH4', from: 'VAULT', via: ['TRENCH'], to: 'SHIP', sink: 'tanks (inflow = vent, level steady)', owner: 'Starship' },
    { item: 'LOX + CH4', from: 'VAULT', via: ['TRENCH'], to: 'BOOSTER', sink: 'tanks (inflow = vent, level steady)', owner: 'Starship' }
  );
})(typeof window !== 'undefined' ? window : globalThis);
