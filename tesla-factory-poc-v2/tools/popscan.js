// usage: node tools/popscan.js [theme] [fps] [threshold] [t0] [t1]  — renders the whole loop in-page and reports
// 32x32 cells whose pixels change a lot between consecutive frames (candidate pops/teleports).
// Also checks t=0 vs t=LOOP pixel identity.
const { chromium } = require('/workspace/tesla-factory/review/node_modules/playwright-core');
(async () => {
  const theme = process.argv[2] || 'default', fps = +(process.argv[3] || 60);
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
  const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
  await p.goto('file://' + process.cwd() + '/index.html?t=0&theme=' + theme);
  await p.waitForTimeout(300);
  const res = await p.evaluate(([fps, TH, T0, T1]) => {
    const cv = document.getElementById('scene'), ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height, CS = 32, gx = Math.ceil(W / CS), gy = Math.ceil(H / CS);
    const grab = (t) => { __setTime(t); return ctx.getImageData(0, 0, W, H).data; };
    const a0 = grab(0), aL = grab(TF.LOOP);
    let loopDiff = 0; for (let i = 0; i < a0.length; i++) if (Math.abs(a0[i] - aL[i]) > 2) loopDiff++;
    // per-frame changed-sample counts per cell; a pop = isolated spike (much bigger than both neighbours)
    const n = Math.round((T1 - T0) * fps), counts = [];
    let prev = grab(T0);
    for (let f0 = 1; f0 <= n; f0++) {
      const cur = grab(T0 + f0 / fps), cnt = new Uint16Array(gx * gy);
      for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) {
        const i = (y * W + x) * 4;
        if (Math.abs(cur[i] - prev[i]) + Math.abs(cur[i + 1] - prev[i + 1]) + Math.abs(cur[i + 2] - prev[i + 2]) > 90) cnt[((y / CS) | 0) * gx + ((x / CS) | 0)]++;
      }
      counts.push(cnt); prev = cur;
    }
    const hits = [];
    for (let f = 1; f < counts.length - 1; f++) for (let c = 0; c < gx * gy; c++) {
      const v = counts[f][c], nb = Math.max(counts[f - 1][c], counts[f + 1][c]);
      if (v > TH && v > 3 * nb) hits.push([+(T0 + (f + 1) / fps).toFixed(4), (c % gx) * CS, ((c / gx) | 0) * CS, v, nb]);
    }
    return { loopDiff, hits };
  }, [fps, +(process.argv[4] || 110), +(process.argv[5] || 0), +(process.argv[6] || 16)]);
  console.log('t=0 vs t=LOOP differing bytes:', res.loopDiff);
  console.log('isolated spikes (t, x, y, changed/256, neighbour max):', res.hits.length);
  res.hits.sort((a, b) => b[3] - a[3]).slice(0, +(process.env.TOP || 60)).forEach((h) => console.log(h.join('\t')));
  console.log(errs.length ? 'ERRORS ' + errs.join('\n') : 'no page errors');
  await b.close();
})();
