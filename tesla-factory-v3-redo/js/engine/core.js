// TF — Tesla Factory v3 engine core: namespace, registries, time helpers.
// World units: x right, y DOWN (canvas). TF.M world units = 1 metre. Everything is a pure function of t (seconds).
(function (G) {
  const TF = (G.TF = G.TF || {});
  TF.M = 50;                 // world units per metre
  TF.BASE = 24;              // base machine loop (s)
  TF.LOOP = 48;              // machine / item seamless loop (heavy items)
  TF.SCENE = 192;            // full scene loop (4 × LOOP), including the Elon tour
  TF.LOD = { far: 0.35, near: 0.8 };   // px per world unit thresholds (FACTORY-MAP §9)

  // ---------- registries ----------
  TF.rooms = {};      // id -> module
  TF.transports = []; // generic transport instances (drawn by the engine, culled by box)
  TF.themes = {};
  TF.flows = [];      // parts-flow declarations used by boot checks

  // Room module contract: {id, period, box?, ports: {connectorId: 'in'|'out'|'both'}, actors: [...],
  //   flows: [...], back?(ctx,t,theme,lod), draw(ctx,t,theme,lod), front?(ctx,t,theme,lod)}
  TF.room = (mod) => {
    if (TF.rooms[mod.id]) console.warn('room registered twice', mod.id);
    TF.rooms[mod.id] = mod;
    (mod.flows || []).forEach((f) => TF.flows.push(Object.assign({ owner: mod.id }, f)));
    return mod;
  };
  // Transport contract: {id, owner, period, box: {x,y,w,h}, layer: 'back'|'main'|'front', draw(ctx,t,theme,lod)}
  TF.transport = (tr) => { TF.transports.push(tr); return tr; };
  TF.theme = (th) => { TF.themes[th.name] = th; return th; };

  // ---------- math ----------
  const clamp = (TF.clamp = (v, a, b) => Math.max(a, Math.min(b, v)));
  TF.lerp = (a, b, u) => a + (b - a) * u;
  const smooth = (TF.smooth = (u) => { u = clamp(u, 0, 1); return u * u * (3 - 2 * u); });
  TF.mod = (t, p) => ((t % p) + p) % p;
  TF.ramp = (x, a, b) => smooth((x - a) / (b - a));          // eased 0..1 between a and b
  TF.lin = (x, a, b) => clamp((x - a) / (b - a), 0, 1);       // linear 0..1
  TF.pulse = (x, a, b, e) => Math.min(TF.ramp(x, a, a + e), 1 - TF.ramp(x, b - e, b)); // up, hold, down
  // Piecewise eased interpolation of numbers or arrays: keys [[time, value], ...] sorted by time.
  TF.keys = (x, keys, ease = smooth) => {
    if (x <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      if (x < keys[i][0]) {
        const [t0, v0] = keys[i - 1], [t1, v1] = keys[i], u = ease((x - t0) / (t1 - t0));
        return Array.isArray(v0) ? v0.map((v, j) => v + (v1[j] - v) * u) : v0 + (v1 - v0) * u;
      }
    }
    return keys[keys.length - 1][1];
  };
  // Deterministic hash noise in [0,1)
  TF.hash = (a, b = 0) => { const s = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return s - Math.floor(s); };

  // ---------- geometry / culling ----------
  TF.boxHit = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
  TF.pad = (b, p) => ({ x: b.x - p, y: b.y - p, w: b.w + 2 * p, h: b.h + 2 * p });
  TF.lodOf = (zoom) => (zoom < TF.LOD.far ? 'far' : zoom < TF.LOD.near ? 'mid' : 'near');
  TF.lodAtLeast = (lod, want) => ['far', 'mid', 'near'].indexOf(lod) >= ['far', 'mid', 'near'].indexOf(want);

  // ---------- small canvas helpers in world units ----------
  const D = (TF.draw = {});
  D.rect = (ctx, x, y, w, h, fill, stroke, lw = 1) => {
    if (fill) { ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.strokeRect(x, y, w, h); }
  };
  D.poly = (ctx, pts, fill, stroke, lw = 1, close = true) => {
    ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    if (close) ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
  };
  D.line = (ctx, pts, col, lw = 1, dash) => {
    ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.strokeStyle = col; ctx.lineWidth = lw; if (dash) ctx.setLineDash(dash);
    ctx.stroke(); if (dash) ctx.setLineDash([]);
  };
  D.circle = (ctx, x, y, r, fill, stroke, lw = 1) => {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
  };
  // Owner rule: NO TEXT in the scene. D.text only draws with ?debug=1 (labels for development);
  // D.sign is the one exception (the roof TESLA sign).
  TF.debug = typeof location !== 'undefined' && /[?&]debug=1/.test(location.search);
  D.text = (ctx, s, x, y, size, col, align, weight) => { if (TF.debug) D.sign(ctx, s, x, y, size, col, align, weight); };
  D.sign = (ctx, s, x, y, size, col, align = 'center', weight = '600') => {
    ctx.font = `${weight} ${size}px system-ui, sans-serif`; ctx.fillStyle = col; ctx.textAlign = align; ctx.textBaseline = 'middle';
    ctx.fillText(s, x, y);
  };
  // Tesla "T" logo centred at (x, y), height h
  D.tLogo = (ctx, x, y, h, col = '#e31937') => {
    const w = h * 0.9;
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y - h / 2); ctx.quadraticCurveTo(x, y - h * 0.62, x + w / 2, y - h / 2);
    ctx.lineTo(x + w * 0.42, y - h * 0.36); ctx.quadraticCurveTo(x + w * 0.2, y - h * 0.42, x + w * 0.08, y - h * 0.4);
    ctx.lineTo(x, y + h / 2); ctx.lineTo(x - w * 0.08, y - h * 0.4);
    ctx.quadraticCurveTo(x - w * 0.2, y - h * 0.42, x - w * 0.42, y - h * 0.36); ctx.closePath();
    ctx.fillStyle = col; ctx.fill();
  };
  // machine screen (dark panel) with a drawing callback in a local box
  D.screen = (ctx, x, y, w, h, fn) => {
    D.rect(ctx, x - 1.5, y - 1.5, w + 3, h + 3, '#5d656d'); D.rect(ctx, x, y, w, h, '#1d2733');
    if (fn) { ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); fn(x, y, w, h); ctx.restore(); }
  };
  // fan (rotor angle a) in a round housing
  D.fan = (ctx, x, y, r, a) => {
    D.circle(ctx, x, y, r, '#eef1f4', '#7b848c', 1.2);
    for (let k = 0; k < 4; k++) { const b = a + k * Math.PI / 2; ctx.beginPath(); ctx.ellipse(x + Math.cos(b) * r * 0.45, y + Math.sin(b) * r * 0.45, r * 0.42, r * 0.16, b, 0, Math.PI * 2); ctx.fillStyle = '#9aa3ab'; ctx.fill(); }
    D.circle(ctx, x, y, r * 0.15, '#4a5056');
  };
  D.mix = (a, b, u) => { // hex colour mix
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const c = (s) => Math.round(((pa >> s) & 255) + (((pb >> s) & 255) - ((pa >> s) & 255)) * clamp(u, 0, 1));
    return '#' + ((1 << 24) | (c(16) << 16) | (c(8) << 8) | c(0)).toString(16).slice(1);
  };
})(typeof window !== 'undefined' ? window : globalThis);
