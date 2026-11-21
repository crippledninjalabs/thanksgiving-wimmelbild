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
  const csY = (u) => TF.keys(u, [
    [0, yBR], [6, yBR], [7, yBR], [11, yG - 40], [12, yG - 40], [16, yENG], [22, yENG], [24, yBR],
    [30, yBR], [31, yBR], [32, yENG], [37, yENG], [38, yBR], [48, yBR]
  ]);
  const tlY = (u) => {
    // 24 s stub: parked at G 16.6-23.7 / 23.7-3, useful trips: G->BR and BR->CG as a simple loop so the lift is alive
    // Map is dense; keep a visible 24 s circuit that is off the seam: 0-4 at G, 4-8 up to BR, 8-12 to CG, 12-16 to BR, 16-20 to G, 20-24 at G
    return TF.keys(u, [[0, yG - 8], [4, yG - 8], [8, yBR], [12, yCG], [16, yBR], [20, yG - 8], [24, yG - 8]]);
  };

  TF.transport({ id: 'Tower', period: 48, layer: 'main', box: { x: T.x - 80, y: T.y - 40, w: T.w + 200, h: T.h + 80 },
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
      D.rect(ctx, T.x + T.w - 28, ty - 50, 28, 50, '#94a3b8', '#334155', 1.2);
      D.rect(ctx, T.x + T.w - 24, ty - 46, 20, 16, '#bae6fd', '#64748b', 0.8);
      // tower tech is drawn at the end of this pass (always visible; rides this car when on it)

      // south/front face: CS rail + carriage
      D.rect(ctx, T.x + 8, T.y + 10, 8, T.h - 20, '#94a3b8', '#334155', 1);
      const cy = csY(u48);
      // chopsticks arms (two prongs)
      const reach = 90;
      D.rect(ctx, T.x + 4, cy - 14, 16, 28, '#64748b', '#1e293b', 1);
      D.line(ctx, [[T.x + 20, cy - 8], [T.x + 20 + reach, cy - 8]], '#475569', 5);
      D.line(ctx, [[T.x + 20, cy + 8], [T.x + 20 + reach, cy + 8]], '#475569', 5);
      D.rect(ctx, T.x + 16 + reach, cy - 14, 10, 28, '#334155');

      // payload on CS
      const ringOnCS = (u48 >= 7 && u48 < 12);             // A 7-12: carrying ring down to G
      const newRaptorOnCS = (u48 >= 31 && u48 < 37);       // B 7-13: serviced raptor to ENG
      const oldRaptorOnCS = (u48 >= 16 && u48 < 31);       // A 16-B 7: old raptor up to BR
      const hx = T.x + 20 + reach - 10;
      if (ringOnCS) {
        ctx.beginPath(); ctx.arc(hx, cy, 1.3 * M, 0, Math.PI * 2); ctx.strokeStyle = '#6b737b'; ctx.lineWidth = 8; ctx.stroke();
        ctx.beginPath(); ctx.arc(hx, cy, 1.3 * M, 0, Math.PI * 2); ctx.strokeStyle = '#c3c9cf'; ctx.lineWidth = 5; ctx.stroke();
        if (lod !== 'far') IT.crate(ctx, hx, cy + 8);
      }
      if (newRaptorOnCS || oldRaptorOnCS) TF.stage3.raptor(ctx, hx, cy + 20, { pump: 1 });

      // ship QD arm (tower to cargo door) at CG height, parked or slightly extended
      const armY = yCG - 20, ext = (u >= 10 && u < 16) ? 1 : 0.15;
      D.rect(ctx, T.x + T.w, armY - 5, 200 * ext + 20, 10, '#7b848c', '#2b2f34', 1);

      // tile pile at G
      D.rect(ctx, T.x - 40, G0 - 8, 28, 8, '#f3f4f6', '#6b737b', 0.6);
      D.rect(ctx, T.x - 36, G0 - 16, 20, 8, '#f3f4f6', '#6b737b', 0.6);
      if (lod !== 'far') {
        // PAD: always on the ground — tiles, booster QD hookup during fueling (4-14), never pops
        const pad = (function () {
          const pile = T.x - 20, qd = 4740;
          if (u < 4) return { id: 'tower.pad', x: pile, face: 1, pose: A.reach([0.4, 0.7 + 0.05 * Math.sin(t * Math.PI * 2)], [0.2, 0.7], { lean: 0.2, gripN: 0.7 }) };
          if (u < 8) { const st = A.walk(4, pile, qd, { step: 0.55 }).f(TF.ramp(u, 4, 8), u - 4); return Object.assign({ id: 'tower.pad' }, st); }
          if (u < 14) return { id: 'tower.pad', x: qd, face: 1, pose: A.reach([0.45, 0.95], [0.2, 0.8], { lean: 0.25, hipY: 0.9, gripN: 0.9 }) };
          if (u < 16) return { id: 'tower.pad', x: qd, face: -1, pose: A.reach([0.4, 0.9], [0.2, 0.8], { lean: 0.15, gripN: 0.5 }) };
          if (u < 20) { const st = A.walk(4, qd, pile, { step: 0.55, carry: [0.3, 0.9], carryW: 0.25 }).f(TF.ramp(u, 16, 20), u - 16); return Object.assign({ id: 'tower.pad' }, st); }
          return { id: 'tower.pad', x: pile, face: 1, pose: A.reach([0.35, 0.7], [0.2, 0.65], { lean: 0.15, gripN: 0.6 }) };
        })();
        const pf = A.draw(ctx, pad, G0);
        if (u >= 16 && u < 20) { const w = pf.w(pf.sk.wristN); D.rect(ctx, w[0] - 6, w[1] - 3, 12, 4, '#f3f4f6', '#6b737b', 0.6); }

        // TOWER TECH: 48 s, always visible. Rides TL, walks the QD arm into the ship, climbs the
        // ship ladder to the engine bay (Raptor install/remove), rides back down. Never floats.
        const yEng = TF.stage3.deckY(TF.stage3.DCK.eng) + 8;
        const yCargo = TF.stage3.deckY(TF.stage3.DCK.header) - 6;
        const liftX = T.x + T.w - 14, doorX = 4780, ladX = TF.stage3.shipCX - 70;
        const climb = (t0, dur, yA, yB, face, uu) => {
          const k = TF.clamp((uu - t0) / dur, 0, 1);
          return { id: 'tower.tech', x: ladX, y: TF.lerp(yA, yB, TF.smooth(k)), face, pose: A.reach([0.25, 1.55], [0.15, 1.3], { gripN: 0.8, head: -0.15 }) };
        };
        let tech;
        if (u48 < 4) { const st = A.walk(4, T.x + 20, liftX, { step: 0.5 }).f(u48 / 4, u48); tech = Object.assign({ id: 'tower.tech', y: G0 }, st); }
        else if (u48 < 12) tech = { id: 'tower.tech', x: liftX, y: ty, face: 1, pose: A.idle(t) };            // ride G->BR->CG
        else if (u48 < 14) tech = { id: 'tower.tech', x: TF.lerp(liftX, doorX, TF.ramp(u48, 12, 14)), y: yCG, face: 1, pose: A.reach([0.4, 1.1], [0.2, 1.0], { gripN: 0.6 }) };
        else if (u48 < 16) tech = { id: 'tower.tech', x: doorX, y: yCargo, face: 1, pose: A.reach([0.45, 1.05], [0.2, 0.95], { gripN: 0.8, lean: 0.15 }) };
        else if (u48 < 18) { const st = A.walk(2, doorX, ladX, { step: 0.5 }).f(TF.ramp(u48, 16, 18), u48 - 16); tech = Object.assign({ id: 'tower.tech', y: yCargo }, st); }
        else if (u48 < 24) tech = climb(18, 6, yCargo, yEng, 1, u48);
        else if (u48 < 32) tech = { id: 'tower.tech', x: TF.stage3.shipCX + (u48 < 30 ? 20 : 40), y: yEng, face: 1, pose: A.reach([0.4, 1.1], [0.2, 0.9], { gripN: 0.9, lean: 0.2, head: -0.1 }) };
        else if (u48 < 36) tech = climb(32, 4, yEng, yCargo, -1, u48);
        else if (u48 < 38) tech = { id: 'tower.tech', x: TF.lerp(ladX, liftX, TF.ramp(u48, 36, 38)), y: yCG, face: -1, pose: A.idle(t) };
        else if (u48 < 44) tech = { id: 'tower.tech', x: liftX, y: ty, face: 1, pose: A.idle(t) };             // ride CG->BR->G (tl 12-20)
        else tech = { id: 'tower.tech', x: TF.lerp(liftX, T.x + 20, TF.ramp(u48, 44, 48)), y: G0, face: -1, pose: A.idle(t) };
        A.draw(ctx, tech, tech.y);
      }
    } });

  // ring transporter at tower base (48 s): gets ring A 11-12, leaves east B 16-20, returns empty A 4-8
  TF.transport({ id: 'Ring-transporter', period: 48, layer: 'main', box: { x: 4300, y: G0 - 140, w: 1000, h: 160 },
    draw(ctx, t, theme, lod) {
      const u = s48(t);
      // x: off east, arrives A 4-8 empty, parks at tower base 8-40 (A8-B16), leaves B 16-20, gone 20-52
      const x = TF.keys(u, [[0, 4580], [4, 4580], [8, 4580], [16, 4580], [40, 4580], [44, 5400], [48, 5400],
        /* wrap: after leave at 44 it's off; next arrival is +48+4. keys are in 0-48; for 0-4 it's already parked from previous? */
      ]);
      // Simpler explicit windows
      let tx = null, hasRing = false, hasCrates = false;
      if (u >= 4 && u < 8) tx = TF.lerp(5400, 4580, TF.ramp(u, 4, 8));           // return empty
      else if (u >= 8 && u < 40) { tx = 4580; hasRing = u >= 12; hasCrates = u >= 14 && u < 24 + 14; }
      else if (u >= 40 && u < 44) { tx = TF.lerp(4580, 5400, TF.ramp(u, 40, 44)); hasRing = true; hasCrates = true; }
      if (tx == null || tx > 5350) return;
      // flatbed + cab
      D.rect(ctx, tx - 80, G0 - 36, 140, 20, '#64748b', '#1e293b', 1);
      D.rect(ctx, tx + 60, G0 - 50, 40, 34, '#475569', '#1e293b', 1);
      D.rect(ctx, tx + 68, G0 - 44, 16, 10, '#bae6fd', '#64748b', 0.6);
      D.circle(ctx, tx - 50, G0 - 8, 8, '#1f2937'); D.circle(ctx, tx + 20, G0 - 8, 8, '#1f2937'); D.circle(ctx, tx + 80, G0 - 8, 8, '#1f2937');
      if (hasRing) {
        ctx.beginPath(); ctx.arc(tx - 10, G0 - 50, 1.3 * M, 0, Math.PI * 2); ctx.strokeStyle = '#6b737b'; ctx.lineWidth = 8; ctx.stroke();
        ctx.beginPath(); ctx.arc(tx - 10, G0 - 50, 1.3 * M, 0, Math.PI * 2); ctx.strokeStyle = '#c3c9cf'; ctx.lineWidth = 5; ctx.stroke();
      }
      if (hasCrates) { IT.crate(ctx, tx + 30, G0 - 36); IT.foodcrate(ctx, tx + 48, G0 - 36); }
    } });

  TF.flows.push(
    { item: 'ring + tile crate (trolley)', from: '8E', via: ['B8', 'CS'], to: 'TOWER', sink: 'ring transporter', owner: 'Tower' },
    { item: 'serviced Raptor (trolley)', from: '8E', via: ['B8', 'CS'], to: 'SHIP', sink: 'engine bay', owner: 'Tower' },
    { item: 'old Raptor (chopsticks)', from: 'SHIP', via: ['CS', 'B8'], to: '8E', sink: 'trolley back to 8D', owner: 'Tower' },
    { item: 'crew-up + food crate', from: '8E', via: ['B8', 'TL', 'AA'], to: 'SHIP', sink: 'cargo / galley', owner: 'Tower' }
  );
})(typeof window !== 'undefined' ? window : globalThis);
