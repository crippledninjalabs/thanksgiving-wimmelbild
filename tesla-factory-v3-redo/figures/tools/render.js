// Usage: node tools/render.js [sheets|anims|all] [name...]
// Renders sheets to out/<name>-sheet.png and animations to out/<name>.mp4 (30 fps, ffmpeg).
const path = require('path'), fs = require('fs'), { execFileSync } = require('child_process');
const { chromium } = require('/workspace/tesla-factory/review/node_modules/playwright-core');
const root = path.resolve(__dirname, '..'), out = path.join(root, 'out');
const mode = process.argv[2] || 'all', only = process.argv.slice(3);
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.error('PAGE ERROR', e.message));
  const url = (q) => 'file://' + path.join(root, 'sheets.html') + '?nonav=1&' + q;
  const grab = async () => Buffer.from((await page.evaluate(() => document.getElementById('cv').toDataURL('image/png'))).split(',')[1], 'base64');
  if (mode === 'sheets' || mode === 'all') {
    for (const n of ['optimus', 'elon', 'cybercab', 'vehicles', 'overview']) {
      if (only.length && !only.includes(n)) continue;
      await page.goto(url('sheet=' + n)); await page.waitForFunction(() => window.READY);
      fs.writeFileSync(path.join(out, n + '-sheet.png'), await grab()); console.log('wrote out/' + n + '-sheet.png');
    }
  }
  if (mode === 'anims' || mode === 'all') {
    await page.goto(url('sheet=overview'));
    const names = await page.evaluate(() => Object.keys(TF3.anims));
    for (const n of names) {
      if (only.length && !only.includes(n)) continue;
      const tmp = fs.mkdtempSync('/tmp/tf3-' + n + '-');
      const info = await page.evaluate((n) => { const a = TF3.anims[n]; const cv = document.getElementById('cv'); cv.width = a.w; cv.height = a.h; return { d: a.duration }; }, n);
      const frames = Math.round(info.d * 30);
      for (let i = 0; i < frames; i++) {
        const b64 = await page.evaluate(([n, t]) => { const a = TF3.anims[n]; a.draw(document.getElementById('cv').getContext('2d'), t); return document.getElementById('cv').toDataURL('image/png'); }, [n, i * info.d / frames]);
        fs.writeFileSync(path.join(tmp, String(i).padStart(4, '0') + '.png'), Buffer.from(b64.split(',')[1], 'base64'));
      }
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '30', '-i', path.join(tmp, '%04d.png'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', path.join(out, n + '.mp4')]);
      fs.rmSync(tmp, { recursive: true }); console.log('wrote out/' + n + '.mp4', frames, 'frames');
    }
  }
  await browser.close();
})();
