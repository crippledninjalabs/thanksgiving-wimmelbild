// usage: node tools/shot.js out.png theme t [t2 ...]  (screenshots at frozen times; prints console errors)
const { chromium } = require('/workspace/tesla-factory/review/node_modules/playwright-core');
(async () => {
  const [out, theme, ...ts] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1600, height: 1000 } });
  const errs = [];
  p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  p.on('pageerror', (e) => errs.push(String(e)));
  await p.goto('file://' + process.cwd() + '/index.html?theme=' + theme + '&t=0');
  await p.waitForTimeout(300);
  for (const t of ts) {
    await p.evaluate((s) => window.__setTime(s), +t);
    await p.screenshot({ path: out.replace('.png', `_${t}.png`) });
  }
  console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no console errors');
  await b.close();
})();
