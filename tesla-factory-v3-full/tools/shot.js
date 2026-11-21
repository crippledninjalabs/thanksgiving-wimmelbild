// Screenshot at a time, theme and view.  node tools/shot.js --t 3 --theme default --view floor6|6B|x,y,zoom|whole --w 1600 --h 1000 --out out/x.png
const fs = require('fs'), path = require('path');
const { open, setView, grab, ROOT } = require('./lib');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
(async () => {
  const w = +arg('w', 1600), h = +arg('h', 1000), t = +arg('t', 0);
  const { browser, page, errors, logs } = await open({ w, h, t, theme: arg('theme', 'default') });
  await setView(page, arg('view', 'whole'), w, h);
  await page.evaluate((t) => window.__setTime(t), t);
  const out = path.resolve(ROOT, arg('out', 'out/shot.png'));
  fs.writeFileSync(out, Buffer.from(await grab(page), 'base64'));
  const stats = await page.evaluate(() => window.TF.render.stats);
  console.log('wrote', path.relative(ROOT, out), JSON.stringify(stats));
  logs.filter((l) => l.includes('[boot]')).forEach((l) => console.log(l));
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; }
  await browser.close();
})();
