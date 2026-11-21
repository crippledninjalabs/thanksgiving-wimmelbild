// Debug helper: node tools/strip.js <anim> <n> -> /tmp/strip-<anim>.png (n frames side by side, half size)
const path = require('path'), fs = require('fs');
const { chromium } = require('/workspace/tesla-factory/review/node_modules/playwright-core');
const [name, n = 8] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' }); const p = await b.newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto('file://' + path.resolve(__dirname, '../sheets.html') + '?nonav=1&anim=' + name + '&t=0');
  const url = await p.evaluate(([name, n]) => {
    const a = TF3.anims[name], cv = document.createElement('canvas'), w = a.w / 2, h = a.h / 2, cols = 4;
    cv.width = w * cols; cv.height = h * Math.ceil(n / cols); const c = cv.getContext('2d');
    const src = document.getElementById('cv'); src.width = a.w; src.height = a.h;
    for (let i = 0; i < n; i++) { const t = a.duration * i / n; a.draw(src.getContext('2d'), t);
      c.drawImage(src, (i % cols) * w, Math.floor(i / cols) * h, w, h); c.fillStyle = '#888'; c.font = '14px sans-serif'; c.fillText(t.toFixed(2) + ' s', (i % cols) * w + 8, Math.floor(i / cols) * h + 18);
      c.strokeStyle = '#ddd'; c.strokeRect((i % cols) * w, Math.floor(i / cols) * h, w, h); }
    return cv.toDataURL('image/png');
  }, [name, +n]);
  fs.writeFileSync('/tmp/strip-' + name + '.png', Buffer.from(url.split(',')[1], 'base64')); await b.close();
})();
