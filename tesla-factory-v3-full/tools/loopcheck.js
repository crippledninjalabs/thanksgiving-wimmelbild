// Loop check: frame at t = 0 vs t = 48 must be pixel-identical (whole scene, floor 6, and a near view of every room).
// node tools/loopcheck.js [theme]
const { open } = require('./lib');
(async () => {
  const theme = process.argv[2] || 'default';
  const { browser, page, errors } = await open({ w: 1600, h: 1000, theme });
  const views = { whole: null, floor6: [2280, 1642, 0.62], '6A': [1590, 1642, 2.8], '6B': [2070, 1642, 2.8], '6C': [2550, 1642, 2.8], '6D': [3030, 1642, 2.8], '6E': [3510, 1642, 2.8] };
  for (const f of [1, 2, 3, 4, 5, 7, 8, 9]) views['floor' + f] = [2300, 3300 - (f - 1) * 300 - 158, 0.6];
  views.dock = [700, 3150, 1.2];
  views.ship = [4885, 1850, 0.42];
  views.tower = [4625, 2000, 0.45];
  views.lawn = [4150, 3150, 0.75];
  views.underground = [2650, 3490, 0.55];
  views.vault = [3850, 3490, 0.7];
  let bad = 0;
  for (const [name, v] of Object.entries(views)) {
    const diff = await page.evaluate(([v, theme]) => {
      const TF = window.TF, W = 1600, H = 1000, view = v ? { cx: v[0], cy: v[1], zoom: v[2] } : { cx: TF.layout.W / 2, cy: TF.layout.H / 2, zoom: Math.min(W / TF.layout.W, H / TF.layout.H) * 0.98 };
      TF.GAGS_OFF = true;
      const grab = (t) => { const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'); TF.render.frame(x, W, H, t, view, theme, 1); return x.getImageData(0, 0, W, H).data; };
      const a = grab(0), b = grab(48);
      let n = 0; for (let i = 0; i < a.length; i += 4) if (a[i] !== b[i] || a[i + 1] !== b[i + 1] || a[i + 2] !== b[i + 2]) n++;
      return n;
    }, [v, theme]);
    console.log(`${name.padEnd(7)} t=0 vs t=48: ${diff} differing pixels`);
    if (diff) bad++;
  }
  if (errors.length) console.log('ERRORS:', errors.join('\n'));
  console.log(bad ? 'LOOP CHECK FAILED' : 'LOOP CHECK OK');
  await browser.close();
})();
