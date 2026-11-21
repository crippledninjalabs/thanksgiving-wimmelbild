// Underground strip: W-core pits, BA coolant, BB Megapack, gopher burrows, pump vault + buried
// tanks, trench, Boring tunnel (FACTORY-MAP §5). Continuity: every moving item has a source and a sink.
(function (G) {
  const TF = G.TF, TF3 = G.TF3, L = TF.layout, D = TF.draw, K = TF.kit, A = TF.act, M = TF.M;
  TF.claimedZones = Object.assign(TF.claimedZones || {}, {
    PITS: 1, BA: 1, BB: 1, BURROWS: 1, VAULT: 1, TRENCH: 1, TUNNEL: 1
  });
  const G0 = L.G, s24 = (t) => TF.mod(t, 24);
  const BA = L.zoneById('BA').box, BB = L.zoneById('BB').box, BUR = L.zoneById('BURROWS').box;
  const VAU = L.zoneById('VAULT').box, TR = L.zoneById('TRENCH').box, TUN = L.zoneById('TUNNEL').box;
  const PITS = L.zoneById('PITS').box, SHAFT = L.zoneById('SHAFT').box;
  const gophersGag = { id: 'gophers', P: 53, offset: 7, cycles: 1, room: 'BURROWS', trigger: 'one gopher wakes, pops out of the lawn hole, looks around, and goes back to sleep' };
  TF.gagHook(gophersGag);

  const chamber = (ctx, b, fill) => {
    D.rect(ctx, b.x + 4, b.y + 4, b.w - 8, b.h - 8, fill || '#f3efe7', '#d6cbb8', 1.5);
  };
  const buriedLevel = (u) => {
    const lo = 0.35, hi = 0.78;
    if (u >= 4 && u < 14) return lo + TF.ramp(u, 4, 14) * (hi - lo);
    const p = u >= 14 ? (u - 14) / 14 : (10 + u) / 14;
    return hi - p * (hi - lo);
  };

  // utility Optimus: BA climb/valve then walk to BB screens and back (24 s)
  const utilAt = (t) => {
    const u = s24(t);
    const yBA = G0 + BA.h - 12, yValve = G0 + 80, yBB = G0 + BB.h - 12;
    const xTank = BA.x + 160, xValve = BA.x + 150, xBB = BB.x + 220, xHome = BA.x + 80;
    let x = xHome, y = yBA, face = 1, pose = A.idle(t), carry = false;
    if (u < 4) { x = xHome; y = yBA; pose = A.idle(t); }
    else if (u < 8) { // climb
      x = xValve; y = TF.lerp(yBA, yValve, TF.ramp(u, 4, 8));
      pose = A.reach([0.3, 1.6], [0.2, 1.4], { gripN: 1, head: -0.4 });
    } else if (u < 10) { // turn valve
      x = xValve; y = yValve;
      pose = A.reach([0.45, 1.2], [0.2, 1.1], { gripN: 1, lean: 0.15 });
    } else if (u < 14) { // down
      x = xValve; y = TF.lerp(yValve, yBA, TF.ramp(u, 10, 14));
      pose = A.reach([0.3, 1.6], [0.2, 1.4], { gripN: 1, head: -0.4 });
    } else if (u < 16) { // walk to BB
      x = TF.lerp(xValve, xBB, TF.ramp(u, 14, 16)); y = yBA; face = 1;
      pose = A.idle(t); // walk-ish: use a reach swing
      const st = A.walk(2, xValve, xBB, { step: 0.55 }).f(TF.ramp(u, 14, 16), (u - 14));
      return { x: st.x, face: st.face, pose: st.pose, y: yBA };
    } else if (u < 20) {
      x = xBB; y = yBB; face = 1;
      pose = A.reach([0.4, 1.1], [0.2, 1.0], { gripN: 0.4, head: -0.1 });
    } else {
      const st = A.walk(4, xBB, xHome, { step: 0.55 }).f(TF.ramp(u, 20, 24), (u - 20));
      return { x: st.x, face: st.face, pose: st.pose, y: yBA };
    }
    return { x, face, pose, y };
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

      // ----- BA coolant plant -----
      chamber(ctx, BA, '#eef2f6');
      const tankX = BA.x + 80, tankW = 160, tankH = 220, tankY = G0 + 40;
      // level: low 0-8, fills after the valve 8-16, drains 16-24 back to low
      const clev = u < 8 ? 0.28 : u < 16 ? 0.28 + TF.ramp(u, 8, 16) * 0.52 : 0.80 - TF.ramp(u, 16, 24) * 0.52;
      D.rect(ctx, tankX, tankY, tankW, tankH, '#e2e8f0', '#64748b', 1.5);
      D.rect(ctx, tankX + 3, tankY + tankH * (1 - clev), tankW - 6, tankH * clev, '#7dd3fc');
      D.rect(ctx, tankX, tankY, tankW, tankH, null, '#64748b', 1.5);
      K.gauge(ctx, tankX + tankW + 24, tankY + 30, 16, clev, lod);
      K.ladder(ctx, tankX + 20, G0 + BA.h - 12, (G0 + BA.h - 12 - (tankY + 20)) / M, 0.3);
      const vAng = (u >= 8 && u < 10) ? (u - 8) * Math.PI : 0.2;
      K.valve(ctx, tankX + 70, tankY + 20, 10, vAng);
      // pumps + riser up
      D.rect(ctx, BA.x + 300, G0 + 200, 50, 40, '#94a3b8', '#334155', 1);
      D.circle(ctx, BA.x + 325, G0 + 220, 12, '#cbd5e1', '#334155', 1);
      K.pipe(ctx, [[tankX + tankW, tankY + tankH - 20], [BA.x + 300, tankY + tankH - 20], [BA.x + 325, G0 + 200]], '#64748b', 6, u * 8, lod, '#bae6fd');
      K.pipe(ctx, [[BA.x + 325, G0 + 200], [BA.x + 325, G0]], '#64748b', 8, u * 8, lod, '#bae6fd'); // up the riser

      // ----- BB Megapack room -----
      chamber(ctx, BB, '#eef2f6');
      for (let i = 0; i < 4; i++) {
        const x = BB.x + 40 + i * 100, y = G0 + 80;
        D.rect(ctx, x, y, 70, 200, '#1e293b', '#0f172a', 1.2);
        // charge bars (steady-ish with a slow pulse, same at 0 and 24)
        const ch = 0.7 + 0.08 * Math.sin((u / 24) * Math.PI * 2 + i);
        D.rect(ctx, x + 14, y + 20 + (1 - ch) * 160, 16, ch * 160, '#4ade80');
        D.rect(ctx, x + 40, y + 20 + (1 - ch * 0.9) * 160, 16, ch * 0.9 * 160, '#22d3ee');
        if (lod !== 'far') D.screen(ctx, x + 10, y + 8, 50, 16, (sx, sy, sw, sh) => {
          ctx.fillStyle = '#4ade80'; ctx.fillRect(sx + 4, sy + 5, sw * ch * 0.8, 6);
        });
      }
      // riser in/out
      K.pipe(ctx, [[BA.x + BA.w - 4, G0 + 40], [BB.x + 20, G0 + 40], [BB.x + 20, G0]], '#64748b', 6, u * 8, lod, '#fde68a');

      // ----- burrows (soil band, no pipes crossed) -----
      D.rect(ctx, BUR.x + 4, BUR.y + 4, BUR.w - 8, BUR.h - 8, '#e8dcc8', '#d1c0a5', 1.5);
      // winding burrow tunnels
      const dens = [
        [BUR.x + 80, G0 + 80, BUR.x + 280, G0 + 200, BUR.x + 500, G0 + 140],
        [BUR.x + 500, G0 + 140, BUR.x + 800, G0 + 80, BUR.x + 1100, G0 + 200],
        [BUR.x + 1100, G0 + 200, BUR.x + 1400, G0 + 100, BUR.x + BUR.w - 40, G0 + 160],
        [BUR.x + 280, G0 + 200, BUR.x + 400, G0 + 300, BUR.x + 700, G0 + 260],
      ];
      ctx.lineCap = 'round';
      for (const d of dens) {
        ctx.beginPath(); ctx.moveTo(d[0], d[1]); ctx.quadraticCurveTo(d[2], d[3], d[4], d[5]);
        ctx.strokeStyle = '#6b5344'; ctx.lineWidth = 22; ctx.stroke();
        ctx.strokeStyle = '#3f2e24'; ctx.lineWidth = 16; ctx.stroke();
      }
      // nest chamber
      const nx = BUR.x + 700, ny = G0 + 250;
      D.circle(ctx, nx, ny, 36, '#3f2e24'); D.circle(ctx, nx, ny, 28, '#6b5344');
      const breath = 0.015 * Math.sin(u * Math.PI * 2 / 3);
      const gagOn = TF.gagActive(gophersGag, t);
      const g = TF.mod(t - gophersGag.offset, gophersGag.P);
      // family of 3 asleep; during the gag one of them travels to the lawn hole (0-8 up, 8-14 peek, 14-24 back)
      const hole = TF.stage3.gopherHole;
      let traveler = null;
      if (gagOn) {
        const hy = G0, hx = hole.x;
        if (g < 8) traveler = { x: TF.lerp(nx, hx, TF.ramp(g, 0, 8)), y: TF.lerp(ny, hy, TF.ramp(g, 0, 8)), awake: 1 };
        else if (g < 14) traveler = { x: hx, y: hy, awake: 1, peek: 1 };
        else traveler = { x: TF.lerp(hx, nx, TF.ramp(g, 14, 24)), y: TF.lerp(hy, ny, TF.ramp(g, 14, 24)), awake: 1 };
      }
      const drawG = TF.stage3.gopher;
      if (lod !== 'far') {
        drawG(ctx, nx - 16, ny + 8, 1, breath, false);
        drawG(ctx, nx + 14, ny + 10, -1, breath * 0.8, false);
        if (traveler) drawG(ctx, traveler.x, traveler.y, 1, 0.01, true);
        else drawG(ctx, nx, ny + 4, 1, breath * 1.1, false);
      }

      // ----- pump vault + buried tanks -----
      chamber(ctx, VAU, '#e8eef3');
      const lev = buriedLevel(u);
      // LOX (left, frosty) + CH4 (right)
      const tanks = [[VAU.x + 40, '#dbeafe', 1], [VAU.x + 200, '#ecfccb', 0]];
      tanks.forEach(([x, col, frost], i) => {
        D.rect(ctx, x, G0 + 40, 130, 280, '#cbd5e1', '#64748b', 1.5);
        D.rect(ctx, x + 4, G0 + 40 + 280 * (1 - lev), 122, 280 * lev, col);
        if (frost) D.line(ctx, [[x + 8, G0 + 40 + 280 * (1 - lev)], [x + 122, G0 + 40 + 280 * (1 - lev)]], '#bfdbfe', 2);
        D.rect(ctx, x, G0 + 40, 130, 280, null, '#64748b', 1.5);
      });
      // pumps / valves
      D.rect(ctx, VAU.x + 380, G0 + 200, 60, 50, '#94a3b8', '#334155', 1);
      K.valve(ctx, VAU.x + 410, G0 + 190, 10, u >= 4 && u < 14 ? u * 1.2 : 0.3);
      K.pipe(ctx, [[VAU.x + 170, G0 + 300], [VAU.x + 380, G0 + 300], [VAU.x + 410, G0 + 250]], '#64748b', 7, u >= 4 && u < 14 ? u * 10 : null, lod, '#bfdbfe');
      // fill pipe up to the farm
      K.pipe(ctx, [[VAU.x + 100, G0 + 40], [VAU.x + 100, G0]], '#64748b', 6, u >= 4 && u < 14 ? u * 10 : null, lod, '#93c5fd');
      K.pipe(ctx, [[VAU.x + 260, G0 + 40], [VAU.x + 260, G0]], '#84cc16', 6, u >= 4 && u < 14 ? u * 10 : null, lod, '#ecfccb');

      // ----- trench to the launch mount (2 pipes) -----
      chamber(ctx, TR, '#e8eef3');
      K.pipe(ctx, [[VAU.x + VAU.w - 8, G0 + 200], [TR.x + 40, G0 + 200], [TR.x + TR.w - 30, G0 + 80], [TR.x + TR.w - 30, G0]], '#64748b', 8, u * 6, lod, '#bfdbfe');
      K.pipe(ctx, [[VAU.x + VAU.w - 8, G0 + 230], [TR.x + 40, G0 + 240], [TR.x + TR.w - 50, G0 + 110], [TR.x + TR.w - 50, G0]], '#84cc16', 8, u * 6, lod, '#ecfccb');

      // ----- Boring tunnel -----
      D.rect(ctx, TUN.x, TUN.y, TUN.w, TUN.h, '#d6cbb8', '#b8a48c', 2);
      // excavated bore
      const crown = TUN.y + 16, floor = TUN.y + TUN.h - 16, midY = (crown + floor) / 2, boreR = (floor - crown) / 2;
      ctx.beginPath(); ctx.moveTo(TUN.x, midY); ctx.lineTo(TUN.x, floor); ctx.lineTo(TUN.x + TUN.w, floor); ctx.lineTo(TUN.x + TUN.w, midY);
      ctx.strokeStyle = '#a89078'; ctx.lineWidth = 2; ctx.stroke();
      // rock mask at the east end (cutter always inside)
      const maskX = TUN.x + TUN.w - 220;
      D.rect(ctx, maskX, TUN.y, TUN.x + TUN.w - maskX, TUN.h, '#c4b49a', '#9a8870', 1);
      // static lining rings (never move), west of the shield
      const Lring = 80, shieldX = maskX - 10;
      for (let x = SHAFT.x + SHAFT.w + 10; x < shieldX - 4; x += Lring) {
        ctx.beginPath(); ctx.ellipse(x + Lring / 2, midY, 8, boreR - 4, 0, 0, Math.PI * 2);
        ctx.strokeStyle = '#8a7a66'; ctx.lineWidth = 3; ctx.stroke();
      }
      // train: support cars, period L, shift L*s(τ) mod L so τ=0 and τ=24 match
      const sPush = u >= 2 && u < 14 ? TF.ramp(u, 2, 14) : (u >= 14 ? 1 : 0);
      const shift = (Lring * sPush) % Lring;          // 0 at both ends of the loop
      const tailX = SHAFT.x + SHAFT.w;                 // tail stays behind the shaft wall
      for (let x = tailX + shift - Lring; x < shieldX; x += Lring) {
        if (x + 10 < tailX) continue;
        D.rect(ctx, x + 8, midY - 22, Lring - 16, 44, '#94a3b8', '#334155', 1);
        D.circle(ctx, x + 18, midY + 24, 6, '#1f2937'); D.circle(ctx, x + Lring - 18, midY + 24, 6, '#1f2937');
      }
      // cutter head inside the mask (slight rotation)
      const cutX = maskX + 40;
      ctx.save(); ctx.translate(cutX, midY); ctx.rotate(u / 24 * Math.PI * 2);
      D.circle(ctx, 0, 0, boreR - 6, '#6b737b', '#1f2937', 2);
      for (let k = 0; k < 6; k++) D.line(ctx, [[0, 0], [Math.cos(k * Math.PI / 3) * (boreR - 8), Math.sin(k * Math.PI / 3) * (boreR - 8)]], '#1f2937', 2);
      ctx.restore();
      // gantry conveyor: one ring set east per 24 s, enters the mask at 19-20
      const convX = TF.keys(u, [[0, tailX + 200], [19, maskX + 20], [20, maskX + 80], [24, maskX + 80]]);
      if (u < 20.5) D.rect(ctx, convX - 16, midY - 50, 32, 10, '#9aa3ab', '#57534e', 0.8);
      // muck belt west into the shaft hopper
      D.line(ctx, [[cutX - 40, midY + 28], [SHAFT.x + SHAFT.w / 2, midY + 28]], '#57534e', 5);
      if (lod !== 'far') {
        const dirtX = TF.lerp(cutX - 40, SHAFT.x + SHAFT.w / 2, TF.mod(u * 0.4, 1));
        D.circle(ctx, dirtX, midY + 28, 5, '#a8a29e', '#78716c', 0.6);
      }
      // hopper in the shaft, level rises 0-20, drops 20-24
      const hopL = u < 20 ? TF.lin(u, 0, 20) : 1 - TF.ramp(u, 20, 24);
      const hx = SHAFT.x + 30, hy = TUN.y + 20, hh = 70, hw = SHAFT.w - 60;
      D.rect(ctx, hx, hy, hw, hh, '#e7e5e4', '#78716c', 1);
      D.rect(ctx, hx + 2, hy + hh * (1 - hopL), hw - 4, hh * hopL, '#a8a29e');
      // shaft walls down from grade
      D.rect(ctx, SHAFT.x + 8, G0, 8, TUN.y + TUN.h - G0, '#c3c9d0', '#9aa3ab', 1);
      D.rect(ctx, SHAFT.x + SHAFT.w - 16, G0, 8, TUN.y + TUN.h - G0, '#c3c9d0', '#9aa3ab', 1);

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
    { item: 'dirt lumps', from: 'TUNNEL', via: ['SHAFT'], to: 'YARD', sink: 'brick press', owner: 'Underground' },
    { item: 'tunnel ring sets', from: 'YARD', via: ['SHAFT'], to: 'TUNNEL', sink: 'lining (into the rock mask)', owner: 'Underground' },
    { item: 'LOX + CH4', from: 'VAULT', via: ['TRENCH'], to: 'MOUNT', sink: 'booster QD + ship QD', owner: 'Underground' }
  );
})(typeof window !== 'undefined' ? window : globalThis);
