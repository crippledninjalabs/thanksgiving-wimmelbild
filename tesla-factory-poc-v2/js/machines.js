// Reusable animated machine parts + small vehicles. All are pure functions of time t (seconds).
// Any frequency hz used here is a multiple of 1/16 so LOOP=16 s stays seamless.
(function () {
  const { C, D } = TF;
  const M = (TF.M = {});

  // Robot arm on a pedestal. Returns hand [x,y].
  M.arm = (ctx, bx, by, tx, ty, l1 = 34, l2 = 30, bend = 1, w = 7, up = false) => {
    D.rect(ctx, bx - 9, up ? by - 4 : by, 18, 7, C.m2, C.line, 1.2, 2);
    return D.robotArm(ctx, bx, by + (up ? 2 : 0), tx, ty, l1, l2, bend, w);
  };
  // Welding arm: hand dips between two points; sparks while touching.
  // Welding arm: hand sweeps x0->x1 along y; w (0..1) eases between rest pose and work (sparks when w~1).
  M.weldArm = (ctx, t, bx, by, x0, y0, x1, y1, hz = 0.5, off = 0, l = 34, bend = 1, up = false, w = 1, rest = null) => {
    const q = TF.saw(t, hz, off);
    const k = TF.tri(t, hz, off);
    const dip = Math.max(0, Math.sin(q * Math.PI * 6)) * 5;
    let tx = TF.lerp(x0, x1, k), ty = TF.lerp(y0, y1, k) - dip;
    if (rest) { tx = TF.lerp(rest[0], tx, w); ty = TF.lerp(rest[1], ty, w); }
    const [hx, hy] = M.arm(ctx, bx, by, tx, ty, l, l, bend, 6, up);
    D.line(ctx, [[hx, hy], [hx, hy + 6]], C.dark, 2.4);
    if (w > 0.95 && Math.sin(q * Math.PI * 6) < 0.2) M.sparks(ctx, hx, hy + 7, t, bx + off * 7);
    return [hx, hy];
  };
  // activity weight for a station: ramps up after the car arrives, down before it leaves
  M.act = (ph, a = 0.1, b = 0.45, c = 1.95, d = 2.3) => TF.bump(ph, a, b, c, d);
  M.sparks = (ctx, x, y, t, seed = 0, n = 7, r = 11) => {
    const q = TF.saw(t, 4, TF.hash(seed));
    ctx.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const a = -Math.PI * (0.1 + 0.8 * TF.hash(seed + i * 3.1)) + (i % 2 ? 0.4 : -0.4) * q;
      const rr = r * (0.4 + 0.8 * TF.frac(q + TF.hash(seed + i)));
      ctx.strokeStyle = i % 3 ? '#ffb02e' : '#fff176'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a) * rr, y - Math.sin(a) * rr * -1 + rr * 0.3); ctx.stroke();
    }
    D.circ(ctx, x, y, 2.2, '#fff8c0', null);
  };
  M.fan = (ctx, x, y, r, t, hz = 1) => {
    D.circ(ctx, x, y, r, '#e9ecef', C.line, 1.4);
    const a0 = t * hz * Math.PI * 2;
    ctx.fillStyle = C.m3;
    for (let i = 0; i < 4; i++) {
      const a = a0 + (i * Math.PI) / 2;
      ctx.beginPath(); ctx.moveTo(x, y);
      ctx.arc(x, y, r * 0.82, a, a + 0.7); ctx.closePath(); ctx.fill();
    }
    D.joint(ctx, x, y, 2.4);
  };
  M.gauge = (ctx, x, y, r, t, hz = 0.25, off = 0) => D.gauge(ctx, x, y, r, 0.5 + 0.4 * TF.osc(t, hz, off));
  M.lights = (ctx, x, y, n, t, seed = 0, dx = 7, hz = 2) => {
    for (let i = 0; i < n; i++) {
      const on = TF.saw(t, hz, TF.hash(seed + i)) < 0.5;
      const col = ['#4caf50', '#ffc107', '#e31937', '#3d8bfd'][(i + seed) % 4];
      D.circ(ctx, x + i * dx, y, 2.2, on ? col : '#aab1b8', null);
    }
  };
  M.screen = (ctx, x, y, w, h, t, seed = 0, accent = C.blue) => {
    D.rect(ctx, x, y, w, h, '#263039', C.ink, 1.2, 2);
    ctx.strokeStyle = accent; ctx.lineWidth = 1.2; ctx.beginPath();
    for (let i = 0; i <= 8; i++) {
      const px = x + 2 + ((w - 4) * i) / 8;
      const py = y + h / 2 + Math.sin(i * 1.3 + seed + t * Math.PI) * (h * 0.28);
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.stroke();
    const bw = (w - 6) * TF.saw(t, 0.5, TF.hash(seed));
    D.rect(ctx, x + 3, y + h - 4, bw, 2, '#4caf50', null, 0, 0);
  };
  // Control cabinet: lights + screen + gauge. Good filler.
  M.cabinet = (ctx, x, y, w, h, t, seed = 0) => {
    D.rect(ctx, x, y - h, w, h, C.m, C.line, 1.4, 2);
    M.screen(ctx, x + 4, y - h + 4, w - 8, Math.min(16, h * 0.35), t, seed);
    M.lights(ctx, x + 6, y - h + Math.min(16, h * 0.35) + 10, Math.max(1, Math.floor((w - 8) / 7)), t, seed);
    if (h > 40) M.gauge(ctx, x + w / 2, y - 12, Math.min(8, w / 4), t, 0.25, seed * 0.1);
  };
  M.steam = (ctx, x, y, t, seed = 0, size = 7, hz = 0.5, amt = 1) => {
    if (amt <= 0) return;
    for (let i = 0; i < 3; i++) {
      const q = TF.saw(t, hz, i / 3 + TF.hash(seed));
      const a = 0.55 * (1 - q) * amt;
      ctx.fillStyle = `rgba(225,230,235,${a})`;
      ctx.beginPath(); ctx.arc(x + Math.sin(q * 5 + seed) * 4, y - q * 34, size * (0.5 + q), 0, Math.PI * 2); ctx.fill();
    }
  };
  M.tank = (ctx, x, y, w, h, level, col = '#7fb3e6') => {
    D.rect(ctx, x, y - h, w, h, '#eef1f4', C.line, 1.6, 6);
    D.rect(ctx, x + 3, y - 3 - (h - 6) * level, w - 6, (h - 6) * level, col, null, 0, 4);
    D.line(ctx, [[x + w * 0.3, y - h + 4], [x + w * 0.3, y - 4]], 'rgba(255,255,255,0.6)', 2);
  };
  M.piston = (ctx, x, y0, len, ext, w = 8) => { // vertical, base at y0 going down by len*ext
    D.rect(ctx, x - w / 2, y0, w, len * 0.55, C.m2, C.line, 1.2, 1);
    D.rect(ctx, x - w / 4, y0 + len * 0.5, w / 2, len * 0.5 * ext + 2, '#e9ecef', C.line, 1, 1);
    D.joint(ctx, x, y0 + len * 0.5 + len * 0.5 * ext + 2, 2.6);
  };
  M.ladder = (ctx, x, y0, y1, w = 12) => {
    D.line(ctx, [[x, y0], [x, y1]], C.m3, 2); D.line(ctx, [[x + w, y0], [x + w, y1]], C.m3, 2);
    for (let y = y0 + 6; y < y1; y += 8) D.line(ctx, [[x, y], [x + w, y]], C.m3, 1.4);
  };
  // Worker climbing a ladder: y oscillates between y0 (top) and y1 (bottom).
  M.climber = (ctx, x, y0, y1, t, hz = 0.125, off = 0, shirt = '#e67e22') => {
    const k = TF.ease(TF.tri(t, hz, off));
    const y = TF.lerp(y1, y0, k);
    const legs = TF.osc(t, 2) * 0.5;
    D.person(ctx, x, y, { s: 0.8, face: 1, shirt, hair: 'cap', hat: '#f4c430', armF: 2.6 + legs, armB: 2.6 - legs, walk: legs * 3 });
  };
  // Worker at a panel pushing a button now and then.
  M.operator = (ctx, x, y, t, face = 1, shirt = '#4a90d9', off = 0, hat = '#f4c430') => {
    const push = TF.bump(TF.saw(t, 0.5, off), 0.1, 0.2, 0.3, 0.45);
    D.person(ctx, x, y, { s: 0.8, face, shirt, hair: 'cap', hat, armF: 1.2 + push * 0.5, armB: 0.2 + TF.osc(t, 0.25, off) * 0.1 });
  };
  M.beacon = (ctx, x, y, t, col = '#ff9800', hz = 1) => {
    D.rect(ctx, x - 3, y - 2, 6, 4, C.dark, null, 0, 1);
    const on = TF.saw(t, hz) < 0.5;
    D.circ(ctx, x, y - 5, 3.4, on ? col : '#c9a46a', C.ink, 0.8);
    if (on) D.circ(ctx, x, y - 5, 7, 'rgba(255,180,0,0.25)', null);
  };
  // Overhead trolley on a rail with a cable + hook; hook at (x, y). Rail at yr.
  M.hoist = (ctx, x, yr, y, col = C.m2) => {
    D.rect(ctx, x - 10, yr - 3, 20, 9, col, C.line, 1.2, 2);
    D.circ(ctx, x - 5, yr - 3, 2.4, C.dark, null); D.circ(ctx, x + 5, yr - 3, 2.4, C.dark, null);
    D.line(ctx, [[x, yr + 6], [x, y]], C.ink, 1.2);
    D.line(ctx, [[x - 4, y], [x + 4, y]], C.dark, 2.4);
  };
  M.rail = (ctx, x0, x1, y) => {
    D.rect(ctx, x0, y - 4, x1 - x0, 5, C.m3, C.line, 1, 1);
  };

  // Roller bed: top at y, rollers spin continuously (hz multiple of 1/16).
  M.rollers = (ctx, x0, x1, y, t, legs = 0, hz = 1) => {
    D.rect(ctx, x0, y + 3, x1 - x0, 6, C.m3, C.line, 1, 1);
    const a = t * hz * Math.PI * 2;
    for (let x = x0 + 6; x < x1 - 3; x += 14) {
      D.circ(ctx, x, y + 3, 3.2, C.m, C.ink, 0.8);
      D.line(ctx, [[x, y + 3], [x + Math.cos(a) * 3, y + 3 + Math.sin(a) * 3]], C.ink, 0.8);
    }
    if (legs) for (let x = x0 + 20; x < x1 - 10; x += 90) D.rect(ctx, x - 2, y + 9, 4, legs, C.m2, C.line, 1, 1);
  };
  M.stripes = (ctx, x, y, w, h) => {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.fillStyle = '#f4c430'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#2b3036';
    for (let i = -h; i < w; i += 10) { ctx.beginPath(); ctx.moveTo(x + i, y + h); ctx.lineTo(x + i + 5, y + h); ctx.lineTo(x + i + 5 + h, y); ctx.lineTo(x + i + h, y); ctx.fill(); }
    ctx.restore();
  };

  M.drone = (ctx, x, y, t) => {
    D.rect(ctx, x - 8, y - 3, 16, 6, C.m, C.ink, 1, 2);
    D.line(ctx, [[x - 14, y - 4], [x + 14, y - 4]], C.ink, 1.2);
    const w = Math.abs(Math.cos(t * Math.PI * 16)) * 7; // rotor blur
    for (const rx of [-14, 14]) D.line(ctx, [[x + rx - w, y - 6], [x + rx + w, y - 6]], C.dark, 1.6);
    D.circ(ctx, x, y + 4, 2, TF.saw(t, 2) < 0.5 ? '#e31937' : '#4caf50', null);
  };
  M.lamp = (ctx, x, y0, len, t, off = 0) => {
    D.line(ctx, [[x, y0], [x, y0 + len]], C.ink, 1);
    D.poly(ctx, [[x - 7, y0 + len + 7], [x - 3, y0 + len], [x + 3, y0 + len], [x + 7, y0 + len + 7]], C.m2, C.ink, 1);
    D.circ(ctx, x, y0 + len + 8, 2.6, TF.saw(t, 1, off) < 0.6 ? '#ffd84a' : '#c9b26a', null);
  };

  // ---- vehicles ----
  M.forklift = (ctx, x, y, face, lift = 0, load) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(face, 1);
    D.rect(ctx, -18, -16, 26, 12, '#f4c430', C.ink, 1.2, 2);
    D.poly(ctx, [[-14, -16], [-12, -30], [2, -30], [4, -16]], null, C.ink, 1.4, false);
    D.rect(ctx, -22, -18, 6, 10, C.dark, null, 0, 1);
    D.rect(ctx, 9, -38, 3, 36, C.dark, null, 0, 0);
    D.line(ctx, [[10, -4 - lift], [24, -4 - lift]], C.ink, 2.4);
    if (load) load(ctx, 18, -12 - lift);
    D.wheel(ctx, -11, -4, 4.5, x * 0.2); D.wheel(ctx, 4, -4, 4.5, x * 0.2);
    D.person(ctx, -6, -14, { s: 0.6, face: 1, shirt: '#4a90d9', hair: 'cap', hat: '#f4c430', armF: 1.3, armB: 1.1 });
    ctx.restore();
  };
  M.agv = (ctx, x, y, w = 34, col = '#e9ecef') => {
    D.rect(ctx, x - w / 2, y - 9, w, 7, col, C.ink, 1.2, 3);
    D.circ(ctx, x - w / 2 + 5, y - 2, 2.4, C.dark, null); D.circ(ctx, x + w / 2 - 5, y - 2, 2.4, C.dark, null);
    D.line(ctx, [[x - w / 2 + 4, y - 6], [x + w / 2 - 4, y - 6]], TF.C.blue, 1.4);
  };
  M.cart = (ctx, x, y, face = 1) => {
    D.rect(ctx, x - 13, y - 12, 26, 8, C.m, C.line, 1.2, 1);
    D.circ(ctx, x - 8, y - 2.5, 2.5, C.dark, null); D.circ(ctx, x + 8, y - 2.5, 2.5, C.dark, null);
    D.line(ctx, [[x - 13 * face, y - 12], [x - 18 * face, y - 24]], C.line, 1.6);
  };

  // Optimus scaled by s, hands given in world coords.
  D.opt = (ctx, x, y, s, o = {}) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const cv = (h) => (h ? [(h[0] - x) / s, (h[1] - y) / s] : undefined);
    const mid = o.mid && (() => { ctx.save(); ctx.scale(1 / s, 1 / s); ctx.translate(-x, -y); o.mid(); ctx.restore(); });
    D.optimus(ctx, 0, 0, { face: o.face, bob: o.bob, hF: cv(o.hF), hB: cv(o.hB), walk: o.walk, amp: o.amp, mid });
    ctx.restore();
  };
  // Battery pack (flat slab) centred on x, bottom at y.
  D.pack = (ctx, x, y, w = 60) => {
    D.rect(ctx, x - w / 2, y - 9, w, 9, '#4f5963', C.ink, 1.2, 2);
    for (let i = 1; i < 6; i++) D.line(ctx, [[x - w / 2 + (w * i) / 6, y - 8], [x - w / 2 + (w * i) / 6, y - 1]], '#7f8a95', 1);
    D.rect(ctx, x - 5, y - 7, 10, 4, TF.C.red, null, 0, 1);
  };
})();
