// Render the style-test loop from the same tick function the page uses.
// Usage: node pixel-test/export.js [out-dir]

import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { once } from 'node:events';
import { renderRGBA, renderSheet, W, H, LOOP, HERO_TICK } from './js/scene.js';

const outDir = process.argv[2] || '/tmp/banquet-pixel';
mkdirSync(outDir, { recursive: true });

function raw(tick) {
  return Buffer.from(renderRGBA(tick).buffer);
}

const a = raw(0);
const b = raw(LOOP);
if (a.length !== b.length || !a.equals(b)) {
  for (let i = 0; i < a.length; i += 4) {
    if (a[i] !== b[i] || a[i + 1] !== b[i + 1] || a[i + 2] !== b[i + 2]) {
      const px = (i / 4) | 0;
      throw new Error(`seam mismatch at pixel ${px % W},${(px / W) | 0}`);
    }
  }
  throw new Error('seam mismatch');
}
console.log('seam ok: tick 0 equals tick 480');

function ffmpeg(args, stdin) {
  return new Promise((resolve, reject) => {
    const ff = spawn('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...args], { stdio: ['pipe', 'inherit', 'inherit'] });
    ff.on('error', reject);
    ff.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg ${code}`))));
    if (stdin) {
      ff.stdin.end(stdin);
    } else {
      ff.stdin.end();
    }
  });
}

async function pngFromRaw(buf, file, scale) {
  const sw = W * scale;
  const sh = H * scale;
  await ffmpeg([
    '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-i', 'pipe:0',
    '-sws_flags', 'neighbor',
    '-vf', `scale=${sw}:${sh}:flags=neighbor`,
    file,
  ], buf);
}

await pngFromRaw(raw(HERO_TICK), `${outDir}/hero.png`, 3);
await pngFromRaw(Buffer.from(renderSheet().buffer), `${outDir}/sheet.png`, 2);
console.log('wrote hero and sheet');

// Key frames for review, 1x (upscaled 3x alongside).
for (const t of [0, 40, 100, 160, 236, 300, 360, 430, 470]) {
  await pngFromRaw(raw(t), `${outDir}/t${String(t).padStart(3, '0')}.png`, 3);
}
console.log('wrote key frames');

if (process.argv.includes('--keys-only')) process.exit(0);

const ff = spawn('ffmpeg', [
  '-y', '-hide_banner', '-loglevel', 'error',
  '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '24', '-i', 'pipe:0',
  '-sws_flags', 'neighbor',
  '-vf', `scale=${W * 3}:${H * 3}:flags=neighbor`,
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '16', '-preset', 'medium',
  '-movflags', '+faststart',
  `${outDir}/loop.mp4`,
], { stdio: ['pipe', 'inherit', 'inherit'] });

for (let tick = 0; tick < LOOP; tick++) {
  const buf = raw(tick);
  if (!ff.stdin.write(buf)) await once(ff.stdin, 'drain');
  if (tick % 60 === 0) console.log(`frame ${tick}`);
}
ff.stdin.end();
await once(ff, 'close');
console.log('wrote loop');

writeFileSync(`${outDir}/meta.txt`, `internal ${W}x${H}\nhero tick ${HERO_TICK}\nloop ticks ${LOOP}\n`);
