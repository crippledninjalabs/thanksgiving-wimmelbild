// Popscan: render every frame (30 fps) of the 48 s loop at a near-LOD view of the whole of floor 6 and flag
// single-frame events per 16x16 tile: JUMP = a tile changes a lot between two frames while barely changing in the
// frames before and after; FLICKER = a tile changes and changes back (frame i differs from both neighbours, which
// match each other). node tools/popscan.js [zoom=1] [fps=30] [theme]
const { open } = require('./lib');
if (process.argv[2] !== 'actors') (async () => {
  const zoom = +(process.argv[2] || 1), fps = +(process.argv[3] || 30), theme = process.argv[4] || 'default';
  const { browser, page, errors } = await open({ w: 800, h: 600, theme });
  const res = await page.evaluate(([zoom, fps, theme]) => {
    const TF = window.TF, x0 = 1340, x1 = 3770, y0 = 1490, y1 = 1810;
    const W = Math.round((x1 - x0) * zoom), H = Math.round((y1 - y0) * zoom), view = { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, zoom };
    const c = document.createElement('canvas'); c.width = W; c.height = H; const ctx = c.getContext('2d', { willReadFrequently: true });
    const TS = 16, tw = Math.ceil(W / TS), th = Math.ceil(H / TS), NT = tw * th, N = Math.round(48 * fps);
    const lum = (t) => { TF.render.frame(ctx, W, H, t, view, theme, 1); const d = ctx.getImageData(0, 0, W, H).data, L = new Uint8Array(W * H);
      for (let i = 0, j = 0; i < d.length; i += 4, j++) L[j] = (d[i] * 3 + d[i + 1] * 6 + d[i + 2]) / 10; return L; };
    const tileDiff = (A, B) => { const out = new Float32Array(NT);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const k = ((y / TS) | 0) * tw + ((x / TS) | 0); out[k] += Math.abs(A[y * W + x] - B[y * W + x]); }
      for (let k = 0; k < NT; k++) out[k] /= TS * TS; return out; };
    const Ls = [], D = [], D2 = [];
    for (let i = 0; i <= N + 1; i++) {
      Ls.push(lum(i / fps)); if (Ls.length > 3) Ls.shift();
      if (Ls.length >= 2) D.push(tileDiff(Ls[Ls.length - 2], Ls[Ls.length - 1]));
      if (Ls.length === 3) D2.push(tileDiff(Ls[0], Ls[2]));
    }
    // D[i] = diff(frame i, i+1); D2[i] = diff(frame i, i+2)
    const T = 8, flags = [];
    for (let i = 1; i < N; i++) for (let k = 0; k < NT; k++) {
      const a = D[i - 1][k], b = D[i][k], n = D[i + 1] ? D[i + 1][k] : 0;
      const wx = x0 + ((k % tw) + 0.5) * TS / zoom, wy = y0 + (((k / tw) | 0) + 0.5) * TS / zoom;
      if (b > T && b > 4 * Math.max(a, n)) flags.push({ kind: 'JUMP', t: +(i / fps).toFixed(3), x: Math.round(wx), y: Math.round(wy), v: +b.toFixed(1) });
      if (a > T && b > T && D2[i - 1][k] < 0.3 * Math.min(a, b)) flags.push({ kind: 'FLICKER', t: +(i / fps).toFixed(3), x: Math.round(wx), y: Math.round(wy), v: +Math.min(a, b).toFixed(1) });
    }
    return { W, H, N, flags };
  }, [zoom, fps, theme]);
  // group flags by kind + time + room
  const room = (x) => x < 1350 ? 'core' : '6' + 'ABCDE'[Math.min(4, Math.floor((x - 1350) / 480))];
  const groups = {};
  for (const f of res.flags) { const key = `${f.kind} t=${f.t.toFixed(2)} ${room(f.x)}`; (groups[key] = groups[key] || []).push(f); }
  const keys = Object.keys(groups);
  console.log(`popscan: ${res.N} frames ${res.W}x${res.H} at zoom ${zoom}, ${res.flags.length} tile flags in ${keys.length} groups`);
  keys.sort((a, b) => (a < 'K') - (b < 'K') || groups[b].length - groups[a].length); keys.filter((k) => k.startsWith('JUMP')).concat(keys.filter((k) => !k.startsWith('JUMP')).slice(0, 15)).slice(0, 90).forEach((k) => {
    const g = groups[k], xs = g.map((f) => f.x), ys = g.map((f) => f.y);
    console.log(`${k.padEnd(28)} tiles ${String(g.length).padStart(3)}  world x ${Math.min(...xs)}..${Math.max(...xs)} y ${Math.min(...ys)}..${Math.max(...ys)}  max ${Math.max(...g.map((f) => f.v))}`);
  });
  // summary by kind, room and height band (what usually lives there on floor 6)
  const band = (y) => y < 1514 ? 'tube band (PT capsule)' : y < 1550 ? 'cable band (baskets)' : y < 1640 ? 'hanger band (F6H)' : y > 1780 ? 'floor/slab line' : 'work zone';
  const sum = {};
  for (const f of res.flags) { const k = `${f.kind.padEnd(7)} ${room(f.x).padEnd(4)} ${band(f.y)}`; sum[k] = (sum[k] || 0) + 1; }
  console.log('summary (tile flags):'); Object.entries(sum).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log('  ' + k.padEnd(48) + v));
  if (errors.length) console.log('ERRORS:', errors.join('\n'));
  await browser.close();
})();

