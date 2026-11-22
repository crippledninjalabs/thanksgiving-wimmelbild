// TF.biw — LOOKS ONLY for the floor-6 Model Y body-in-white (Reid round 3). Motion and timing stay in line6.js;
// this file only turns a car state into a drawing. The body is drawn as open structure, not a filled silhouette:
//   inner/far layer : floor pan + crossmembers, seat rails, firewall, rear bulkhead, inner wheelhouses, strut tower,
//                     far-side pillars and roof rail (seen through the openings, darker)
//   near structure  : sill, front/rear lower structure and tail (wheel arches cut out), roof rail, A/hinge/B/C pillars
//   fitted panels   : rear quarter (6B), doors + hood (6C) — doors keep open window frames (glass comes on floor 5)
//   details         : stamped creases, spot-weld dot rows, weld beads, hinge bolts, clear-coat gloss
// Everything not drawn is a real opening: the room and the far side show through. Coat passes: bare metal (hot
// casting glow in 6A) -> primer band just ahead of the spray edge -> red; 6E bake adds clear-coat gloss.
(function (G) {
  const TF = G.TF, TF3 = G.TF3, D = TF.draw, P = TF3.paint, M = TF.M;
  const ln = TF.line6, PIECE = ln.PIECE, ARCH = ln.ARCH, AR = ln.ARCH_R;
  const B = (TF.biw = {});

  // ---------- palettes ----------
  const PAL = {
    metal: { top: '#d3d9df', bot: '#9aa3ac', panelTop: '#dde2e7', panelBot: '#a9b1b9', inner: '#858e97', far: '#6f7881', edge: '#565e66', hi: '#eef2f5', dot: '#7c858e' },
    primer: { top: '#d9d4c9', bot: '#b3ad9f', panelTop: '#dfdace', panelBot: '#b8b2a4', inner: '#9a9486', far: '#837e72', edge: '#6c675c', hi: '#f0ece3', dot: '#a29c8f' },
    red: { top: '#e0333f', bot: '#a5161f', panelTop: '#e43a46', panelBot: '#aa1822', inner: '#8f141c', far: '#741018', edge: '#5e0d13', hi: '#ff9aa0', dot: '#b31c27' },
  };
  const heatPal = (h) => { if (h <= 0) return PAL.metal; const m = PAL.metal, mix = (c) => D.mix(c, '#ff8a3d', h * 0.8);
    return Object.assign({}, m, { top: mix(m.top), bot: mix(m.bot), inner: D.mix(m.inner, '#e0662a', h * 0.6), hi: D.mix(m.hi, '#ffd2a0', h) }); };

  // ---------- geometry (car-local metres) ----------
  const ROOF = [[0.66, 1.355], [0.3, 1.55], [-0.3, 1.595], [-1.0, 1.555], [-1.6, 1.44], [-2.05, 1.28], [-2.27, 1.155]];
  const FAR = (pts, dx = 0.07, dy = -0.045) => pts.map(([x, y]) => [x + dx, y + dy]);
  const MEMBERS = {   // near pillars / rails: [points, width]
    roof: [ROOF, 0.075], aPillar: [[[1.12, 1.0], [0.67, 1.35]], 0.07], hinge: [[[1.13, 0.49], [1.12, 1.01]], 0.08],
    bPillar: [[[-0.1, 0.5], [-0.12, 1.05], [-0.2, 1.585]], 0.09], cPillar: [[[-1.34, 0.52], [-1.34, 1.08], [-1.62, 1.44]], 0.08],
    tailgate: [[[-1.96, 1.28], [-2.3, 1.12]], 0.06],
  };
  const LOWER = [   // sill + front structure + rear structure + tail (one path; arches cut with even-odd)
    [[1.13, 0.37], [-1.36, 0.37], [-1.36, 0.5], [1.13, 0.5]],
    [[1.13, 0.49], [1.13, 0.95], [1.6, 0.875], [2.2, 0.75], [2.36, 0.66], [2.38, 0.46], [2.3, 0.33], [1.15, 0.33]],
    [[-1.34, 0.33], [-2.25, 0.33], [-2.36, 0.5], [-2.37, 0.56], [-1.34, 0.56]],
    [[-2.37, 0.55], [-2.38, 0.98], [-2.35, 1.16], [-2.27, 1.17], [-2.24, 1.0], [-2.27, 0.55]],
  ];
  const path = (ctx, pts, close = true) => { pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); if (close) ctx.closePath(); };
  const archHoles = (ctx) => ARCH.forEach(([x, y]) => { ctx.moveTo(x + AR, y); ctx.arc(x, y, AR, 0, Math.PI * 2); });
  const noArches = (ctx, fn) => { ctx.save(); ctx.beginPath(); ctx.rect(-4, -1, 8, 4); archHoles(ctx); ctx.clip('evenodd'); fn(); ctx.restore(); };
  const grad = (ctx, a, b) => { const g = ctx.createLinearGradient(0, 1.6, 0, 0.35); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  const member = (ctx, pts, w, pal) => { P.line(ctx, pts, pal.edge, w + 0.018); P.line(ctx, pts, pal.top, w); P.line(ctx, pts.map(([x, y]) => [x + 0.008, y + 0.012]), pal.hi, w * 0.25); };
  const dots = (ctx, pts, step, col, r = 0.011) => { const p = TF.track.path(pts); for (let s = step / 2; s < p.total; s += step) P.circle(ctx, p.at(s), r, col, null); };

  function inner(ctx, st, pal, lod) {
    // floor pan with ribs, crossmembers, seat rails
    P.poly(ctx, [[-1.95, 0.47], [1.08, 0.47], [1.08, 0.565], [-1.95, 0.565]], pal.inner, pal.edge, 0.8);
    if (lod !== 'far') for (let x = -1.85; x < 1.0; x += 0.22) P.line(ctx, [[x, 0.49], [x, 0.55]], pal.far, 0.012);
    for (const x of [0.45, -0.5, -1.2]) P.poly(ctx, [[x - 0.035, 0.565], [x + 0.035, 0.565], [x + 0.03, 0.66], [x - 0.03, 0.66]], pal.inner, pal.edge, 0.7);
    P.line(ctx, [[-1.25, 0.63], [0.62, 0.63]], pal.far, 0.018);
    // firewall / dash, rear seat bulkhead + parcel shelf, strut tower + radiator support (engine bay)
    P.poly(ctx, [[1.0, 0.5], [1.1, 0.5], [1.1, 1.0], [1.0, 0.985]], pal.inner, pal.edge, 0.8);
    P.line(ctx, [[1.0, 0.86], [0.78, 0.9]], pal.far, 0.03);
    P.line(ctx, [[-1.45, 0.57], [-1.47, 0.98]], pal.inner, 0.045); P.line(ctx, [[-1.45, 0.99], [-2.18, 1.03]], pal.inner, 0.04);
    P.poly(ctx, [[1.4, 0.62], [1.7, 0.62], [1.68, 0.86], [1.42, 0.88]], pal.inner, pal.edge, 0.8);
    P.line(ctx, [[2.18, 0.46], [2.16, 0.76]], pal.inner, 0.04);
    // far-side structure (seen through door and window openings)
    P.line(ctx, [[1.06, 0.53], [-1.3, 0.53]], pal.far, 0.05);
    for (const k of ['roof', 'aPillar', 'bPillar', 'cPillar']) P.line(ctx, FAR(MEMBERS[k][0]), pal.far, MEMBERS[k][1] * 0.8);
    // inner wheelhouses (no wheels yet: open stamped wells)
    for (const [x, y] of ARCH) { ctx.beginPath(); ctx.arc(x, y, AR * 1.1, 0.05, Math.PI - 0.05); ctx.strokeStyle = pal.inner; ctx.lineWidth = 0.07; ctx.stroke(); }
  }
  function structure(ctx, st, pal, lod) {
    noArches(ctx, () => { ctx.beginPath(); LOWER.forEach((pts) => path(ctx, pts));
      ctx.fillStyle = grad(ctx, pal.top, pal.bot); ctx.fill(); ctx.strokeStyle = pal.edge; ctx.lineWidth = 0.012; ctx.stroke(); });
    for (const k in MEMBERS) member(ctx, MEMBERS[k][0], MEMBERS[k][1], pal);
    for (const [x, y] of ARCH) { ctx.beginPath(); ctx.arc(x, y, AR, 0.12, Math.PI - 0.12); ctx.strokeStyle = pal.hi; ctx.lineWidth = 0.02; ctx.stroke(); }   // arch flange lip
  }
  function panel(ctx, name, pal) {
    const pc = PIECE[name];
    noArches(ctx, () => { ctx.beginPath(); path(ctx, pc.poly);
      ctx.fillStyle = grad(ctx, pal.panelTop, pal.panelBot); ctx.fill(); ctx.strokeStyle = pal.edge; ctx.lineWidth = 0.014; ctx.stroke(); });
    if (pc.frame) { P.line(ctx, pc.frame, pal.edge, 0.06); P.line(ctx, pc.frame, pal.panelTop, 0.042); }   // window frame, no glass
    if (name !== 'hood') P.line(ctx, [[pc.poly[0][0] + 0.06, pc.poly[0][1] + 0.12], [pc.poly[1][0] - 0.06, pc.poly[1][1] + 0.12]], pal.hi, 0.012);   // stamped rib
  }
  function details(ctx, st, pal, lod) {
    // shoulder crease over the parts that exist
    const crease = [[[2.25, 0.74], [1.13, 0.9]]];
    if (st.frontDoor) crease.push([[1.13, 0.9], [-0.1, 0.95]]);
    if (st.rearDoor) crease.push([[-0.1, 0.95], [-1.34, 0.98]]);
    if (st.quarter) crease.push([[-1.34, 0.98], [-2.3, 0.98]]);
    crease.forEach((c) => { P.line(ctx, c, pal.hi, 0.02); P.line(ctx, c.map(([x, y]) => [x, y - 0.022]), pal.bot, 0.01); });
    if (lod !== 'near') return;
    // spot-weld dot rows along flanges
    dots(ctx, [[1.08, 0.47], [-1.3, 0.47]], 0.09, pal.dot);
    dots(ctx, ROOF.map(([x, y]) => [x, y - 0.02]), 0.1, pal.dot);
    dots(ctx, [[-0.1, 0.55], [-0.12, 1.05], [-0.19, 1.54]], 0.09, pal.dot);
    dots(ctx, [[1.12, 0.55], [1.12, 0.98], [0.7, 1.32]], 0.09, pal.dot);
    if (st.quarter) dots(ctx, [[-1.38, 0.56], [-1.38, 1.06]], 0.09, pal.dot);
  }
  function coat(ctx, st, pal, lod) {
    inner(ctx, st, pal, lod);
    structure(ctx, st, pal, lod);
    if (st.quarter) panel(ctx, 'quarter', pal);
    if (st.rearDoor) panel(ctx, 'rearDoor', pal);
    if (st.frontDoor) panel(ctx, 'frontDoor', pal);
    if (st.hood) panel(ctx, 'hood', pal);
    details(ctx, st, pal, lod);
  }

  // ---------- floor-5 fit-out (only drawn when the state carries these flags; floor 6 never does) ----------
  const GLASS = ln.GLASS;
  B.wheel = (ctx, c, r, ang, lod, rim = '#9aa1a8', tyre = '#1d1f22') => {   // car-local metres
    P.circle(ctx, c, r, tyre, '#000000', 0.8); P.circle(ctx, c, r * 0.62, rim, '#5d656d', 0.6);
    if (lod !== 'far') for (let k = 0; k < 5; k++) { const a = ang + k * Math.PI * 2 / 5; P.line(ctx, [[c[0] + Math.cos(a) * r * 0.15, c[1] + Math.sin(a) * r * 0.15], [c[0] + Math.cos(a) * r * 0.55, c[1] + Math.sin(a) * r * 0.55]], '#6b737b', r * 0.12); }
    P.circle(ctx, c, r * 0.13, '#4a5056', null);
  };
  function extras(ctx, st, lod, mod) {
    const red = PAL.red;
    if (st.pack) { P.poly(ctx, [[-1.15, 0.25], [1.0, 0.25], [1.0, 0.34], [-1.15, 0.34]], '#2a2e33', '#111', 0.6); if (lod !== 'far') P.line(ctx, [[0.9, 0.3], [1.05, 0.42]], '#f97316', 0.02); }
    if (st.seats && !mod) for (const [x0, x1] of [[0.05, 0.42], [-1.28, -0.88]]) {
      P.poly(ctx, [[x0, 0.6], [x1, 0.6], [x1 - 0.06, 1.18], [x0 + 0.02, 1.22]], '#2b2f34', '#111', 0.6);
      P.poly(ctx, [[x0 + 0.06, 1.24], [x0 + 0.24, 1.24], [x0 + 0.22, 1.36], [x0 + 0.08, 1.36]], '#2b2f34', null); }
    if (st.screen && !mod) P.poly(ctx, [[0.82, 0.98], [0.98, 1.0], [0.98, 1.1], [0.82, 1.08]], st.screen > 0.5 ? '#7dd3fc' : '#1f2937', null);
    if (st.glass && !mod) {
      ctx.globalAlpha = 0.78; P.smooth(ctx, GLASS, '#26323d', null); ctx.globalAlpha = 1;
      if (lod !== 'far') P.line(ctx, [[0.95, 1.12], [0.62, 1.34]], '#9fb4c4', 0.012);
      for (const k of ['bPillar', 'roof']) member(ctx, MEMBERS[k][0], MEMBERS[k][1], red);
      P.line(ctx, [[-1.34, 1.08], [-1.62, 1.44]], red.top, 0.06);
    }
    if (st.roofGlass) P.line(ctx, ROOF.slice(0, 5), '#26323d', 0.045);
    ARCH.forEach((c, i) => { if (st.wheels || (i === 0 ? st.wheelF : st.wheelR)) B.wheel(ctx, [c[0], 0.37], 0.37, st.wheelAng || 0, lod); });
    if (st.lit && lod !== 'far') { P.line(ctx, [[2.33, 0.68], [2.05, 0.78]], '#fffbe6', 0.045); P.line(ctx, [[-2.35, 1.0], [-2.15, 1.04]], '#ff3b3b', 0.05);
      ctx.globalAlpha = 0.25; P.circle(ctx, [2.32, 0.7], 0.12, '#fff7c2', null); ctx.globalAlpha = 1; }
  }
  // finished Model Y (end of floor 5; BL cage, 1A, car carrier)
  B.finishedMY = { heat: 0, quarter: true, beads: [1, 1, 1, 1], welding: [0, 0, 0, 0], rearDoor: true, frontDoor: true, hood: true, bolts: [1, 1, 1],
    paint: 1, bake: 1, glass: true, seats: true, wheels: true, pack: true, lit: true, screen: 1 };
  // shared look helpers for the other bodies (bodies.js)
  Object.assign(B, { PAL, grad, member, dots, noArchesAt: (ctx, arches, fn) => { ctx.save(); ctx.beginPath(); ctx.rect(-5, -1, 10, 6);
    arches.forEach(([x, y, r]) => { ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, Math.PI * 2); }); ctx.clip('evenodd'); fn(); ctx.restore(); } });

  // R3-7: painted/finished Model Y = smooth modern crossover (same length/height/arches; floor-6 bare stages never use this)
  const SKIN = [[2.3, 0.33], [2.38, 0.46], [2.41, 0.62], [2.33, 0.8], [2.0, 0.89], [1.5, 0.95], [1.05, 1.0], [0.75, 1.2], [0.45, 1.44], [0.1, 1.57], [-0.5, 1.6], [-1.0, 1.55], [-1.5, 1.42], [-2.0, 1.25], [-2.3, 1.15], [-2.38, 1.13], [-2.39, 0.9], [-2.37, 0.5], [-2.27, 0.33]];
  const GLASSH = [[0.98, 1.03], [0.7, 1.24], [0.42, 1.44], [0.1, 1.53], [-0.5, 1.56], [-1.0, 1.51], [-1.45, 1.39], [-1.85, 1.22], [-1.7, 1.06]];
  function modernBody(ctx, st, lod) {
    const pal = PAL.red, fin = [], smoothPts = (pts) => { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length - 1; i++) { const m = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2]; ctx.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1]); } ctx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]); ctx.closePath(); };
    noArches(ctx, () => {
      smoothPts(SKIN); ctx.fillStyle = grad(ctx, pal.panelTop, pal.panelBot); ctx.fill(); ctx.strokeStyle = pal.edge; ctx.lineWidth = 0.014; ctx.stroke();
      // black lower cladding / sills
      ctx.beginPath(); ctx.rect(-2.4, 0.3, 4.85, 0.2); ctx.fillStyle = '#1f2327'; ctx.fill();
    });
    for (const [x, y] of ARCH) { ctx.beginPath(); ctx.arc(x, y, AR + 0.03, 0.1, Math.PI - 0.1); ctx.strokeStyle = '#1f2327'; ctx.lineWidth = 0.07; ctx.stroke(); }
    // ducktail lip
    P.line(ctx, [[-2.3, 1.15], [-2.4, 1.15]], '#8f141c', 0.035);
    // one dark glasshouse (open cabin look until the glass is fitted)
    ctx.globalAlpha = st.glass ? 0.92 : 0.55; smoothPts(GLASSH); ctx.fillStyle = st.glass ? '#1c262f' : '#2b3138'; ctx.fill(); ctx.globalAlpha = 1;
    if (st.seats && lod !== 'far') { ctx.globalAlpha = 0.22; for (const x of [0.05, -1.05]) P.poly(ctx, [[x, 1.1], [x + 0.2, 1.1], [x + 0.18, 1.3], [x + 0.03, 1.3]], '#0b0e11', null); ctx.globalAlpha = 1; }
    if (lod !== 'far') {
      for (const x of [-0.12, 0.98, -1.34]) P.line(ctx, [[x, 0.5], [x, x === -0.12 ? 1.54 : 1.02]], pal.edge, 0.012);   // door cuts / B-pillar seam
      P.line(ctx, [[0.98, 1.03], [-1.7, 1.06]], pal.edge, 0.01);                                                         // beltline
      P.line(ctx, [[0.35, 0.93], [0.14, 0.93]], pal.edge, 0.016); P.line(ctx, [[-0.62, 0.95], [-0.83, 0.95]], pal.edge, 0.016);   // flush handles
    }
  }
  // ---------- public ----------
  B.drawBody = (ctx, x, y, st, lod) => {
    P.begin(ctx, x, y, M, 1);
    const mod = st.paint >= 1 && !!(st.glass || st.seats || st.wheels || st.wheelF || st.pack || st.lit || st.screen);
    if (mod) modernBody(ctx, st, lod); else coat(ctx, st, heatPal(st.heat), lod);
    if (st.paint > 0 && !mod) {
      const xr = 2.45 - st.paint * 4.9, xp = Math.max(-3, xr - (st.paint < 1 ? 0.45 : 0));
      ctx.save(); ctx.beginPath(); ctx.rect(xp, -1, 6, 4); ctx.clip(); coat(ctx, st, PAL.primer, lod); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.rect(xr, -1, 6, 4); ctx.clip(); coat(ctx, st, PAL.red, lod); ctx.restore();
    }
    // weld beads (stay on the part; painted over in 6D)
    if (!mod && lod !== 'far') st.beads.forEach((p, j) => {
      if (p <= 0) return;
      const sp = ln.SEAMS[j], pts = [];
      for (let s = 0; s <= sp.total * p + 1e-9; s += sp.total / 24) pts.push(sp.at(s));
      pts.push(sp.at(sp.total * p));
      const painted = st.paint > 0 && pts[0][0] > 2.45 - st.paint * 4.9;
      P.line(ctx, pts, painted ? '#7a1018' : '#3f454b', 0.035);
      if (lod === 'near' && !painted) P.line(ctx, pts, '#b9c1c9', 0.01);
      if (st.welding[j]) P.circle(ctx, pts[pts.length - 1], 0.03, '#ffb347', null);
    });
    if (!mod && lod === 'near') st.bolts.forEach((b, j) => { if (b) P.circle(ctx, [[-0.12, 0.95], [1.12, 0.95], [1.2, 1.0]][j], 0.022, '#30353a', null); });
    if (st.glass || st.seats || st.wheels || st.wheelF || st.pack || st.lit || st.screen) extras(ctx, st, lod, mod);   // floor 5+: glass, seats, pack, wheels, lights
    // clear-coat gloss after the bake
    if (st.bake > 0 && lod !== 'far') {
      ctx.globalAlpha = 0.4 * st.bake;
      if (mod) P.line(ctx, [[1.7, 0.9], [-1.9, 1.02]], '#ffffff', 0.016); else {
      P.line(ctx, [[0.4, 1.5], [-0.9, 1.53]], '#ffffff', 0.03); P.line(ctx, [[2.0, 0.78], [1.3, 0.88]], '#ffffff', 0.025);
      P.line(ctx, [[0.9, 0.86], [-0.05, 0.9]], '#ffffff', 0.02); P.line(ctx, [[-0.3, 0.9], [-1.2, 0.93]], '#ffffff', 0.02);
      }
      ctx.globalAlpha = 1;
    }
    P.end(ctx);
  };
  // loose piece (door / hood / quarter) with its centre at world (wx, wy): stamped bare metal
  B.drawPiece = (ctx, name, wx, wy, lod) => {
    const pc = PIECE[name];
    P.begin(ctx, wx - pc.c[0] * M, wy + pc.c[1] * M, M, 1);
    panel(ctx, name, PAL.metal);
    P.end(ctx);
  };
})(typeof window !== 'undefined' ? window : globalThis);
