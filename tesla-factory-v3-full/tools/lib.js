// Shared headless-Chrome helpers for the v3 tools (playwright-core + /usr/bin/google-chrome).
const path = require('path');
const { chromium } = require('/workspace/tesla-factory/review/node_modules/playwright-core');
const ROOT = path.resolve(__dirname, '..');
const VIEWS = { // named views (world centre x, y, zoom at the given width)
  whole: null, floor6: [2280, 1642, null], '6A': [1590, 1642, null], '6B': [2070, 1642, null], '6C': [2550, 1642, null],
  '6D': [3030, 1642, null], '6E': [3510, 1642, null],
};
async function open(o = {}) {
  const w = o.w || 1600, h = o.h || 1000;
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const errors = [], logs = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { logs.push(m.type() + ': ' + m.text()); if (m.type() === 'error') errors.push(m.text()); });
  const q = new URLSearchParams({ clean: '1', t: String(o.t ?? 0), theme: o.theme || 'default' });
  await page.goto('file://' + path.join(ROOT, 'index.html') + '?' + q.toString());
  await page.waitForFunction(() => window.__ready === true);
  return { browser, page, errors, logs, w, h };
}
// resolve a view spec: 'whole' | name | 'x,y,zoom' | [x,y,zoom]; zoom null = fit the width of the named span
function resolveView(spec, w, h) {
  if (!spec || spec === 'whole') return null;
  if (typeof spec === 'string' && VIEWS[spec] !== undefined) {
    const v = VIEWS[spec]; const span = spec === 'floor6' ? 2560 : 520;
    return [v[0], v[1], v[2] || Math.min(w / span, h / 340)];
  }
  const a = Array.isArray(spec) ? spec : String(spec).split(',').map(Number);
  return a;
}
async function setView(page, spec, w, h) {
  const v = resolveView(spec, w, h);
  if (v) await page.evaluate((v) => window.__view(v[0], v[1], v[2]), v);
  else await page.evaluate(() => { window.TF.camera.fit(); window.__render(); });
}
async function grab(page) {
  return page.evaluate(() => document.getElementById('cv').toDataURL('image/png').split(',')[1]);
}
module.exports = { open, setView, grab, ROOT, resolveView };
