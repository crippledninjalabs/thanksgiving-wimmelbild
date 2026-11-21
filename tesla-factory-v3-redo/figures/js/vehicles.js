// TF3.vehicles — side views. draw(ctx, x, y, scale, pose, opts): (x, y) = canvas px of the ground
// point under the vehicle centre; faces +x (opts.face = -1 to flip). pose: {wheelAng, bob, pitch, door}.
(function (G) {
  const TF3 = (G.TF3 = G.TF3 || {});
  const R = TF3.rig, P = TF3.paint;
  const V = (TF3.vehicles = {});

  function shadow(ctx, L, col) { P.ellipse(ctx, [0, 0.0], L * 0.48, 0.05, 0, col, null); }
  function tyre(ctx, c, r, cfg) { // cfg: {tyre, cover, coverShade, rim, aero, ang}
    P.circle(ctx, c, r, cfg.tyre, null);
    P.circle(ctx, c, r * 0.97, null, '#000', 1);
    if (cfg.aero) { // smooth aero cover disc + small marker so rotation is visible
      P.circle(ctx, c, r * 0.8, cfg.cover, cfg.coverShade, 1.2);
      P.circle(ctx, c, r * 0.6, null, cfg.coverShade, 0.8);
      P.circle(ctx, c, r * 0.12, cfg.coverShade, null);
      P.line(ctx, [R.add(c, R.polar(cfg.ang, r * 0.62)), R.add(c, R.polar(cfg.ang, r * 0.76))], cfg.coverShade, r * 0.06);
    } else {
      P.circle(ctx, c, r * 0.66, cfg.rim, '#555b61', 1);
      for (let i = 0; i < 5; i++) P.line(ctx, [R.add(c, R.polar(cfg.ang + i * 1.2566, r * 0.14)), R.add(c, R.polar(cfg.ang + i * 1.2566, r * 0.6))], '#6b7279', r * 0.11);
      P.circle(ctx, c, r * 0.14, '#4a5056', null);
    }
  }
  const begin = (ctx, x, y, scale, opts) => P.begin(ctx, x, y, scale, opts.face || 1);
  const body = (ctx, pose, fn) => { ctx.save(); ctx.translate(0, pose.bob || 0); ctx.rotate(pose.pitch || 0); fn(); ctx.restore(); };

  // ---------------- Cybercab ----------------
  // ---- Cybercab: traced from ref photo 05 (side, faces right). Table = photo pixels (see ref/cybercab/MEASUREMENTS.md);
  // converted to metres (x fwd from car centre, y up from ground) with the 1.2 deg ground tilt removed.
  const CAB_PX = {
    tailX: 374, noseX: 3089, groundRear: [877, 1730], groundFront: [2606, 1765],
    // ONE continuous silhouette, nose -> hood -> windshield -> roof -> fastback -> tail -> under-body. c = crisp corner
    body: [[3010, 1330], [2900, 1265], [2750, 1192], [2600, 1162], [2417, 1139], [2250, 1058], [2120, 938], [2028, 872],
      [1850, 846], [1640, 840], [1450, 855], [1252, 886], [997, 952], [752, 1019], [497, 1102], [374, 1141, 'c'],
      [377, 1300], [384, 1450], [410, 1600, 'c'], [700, 1598], [1500, 1592], [2950, 1588, 'c'], [3062, 1565], [3089, 1480],
      [3089, 1400], [3064, 1356]],
    aPillar: [[2283, 1167], [2028, 869]],                         // door glass front edge / windshield rear edge
    canopy: [[1440, 893, 'c'], [1640, 878], [1850, 884], [2010, 902], [2125, 952], [2250, 1066], [2400, 1142, 'c'], [2262, 1162, 'c'], [1398, 1066, 'c']],
    quarterGlass: [[997, 985, 'c'], [1100, 945], [1250, 906], [1365, 893, 'c'], [1385, 1062, 'c'], [1200, 1030]],
    crease: [[374, 1141], [900, 1150], [1600, 1158], [2300, 1168], [2700, 1205], [2980, 1318]],
    sillTop: 1530, rearTrimTop: 1405, rearTrimX: 470, frontTrimTop: 1470, frontTrimX: 2955,
    frontLight: [[2885, 1328], [3062, 1362]], rearLight: [[374, 1150], [470, 1160]],
    // door = body ∩ this region (rear seam, sill, front arch, front cut, A-pillar; top runs above the roof)
    doorSeam: [[1455, 500], [1436, 896], [1371, 1055], [1514, 1515], [1520, 1530], [2338, 1530], 'ARC', [2428, 1344],
      [2283, 1167], [2028, 869], [1990, 500]],
    hinge: [2310, 1200], seat: [[1520, 1460], [1585, 1065], [1660, 1075], [1610, 1430], [1860, 1420], [1860, 1470]],
    wheels: [[877, 1478, 257], [2606, 1520, 250]], disc: 0.85, archGap: 1.07,
  };
  const CK = 4.3 / (CAB_PX.noseX - CAB_PX.tailX), CMID = (CAB_PX.noseX + CAB_PX.tailX) / 2;
  const cgnd = (x) => CAB_PX.groundRear[1] + (CAB_PX.groundFront[1] - CAB_PX.groundRear[1]) * (x - CAB_PX.groundRear[0]) / (CAB_PX.groundFront[0] - CAB_PX.groundRear[0]);
  const cm = (p) => [(p[0] - CMID) * CK, (cgnd(p[0]) - p[1]) * CK, p[2]];
  const cmy = (x, y) => (cgnd(x) - y) * CK;
  // smooth closed/open path through points; points flagged 'c' are crisp corners (tangent broken there)
  function cabPath(ctx, pts, closed = true) {
    const n = pts.length, P_ = (i) => pts[(i + n) % n];
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    const last = closed ? n : n - 1;
    for (let i = 0; i < last; i++) {
      const p0 = P_(i - 1), p1 = P_(i), p2 = P_(i + 1), p3 = P_(i + 2);
      const t1 = (p1[2] === 'c' || (!closed && i === 0)) ? [(p2[0] - p1[0]) * 0.5, (p2[1] - p1[1]) * 0.5] : [(p2[0] - p0[0]) * 0.5, (p2[1] - p0[1]) * 0.5];
      const t2 = (p2[2] === 'c' || (!closed && i === n - 2)) ? [(p2[0] - p1[0]) * 0.5, (p2[1] - p1[1]) * 0.5] : [(p3[0] - p1[0]) * 0.5, (p3[1] - p1[1]) * 0.5];
      ctx.bezierCurveTo(p1[0] + t1[0] / 3, p1[1] + t1[1] / 3, p2[0] - t2[0] / 3, p2[1] - t2[1] / 3, p2[0], p2[1]);
    }
    if (closed) ctx.closePath();
  }
  const CAB = (() => { // metres geometry, built once
    const W = CAB_PX.wheels.map(([x, y, r]) => ({ c: [(x - CMID) * CK, 0], r: r * CK }));
    const r = (W[0].r + W[1].r) / 2; W.forEach((w) => { w.r = r; w.c[1] = r; });
    const seam = [];
    for (const q of CAB_PX.doorSeam) {
      if (q === 'ARC') { // follow the front arch (gap radius) from the sill up to the front cut
        const fw = W[1], R_ = fw.r * CAB_PX.archGap, a0 = Math.PI + Math.asin((cmy(2338, 1530) - fw.c[1]) / R_), a1 = Math.PI - 0.78;
        for (let k = 1; k < 8; k++) { const a = a0 + (a1 - a0) * k / 8; seam.push([fw.c[0] + R_ * Math.cos(a), fw.c[1] + R_ * Math.sin(a)]); }
      } else seam.push(cm(q).slice(0, 2));
    }
    return {
      body: CAB_PX.body.map(cm), canopy: CAB_PX.canopy.map(cm), quarterGlass: CAB_PX.quarterGlass.map(cm), aPillar: CAB_PX.aPillar.map(cm), crease: CAB_PX.crease.map(cm), seam, hinge: cm(CAB_PX.hinge).slice(0, 2),
      seat: CAB_PX.seat.map(cm), wheels: W, frontLight: CAB_PX.frontLight.map(cm), rearLight: CAB_PX.rearLight.map(cm),
      sillTop: cmy(1900, CAB_PX.sillTop), rearTrim: [(CAB_PX.rearTrimX - CMID) * CK, cmy(400, CAB_PX.rearTrimTop)],
      frontTrim: [(CAB_PX.frontTrimX - CMID) * CK, cmy(3000, CAB_PX.frontTrimTop)],
    };
  })();

  V.cybercab = {
    geometry: CAB, px: CAB_PX,
    // all body layers (fill + details), drawn inside the silhouette clip; reused for the door piece
    _layers(ctx, C) {
      const G = CAB;
      cabPath(ctx, G.body); ctx.fillStyle = C.body; ctx.fill();
      ctx.save(); cabPath(ctx, G.body); ctx.clip();
      P.poly(ctx, [[-3, -1], [3, -1], [3, 0.5], [-3, 0.5]], C.shade, null);                          // lower body in shade
      cabPath(ctx, G.crease.concat(G.crease.slice().reverse().map((p) => [p[0], p[1] + 0.07])), true);
      ctx.fillStyle = C.bodyHi; ctx.fill();                                                           // one soft highlight band
      P.line(ctx, G.crease, C.crease, 0.006);
      const L = 2.4;                                                                                 // black lower trim
      P.poly(ctx, [[-L, -1], [L, -1], [L, G.frontTrim[1]], [G.frontTrim[0], G.frontTrim[1]], [G.frontTrim[0] - 0.08, G.sillTop],
        [G.rearTrim[0] + 0.08, G.sillTop], [G.rearTrim[0], G.rearTrim[1]], [-L, G.rearTrim[1]]], C.trim, null);
      cabPath(ctx, G.canopy); ctx.fillStyle = C.glass; ctx.fill();                                    // one dark canopy
      cabPath(ctx, G.quarterGlass); ctx.fillStyle = C.glass; ctx.fill();
      P.line(ctx, G.aPillar, C.glassHi, 0.012);                                                       // A-pillar seam
      P.line(ctx, [[G.canopy[0][0] + 0.25, G.canopy[0][1] - 0.04], [G.canopy[3][0] - 0.1, G.canopy[3][1] - 0.05]], C.glassHi, 0.02);
      for (const w of G.wheels) P.circle(ctx, w.c, w.r * CAB_PX.archGap, C.arch, null);              // arches cut into the body
      P.line(ctx, G.frontLight, C.light, 0.035);
      P.line(ctx, G.rearLight, C.tail, 0.03);
      ctx.restore();
    },
    draw(ctx, x, y, scale, pose = {}, opts = {}) {
      const C = TF3.style.cybercab.col, G = CAB;
      const door = R.clamp(pose.door || 0, 0, 1), th = R.easeInOut(door) * TF3.style.cybercab.doorMax;
      begin(ctx, x, y, scale, opts);
      shadow(ctx, 4.3, C.shadow);
      const ang = pose.wheelAng || 0;
      body(ctx, pose, () => {
        this._layers(ctx, C);
        ctx.save(); cabPath(ctx, G.body); ctx.clip();
        if (door > 0.001) {                                                                           // aperture behind the door
          P.poly(ctx, G.seam, C.cabin, null);
          cabPath(ctx, G.seat); ctx.fillStyle = C.seat; ctx.fill();
        } else P.poly(ctx, G.seam, null, C.seam, 0.9);                                                // closed: thin seam line
        ctx.restore();
        cabPath(ctx, G.body); P.fillStroke(ctx, null, C.outline, 1.4);                                 // single outline
      });
      for (const w of G.wheels) {                                                                     // tyres + aero discs
        P.circle(ctx, w.c, w.r, C.tyre, null);
        P.circle(ctx, w.c, w.r * CAB_PX.disc, C.cover, C.coverShade, 0.8);
        P.circle(ctx, w.c, w.r * CAB_PX.disc * 0.8, null, C.coverShade, 0.6);
        P.circle(ctx, w.c, w.r * 0.09, C.cap, null);
        P.circle(ctx, R.add(w.c, R.polar(ang, w.r * 0.55)), w.r * 0.035, C.coverShade, null);          // rotation mark
      }
      if (door > 0.001) body(ctx, pose, () => {                                                       // rigid door on a fixed hinge
        P.at(ctx, G.hinge, -th, () => {
          ctx.translate(-G.hinge[0], -G.hinge[1]);
          ctx.save(); P.poly(ctx, G.seam, null, null); ctx.clip();
          this._layers(ctx, C);
          ctx.save(); cabPath(ctx, G.body); ctx.clip(); P.poly(ctx, G.seam, null, C.doorEdge, 5); ctx.restore(); // dark inner frame edge
          cabPath(ctx, G.body); P.fillStroke(ctx, null, C.outline, 1.4);
          ctx.restore();
          ctx.save(); cabPath(ctx, G.body); ctx.clip(); P.poly(ctx, G.seam, null, C.outline, 1.2); ctx.restore();
        });
        P.circle(ctx, G.hinge, 0.025, C.trim, null);
      });
      P.end(ctx);
    },
    // Plan (top) view, nose to +x like the side view. Width ≈1.97 m (estimated from photos 12/13, see MEASUREMENTS.md).
    // Teardrop: widest over the front wheels / A-pillars, tapering to a narrower rear track and a short rounded flat tail.
    plan: {
      half: [[2.16, 0], [2.13, 0.42], [2.03, 0.74], [1.8, 0.93], [1.4, 0.985], [0.8, 0.975], [0.0, 0.945], [-0.8, 0.895],
        [-1.35, 0.85], [-1.8, 0.78], [-2.06, 0.66], [-2.15, 0.45], [-2.17, 0.0]],
      glass: [[1.24, 0], [1.17, 0.42], [1.0, 0.66], [0.45, 0.7], [-0.12, 0.6], [-0.36, 0.33], [-0.42, 0]],
    },
    drawPlan(ctx, x, y, scale) {
      const st = TF3.style.cybercab, C = st.col, G = CAB, PL = this.plan;
      const mirror = (h) => h.concat(h.slice(1, -1).reverse().map((p) => [p[0], -p[1]]));
      const out = mirror(PL.half), halfW = (xx) => { // outline half-width at x (linear between table points)
        const h = PL.half; for (let i = 0; i < h.length - 1; i++) if (xx <= h[i][0] && xx >= h[i + 1][0])
          return R.lerp(h[i + 1][1], h[i][1], (xx - h[i + 1][0]) / (h[i][0] - h[i + 1][0])); return 0; };
      P.begin(ctx, x, y, scale, 1);
      cabPath(ctx, out); ctx.fillStyle = C.body; ctx.fill();
      ctx.save(); cabPath(ctx, out); ctx.clip();
      for (const w of G.wheels) for (const s of [-1, 1]) {                       // tyre edges peeking at the corners, inside the outline
        const e = halfW(w.c[0]) - 0.012;
        P.poly(ctx, [[w.c[0] - w.r * 0.9, s * (e - 0.05)], [w.c[0] + w.r * 0.9, s * (e - 0.05)], [w.c[0] + w.r * 0.85, s * (e + 0.03)], [w.c[0] - w.r * 0.85, s * (e + 0.03)]], C.tyre, null);
      }
      cabPath(ctx, [[-0.55, 0.14], [-1.2, 0.13], [-1.85, 0.16], [-1.85, 0.3], [-1.2, 0.34], [-0.55, 0.3]]); ctx.fillStyle = C.bodyHi; ctx.fill(); // one soft highlight on the deck
      cabPath(ctx, mirror(PL.glass)); ctx.fillStyle = C.glass; ctx.fill();          // windshield wrapping over the front roof
      P.line(ctx, [[0.95, 0.45], [0.35, 0.5]], C.glassHi, 0.025);
      P.line(ctx, [[-0.42, 0], [-2.12, 0]], C.crease, 0.008);                       // centre seam
      for (const s of [-1, 1]) {                                                    // door seams
        P.line(ctx, [[1.12, s * 0.8], [0.4, s * 0.79], [-0.5, s * 0.74]], C.seam, 0.007);
        P.line(ctx, [[-0.5, s * 0.74], [-0.55, s * (halfW(-0.55) + 0.01)]], C.seam, 0.007);
      }
      ctx.restore();
      ctx.save(); cabPath(ctx, out); ctx.clip();                                    // light bars along the nose and tail edges
      cabPath(ctx, [[2.0, -0.72], [2.1, -0.42], [2.135, 0], [2.1, 0.42], [2.0, 0.72]], false);
      ctx.strokeStyle = C.light; ctx.lineWidth = 0.035; ctx.stroke();
      P.line(ctx, [[-2.17, -0.5], [-2.17, 0.5]], C.tail, 0.07);
      ctx.restore();
      cabPath(ctx, out); P.fillStroke(ctx, null, C.outline, 1.4);
      P.end(ctx);
    },
  };

  // ---------------- Model Y (fastback crossover) ----------------
  V.modelY = {
    draw(ctx, x, y, scale, pose = {}, opts = {}) {
      const st = TF3.style.vehicles.modelY, VC = TF3.style.vehicles.col, L = st.len / 2, r = st.wheelR;
      const paint = opts.paint || TF3.style.vehicles.paints.red, fa = L - st.frontAxle, ra = fa - st.wheelbase;
      const isBlack = paint === TF3.style.vehicles.paints.black;
      const dark = P.shade(paint, 0.8), out = isBlack ? '#6a7078' : P.shade(paint, 0.55), hi = isBlack ? '#555b63' : P.shade(paint, 1.15);
      begin(ctx, x, y, scale, opts); shadow(ctx, st.len, VC.shadow);
      body(ctx, pose, () => {
        const outl = [[2.3, 0.33], [2.38, 0.46], [2.36, 0.66], [2.15, 0.82], [1.6, 0.95], [1.12, 1.02], [0.7, 1.36], [0.3, 1.57],
          [-0.3, 1.62], [-1.0, 1.58], [-1.6, 1.46], [-2.05, 1.3], [-2.28, 1.17], [-2.35, 1.16], [-2.38, 0.98], [-2.36, 0.5], [-2.25, 0.33], [0, 0.33]];
        P.smooth(ctx, outl, paint, out, 1.6);
        ctx.save(); P.smooth(ctx, outl, null, null); ctx.clip();
        P.poly(ctx, [[3, 0], [3, 0.5], [-3, 0.5], [-3, 0]], dark, null);
        ctx.restore();
        P.line(ctx, [[2.25, 0.74], [0.8, 0.94], [-1.6, 1.0], [-2.3, 0.98]], hi, 0.025);   // shoulder highlight
        // one continuous glass band, thin B-pillar
        P.smooth(ctx, [[1.05, 1.05], [0.68, 1.34], [0.3, 1.54], [-0.3, 1.585], [-1.0, 1.545], [-1.6, 1.42], [-1.95, 1.28], [-1.75, 1.1], [0, 1.05]], VC.glass, out, 1);
        P.line(ctx, [[-0.2, 1.06], [-0.22, 1.57]], paint, 0.03);
        P.line(ctx, [[-0.1, 0.42], [-0.1, 1.0]], out, 0.008); P.line(ctx, [[1.15, 0.45], [1.15, 0.98]], out, 0.008); P.line(ctx, [[-1.35, 0.5], [-1.35, 1.03]], out, 0.008);
        P.line(ctx, [[2.33, 0.68], [2.05, 0.78]], VC.light, 0.035);
        P.line(ctx, [[-2.35, 1.0], [-2.15, 1.04]], VC.tail, 0.05);
        for (const ax of [fa, ra]) { ctx.beginPath(); ctx.arc(ax, r, r * 1.14, 0, Math.PI); ctx.lineTo(ax + r * 1.14, r); P.fillStroke(ctx, '#1d1f22', null); }
      });
      for (const ax of [fa, ra]) tyre(ctx, [ax, r], r, { tyre: VC.tyre, rim: VC.rim, ang: pose.wheelAng || 0 });
      P.end(ctx);
    },
  };

  // ---------------- Cybertruck ----------------
  V.cybertruck = {
    draw(ctx, x, y, scale, pose = {}, opts = {}) {
      const st = TF3.style.vehicles.cybertruck, VC = TF3.style.vehicles.col, L = st.len / 2, r = st.wheelR;
      const fa = L - st.frontAxle, ra = fa - st.wheelbase;
      begin(ctx, x, y, scale, opts); shadow(ctx, st.len, VC.shadow);
      body(ctx, pose, () => {
        // single-peak wedge: straight line nose -> apex (just behind the windshield top) -> straight line to the tailgate
        const nose = [L, 1.05], apex = [0.25, 1.79], tail = [-L, 1.27];
        const crease = (xx) => 0.98 + (L - xx) / (2 * L) * 0.2; // side crease, slightly rising to the rear
        P.poly(ctx, [[L, 0.5], nose, apex, tail, [-L, 0.48], [-L + 0.2, 0.42], [L - 0.2, 0.42]], VC.steel, VC.outline, 1.6);
        P.poly(ctx, [nose, apex, tail, [-L, crease(-L)], [L, crease(L)]], VC.steelHi, null);                  // upper flat panel
        P.poly(ctx, [[L, 0.5], [L, 0.66], [-L, 0.66], [-L, 0.48], [-L + 0.2, 0.42], [L - 0.2, 0.42]], VC.steelShade, null); // lower panel
        P.line(ctx, [[L, crease(L)], [-L, crease(-L)]], '#a9afb5', 0.01);
        P.line(ctx, [nose, apex, tail], VC.outline, 0.008);
        // windows follow the wedge lines
        const onFront = (xx) => nose[1] + (xx - L) / (apex[0] - L) * (apex[1] - nose[1]);
        const onRear = (xx) => apex[1] + (xx - apex[0]) / (tail[0] - apex[0]) * (tail[1] - apex[1]);
        P.poly(ctx, [[1.45, onFront(1.45) - 0.03], [apex[0] + 0.05, apex[1] - 0.07], [-1.15, onRear(-1.15) - 0.06], [-1.15, 1.12], [1.3, 1.08]], VC.glass, VC.outline, 1);
        P.line(ctx, [[0.0, 1.1], [0.0, onRear(0) - 0.07]], VC.steelHi, 0.045);
        P.line(ctx, [[L, 1.03], [L - 0.35, onFront(L - 0.35) + 0.0]], VC.light, 0.035);                       // full-width light bar (nose)
        P.line(ctx, [[-L + 0.01, 1.19], [-L + 0.01, 1.26]], VC.tail, 0.05);
        for (const ax of [fa, ra]) // trapezoid wheel arches (black cladding)
          P.poly(ctx, [[ax - r * 1.35, 0.42], [ax - r * 0.85, 0.42 + r * 1.15], [ax + r * 0.85, 0.42 + r * 1.15], [ax + r * 1.35, 0.42]], '#2b2f34', null);
      });
      for (const ax of [fa, ra]) tyre(ctx, [ax, r], r, { tyre: VC.tyre, cover: '#b9bec3', coverShade: '#6c737a', aero: true, ang: pose.wheelAng || 0 });
      P.end(ctx);
    },
  };

  // ---------------- Tesla Semi (tractor; optional short trailer stub) ----------------
  V.semi = {
    draw(ctx, x, y, scale, pose = {}, opts = {}) {
      const st = TF3.style.vehicles.semi, VC = TF3.style.vehicles.col, L = st.len / 2, r = st.wheelR;
      begin(ctx, x, y, scale, opts); shadow(ctx, st.len, VC.shadow);
      body(ctx, pose, () => {
        P.poly(ctx, [[-L, 0.95], [L - 2.6, 0.95], [L - 2.6, 1.15], [-L, 1.15]], '#3a3f45', VC.outline, 1); // chassis
        P.poly(ctx, [[-L + 0.5, 1.15], [-L + 1.6, 1.15], [-L + 1.6, 1.3], [-L + 0.5, 1.3]], '#2b2f34', null);   // fifth wheel
        P.poly(ctx, [[L, 0.5], [L + 0.03, 1.15], [L - 0.12, 1.75], [L - 0.55, 2.55], [L - 1.2, 3.4], [L - 1.9, 3.92], [L - 3.2, 4.0],
          [L - 3.35, 3.7], [L - 3.35, 0.9], [L - 2.4, 0.6], [L - 0.4, 0.45]], VC.semiCab, VC.outline, 1.6);
        P.poly(ctx, [[L - 0.2, 1.95], [L - 0.62, 2.62], [L - 1.25, 3.4], [L - 1.45, 3.3], [L - 1.1, 1.95]], VC.glass, VC.outline, 1);
        P.poly(ctx, [[L - 1.35, 2.3], [L - 1.6, 3.15], [L - 2.1, 3.15], [L - 2.1, 2.3]], VC.glass, VC.outline, 1);
        P.line(ctx, [[L - 2.25, 0.85], [L - 2.25, 3.3]], '#c7ccd1', 0.015);
        P.line(ctx, [[L + 0.02, 1.0], [L - 0.08, 1.6]], VC.light, 0.05);
        P.poly(ctx, [[L, 0.5], [L + 0.02, 0.9], [L - 3.35, 0.9], [L - 3.35, 0.75], [L - 2.4, 0.6], [L - 0.4, 0.45]], VC.trim, null);
        for (const ax of [L - st.frontAxle, L - st.drive[0], L - st.drive[1]]) {
          ctx.beginPath(); ctx.arc(ax, r, r * 1.12, 0, Math.PI); ctx.lineTo(ax + r * 1.12, r); P.fillStroke(ctx, '#1d1f22', null);
        }
      });
      for (const ax of [L - st.frontAxle, L - st.drive[0], L - st.drive[1]]) tyre(ctx, [ax, r], r, { tyre: VC.tyre, rim: VC.rim, ang: pose.wheelAng || 0 });
      P.end(ctx);
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
