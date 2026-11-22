// DOCK / warehouse at the foot of the west core (source (a) for every basket, capsule and BL load).
// 24 s: parts truck backs in 15-18, AGV forklift: pallet B -> sort table, backload bin -> truck, pallet A staged and
// pushed into the BL cage at 0-0.8, truck leaves 0-3. The DOCK Optimus works the sort table the whole cycle:
// 4 trips to the W3 outbox (2 parts each) + 3 trips to the PT outbox + a label check; automatic loaders hop each
// part from its outbox into the waiting basket / capsule just before it leaves. Returning capsules park in the rack.
(function (G) {
  const TF = G.TF, L = TF.layout, D = TF.draw, K = TF.kit, A = TF.act, M = TF.M, S = TF.supply, IT = S.items;
  const G0 = L.G, DOCKY = S.DOCKY, W3u = L.core.W3up, RS = L.core.PTx - 6, RR = L.core.PTx + 7;
  const hY = (m) => G0 - m * M;
  const TABLE = [858, 902], BIN = [906, 930], OUT_W3 = 952, OUT_PT = 975, PICK = 908, ST_W3 = 930, ST_PT = 952;

  // ---------- departures from the DOCK (tau mod 24) ----------
  let deps = null;
  const departures = () => {
    if (deps) return deps;
    const ln = TF.line6, w3 = [6.3, 18.3, 14.5], pt = [];                  // floor-6 baskets (blanks x2, paint)
    for (const k in ln.PT) { const r = ln.PT[k]; for (let i = 0; i < 24 / r.period; i++) pt.push({ t: TF.mod(r.t0 + i * r.period, 24), r, i, f6: true }); }
    for (const r of S.baskets) if (r.base === 'dock') for (let i = 0; i < r.n; i++) w3.push(TF.mod(r.dep + i * r.period, 24));
    for (const r of S.capsules) if (r.from === 'dock') for (let i = 0; i < r.n; i++) pt.push({ t: TF.mod(r.dep + i * r.period, 24), r, i });
    deps = { w3: w3.sort((a, b) => a - b), pt: pt.sort((a, b) => a.t - b.t) };
    return deps;
  };

  // ---------- DOCK Optimus (24 s): pick at the pallet, carry to an outbox, back ----------
  const pickP = A.reach([0.45, 0.92], [0.3, 0.95], { lean: 0.25, gripN: 0.9, gripF: 0.9, head: 0.25 });
  const placeP = A.reach([0.42, 0.95], [0.28, 0.98], { lean: 0.15, gripN: 0.3, gripF: 0.3, head: 0.2 });
  const carryP = A.reach([0.3, 1.05], [0.15, 1.05], { gripN: 0.9, gripF: 0.9 });
  const trip = (stand) => { const w = stand === ST_W3 ? 0.45 : 0.9;
    return [A.keyed(0.6, PICK, -1, [[0, A.stand()], [0.5, pickP], [1, carryP]]), A.turn(0.3, PICK, -1, () => carryP),
      A.walk(w, PICK, stand, { step: 0.4, carry: [0.3, 1.0], carryW: 0.2 }),
      A.keyed(0.5, stand, 1, [[0, carryP], [0.5, placeP], [1, A.stand()]]), A.turn(0.3, stand, 1), A.walk(w, stand, PICK, { step: 0.4 })]; };
  const order = ['w3', 'w3', 'pt', 'w3', 'pt', 'w3', 'pt', 'w3'];   // 5 W3 trips (10 parts) + 3 PT trips (6 parts) per 24 s
  const segs = [], places = { w3: [], pt: [] };
  let tt = 0;
  for (const k of order) { const sg = trip(k === 'w3' ? ST_W3 : ST_PT); const pt = tt + 0.6 + 0.3 + sg[2].d + 0.25; places[k].push(pt); sg.forEach((s) => { segs.push(s); tt += s.d; }); }
  segs.push(A.keyed(24 - tt, PICK, -1, [[0, A.stand()], [0.3, A.reach([0.4, 1.0], null, { head: 0.2, gripN: 0.4 })], [0.7, A.reach([0.25, 1.15], null, { head: 0.1, gripN: 0.4 })], [1, A.stand()]]));   // scan the next pallet labels
  const optimus = (t) => A.run(segs, TF.mod(t, 24));
  // outbox counts: +2 / trip (PT: 2, 2, 1) at the place moments, -1 per departure (hop 0.8 s before leaving)
  const count = (kind, t) => {
    const u = TF.mod(t, 24), d = departures(), ins = kind === 'w3' ? places.w3.map((p) => [p, 2]) : places.pt.map((p, i) => [p, [2, 2, 2][i]]);
    const outs = (kind === 'w3' ? d.w3 : d.pt.map((x) => x.t)).map((x) => TF.mod(x - 0.8, 24));
    const at = (x) => ins.reduce((s, [p, n]) => s + (p <= x ? n : 0), 0) - outs.reduce((s, p) => s + (p <= x ? 1 : 0), 0);
    let lo = 0; for (let x = 0; x < 24; x += 0.1) lo = Math.min(lo, at(x));
    return at(u) - lo;
  };

  // ---------- truck + AGV forklift ----------
  const truckRear = (t) => { const u = TF.mod(t, 24); return u < 3 ? TF.lerp(845, -60, TF.ramp(u, 0, 3)) : u < 15 ? -60 : u < 18 ? TF.lerp(-60, 845, TF.ramp(u, 15, 18)) : 845; };
  const FK = [[0, 1010], [0.55, 1068], [0.9, 1045], [1.6, 1000], [7.0, 1000], [8.0, 1772], [8.4, 1772], [10.6, 742], [11.0, 742], [13.0, 1000], [18.0, 1000], [18.8, 872], [19.1, 872], [19.8, 905], [20.1, 905], [20.7, 935], [21.0, 935], [21.9, 872], [22.5, 872], [23.5, 872], [24, 1010]];
  const fkX = (t) => TF.keys(TF.mod(t, 24), FK);
  const fkLoad = (t) => { const u = TF.mod(t, 24); return u >= 8.2 && u < 10.8 ? 'C' : u >= 22.3 ? 'A' : u < 0.9 ? 'P' : u >= 18.95 && u < 19.95 ? 'B' : u >= 20.85 && u < 22.05 ? 'R' : null; };
  const binLevel = (t) => { const u = TF.mod(t - 21.0, 24); return 0.15 + 0.7 * u / 24; };          // fills all cycle, emptied at 21.0
  const tableItems = (t) => { const u = TF.mod(t - 19.95, 24); return Math.max(0, 13 - Math.floor(u / (24 / 13))); };

  const drawTruck = (ctx, x, lod, t) => {
    const y = G0;
    D.rect(ctx, x - 330, hY(3.6), 330, 2.7 * M, '#e5e7eb', '#6b737b', 1.4);           // box
    D.rect(ctx, x - 400, hY(2.4), 70, 1.5 * M, '#eef0f2', '#6b737b', 1.2);            // cab
    D.rect(ctx, x - 392, hY(2.25), 30, 0.5 * M, '#22292f');
    D.rect(ctx, x - 405, hY(0.9), 405, 6, '#3a3f45');
    for (const wx of [x - 370, x - 120, x - 70]) { D.circle(ctx, wx, hY(0.45), 0.45 * M, '#1d1f22'); D.circle(ctx, wx, hY(0.45), 0.22 * M, '#9aa1a8'); }
    if (lod !== 'far') { D.tLogo(ctx, x - 165, hY(2.25), 26); for (let k = 0; k < 6; k++) D.line(ctx, [[x - 320 + k * 55, hY(3.55)], [x - 320 + k * 55, hY(0.95)]], '#d1d5db', 1); }
  };
  const drawFork = (ctx, x, load, lod, t) => {
    const gy = x > L.X0 - 8 ? L.floorY(1) : G0; ctx.save(); ctx.translate(0, gy - G0); drawFork0(ctx, x, load, lod, t); ctx.restore(); };
  const drawFork0 = (ctx, x, load, lod, t) => {
    const y = G0;
    D.rect(ctx, x - 20, hY(1.1), 34, 0.85 * M, '#f2c230', '#9c7a12', 1);
    D.rect(ctx, x + 14, hY(2.0), 5, 2.0 * M, '#4a5056');
    D.rect(ctx, x + 19, hY(0.25), 26, 3, '#3a3f45');
    for (const wx of [x - 10, x + 8]) D.circle(ctx, wx, hY(0.17), 0.17 * M, '#1d1f22');
    K.beacon(ctx, x - 4, hY(1.1) - 4, t, true);
    if (!load) return;
    const px = x + 32;
    if (load === 'A' || load === 'P') {   // 'bl-dock': the AGV pushes the Semi-kit / coil / ingot row across the dock and into the BL cage (cage takes the row at tau 0, same x)
      D.rect(ctx, x + 45, hY(0.3) - 44, 4, 44, '#4a5056', '#2b3035', 0.8);
      if (load === 'A') { const cy = Math.floor(TF.mod(TF.mod(t, 24) >= 22.3 ? t + 24 - TF.mod(t, 24) : t, 48) / 24), BL = TF.BL;
        for (const l of BL.cfg.loads) if (l.follow && (l.cycle === undefined || l.cycle === cy)) BL.drawLoad(ctx, l.kind, (BL.cfg.x0 + BL.cfg.x1) / 2 + l.dx + fkX(t) - 1068, L.floorY(1), lod); } }
    else if (load === 'B') for (let i = 0; i < 4; i++) IT.box(ctx, px - 6 + (i % 2) * 12, hY(0.3) - Math.floor(i / 2) * 8);
    else if (load === 'C') { D.rect(ctx, px - 14, hY(0.3) - 2.0 * M, 30, 2.0 * M - 2, '#d6b07a', '#7d5a2c', 1); D.tLogo(ctx, px + 1, hY(0.3) - 1.0 * M, 10); }
    else { D.rect(ctx, px - 11, hY(0.3) - 14, 22, 14, '#6b7280', '#374151', 0.8); }
  };

  TF.transport({ id: 'dock', owner: 'DOCK', period: 24, layer: 'main', box: { x: -500, y: L.ceilY(1) - 40, w: 1620, h: 380 },
    draw(ctx, t, theme, lod) {
      // truck (far lane of the yard road) + dock door
      drawTruck(ctx, truckRear(t), lod, t);
      // dock door: roll-up shutter open while the truck is in (15-3), bumpers, floor lane markings, ceiling lamps
      { const u = TF.mod(t, 24), open = u >= 14.5 || u < 3.5 ? 1 : 0, k = u >= 14.5 ? TF.ramp(u, 14.5, 15.0) : u < 3.5 ? 1 - TF.ramp(u, 3.0, 3.5) : 0;
        D.rect(ctx, 846, hY(3.9), 8, (3.9 - 3.6 * k) * M, '#9aa3ab', '#6d757d', 0.8); if (lod !== 'far') for (let y = hY(3.9) + 6; y < hY(0.3 + 3.6 * k); y += 7) D.line(ctx, [[846, y], [854, y]], '#7b848c', 0.6);
        D.rect(ctx, 840, hY(1.1), 6, 0.3 * M, '#1d2125'); if (lod !== 'far') TF.kit.beacon(ctx, 850, hY(4.0), t, open && u >= 14.5 && u < 18.2); }
      if (lod !== 'far') { for (let x = 870; x < 1090; x += 30) D.rect(ctx, x, G0 - 2, 15, 2, '#f2c230');
        TF.mx.upper(ctx, G0, L.ceilY(1), t, lod, { lamps: [900, 990, 1060], duct: [860, 1030, 4.6], fans: [1000] }); }
      // warehouse: shelving on the back, sort table with pallet B, backload bin under the SS outlet, outboxes, PT inlet + rack
      if (lod !== 'far') TF.mx.rack(ctx, 860, G0, 1.6, 2.6, 3, 9, (c, x, y) => IT.box(c, x, y), lod);
      D.rect(ctx, TABLE[0], hY(0.85), TABLE[1] - TABLE[0], 5, '#9aa3ab', '#6d757d', 0.8);
      D.rect(ctx, TABLE[0] + 3, hY(0.85) + 5, 4, 0.8 * M, '#8a939b'); D.rect(ctx, TABLE[1] - 7, hY(0.85) + 5, 4, 0.8 * M, '#8a939b');
      D.rect(ctx, TABLE[0] + 2, hY(0.85) - 3, TABLE[1] - TABLE[0] - 4, 3, '#b98b52');
      const n = tableItems(t);
      if (lod !== 'far') for (let i = 0; i < n; i++) IT.box(ctx, TABLE[0] + 9 + (i % 4) * 9, hY(0.85) - 3 - Math.floor(i / 4) * 8);
      const bl = binLevel(t), binOn = TF.mod(t, 24) < 20.85 || TF.mod(t, 24) >= 22.05;
      if (binOn) { D.rect(ctx, BIN[0], hY(0.55), BIN[1] - BIN[0], 0.55 * M, '#6b7280', '#374151', 1); D.rect(ctx, BIN[0] + 2, hY(0.55 * bl), BIN[1] - BIN[0] - 4, 0.55 * bl * M - 2, '#9ca3af'); }
      for (const [x, kind, item] of [[OUT_W3, 'w3', 'box'], [OUT_PT, 'pt', 'chip']]) {
        D.rect(ctx, x - 9, hY(0.85), 18, 5, '#7b848c'); D.rect(ctx, x - 2, hY(0.85) + 5, 4, 0.8 * M, '#8a939b');
        const c = count(kind, t); if (lod !== 'far') for (let i = 0; i < Math.min(c, 5); i++) IT[item](ctx, x, hY(0.85) - i * (kind === 'w3' ? 8 : 5));
      }
      // loader hops: outbox -> basket / capsule 0.8 .. 0.4 s before each departure
      if (lod !== 'far') { const u = TF.mod(t, 24), d = departures();
        for (const x of d.w3) { const k = (u - TF.mod(x - 0.8, 24) + 24) % 24 / 0.4; if (k >= 0 && k < 1) IT.box(ctx, TF.lerp(OUT_W3, W3u, k), TF.lerp(hY(0.85), DOCKY + 26, k) - 22 * Math.sin(Math.PI * k)); }
        for (const p of d.pt) { const k = (u - TF.mod(p.t - 0.8, 24) + 24) % 24 / 0.4; if (k >= 0 && k < 1) IT.chip(ctx, TF.lerp(OUT_PT, RS, k), TF.lerp(hY(0.85), DOCKY + 2, k) - 22 * Math.sin(Math.PI * k)); } }
      // PT inlet + return outlet + capsule rack; capsules at home park in the rack, move to the inlet 1 s before leaving
      D.rect(ctx, RS - 9, DOCKY - 6, 31, 14, '#dfe4e8', '#7b848c', 1);
      D.rect(ctx, 1028, DOCKY - 70, 18, 64, null, '#9aa3ab', 1);
      if (lod !== 'far') { const d = departures(); let slot = 0;
        for (const p of d.pt) {
          const r = p.r, J = TF.mod(t - p.t, 24), back = r.back, col = r.col || '#3f8fd0';
          if (J < back) continue;                                     // travelling: drawn by its own transport
          const toGo = 24 - J; let x = 1037, y = DOCKY - 14 - 11 * slot;
          if (J < back + 0.5) { const k = (J - back) / 0.5; x = TF.lerp(RR, 1037, k); y = TF.lerp(DOCKY, y, k); }
          if (toGo < 1.0) { const k = 1 - toGo; x = TF.lerp(1037, RS, k); y = TF.lerp(y, DOCKY, k); }
          D.rect(ctx, x - 8, y - 4, 16, 8, col, '#245c88', 0.8);
          slot++;
        } }
      // BL cage gate sill at the dock side
      D.rect(ctx, 1090, G0 - 4, 12, 4, '#7b848c');
    } });
  TF.transport({ id: 'dock-front', owner: 'DOCK', period: 24, layer: 'front', box: { x: 600, y: L.ceilY(1), w: 1300, h: 320 },
    draw(ctx, t, theme, lod) {
      const fx = fkX(t); drawFork(ctx, fx, fkLoad(t), lod, t);
      if (lod === 'far') return;
      const st = optimus(t); A.draw(ctx, st, G0);
    } });
  S.fkX = fkX; S.dockOptimus = optimus; S.departures = departures;
})(typeof window !== 'undefined' ? window : globalThis);
