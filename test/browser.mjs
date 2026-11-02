// Headless check of the live viewer: loop, zoom, pan, console, and frame 0.
// Run with: PUPPETEER_CORE=/path/to/puppeteer-core node test/browser.mjs
import { spawn } from 'child_process';
import fs from 'fs';
import http from 'http';
import os from 'os';
import path from 'path';
import { pathToFileURL } from 'url';

const puppeteerPath = process.env.PUPPETEER_CORE
  || '/tmp/pw/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
const puppeteer = (await import(pathToFileURL(puppeteerPath).href)).default;

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const shots = path.join(os.tmpdir(), 'wimmel-shots');
fs.mkdirSync(shots, { recursive: true });
const port = 4173;

const errors = [];
function fail(message) {
  console.error('FAIL', message);
  errors.push(message);
}

function serve() {
  const types = {
    '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
    '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png',
  };
  return http.createServer((req, res) => {
    const url = new URL(req.url, `http://127.0.0.1:${port}`);
    let rel = decodeURIComponent(url.pathname).replace(/^\/+/, '');
    if (rel === '') rel = 'index.html';
    const file = path.resolve(root, rel);
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404); res.end('no'); return;
    }
    res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
}

function renderReference() {
  const py = `
import importlib.util, json, os, shutil, tempfile
from PIL import Image
root = ${JSON.stringify(root)}
paths = json.load(open(os.path.join(root, "motion", "paths.json"), encoding="utf-8"))
tmp = tempfile.mkdtemp()
data = json.loads(json.dumps(paths))
data["background"] = {"8k": os.path.join(root,"assets","background-8k.jpg"), "4k": os.path.join(root,"assets","background-4k.jpg"), "1280": os.path.join(root,"assets","background-4k.jpg")}
data["cab"]["sprites"] = {
  "DR": os.path.join(root,"assets","sprites","cybercabs","cab_closed_DR.png"),
  "DR_open": os.path.join(root,"assets","sprites","cybercabs","cab_door_open_DR.png"),
  "UR": os.path.join(root,"assets","sprites","cybercabs","cab_closed_UR.png"),
}
data["elon"]["sprites_dir"] = os.path.join(root, "assets", "sprites", "elon")
open(os.path.join(tmp,"paths.json"),"w").write(json.dumps(data))
shutil.copy(os.path.join(root,"reference","render_loop.py"), os.path.join(tmp,"render_loop.py"))
spec = importlib.util.spec_from_file_location("render_loop", os.path.join(tmp,"render_loop.py"))
R = importlib.util.module_from_spec(spec); spec.loader.exec_module(R)
W,H = 1280,720
k = W/1280
bg = Image.open(data["background"]["4k"]).convert("RGBA").resize((W,H), Image.Resampling.LANCZOS)
S = R.Sprites(k)
R.render_frame(bg, S, 0, k).convert("RGB").save(${JSON.stringify(path.join(shots, "ref-frame0.png"))})
print("ref", W, H)
`;
  return new Promise((resolve, reject) => {
    const child = spawn('python3', ['-c', py], { stdio: ['ignore', 'inherit', 'inherit'] });
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error('reference render failed')));
  });
}

const server = serve();
await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve));
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME || '/usr/bin/google-chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--hide-scrollbars'],
});

const consoleErrors = [];
const page = await browser.newPage();
const hosts = new Set();
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});
page.on('pageerror', (err) => consoleErrors.push(String(err)));
page.on('request', (req) => {
  try { hosts.add(new URL(req.url()).host); } catch { /* ignore */ }
});

