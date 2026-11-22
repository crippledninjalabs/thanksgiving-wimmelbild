// TF.supply — the three sources and the return loop for every carrier in the building (BRIEF-STAGE2 rule 2):
//   (a) DOCK (ground floor of the west core): truck backs in, AGV forklift unloads pallets (pallet A -> BL cage,
//       pallet B -> sort table), the DOCK Optimus sorts parts into the W3 and PT outboxes, the automatic loaders hop
//       them into the waiting basket / capsule; empties come back down and are unloaded into the backload bin.
//   (b) ROOF drone pad (16 s timer) -> tube inlet -> capsule to its receiver.
//   (c) WINDOW drones (48 s timers, staggered) drop a part into a wall tube opening -> capsule to its receiver.
// Generic carriers: TF.supply.basket(cfg) (zip-line baskets on W3 + floor cables, multi-stop) and
// TF.supply.capsule(cfg) (PT tubes). Every period divides 48.
(function (G) {
  const TF = G.TF, L = TF.layout, D = TF.draw, K = TF.kit, A = TF.act, M = TF.M;
  const S = (TF.supply = { baskets: [], capsules: [] });
  const DOCKY = L.G - 30, W3u = L.core.W3up, W3d = L.core.W3dn, RS = L.core.PTx - 6, RR = L.core.PTx + 7, G0 = L.G;
  const cableY = (f) => L.hY(f, L.rail.cable), tubeY = (f) => L.hY(f, L.rail.tube), tubeR = (f) => L.hY(f, L.rail.tubeR);
  S.DOCKY = DOCKY;

  // ---------- item drawings (payloads) ----------
  const R_TIRE = 0.37 * M;   // = wheel radius on the car at the mount station (5C Model Y)
  const IT = (S.items = {
    box: (c, x, y) => D.rect(c, x - 6, y - 8, 12, 8, '#c99b5f', '#7d5a2c', 0.6),
    crate: (c, x, y) => { D.rect(c, x - 9, y - 10, 18, 10, '#b98b52', '#6b4a22', 0.7); D.line(c, [[x - 9, y - 5], [x + 9, y - 5]], '#8a6a3a', 0.6); },
    R_TIRE,
    tire: (c, x, y, r = R_TIRE, o) => S.items.tireAt(c, x, y - r, r, o),   // x,y = bottom of the tyre
    // same look as B.wheel on the car (tyre, rim ring, 5 spokes, hub); (x,y) = centre; o = { ang, rim, cover }
    tireAt: (c, x, y, r = R_TIRE, o) => { o = o || {}; const rim = o.rim || '#9aa1a8', a0 = o.ang || 0;
      D.circle(c, x, y, r, '#1d1f22', '#000000', 0.8); D.circle(c, x, y, r * 0.62, rim, '#5d656d', 0.6);
      if (r >= 5) for (let k = 0; k < 5; k++) { const a = a0 + k * Math.PI * 2 / 5; D.line(c, [[x + Math.cos(a) * r * 0.15, y + Math.sin(a) * r * 0.15], [x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55]], '#6b737b', Math.max(0.8, r * 0.12)); }
      D.circle(c, x, y, r * 0.13, '#4a5056');
      if (o.cover) D.circle(c, x, y, r * 0.62, '#e4c286', '#bf9a5e', 0.8); },
    pane: (c, x, y) => D.poly(c, [[x - 10, y], [x + 10, y], [x + 7, y - 12], [x - 7, y - 12]], 'rgba(120,160,190,0.7)', '#5d7d96', 0.6),
    blank: (c, x, y) => D.rect(c, x - 12, y - 3, 24, 2.5, '#c9d0d6', '#7b848c', 0.5),
    seat: (c, x, y) => D.poly(c, [[x - 7, y], [x + 5, y], [x + 4, y - 4], [x - 2, y - 4], [x - 5, y - 13], [x - 8, y - 12]], '#3d3935', '#111', 0.5),
    tote: (c, x, y) => { D.rect(c, x - 10, y - 8, 20, 8, '#2f6fb0', '#1d4570', 0.6); },
    wheels: (c, x, y, r = R_TIRE) => { S.items.tote(c, x, y); for (let k = 0; k < 2; k++) S.items.tire(c, x, y - 8 - k * 2 * r, r); },   // R3-core-f1238: the pair rides in its tray (same as the wheel stands' tote + tyres)   // car-size pair, stacked (x,y = bottom)
    wtote: (c, x, y) => D.rect(c, x - 38, y - 8, 76, 8, '#2f6fb0', '#1d4570', 0.6),   // wheel tote, same anchor as tote
    powder: (c, x, y) => { D.rect(c, x - 9, y - 9, 8, 9, '#e5e7eb', '#6b737b', 0.6); D.circle(c, x + 5, y - 5, 5, '#c08457', '#7a5230', 0.6); },
    groceries: (c, x, y) => { D.rect(c, x - 8, y - 8, 16, 8, '#86efac', '#3f6f4f', 0.6); D.circle(c, x - 3, y - 9, 2.5, '#f97316'); D.circle(c, x + 3, y - 9, 2.5, '#ef4444'); },
    foodcrate: (c, x, y) => D.rect(c, x - 8, y - 9, 16, 9, '#fcd34d', '#a16207', 0.6),
    pack: (c, x, y) => D.rect(c, x - 11, y - 5, 22, 5, '#2a2e33', '#111', 0.6),
    kitflat: (c, x, y) => D.rect(c, x - 12, y - 4, 24, 4, '#d6b07a', '#7d5a2c', 0.6),
    scrap: (c, x, y) => { D.rect(c, x - 8, y - 8, 16, 8, '#6b7280', '#374151', 0.6); D.line(c, [[x - 5, y - 6], [x + 5, y - 3]], '#e5e7eb', 0.6); },
    chip: (c, x, y) => D.rect(c, x - 5, y - 5, 10, 5, '#14532d', '#052e16', 0.6),
    lamp: (c, x, y) => { D.rect(c, x - 6, y - 5, 12, 5, '#e5e7eb', '#6b737b', 0.6); D.circle(c, x, y - 2.5, 2, '#fde68a'); },
    sensor: (c, x, y) => { D.rect(c, x - 5, y - 6, 10, 6, '#1f2937', '#000', 0.6); D.circle(c, x, y - 3, 2, '#60a5fa'); },
    cabScreen: (c, x, y) => { D.rect(c, x - 7, y - 5, 14, 5, '#0b1220', '#38bdf8', 0.6); D.rect(c, x - 5, y - 4, 10, 3, '#38bdf8'); },
    computer: (c, x, y) => D.rect(c, x - 6, y - 4, 12, 4, '#1f2937', '#60a5fa', 0.6),
  });

  // ---------- generic multi-stop basket route ----------
  // cfg: {id, owner, period, journey, dep (departure from base, tau in the journey), base: 'dock' | {floor, x},
  //       stops: [{floor, x, dwell, drop (units), unload: [kinds], load: [kinds]}], start: [kinds loaded at base],
  //       variants?: (i) -> stops (per fleet member)}
  S.basket = (cfg) => {
    const r = Object.assign({ n: cfg.journey / cfg.period, start: [] }, cfg);
    r.build = (stops) => {
      const pts = [], keys = []; let t = 0, s = 0;
      const push = (p) => { if (pts.length) s += Math.hypot(p[0] - pts[pts.length - 1][0], p[1] - pts[pts.length - 1][1]); pts.push(p); };
      const leg = (p, drop = 0) => { const a = pts[pts.length - 1]; push(p); t += Math.max(0.35, Math.hypot(p[0] - a[0], p[1] - a[1]) / 520); keys.push([t, s, drop]); };
      const base = r.base === 'dock' ? [W3u, DOCKY] : [r.base.x, cableY(r.base.floor)];
      push(base); keys.push([0, 0, r.base === 'dock' ? 0 : r.base.drop || 0]);
      if (r.base !== 'dock') { t += 0.6; keys.push([t, 0, 0]); }
      let cur = { floor: r.base === 'dock' ? 0 : r.base.floor, x: base[0] };
      const win = [];
      const go = (floor, x) => {
        if (floor !== cur.floor) {
          const up = floor > cur.floor, rx = up ? W3u : W3d;
          if (cur.floor > 0) { leg([cur.x, cableY(cur.floor) - 7]); leg([rx, cableY(cur.floor) - 7]); }
          else if (!up) leg([rx, pts[pts.length - 1][1]]);
          leg([rx, floor > 0 ? cableY(floor) : DOCKY]);
        }
        if (floor > 0 && Math.abs(x - pts[pts.length - 1][0]) > 0.5) {
          const y = cableY(floor) - (x < pts[pts.length - 1][0] ? 7 : 0);
          if (Math.abs(pts[pts.length - 1][1] - y) > 0.5) leg([pts[pts.length - 1][0], y]);
          leg([x, y]); if (y !== cableY(floor)) leg([x, cableY(floor)]);
        }
        cur = { floor, x };
      };
      for (const st of stops) { go(st.floor, st.x); const a = t; t += 0.6; keys.push([t, s, st.drop || 0]); t += st.dwell || 1.5; keys.push([t, s, st.drop || 0]); t += 0.6; keys.push([t, s, 0]); win.push([a, t]); }
      if (r.base === 'dock') { go(0, W3d); if (pts[pts.length - 1][0] !== W3d) leg([W3d, DOCKY]); leg([W3u, DOCKY]); }
      else { go(r.base.floor, r.base.x); t += 0.6; keys.push([t, s, r.base.drop || 0]); }
      if (t > r.journey - 0.5) console.warn('[supply] basket route too long', r.id, t.toFixed(1), '>', r.journey);
      keys.push([r.journey, s, keys[keys.length - 1][2]]);
      const path = TF.track.path(pts);
      return { path, sched: TF.track.schedule(keys, r.journey), win, back: t, stops };
    };
    r.legs = Array.from({ length: r.n }, (_, i) => r.build(r.variants ? r.variants(i) : r.stops));
    // Held items at journey time u: [{k, p, h}] p = 0 on the table/shelf .. 1 in the gripper; h = rest height (m) of the table.
    // Unload = item lerps gripper -> table at the start of the dwell; load = table -> gripper at the end of it (0.6 s lower/raise keys).
    const TW = 0.5, REST_H = 1.0;
    r.held = (u, i) => {
      const lg = r.legs[i], out = [], fl = r.base === 'dock' ? 0 : r.base.floor;
      if (u >= r.journey - TW) { const p = r.base === 'dock' ? 1 : TF.ramp(u, r.journey - TW, r.journey); return r.start.map((k) => ({ k, p, h: REST_H, fl })); }
      if (u >= lg.back) return [];
      let c = r.start.map((k) => ({ k, p: 1 }));
      lg.stops.forEach((st, k) => {
        const a = lg.win[k][0] + 0.6, d = st.dwell || 1.5, tw = Math.min(TW, d / 2), fz = st.floor;
        if (u < a) return;
        const un = st.unload || [], ld = st.load || [];
        const keep = [], rel = [];
        const pool = un.slice();
        for (const it of c) { const j = pool.indexOf(it.k); if (j >= 0) { pool.splice(j, 1); if (u < a + tw) rel.push({ k: it.k, p: Math.min(it.p, 1 - TF.ramp(u, a, a + tw)), h: REST_H, fl: fz }); } else keep.push(it); }
        c = keep.concat(rel);
        const l0 = a + d - tw;
        if (u >= l0) for (const k2 of ld) c.push({ k: k2, p: TF.ramp(u, l0, a + d), h: REST_H, fl: fz });
        else if (u >= a + d) for (const k2 of ld) c.push({ k: k2, p: 1 });
      });
      return c;
    };
    r.content = (u, i) => r.held(u, i).map((x) => x.k);
    // true while member i's gripper is taking the base load (room hides its own table copy of the unit)
    r.holding = (t) => { for (let i = 0; i < r.n; i++) { const u = TF.mod(t - r.dep - i * r.period, r.journey); if (u >= r.journey - TW) return true; } return false; };
    // true while a drone owns the unit at stop k (unload: arrival .. end of the gripper->table lerp; load: start of table->gripper lerp .. leaving).
    // A room hides its own shelf copy while this is true, so there is one owner per frame.
    r.grip = (t, k) => { for (let i = 0; i < r.n; i++) { const lg = r.legs[i], st = lg.stops[k], u = TF.mod(t - r.dep - i * r.period, r.journey), w = lg.win[k], d = st.dwell || 1.5, tw = Math.min(TW, d / 2);
      if ((st.unload && st.unload.length && u >= w[0] && u < w[0] + 0.6 + tw) || (st.load && st.load.length && u >= w[0] + 0.6 + d - tw && u < w[1])) return true; } return false; };
    r.at = (t, i) => { const u = TF.mod(t - r.dep - i * r.period, r.journey), lg = r.legs[i], st = lg.sched(u), xy = lg.path.at(st.s);
      return { u, x: xy[0], y: xy[1], drop: st.k[0] }; };
    // absolute window (tau mod period) when member i sits at stop k
    r.window = (i, k) => r.legs[i].win[k].map((u) => TF.mod(u + r.dep + i * r.period, 48));
    S.baskets.push(r);
    return r;
  };

  // ---------- generic capsule route (PT tubes) ----------
  // cfg: {id, period, dep, from: 'dock' | {floor, x, h} (room) | {pts: [...]} (roof/window inlet), to: {floor, x, h}, col, item}
  S.capsule = (cfg) => {
    const r = Object.assign({ journey: 24, col: '#3f8fd0' }, cfg);
    const end = [r.to.x, L.hY(r.to.floor, r.to.h)];
    let sup, ret;
    if (r.from === 'dock') {
      sup = [[RS, DOCKY], [RS, tubeY(r.to.floor)], [r.to.x, tubeY(r.to.floor)], end];
      ret = [end, [r.to.x, tubeR(r.to.floor)], [RR, tubeR(r.to.floor)], [RR, DOCKY]];
    } else if (r.from.pts) { sup = r.from.pts.concat([end]); ret = sup.slice().reverse(); }
    else {
      const a = [r.from.x, L.hY(r.from.floor, r.from.h)], down = r.to.floor < r.from.floor, rz = down ? RR : RS;
      sup = [a, [a[0], tubeR(r.from.floor)], [rz, tubeR(r.from.floor)], [rz, tubeY(r.to.floor)], [r.to.x, tubeY(r.to.floor)], end];
      ret = sup.slice().reverse();
    }
    const legKeys = (pts, t0) => { const p = TF.track.path(pts), keys = [[t0, 0]]; let t = t0;
      for (let i = 1; i < pts.length; i++) { t += Math.max(0.3, (p.cum[i] - p.cum[i - 1]) / 600); keys.push([t, p.cum[i]]); } return { p, keys, end: t }; };
    const S1 = legKeys(sup, 0), o1 = S1.end + 0.8, R1 = legKeys(ret, o1);
    Object.assign(r, { sup: S1.p, ret: R1.p, open: [S1.end, o1], back: R1.end, n: r.journey / r.period });
    const fs = TF.track.schedule(S1.keys.concat([[o1, S1.p.total]]), 1e9), fr = TF.track.schedule(R1.keys, 1e9);
    r.at = (t, i) => { const u = TF.mod(t - r.dep - i * r.period, r.journey);
      if (u >= r.back) return null;
      const f = u < o1 ? fs : fr, path = u < o1 ? r.sup : r.ret;
      return { path, s: f(u).s, v: (f(u + 0.02).s - f(u - 0.02).s) / 0.04, u, full: u < S1.end + 0.4 }; };
    r.arrive = (i) => TF.mod(r.dep + i * r.period + S1.end, 48);   // absolute arrival at the receiver
    S.capsules.push(r);
    return r;
  };

  // ---------- drawing of the generic carriers ----------
  TF.transport({ id: 'supply-carriers', owner: 'CORE', period: 48, layer: 'main', box: { x: 0, y: 0, w: L.W, h: L.H },
    draw(ctx, t, theme, lod) {
      for (let f = 1; f <= L.floors; f++) if (f !== 6) TF.basket.cable(ctx, W3u, L.X1 - 12, cableY(f), lod);   // floor cables F(n)R
      for (const r of S.capsules) { TF.tube.draw(ctx, r.sup, lod); if (r.from === 'dock' || r.from.floor) TF.tube.draw(ctx, r.ret, lod); }
      if (lod === 'far') return;
      for (const r of S.capsules) for (let i = 0; i < r.n; i++) { const c = r.at(t, i); if (c && c.s > 1) TF.tube.capsule(ctx, c.path, c.s, c.v, lod, theme.decor.capsuleDecal, r.col);
        if (c && r.id === 'roof-chips' && c.path === r.sup && c.u < r.open[0] + 0.3) { const q = c.path.at(c.s); IT.chip(ctx, q[0], q[1] + 5); } }   // R3-core-f9: the chip rides on the capsule until 9A's tray draws it
      for (const r of S.baskets) for (let i = 0; i < r.n; i++) {
        const b = r.at(t, i), items = r.held(b.u, i);
        TF.basket.draw(ctx, b.x, b.y, b.drop, lod, items.length ? (c, px, py) => items.slice(0, 3).forEach((o, j) => {
          const k = o.k, fl = o.fl === 0 ? 0 : (o.fl || 0), ry = o.p < 1 && fl ? L.hY(fl, o.h) : py;   // table copy sits at the rest height
          IT[k](c, px + (j - (Math.min(items.length, 3) - 1) / 2) * (k === 'wheels' ? R_TIRE * 1.1 : 9), py + 1 + (ry - py) * (1 - o.p)); }) : null);
      }
    } });

  // ---------- (b) roof drone pad -> tube inlet (16 s) ----------
  const PAD = [L.X0 + 240, L.ceilY(L.floors) - L.slab], INLET = [L.X0 + 300, PAD[1]];
  S.roofCapsule = S.capsule({ id: 'roof-chips', period: 16, journey: 16, dep: 4.2, col: '#16a34a', item: 'chip',
    from: { pts: [[INLET[0], INLET[1] - 10], [INLET[0], L.ceilY(9) + 20]] }, to: { floor: 9, x: INLET[0], h: 4.6 } });
  TF.transport({ id: 'roof-pad', owner: 'ROOF', period: 16, layer: 'front', box: { x: PAD[0] - 300, y: PAD[1] - 400, w: 700, h: 420 },
    draw(ctx, t, theme, lod) {
      const u = TF.mod(t, 16);
      // pad deck with landing ring, edge lights (blink 1 s), wind sock, charger kiosk
      D.rect(ctx, PAD[0] - 50, PAD[1] - 6, 100, 6, '#9aa3ab', '#6d757d', 1);
      if (lod !== 'far') { for (let i = 0; i < 5; i++) D.circle(ctx, PAD[0] - 44 + i * 22, PAD[1] - 7, 1.8, TF.mod(t + i * 0.2, 1) < 0.5 ? '#4ade80' : '#14532d');
        D.line(ctx, [[PAD[0] - 70, PAD[1]], [PAD[0] - 70, PAD[1] - 60]], '#7b848c', 1.5);
        D.poly(ctx, [[PAD[0] - 70, PAD[1] - 60], [PAD[0] - 46, PAD[1] - 56 + Math.sin(t * Math.PI) * 2], [PAD[0] - 46, PAD[1] - 50 + Math.sin(t * Math.PI) * 2], [PAD[0] - 70, PAD[1] - 52]], '#f97316');
        D.rect(ctx, PAD[0] + 60, PAD[1] - 30, 14, 30, '#e8ecef', '#7b848c', 1); D.circle(ctx, PAD[0] + 67, PAD[1] - 22, 2, u >= 2.4 && u < 3.6 ? '#4ade80' : '#334155'); }
      D.rect(ctx, INLET[0] - 9, INLET[1] - 18, 18, 18, '#dfe4e8', '#7b848c', 1);   // tube inlet with flap
      D.rect(ctx, INLET[0] - 9, INLET[1] - 20 - 6 * TF.pulse(u, 2.9, 3.6, 0.15), 18, 3, '#7b848c');
      if (lod === 'far') return;
      // drone: in 0-2.4 from the upper right, hover over the inlet 2.4-3.6 (parcel drops 3.0-3.4), out 3.6-6
      const k = TF.pulse(u, 0, 6, 2.4), x = INLET[0] + (1 - k) * 260, y = INLET[1] - 40 - (1 - k) * 620 + Math.sin(u * 3) * 2;
      if (u < 6) { D.rect(ctx, x - 12, y - 3, 24, 7, '#3a3f45', '#1d2125', 0.8);
        for (const s of [-1, 1]) { const rr = 8 * Math.abs(Math.cos(t * 37.69911184307752 + s)); D.line(ctx, [[x + s * 13 - rr, y - 7], [x + s * 13 + rr, y - 7]], '#5d656d', 1.4); }
        if (u < 3.0) IT.chip(ctx, x, y + 12); else if (u < 3.4) IT.chip(ctx, x, TF.lerp(y + 12, INLET[1] - 6, (u - 3.0) / 0.4)); }
      if (u >= 3.4 && u < 4.2) IT.chip(ctx, INLET[0], INLET[1] - 7.5);   // R3-core-f9: chip waits in the inlet cup until the capsule leaves (dep 4.2)
    } });

  // ---------- (c) window drones: payload into a wall tube opening, capsule on to the receiver ----------
  // cfg: {id, floor, wallX, h (m), side (+1 east wall), period, offset, item, to: {floor, x, h}, col}
  S.windowDrone = (cfg) => {
    const oy = L.hY(cfg.floor, cfg.h), ox = cfg.wallX;
    const cap = S.capsule({ id: cfg.id, period: cfg.period, journey: cfg.period, dep: cfg.offset + 3.6, col: cfg.col || '#9333ea', item: cfg.item,
      from: { pts: [[ox - cfg.side * 4, oy], [cfg.to.x, oy]] }, to: cfg.to });
    TF.transport({ id: cfg.id + '-drone', owner: cfg.owner, period: cfg.period, layer: 'front', box: { x: cfg.side > 0 ? ox - 60 : ox - 1900, y: oy - 260, w: 1960, h: 300 },   // R3-core-ship: box covers the whole fly-in path (no cull pop)
      
      draw(ctx, t, theme, lod) {
        const u = TF.mod(t - cfg.offset, cfg.period);
        D.rect(ctx, ox - 7, oy - 9, 14, 18, '#dfe4e8', '#7b848c', 1);   // wall tube opening
        D.rect(ctx, ox + cfg.side * 7 - 2, oy - 9 - 7 * TF.pulse(u, 2.6, 3.6, 0.15), 4, 9, '#7b848c');
        if (lod === 'far' || u > 6) return;
        const k = TF.pulse(u, 0, 6, 2.4), x = ox + cfg.side * (18 + (1 - k) * 1700), y = oy - 14 - (1 - k) * 160 + Math.sin(u * 3) * 2;
        D.rect(ctx, x - 12, y - 3, 24, 7, '#3a3f45', '#1d2125', 0.8);
        for (const s of [-1, 1]) { const rr = 8 * Math.abs(Math.cos(t * 37.69911184307752 + s)); D.line(ctx, [[x + s * 13 - rr, y - 7], [x + s * 13 + rr, y - 7]], '#5d656d', 1.4); }
        const item = IT[cfg.item];
        if (u < 2.8) item(ctx, x, y + 12);
        else if (u < 3.6) {   // R3-core-ship: payload slides into the wall tube, cut by the wall face (hidden by 3.4); the capsule departs from the opening at 3.6
          const q = TF.ramp(u, 2.8, 3.4); ctx.save(); ctx.beginPath();
          if (cfg.side > 0) ctx.rect(ox + 7, oy - 400, 3000, 800); else ctx.rect(ox - 3007, oy - 400, 3000, 800);
          ctx.clip(); item(ctx, TF.lerp(x, ox - cfg.side * 12, q), TF.lerp(y + 12, oy + 4, q)); ctx.restore(); }
      } });
    return cap;
  };
})(typeof window !== 'undefined' ? window : globalThis);
