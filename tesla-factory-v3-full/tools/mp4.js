// MP4 of the whole of floor 6 over the 48 s loop at 30 fps, 1280 wide -> out/stage1-floor6.mp4
// node tools/mp4.js [out=out/stage1-floor6.mp4] [theme=default] [seconds=48]
const fs = require('fs'), path = require('path'), os = require('os'), { execFileSync } = require('child_process');
const { open, ROOT } = require('./lib');
(async () => {
  const out = path.resolve(ROOT, process.argv[2] || 'out/stage1-floor6.mp4'), theme = process.argv[3] || 'default', secs = +(process.argv[4] || 48);
  const gagsoff = process.argv.includes('gagsoff');
  const vArg = process.argv[5] && process.argv[5] !== 'gagsoff' ? process.argv[5].split(',').map(Number) : null;
  const W = vArg ? vArg[3] || 1280 : 1280, H = vArg ? vArg[4] || 800 : 400, fps = 30, view = vArg ? { cx: vArg[0], cy: vArg[1], zoom: vArg[2] } : { cx: 2555, cy: 1645, zoom: 1280 / 2440 };
  const { browser, page, errors } = await open({ w: 800, h: 600, theme });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tf3-mp4-'));
  const N = Math.round(secs * fps);
  for (let i = 0; i < N; i++) {
    const b64 = await page.evaluate(([t, view, W, H, theme, gagsoff]) => {
      const c = window.__mp4c || (window.__mp4c = document.createElement('canvas')); c.width = W; c.height = H;
      window.TF.GAGS_OFF = gagsoff; window.TF.render.frame(c.getContext('2d'), W, H, t, view, theme, 1); return c.toDataURL('image/png').split(',')[1];
    }, [i / fps, view, W, H, theme, gagsoff]);
    fs.writeFileSync(path.join(tmp, String(i).padStart(5, '0') + '.png'), Buffer.from(b64, 'base64'));
  }
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', path.join(tmp, '%05d.png'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', out]);
  fs.rmSync(tmp, { recursive: true });
  console.log('wrote', path.relative(ROOT, out), N, 'frames', `${W}x${H}`, 'zoom', view.zoom.toFixed(3));
  if (errors.length) console.log('ERRORS:', errors.join('\n'));
  await browser.close();
})();