try {
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => window.Wimmel, { timeout: 30000 });
  await page.evaluate(() => Wimmel.ready);

  const meta = await page.evaluate(() => ({
    title: document.title,
    og: document.querySelector('meta[property="og:title"]')?.content,
    card: document.querySelector('meta[name="twitter:card"]')?.content,
    image: document.querySelector('meta[property="og:image"]')?.content,
    hint: document.querySelector('#hint')?.textContent,
  }));
  if (meta.title !== 'Thanksgiving at SpaceX') fail(`title ${meta.title}`);
  if (meta.og !== 'Thanksgiving at SpaceX') fail(`og:title ${meta.og}`);
  if (meta.card !== 'summary_large_image') fail(`twitter card ${meta.card}`);
  if (!meta.image?.endsWith('/share.jpg')) fail(`og:image ${meta.image}`);
  if (meta.hint !== 'Pinch or scroll to zoom') fail(`hint ${meta.hint}`);

  await page.evaluate(() => { Wimmel.setTime(0); });
  await page.evaluate(() => Wimmel.whenIdle());
  await page.screenshot({ path: path.join(shots, 'full.png') });
  await page.evaluate(() => { Wimmel.pause(); Wimmel.setTime(0); });

  const png = await page.evaluate(() => Wimmel.capture());
  fs.writeFileSync(path.join(shots, 'browser-frame0.png'), Buffer.from(png.split(',')[1], 'base64'));

  const fit = await page.evaluate(() => Wimmel.getCamera().scale);
  await page.mouse.move(640, 360);
  for (let i = 0; i < 6; i += 1) await page.mouse.wheel({ deltaY: -120 });
  await new Promise((r) => setTimeout(r, 50));
  const zoomed = await page.evaluate(() => Wimmel.getCamera());
  if (!(zoomed.scale > fit * 1.4)) fail(`wheel zoom ${fit} -> ${zoomed.scale}`);

  const beforePan = zoomed.x;
  await page.mouse.move(420, 360);
  await page.mouse.down();
  await page.mouse.move(760, 300, { steps: 15 });
  await page.mouse.up();
  const panned = await page.evaluate(() => Wimmel.getCamera());
  if (Math.abs(panned.x - beforePan) < 20) fail(`drag pan did not move (${beforePan} -> ${panned.x})`);

  await page.evaluate(() => Wimmel.panBy(100000, 100000));
  const clamped = await page.evaluate(() => {
    const c = Wimmel.getCamera();
    const ww = Wimmel.WORLD.w * c.scale;
    const hh = Wimmel.WORLD.h * c.scale;
    return { x: c.x, y: c.y, ww, hh, vw: 1280, vh: 720 };
  });
  if (clamped.x > 0.5 || clamped.x < clamped.vw - clamped.ww - 0.5) fail(`pan x not clamped ${JSON.stringify(clamped)}`);
  if (clamped.y > 0.5 || clamped.y < clamped.vh - clamped.hh - 0.5) fail(`pan y not clamped ${JSON.stringify(clamped)}`);

  await page.evaluate(() => Wimmel.resetView());
  const reset = await page.evaluate(() => Wimmel.getCamera().scale);
  if (Math.abs(reset - fit) > 1e-6) fail(`reset scale ${reset} vs fit ${fit}`);

  await page.mouse.click(640, 360);
  await new Promise((r) => setTimeout(r, 120));
  await page.mouse.click(640, 360);
  await new Promise((r) => setTimeout(r, 400));
  const doubled = await page.evaluate(() => Wimmel.getCamera().scale);
  if (!(doubled > fit * 1.8)) fail(`double-click zoom ${fit} -> ${doubled}`);

  await page.evaluate(() => Wimmel.play());
  await page.click('#play');
  const paused = await page.evaluate(() => Wimmel.isPlaying());
  if (paused) fail('pause button did not pause');
  await page.click('#play');
  const resumed = await page.evaluate(() => Wimmel.isPlaying());
  if (!resumed) fail('pause button did not resume');

  await page.evaluate(() => { Wimmel.setTime(29.75); Wimmel.play(); });
  await new Promise((r) => setTimeout(r, 450));
  const wrapped = await page.evaluate(() => Wimmel.getTime());
  if (!(wrapped > 0.05 && wrapped < 1.2)) fail(`loop did not wrap, t=${wrapped}`);
  const seam = await page.evaluate(() => JSON.stringify(Wimmel.pose(0)) === JSON.stringify(Wimmel.pose(30)));
  if (!seam) fail('pose(0) !== pose(30) in the page');

  await page.evaluate(() => { Wimmel.pause(); Wimmel.setTime(0); Wimmel.resetView(); });
  await page.evaluate(() => Wimmel.frameWorld(486 * 6, 433 * 6, 1.25));
  await page.evaluate(() => Wimmel.whenIdle());
  const elonTiles = await page.evaluate(() => Wimmel.debug());
  if (!(elonTiles.tilesVisible > 0 && elonTiles.tilesLoaded === elonTiles.tilesVisible)) {
    fail(`elon tiles ${elonTiles.tilesLoaded}/${elonTiles.tilesVisible}`);
  }
  await page.screenshot({ path: path.join(shots, 'elon.png') });

  await page.evaluate(() => { Wimmel.setTime(5); Wimmel.frameWorld(95 * 6, 543 * 6, 1.35); });
  await page.evaluate(() => Wimmel.whenIdle());
  const cabTiles = await page.evaluate(() => Wimmel.debug());
  if (!(cabTiles.tilesLoaded === cabTiles.tilesVisible && cabTiles.tilesVisible > 0)) {
    fail(`cab tiles ${cabTiles.tilesLoaded}/${cabTiles.tilesVisible}`);
  }
  await page.screenshot({ path: path.join(shots, 'cab.png') });

  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await new Promise((r) => setTimeout(r, 200));
  await page.evaluate(() => { Wimmel.pause(); Wimmel.setTime(0); Wimmel.resetView(); });
  const phoneFit = await page.evaluate(() => Wimmel.getCamera());
  if (!(phoneFit.scale > 0 && phoneFit.scale < 0.2)) fail(`phone fit scale ${phoneFit.scale}`);
  const client = await page.createCDPSession();
  const pinch = async (points, type) => {
    await client.send('Input.dispatchTouchEvent', { type, touchPoints: points });
  };
  await pinch([{ x: 140, y: 420, id: 1 }, { x: 250, y: 420, id: 2 }], 'touchStart');
  await pinch([{ x: 80, y: 420, id: 1 }, { x: 310, y: 420, id: 2 }], 'touchMove');
  await pinch([], 'touchEnd');
  await new Promise((r) => setTimeout(r, 50));
  const pinched = await page.evaluate(() => Wimmel.getCamera().scale);
  if (!(pinched > phoneFit.scale * 1.3)) fail(`pinch zoom ${phoneFit.scale} -> ${pinched}`);
  await page.evaluate(() => { Wimmel.play(); Wimmel.resetView(); });
  await page.screenshot({ path: path.join(shots, 'phone.png') });

  const outside = [...hosts].filter((h) => h !== '127.0.0.1' && h !== `127.0.0.1:${port}`);
  if (outside.length) fail(`unexpected hosts ${outside.join(',')}`);
  if (consoleErrors.length) fail(`console errors:\n${consoleErrors.join('\n')}`);
} finally {
  await browser.close();
  server.close();
}

