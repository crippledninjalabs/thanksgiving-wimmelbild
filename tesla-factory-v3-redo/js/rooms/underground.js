// Underground strip: W-core pits, BA coolant plant (chiller), BB Megapack cabinets, pump vault + buried
// tanks, trench (FACTORY-MAP §5). Continuity: every moving item has a source and a sink.
(function (G) {
  const TF = G.TF, TF3 = G.TF3, L = TF.layout, D = TF.draw, K = TF.kit, A = TF.act, M = TF.M;
  TF.claimedZones = Object.assign(TF.claimedZones || {}, {
    PITS: 1, BA: 1, BB: 1, VAULT: 1, TRENCH: 1
  });
  const G0 = L.G, s24 = (t) => TF.mod(t, 24);
  const BA = L.zoneById('BA').box, BB = L.zoneById('BB').box;
  const VAU = L.zoneById('VAULT').box, TR = L.zoneById('TRENCH').box;
  const PITS = L.zoneById('PITS').box;
  const TAU = Math.PI * 2;
  // fan seen from above-front: shroud ellipse + 3 spinning blades
  const fanTop = (ctx, cx, cy, rx, ry, ang) => {
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU); ctx.fillStyle = '#475569'; ctx.fill();
    ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1.5; ctx.stroke();
    for (let k = 0; k < 3; k++) {
      const a = ang + k * TAU / 3;
      D.line(ctx, [[cx, cy], [cx + (rx - 3) * Math.cos(a), cy + (ry - 1) * Math.sin(a)]], '#e2e8f0', 4);
    }
    D.circle(ctx, cx, cy, 3, '#94a3b8', '#1e293b', 1);
  };
  // spoked wheel (impeller / coupling)
  const spokes = (ctx, cx, cy, r, ang, n, col) => {
    for (let k = 0; k < n; k++) { const a = ang + k * TAU / n; D.line(ctx, [[cx, cy], [cx + r * Math.cos(a), cy + r * Math.sin(a)]], col, 3); }
  };

  const chamber = (ctx, b, fill) => {
    D.rect(ctx, b.x + 4, b.y + 4, b.w - 8, b.h - 8, fill || '#f3efe7', '#d6cbb8', 1.5);
  };
  const buriedLevel = (u) => {
    const lo = 0.35, hi = 0.78;
    if (u >= 4 && u < 14) return lo + TF.ramp(u, 4, 14) * (hi - lo);
    const p = u >= 14 ? (u - 14) / 14 : (10 + u) / 14;
    return hi - p * (hi - lo);
  };

  // utility Optimus (R3-1): walk to the tank's west ladder, climb to the roof catwalk, turn the roof valve,
  // climb down, walk to BB and work the panel, walk home (24 s). Tank/ladder geometry shared with draw().
  const RG3 = TF3.rig, climbC = TF3.clips.climb(0.17, 0.3);
  const UT = { tankX: BA.x + 80, tankY: G0 + 100, FL: G0 + BA.h - 12 };
  UT.ladX = UT.tankX - 14; UT.rx = UT.ladX - 0.17 * M; UT.roofY = UT.tankY - 3;
  UT.vx = UT.tankX + 66; UT.vy = UT.tankY - 14; UT.hm = (UT.FL - UT.roofY) / M;
  const climbPose = (p, n) => { const q = p * n, k = Math.min(n - 1, Math.floor(q)); const o = climbC.sample(Math.min(q - k, 0.99999)); o.props = {}; return o; };
  const utilAt = (t) => {
    const u = s24(t);
    const yBA = UT.FL, yBB = G0 + BB.h - 12, xBB = BB.x + 220, xHome = BA.x + 30;
    const out = (st, y) => ({ x: st.x, face: st.face, pose: st.pose, y });
    const sw = Math.sin(u * 2.4);
    const rest = (hx, hy) => A.reach([hx, hy], [hx - 0.1, hy - 0.05], { gripN: 0.3, head: 0.05 * sw });
    if (u < 0.3 || u >= 23.3) return { x: xHome, face: 1, pose: A.idle(t), y: yBA };
    if (u < 1.3) return out(A.walk(1, xHome, UT.rx, { step: 0.4 }).f(TF.ramp(u, 0.3, 1.3), u - 0.3), yBA);
    if (u < 4.8) { // climb up the west-wall ladder, facing it
      const p = TF.ramp(u, 1.3, 4.8), ph = (u < 1.6) ? RG3.blend(A.stand(), climbPose(0, 6), TF.ramp(u, 1.3, 1.6)) : climbPose(p, 6);
      return { x: UT.rx, face: 1, pose: ph, y: yBA - p * UT.hm * M };
    }
    if (u < 6.4) { // step onto the roof catwalk, walk to the valve
      const st = A.walk(1, UT.rx, UT.vx - 0.5 * M, { step: 0.4 }).f(TF.ramp(u, 4.8, 6.4), u - 4.8);
      return { x: st.x, face: 1, pose: u < 5.1 ? RG3.blend(climbPose(0.9999, 6), st.pose, TF.ramp(u, 4.8, 5.1)) : st.pose, y: UT.roofY };
    }
    const xr = UT.vx - 0.5 * M;
    if (u < 10.6 && u >= 6.4) { // hand to the wheel rim, turn it (u 8-10), release
      const vA = (u >= 8 && u < 10) ? 0.2 + (u - 8) * Math.PI : 0.2, a = vA + 2.4;
      const rx = UT.vx + 8 * Math.cos(a), ry = UT.vy + 8 * Math.sin(a);
      const k = u < 8 ? TF.ramp(u, 6.4, 7.4) : u >= 10 ? 1 - TF.ramp(u, 10, 10.4) : 1;
      const hx = TF.lerp(0.3, (rx - xr) / M, k), hy = TF.lerp(1.0 + 0.04 * sw, (UT.roofY - ry) / M, k);
      const x = u >= 10.3 ? TF.lerp(xr, UT.rx, TF.ramp(u, 10.3, 10.6)) : xr;
      return { x, face: u >= 10.3 ? -1 : 1, pose: A.reach([hx, hy], [hx - 0.08, hy - 0.04], { gripN: k, lean: 0.35 * k, head: -0.25 * k }), y: UT.roofY };
    }
    if (u < 13.6) { // climb down, facing the ladder
      const p = 1 - TF.ramp(u, 10.6, 13.6), n = 6;
      const ph = (u < 10.9) ? RG3.blend(A.stand(), climbPose(p, n), TF.ramp(u, 10.6, 10.9)) : (u > 13.3) ? RG3.blend(climbPose(p, n), A.stand(), TF.ramp(u, 13.3, 13.6)) : climbPose(p, n);
      return { x: UT.rx, face: 1, pose: ph, y: yBA - p * UT.hm * M };
    }
    if (u < 17.6) return out(A.walk(3.2, UT.rx, xBB, { step: 0.55 }).f(TF.ramp(u, 13.6, 17.6), u - 13.6), yBA);
    if (u < 20) { // service panel at BB: hand moves across the panel, head follows
      const w = Math.sin(u * 3);
      return { x: xBB, face: 1, pose: A.reach([0.4 + 0.04 * w, 1.1 + 0.05 * Math.sin(u * 2)], [0.2, 1.0], { gripN: 0.4 + 0.3 * Math.max(0, w), head: -0.1 + 0.1 * w }), y: yBB };
    }
    return out(A.walk(3.3, xBB, xHome, { step: 0.55 }).f(TF.ramp(u, 20, 23.3), u - 20), yBA);
  };

  TF.transport({ id: 'Underground', period: 24, layer: 'back', box: { x: 0, y: G0 - 10, w: L.W, h: L.H - G0 + 20 },
    draw(ctx, t, theme, lod) {
      const u = s24(t);
      // soil already painted by shells; rooms
      // W-core pits
      chamber(ctx, PITS, '#efeae1');
      const shafts = L.core.shafts;
      for (const k of Object.keys(shafts)) {
        const [a, b] = shafts[k];
        D.rect(ctx, a + 2, G0, b - a - 4, PITS.h - 8, '#e4ded5', '#c3b8a6', 1);
      }

      // ----- BA coolant plant: buffer tank (valve + ladder) + chiller; blue supply up, red return down -----
      chamber(ctx, BA, '#eef2f6');
      const FL = G0 + BA.h - 12;
      const tankX = BA.x + 80, tankW = 160, tankH = 160, tankY = G0 + 100;   // top lowered (R3-1): robot + railing fit below G0
      // level: low 0-8, fills after the valve 8-16, drains 16-24 back to low
      const clev = u < 8 ? 0.28 : u < 16 ? 0.28 + TF.ramp(u, 8, 16) * 0.52 : 0.80 - TF.ramp(u, 16, 24) * 0.52;
      D.rect(ctx, tankX, tankY, tankW, tankH, '#e2e8f0', '#64748b', 1.5);
      D.rect(ctx, tankX + 3, tankY + tankH * (1 - clev), tankW - 6, tankH * clev, '#7dd3fc');
      D.rect(ctx, tankX, tankY, tankW, tankH, null, '#64748b', 1.5);
      K.gauge(ctx, tankX + tankW - 26, tankY + 30, 14, clev, lod);
      // west-wall ladder (outside the tank), roof catwalk + railing, roof valve on a pipe stub
      K.ladder(ctx, UT.ladX, FL, (FL - UT.roofY) / M, 0.3);
      D.rect(ctx, tankX - 22, UT.roofY, 100, 3, '#94a3b8', '#475569', 1);
      D.line(ctx, [[tankX - 22, UT.roofY], [tankX - 22, UT.roofY - 22], [tankX - 22 + 8, UT.roofY - 22]], '#64748b', 2);
      D.line(ctx, [[tankX + 78, UT.roofY], [tankX + 78, UT.roofY - 22]], '#64748b', 2);
      D.line(ctx, [[UT.vx, tankY], [UT.vx, UT.vy + 8]], '#64748b', 4);
      const vAng = (u >= 8 && u < 10) ? 0.2 + (u - 8) * Math.PI : 0.2;
      K.valve(ctx, UT.vx, UT.vy, 8, vAng);
      // chiller: body, louvres, two fan tops, compressor drum with spinning coupling
      const cx0 = BA.x + 280, cw = 170, cTop = G0 + 214;
      D.rect(ctx, cx0, cTop, cw, FL - cTop, '#d5dde6', '#475569', 1.8);
      for (let y = cTop + 12; y < cTop + 62; y += 8) D.line(ctx, [[cx0 + 10, y], [cx0 + cw - 10, y]], '#94a3b8', 2);
      D.rect(ctx, cx0 + 4, cTop - 8, cw - 8, 8, '#94a3b8', '#475569', 1);
      fanTop(ctx, cx0 + 42, cTop - 14, 30, 9, u / 24 * TAU * 24);
      fanTop(ctx, cx0 + cw - 42, cTop - 14, 30, 9, u / 24 * TAU * 24 + 1);
      // compressor drum (horizontal cylinder) + motor
      const dY = cTop + 84, dH = 40;
      D.rect(ctx, cx0 + 16, dY, 112, dH, '#94a3b8', '#334155', 1.5);
      D.circle(ctx, cx0 + 16, dY + dH / 2, dH / 2, '#94a3b8', '#334155', 1.5);
      D.circle(ctx, cx0 + 128, dY + dH / 2, dH / 2, '#94a3b8', '#334155', 1.5);
      D.line(ctx, [[cx0 + 24, dY + 10], [cx0 + 126, dY + 10]], '#e2e8f0', 3);
      D.rect(ctx, cx0 + 142, dY + 6, 22, dH - 12, '#1d4ed8', '#1e3a8a', 1.2);
      if (lod !== 'far') { D.circle(ctx, cx0 + 128, dY + dH / 2, 11, '#cbd5e1', '#334155', 1); spokes(ctx, cx0 + 128, dY + dH / 2, 10, u / 24 * TAU * 24, 4, '#334155'); }
      D.rect(ctx, cx0 + 12, FL - 6, cw - 24, 6, '#64748b');
      // tank -> chiller (cold buffer), blue supply up the riser, red warm return down it
      K.pipe(ctx, [[cx0, tankY + tankH - 20], [tankX + tankW, tankY + tankH - 20]], '#3b82f6', 6, u * 8, lod, '#dbeafe');
      K.pipe(ctx, [[cx0 + 78, cTop - 8], [cx0 + 78, G0]], '#2563eb', 8, u * 8, lod, '#dbeafe');   // cold supply up
      K.pipe(ctx, [[cx0 + 98, G0], [cx0 + 98, cTop - 8]], '#dc2626', 8, u * 8, lod, '#fecaca');   // warm return down

      // ----- BB Megapack room: five Megapack cabinets, cabled up the riser to the factory -----
      chamber(ctx, BB, '#eef2f6');
      const mpW = 145, mpH = 130, mpTop = G0 + BB.h - 12 - mpH, busY = G0 + 150;
      K.pipe(ctx, [[BB.x + 150 + 4 * 165 + mpW, busY], [BB.x + 20, busY], [BB.x + 20, G0]], '#1e293b', 7, u * 8, lod, '#fde047');   // DC bus up the riser
      for (let i = 0; i < 5; i++) {
        const x = BB.x + 150 + i * 165;
        K.pipe(ctx, [[x + mpW / 2, mpTop], [x + mpW / 2, busY]], '#475569', 4, -u * 8 + 0, lod, '#fde047');
        D.rect(ctx, x, mpTop, mpW, mpH, '#f8fafc', '#64748b', 1.8);
        D.rect(ctx, x, mpTop + mpH - 8, mpW, 8, '#94a3b8');                       // plinth
        for (let d = 1; d < 3; d++) D.line(ctx, [[x + d * mpW / 3, mpTop + 4], [x + d * mpW / 3, mpTop + mpH - 10]], '#cbd5e1', 1.5);   // door seams
        if (lod !== 'far') for (let g = 0; g < 7; g++) D.line(ctx, [[x + 8, mpTop + 56 + g * 7], [x + mpW / 3 - 8, mpTop + 56 + g * 7]], '#94a3b8', 2);   // vent grille
        if (lod !== 'far') for (let g = 0; g < 5; g++) D.line(ctx, [[x + mpW - 8 - mpW / 3 + 8, mpTop + 56 + g * 8], [x + mpW - 8, mpTop + 56 + g * 8]], '#cbd5e1', 2);
        // status LEDs: green steady, charge LED pulses 3 s
        const pulse = 0.5 + 0.5 * Math.sin(u / 3 * TAU + i);
        D.circle(ctx, x + 14, mpTop + 14, 3.5, '#22c55e');
        D.circle(ctx, x + 28, mpTop + 14, 3.5, pulse > 0.5 ? '#38bdf8' : '#7dd3fc');
        D.circle(ctx, x + 42, mpTop + 14, 3.5, i === 3 && TF.mod(u, 6) < 3 ? '#f59e0b' : '#d6d3d1');
        D.rect(ctx, x + mpW - 50, mpTop + 8, 40, 14, '#1e293b', '#0f172a', 0.8);   // lintel strip / badge
      }
      // service panel on cabinet 1 (the utility Optimus works it)
      if (lod !== 'far') D.screen(ctx, BB.x + 190, mpTop + 22, 50, 22, (sx, sy, sw, sh) => {
        ctx.fillStyle = '#4ade80'; ctx.fillRect(sx + 4, sy + 5, sw * (0.6 + 0.2 * Math.sin(u / 24 * TAU)) , 6);
      });

      // ----- pump vault: two buried tanks, two big pumps (motor + volute), ship fuel line -----
      chamber(ctx, VAU, '#e8eef3');
      const lev = buriedLevel(u), VF = G0 + VAU.h - 12;
      const tanks = [[VAU.x + 40, '#dbeafe', 1], [VAU.x + 200, '#ecfccb', 0]];
      tanks.forEach(([x, col, frost]) => {
        D.rect(ctx, x, G0 + 40, 130, 280, '#cbd5e1', '#64748b', 1.5);
        D.rect(ctx, x + 4, G0 + 40 + 280 * (1 - lev), 122, 280 * lev, col);
        if (frost) D.line(ctx, [[x + 8, G0 + 40 + 280 * (1 - lev)], [x + 122, G0 + 40 + 280 * (1 - lev)]], '#bfdbfe', 2);
        D.rect(ctx, x, G0 + 40, 130, 280, null, '#64748b', 1.5);
      });
      const px = VAU.x + 410, py1 = G0 + 110, py2 = G0 + 250;  // volute centres: CH4 top, LOX bottom
      const spin = u / 24 * TAU * 12;
      const pump = (cy, col) => {
        D.rect(ctx, px + 36, cy - 20, 72, 40, '#334155', '#0f172a', 1.5);                   // motor
        for (let f = 0; f < 4; f++) D.line(ctx, [[px + 52 + f * 14, cy - 18], [px + 52 + f * 14, cy + 18]], '#64748b', 2);
        D.line(ctx, [[px + 14, cy], [px + 36, cy]], '#cbd5e1', 5);                         // shaft
        D.circle(ctx, px, cy, 30, '#94a3b8', '#334155', 2);                                // volute casing
        D.circle(ctx, px, cy, 22, col, '#334155', 1);
        spokes(ctx, px, cy, 20, spin, 5, '#1e293b');                                       // impeller
        D.circle(ctx, px, cy, 4, '#1e293b');
        D.rect(ctx, px - 36, cy + 30, 112, 6, '#64748b');                                  // skid
      };
      pump(py1, '#d9f99d'); pump(py2, '#bfdbfe');
      // suction: CH4 straight from its tank, LOX from under the tanks
      K.pipe(ctx, [[VAU.x + 330, py1], [px - 30, py1]], '#65a30d', 7, u * 8, lod, '#ecfccb');
      K.pipe(ctx, [[VAU.x + 105, G0 + 320], [VAU.x + 105, G0 + 345], [VAU.x + 350, G0 + 345], [VAU.x + 350, py2], [px - 30, py2]], '#64748b', 7, u * 8, lod, '#bfdbfe');
      // fill pipes up to the farm (while the truck pumps)
      K.pipe(ctx, [[VAU.x + 100, G0 + 40], [VAU.x + 100, G0]], '#64748b', 6, u >= 4 && u < 14 ? u * 10 : null, lod, '#93c5fd');
      K.pipe(ctx, [[VAU.x + 260, G0 + 40], [VAU.x + 260, G0]], '#84cc16', 6, u >= 4 && u < 14 ? u * 10 : null, lod, '#ecfccb');
      // discharge to the ship fuel line (trench)
      K.pipe(ctx, [[px, py1 - 30], [px, G0 + 60], [VAU.x + VAU.w - 8, G0 + 60]], '#65a30d', 8, u * 8, lod, '#ecfccb');
      K.pipe(ctx, [[px, py2 - 30], [px, G0 + 190], [VAU.x + VAU.w - 8, G0 + 190]], '#3b82f6', 8, u * 8, lod, '#dbeafe');

      // ----- trench to the launch mount (2 pipes: CH4 above, LOX below) -----
      chamber(ctx, TR, '#e8eef3');
      K.pipe(ctx, [[VAU.x + VAU.w - 8, G0 + 60], [TR.x + TR.w - 50, G0 + 60], [TR.x + TR.w - 50, G0]], '#65a30d', 8, u * 8, lod, '#ecfccb');
      K.pipe(ctx, [[VAU.x + VAU.w - 8, G0 + 190], [TR.x + TR.w - 30, G0 + 190], [TR.x + TR.w - 30, G0]], '#3b82f6', 8, u * 8, lod, '#dbeafe');

      // utility Optimus (BA + BB)
      if (lod !== 'far') {
        const st = utilAt(t);
        A.draw(ctx, { x: st.x, face: st.face, pose: st.pose }, st.y);
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