// Actor-scan mode: node tools/popscan.js actors [fps=10] [theme]
// Hooks TF.act.draw, renders the whole world at mid LOD, flags Optimus/Elon pops and jumps.
if (process.argv[2] === 'actors') {
  const fps = +(process.argv[3] || 10), theme = process.argv[4] || 'default';
  (async () => {
    const { open } = require('./lib');
    const { browser, page, errors } = await open({ w: 800, h: 600, theme });
    const res = await page.evaluate(([fps, theme]) => {
      const TF = window.TF, L = TF.layout;
      const W = 2400, H = 1700, zoom = Math.min(W / L.W, H / L.H);
      const view = { cx: L.W / 2, cy: L.H / 2, zoom };
      const c = document.createElement('canvas'); c.width = W; c.height = H;
      const ctx = c.getContext('2d');
      const N = Math.round(48 * fps);
      const frames = [];
      for (let i = 0; i <= N; i++) {
        const t = (i === N ? 48 : i / fps);
        TF._actorScan = [];
        TF.render.frame(ctx, W, H, t, view, theme, 1);
        frames.push(TF._actorScan.map((a, k) => ({ i: k, id: a.id || (a.who + ':' + Math.round(a.x / 40) + ':' + Math.round(a.y / 40)), who: a.who, x: a.x, y: a.y, slide: a.slide, peek: a.peek, build: a.build })));
      }
      TF._actorScan = null;
      const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
      const flags = [];
      const match = (A, B) => {
        const used = new Set(), pairs = [];
        const byId = {};
        for (const b of B) if (b.id) byId[b.id] = b;
        for (const a of A) {
          let b = a.id && byId[a.id];
          if (b && !used.has(b)) { used.add(b); pairs.push([a, b]); continue; }
          let best = null, bd = 1e9;
          for (const cand of B) if (!used.has(cand) && cand.who === a.who) {
            const d = dist(a, cand); if (d < bd) { bd = d; best = cand; }
          }
          if (best && bd < 220) { used.add(best); pairs.push([a, best]); }
          else pairs.push([a, null]);
        }
        for (const b of B) if (![...pairs].some((p) => p[1] === b)) pairs.push([null, b]);
        return pairs;
      };
      for (let i = 0; i < N; i++) {
        const pairs = match(frames[i], frames[i + 1]);
        const t = i / fps, t2 = (i + 1 === N ? 48 : (i + 1) / fps);
        for (const [a, b] of pairs) {
          if (a && !b) flags.push({ kind: (a.peek ? 'HATCH_LEAVE' : a.build ? 'BUILD_START' : 'VANISH'), t: +t.toFixed(2), who: a.who, id: a.id, x: Math.round(a.x), y: Math.round(a.y) });
          if (!a && b) flags.push({ kind: (b.peek ? 'HATCH_ENTER' : b.build ? 'BUILD_START' : 'APPEAR'), t: +t2.toFixed(2), who: b.who, id: b.id, x: Math.round(b.x), y: Math.round(b.y) });
          if (a && b) {
            const d = dist(a, b), dt = Math.max(0.001, t2 - t);
            if (d > 160 && !a.slide && !b.slide) flags.push({ kind: 'JUMP', t: +t2.toFixed(2), who: a.who, id: a.id, x: Math.round(b.x), y: Math.round(b.y), d: Math.round(d), v: +(d / dt).toFixed(0) });
          }
        }
      }
      // seam: t=47.9 vs t=0 for actors with stable ids (Elon may move — only flag vanish/appear)
      const a0 = frames[0], a1 = frames[N - 1];
      const seam = match(a1, a0).filter(([a, b]) => (a && !b) || (!a && b)).map(([a, b]) => {
        const s = a || b;
        return { kind: a ? 'SEAM_VANISH' : 'SEAM_APPEAR', who: s.who, id: s.id, x: Math.round(s.x), y: Math.round(s.y) };
      });
      const counts = frames.map((f) => f.length);
      return { zoom, lod: TF.lodOf(zoom), N, flags, seam, minActors: Math.min(...counts), maxActors: Math.max(...counts), at0: frames[0].length, at48: frames[N].length };
    }, [fps, theme]);
    console.log(`actorscan: ${res.N} steps, lod ${res.lod} zoom ${res.zoom.toFixed(3)}, actors ${res.minActors}..${res.maxActors} (t0=${res.at0} t48=${res.at48})`);
    console.log(`flags ${res.flags.length}, seam ${res.seam.length}`);
    const show = (arr) => arr.slice(0, 80).forEach((f) => console.log(`  ${f.kind.padEnd(12)} t=${String(f.t ?? 'seam').padStart(5)}  ${f.who}  ${f.id || ''}  @${f.x},${f.y}${f.d ? ' d=' + f.d : ''}`));
    const vans = res.flags.filter((f) => f.kind === 'VANISH' || f.kind === 'APPEAR');
    const hatch = res.flags.filter((f) => f.kind === 'HATCH_ENTER' || f.kind === 'HATCH_LEAVE' || f.kind === 'BUILD_START');
    const jumps = res.flags.filter((f) => f.kind === 'JUMP');
    console.log('appear/vanish:'); show(vans);
    console.log('hatch/build (expected):'); show(hatch);
    console.log('jumps:'); show(jumps);
    console.log('seam t=47.9 vs t=0:'); show(res.seam);
    if (errors.length) console.log('ERRORS:', errors.join('\n'));
    await browser.close();
  })();
}