await renderReference();

await new Promise((resolve, reject) => {
  const py = `
import numpy as np
from PIL import Image
a=np.asarray(Image.open(${JSON.stringify(path.join(shots, 'browser-frame0.png'))}).convert('RGB'), dtype=np.float32)
b=np.asarray(Image.open(${JSON.stringify(path.join(shots, 'ref-frame0.png'))}).convert('RGB'), dtype=np.float32)
if a.shape != b.shape:
    raise SystemExit(f'shape {a.shape} vs {b.shape}')
d=np.abs(a-b)
mae=float(d.mean())
elon=float(np.abs(a[390:470,440:540]-b[390:470,440:540]).mean())
cab=float(np.abs(a[580:700,980:1160]-b[580:700,980:1160]).mean())
print(f'mae {mae:.3f} elon {elon:.3f} cab {cab:.3f}')
if mae > 8 or elon > 8 or cab > 12:
    raise SystemExit('frame 0 is not close to render_loop.py')
`;
  const child = spawn('python3', ['-c', py], { stdio: 'inherit' });
  child.on('exit', (code) => code === 0 ? resolve() : reject(new Error('frame compare failed')));
});

if (errors.length) {
  console.error(`${errors.length} browser checks failed`);
  process.exit(1);
}
console.log('browser ok', shots);
