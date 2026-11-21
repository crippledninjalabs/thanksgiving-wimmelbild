// Underground strip: W-core pits, BA coolant plant, BB Megapack room, pump vault + buried
// tanks, trench to the ship (FACTORY-MAP §5). Boring machine, shaft and gopher burrows removed.
// Continuity: every moving item has a visible source, action and sink. No scene text.
(function (G) {
  const TF = G.TF, L = TF.layout, D = TF.draw, K = TF.kit, A = TF.act, M = TF.M;
  TF.claimedZones = Object.assign(TF.claimedZones || {}, { PITS: 1, BA: 1, BB: 1, VAULT: 1, TRENCH: 1 });
  const G0 = L.G, s24 = (t) => TF.mod(t, 24);
  const BA = L.zoneById('BA').box, BB = L.zoneById('BB').box;
  const VAU = L.zoneById('VAULT').box, TR = L.zoneById('TRENCH').box, PITS = L.zoneById('PITS').box;

  const chamber = (ctx, b, fill) => {
    D.rect(ctx, b.x + 4, b.y + 4, b.w - 8, b.h - 8, fill || '#f3efe7', '#c9bba6', 1.8);
    // floor slab
    D.rect(ctx, b.x + 8, G0 + b.h - 22, b.w - 16, 14, '#e7e0d4', '#c3b8a6', 1);
  };
  const buriedLevel = (u) => {
    const lo = 0.35, hi = 0.78;
    if (u >= 4 && u < 14) return lo + TF.ramp(u, 4, 14) * (hi - lo);
    const p = u >= 14 ? (u - 14) / 10 : (10 + u) / 10; // drain 14-24 and wrap 0 so t=0 == t=24
    return hi - Math.min(1, p) * (hi - lo);
  };
  // pumping to the ship during drain (14-24); filling from the truck 4-14
  const filling = (u) => u >= 4 && u < 14;
  const pumping = (u) => u >= 14;

  // utility Optimus: BA climb/valve then walk to BB cabinets and back (24 s, always visible)
  const utilAt = (t) => {
    const u = s24(t);
    const yBA = G0 + BA.h - 22, yValve = G0 + 86, yBB = G0 + BB.h - 22;
    const xValve = BA.x + 168, xBB = BB.x + 420, xHome = BA.x + 80;
    if (u < 4) return { x: xHome, y: yBA, face: 1, pose: A.idle(t), id: 'ug.util' };
    if (u < 8) return { x: xValve, y: TF.lerp(yBA, yValve, TF.ramp(u, 4, 8)), face: 1, pose: A.reach([0.3, 1.6], [0.2, 1.4], { gripN: 1, head: -0.4 }), id: 'ug.util' };
    if (u < 10) return { x: xValve, y: yValve, face: 1, pose: A.reach([0.45, 1.2], [0.2, 1.1], { gripN: 1, lean: 0.15 }), id: 'ug.util' };
    if (u < 14) return { x: xValve, y: TF.lerp(yValve, yBA, TF.ramp(u, 10, 14)), face: 1, pose: A.reach([0.3, 1.6], [0.2, 1.4], { gripN: 1, head: -0.4 }), id: 'ug.util' };
    if (u < 16) { const st = A.walk(2, xValve, xBB, { step: 0.55 }).f(TF.ramp(u, 14, 16), (u - 14)); return { x: st.x, face: st.face, pose: st.pose, y: yBA, id: 'ug.util' }; }
    if (u < 20) return { x: xBB, y: yBB, face: 1, pose: A.reach([0.4, 1.15], [0.2, 1.0], { gripN: 0.4, head: -0.1 }), id: 'ug.util' };
    const st = A.walk(4, xBB, xHome, { step: 0.55 }).f(TF.ramp(u, 20, 24), (u - 20));
    return { x: st.x, face: st.face, pose: st.pose, y: yBA, id: 'ug.util' };
  };

  // ----- shared visual helpers (no text) -----
  const fan = (ctx, x, y, r, ang, lod) => {
    D.circle(ctx, x, y, r, '#cbd5e1', '#475569', 1.2);
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(r * 0.55, r * 0.15, r * 0.82, 0); ctx.quadraticCurveTo(r * 0.55, -r * 0.15, 0, 0);
      ctx.fillStyle = '#64748b'; ctx.fill();
    }
    ctx.restore();
    D.circle(ctx, x, y, r * 0.22, '#334155', '#1e293b', 0.8);
  };
  const megapack = (ctx, x, y, w, h, charge, lod, lit) => {
    // white/grey Tesla-style cabinet: door seams, vent grilles, status light (no text)
    D.rect(ctx, x, y, w, h, '#e8eaed', '#7b848c', 1.4);
    D.rect(ctx, x + 3, y + 3, w - 6, h - 6, '#f4f5f6', '#c3c9d0', 0.7);
    // door panel split
    const mid = x + w * 0.52;
    D.line(ctx, [[mid, y + 10], [mid, y + h - 10]], '#c3c9d0', 1.2);
    // handle recesses
    D.rect(ctx, mid - 8, y + h * 0.45, 5, 22, '#cbd5e1', '#9aa3ab', 0.6);
    D.rect(ctx, mid + 3, y + h * 0.45, 5, 22, '#cbd5e1', '#9aa3ab', 0.6);
    // vent grilles on the lower third
    const gy = y + h * 0.62, gh = h * 0.28;
    D.rect(ctx, x + 8, gy, w - 16, gh, '#d5d9de', '#9aa3ab', 0.6);
    if (lod !== 'far') {
      for (let i = 0; i < 7; i++) D.line(ctx, [[x + 12, gy + 4 + i * (gh - 8) / 6], [x + w - 12, gy + 4 + i * (gh - 8) / 6]], '#9aa3ab', 0.8);
    }
    // thin red accent bar (Tesla cue, not text)
    D.rect(ctx, x + 8, y + 8, w - 16, 4, '#b91c1c');
    // charge window (green rising) + status light
    const ch = 0.55 + 0.35 * charge;
    D.rect(ctx, x + w - 16, y + 20, 8, h * 0.32, '#e2e8f0', '#94a3b8', 0.6);
    D.rect(ctx, x + w - 15, y + 20 + h * 0.32 * (1 - ch), 6, h * 0.32 * ch, '#4ade80');
    const col = lit ? '#4ade80' : '#f59e0b';
    D.circle(ctx, x + 14, y + 22, 4, col, '#14532d', 0.7);
    if (lit) { ctx.globalAlpha = 0.35; D.circle(ctx, x + 14, y + 22, 8, col); ctx.globalAlpha = 1; }
  };
  const pump = (ctx, x, y, on, col) => {
    // motor + volute (snail) — readable as a pump with no text
    D.rect(ctx, x - 36, y - 22, 32, 28, '#94a3b8', '#334155', 1.2);
    D.rect(ctx, x - 32, y - 28, 24, 8, '#cbd5e1', '#334155', 0.8);
    D.circle(ctx, x + 8, y - 4, 22, '#cbd5e1', '#334155', 1.4);
    D.circle(ctx, x + 8, y - 4, 10, '#e2e8f0', '#334155', 0.8);
    if (on) {
      ctx.save(); ctx.translate(x + 8, y - 4); ctx.rotate(y * 0 + (on === true ? 1 : 0));
      ctx.restore();
      for (let i = 0; i < 3; i++) D.line(ctx, [[x + 8, y - 4], [x + 8 + Math.cos((on) + i * 2.1) * 8, y - 4 + Math.sin((on) + i * 2.1) * 8]], '#64748b', 1.4);
    }
    // discharge flange colour-coded by fluid
    D.rect(ctx, x + 22, y - 10, 16, 12, col, '#334155', 1);
  };

  TF.transport({ id: 'Underground', period: 24, layer: 'back', box: { x: 0, y: G0 - 10, w: L.W, h: L.H - G0 + 20 },
    draw(ctx, t, theme, lod) {
      const u = s24(t);
      // W-core pits
      chamber(ctx, PITS, '#efeae1');
      const shafts = L.core.shafts;
      for (const k of Object.keys(shafts)) {
        const [a, b] = shafts[k];
        D.rect(ctx, a + 2, G0, b - a - 4, PITS.h - 22, '#e4ded5', '#c3b8a6', 1);
      }

      // ----- BA coolant plant: recognisable chiller, fans on top, insulated blue/red pipes -----
      chamber(ctx, BA, '#eef2f6');
      const cx0 = BA.x + 70, cy0 = G0 + 120, cw = 200, ch = 160;
      D.rect(ctx, cx0, cy0, cw, ch, '#d6dde4', '#64748b', 1.6);             // chiller body
      D.rect(ctx, cx0 + 6, cy0 + 8, cw - 12, 36, '#c5ced6', '#7b848c', 0.8);
      // fans on top (spin continuously; boost after the valve so the refill looks powered)
      const fanAng = K.spin(t, 24, 0.6, 0.8, [[8, 24]]);
      fan(ctx, cx0 + 50, cy0 - 2, 22, fanAng, lod);
      fan(ctx, cx0 + 110, cy0 - 2, 22, fanAng + 0.9, lod);
      fan(ctx, cx0 + 170, cy0 - 2, 22, fanAng + 1.7, lod);
      K.wisp(ctx, cx0 + 110, cy0 - 28, t, 6, lod, 0.2, '#e2e8f0', 22);
      // sight-glass tank on the side: low 0-8, fills after the valve 8-16, drains 16-24
      const clev = u < 8 ? 0.28 : u < 16 ? 0.28 + TF.ramp(u, 8, 16) * 0.52 : 0.80 - TF.ramp(u, 16, 24) * 0.52;
      const tx = cx0 + cw + 18, tw = 54, th = 140, ty = cy0 + 12;
      D.rect(ctx, tx, ty, tw, th, '#e2e8f0', '#64748b', 1.4);
      D.rect(ctx, tx + 3, ty + th * (1 - clev), tw - 6, th * clev, '#7dd3fc');
      D.rect(ctx, tx, ty, tw, th, null, '#64748b', 1.4);
      K.gauge(ctx, tx + tw + 20, ty + 16, 14, clev, lod);
      K.ladder(ctx, cx0 + 14, G0 + BA.h - 22, (G0 + BA.h - 22 - (cy0 + 16)) / M, 0.3);
      const vAng = (u >= 8 && u < 10) ? (u - 8) * Math.PI : 0.2;
      K.valve(ctx, tx + tw / 2, ty - 8, 10, vAng);
      // circulation pump
      D.rect(ctx, BA.x + 330, G0 + 210, 46, 36, '#94a3b8', '#334155', 1);
      D.circle(ctx, BA.x + 353, G0 + 226, 11, '#cbd5e1', '#334155', 1);
      // red return (hot) down from the factory, blue supply up
      const flow = u * 8;
      K.pipe(ctx, [[BA.x + 40, G0], [BA.x + 40, cy0 + 40], [cx0, cy0 + 40]], '#b91c1c', 10, flow, lod, '#fecaca');
      K.pipe(ctx, [[tx + tw, ty + th - 16], [BA.x + 330, ty + th - 16], [BA.x + 353, G0 + 210]], '#0369a1', 8, flow, lod, '#7dd3fc');
      K.pipe(ctx, [[BA.x + 353, G0 + 210], [BA.x + 353, G0]], '#0369a1', 10, flow, lod, '#7dd3fc');

      // ----- BB Megapack room: rows of real cabinets, thick cables up, status lights -----
      chamber(ctx, BB, '#eef2f6');
      const packs = 8, packW = 86, packH = 200, packY = G0 + 90, gap = 24;
      const rowX0 = BB.x + 50;
      for (let i = 0; i < packs; i++) {
        const x = rowX0 + i * (packW + gap);
        const chg = 0.5 + 0.5 * Math.sin((u / 24) * Math.PI * 2 + i * 0.7);
        const discharging = chg > 0.45; // status light green when sending power up
        megapack(ctx, x, packY, packW, packH, chg, lod, discharging);
      }
      // thick cable tray along the ceiling, branches down into each cabinet, riser up at the west
      const trayY = G0 + 36;
      D.rect(ctx, BB.x + 20, trayY, BB.w - 40, 14, '#334155', '#1e293b', 1);
      D.rect(ctx, BB.x + 22, trayY + 3, BB.w - 44, 4, '#fbbf24');   // live bus
      D.rect(ctx, BB.x + 22, trayY + 8, BB.w - 44, 4, '#38bdf8');
      for (let i = 0; i < packs; i++) {
        const x = rowX0 + i * (packW + gap) + packW / 2;
        D.line(ctx, [[x, trayY + 14], [x, packY]], '#1f2937', 5);
        D.line(ctx, [[x, trayY + 14], [x, packY]], '#fbbf24', 2);
      }
      // riser up into the factory (west) + feed in from 9C (drawn as the same trunk, pulse)
      K.pipe(ctx, [[BB.x + 28, trayY + 7], [BB.x + 28, G0]], '#1f2937', 12, u * 6, lod, '#fde68a');
      // west-side feed from BA wall as a second trunk (power in)
      K.pipe(ctx, [[BA.x + BA.w - 4, G0 + 40], [BB.x + 20, G0 + 40], [BB.x + 20, trayY + 7]], '#1f2937', 8, u * 6, lod, '#fde68a');

      // ----- pump vault + buried tanks (expanded into the old burrow span) -----
      chamber(ctx, VAU, '#e8eef3');
      const lev = buriedLevel(u);
      // two large tanks: LOX (frosty blue, ribbed jacket) and CH4 (smooth lime, banded)
      const tankH = 260, tankW = 150, tankY = G0 + 50;
      const loxX = VAU.x + 80, ch4X = VAU.x + 280;
      const tankShell = (x, fillCol, frost, bands) => {
        D.rect(ctx, x, tankY, tankW, tankH, '#cbd5e1', '#64748b', 1.6);
        D.rect(ctx, x + 5, tankY + tankH * (1 - lev), tankW - 10, tankH * lev, fillCol);
        if (frost) {
          D.line(ctx, [[x + 8, tankY + tankH * (1 - lev)], [x + tankW - 8, tankY + tankH * (1 - lev)]], '#bfdbfe', 3);
          if (lod !== 'far') for (let i = 0; i < 5; i++) D.line(ctx, [[x + 8, tankY + 20 + i * 18], [x + 18, tankY + 20 + i * 18]], '#93c5fd', 2);
        }
        if (bands) for (let i = 1; i < 4; i++) D.rect(ctx, x, tankY + i * (tankH / 4) - 3, tankW, 6, '#65a30d', '#3f6212', 0.6);
        D.rect(ctx, x, tankY, tankW, tankH, null, '#64748b', 1.6);
        // crown
        D.rect(ctx, x + 20, tankY - 12, tankW - 40, 12, '#94a3b8', '#334155', 1);
      };
      tankShell(loxX, '#dbeafe', true, false);
      tankShell(ch4X, '#ecfccb', false, true);
      // fill pipes down from the tank farm (active only while the truck pumps)
      const fillFlow = filling(u) ? u * 10 : null;
      K.pipe(ctx, [[loxX + tankW / 2, G0], [loxX + tankW / 2, tankY - 12]], '#64748b', 8, fillFlow, lod, '#93c5fd');
      K.pipe(ctx, [[ch4X + tankW / 2, G0], [ch4X + tankW / 2, tankY - 12]], '#84cc16', 8, fillFlow, lod, '#ecfccb');
      // two big pumps, shape-coded discharge, only running while pumping to the ship
      const pOn = pumping(u) ? u * 8 : 0;
      const pY = G0 + 250, pLox = VAU.x + 560, pCh4 = VAU.x + 720;
      pump(ctx, pLox, pY, pOn, '#93c5fd');
      pump(ctx, pCh4, pY, pOn, '#84cc16');
      K.valve(ctx, pLox + 8, pY - 44, 10, pumping(u) ? u * 1.2 : 0.3);
      K.valve(ctx, pCh4 + 8, pY - 44, 10, pumping(u) ? u * 1.2 : 0.3);
      const outFlow = pumping(u) ? u * 10 : null;
      // tank bottoms -> pumps
      K.pipe(ctx, [[loxX + tankW, tankY + tankH - 24], [pLox - 36, tankY + tankH - 24], [pLox - 36, pY - 10]], '#64748b', 9, outFlow, lod, '#bfdbfe');
      K.pipe(ctx, [[ch4X + tankW, tankY + tankH - 48], [pCh4 - 36, tankY + tankH - 48], [pCh4 - 36, pY - 10]], '#84cc16', 9, outFlow, lod, '#ecfccb');
      // pumps -> trench (east)
      K.pipe(ctx, [[pLox + 38, pY - 4], [VAU.x + VAU.w - 8, pY - 4]], '#64748b', 10, outFlow, lod, '#bfdbfe');
      K.pipe(ctx, [[pCh4 + 38, pY + 10], [VAU.x + VAU.w - 8, pY + 10]], '#84cc16', 10, outFlow, lod, '#ecfccb');

      // ----- trench to the launch mount: the two pipes climb to the ship -----
      chamber(ctx, TR, '#e8eef3');
      K.pipe(ctx, [[VAU.x + VAU.w - 8, pY - 4], [TR.x + 40, pY - 4], [TR.x + TR.w - 30, G0 + 80], [TR.x + TR.w - 30, G0]], '#64748b', 10, outFlow, lod, '#bfdbfe');
      K.pipe(ctx, [[VAU.x + VAU.w - 8, pY + 10], [TR.x + 40, pY + 16], [TR.x + TR.w - 50, G0 + 110], [TR.x + TR.w - 50, G0]], '#84cc16', 10, outFlow, lod, '#ecfccb');

      // utility Optimus (BA + BB) — always drawn at mid/near
      if (lod !== 'far') {
        const st = utilAt(t);
        A.draw(ctx, st, st.y);
      }
    } });

  TF.flows.push(
    { item: 'coolant', from: 'BA', via: ['RISER'], to: '6A', sink: 'closed loop (presses)', owner: 'Underground' },
    { item: 'coolant return', from: '6A', via: ['RISER'], to: 'BA', sink: 'plant tank', owner: 'Underground' },
    { item: 'power', from: '9C', via: ['RISER'], to: 'BB', sink: 'Megapacks', owner: 'Underground' },
    { item: 'power', from: 'BB', via: ['RISER'], to: '1A', sink: 'chargers', owner: 'Underground' },
    { item: 'LOX + CH4', from: 'VAULT', via: ['TRENCH'], to: 'MOUNT', sink: 'booster QD + ship QD', owner: 'Underground' }
  );
})(typeof window !== 'undefined' ? window : globalThis);
