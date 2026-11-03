// Write the 3× still and a 2× crop of Elon. No animation export.
// Usage: node pixel-test/export.js [out-dir]

import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { renderRGBA, W, H, ELON_POS } from './js/scene.js';
import { ELON, visibleHeight } from './js/sprites.js';

const outDir = process.argv[2] || '/tmp/banquet-still';
mkdirSync(outDir, { recursive: true });

const h = visibleHeight(ELON);
if (h < 56 || h > 66) throw new Error(`Elon height ${h}, expected 56–64`);
console.log(`Elon visible height ${h}px`);

function png(buf, w, hgt, file, scale) {
  return new Promise((resolve, reject) => {
    const ff = spawn('ffmpeg', [
      '-y', '-hide_banner', '-loglevel', 'error',
      '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${w}x${hgt}`, '-i', 'pipe:0',
      '-sws_flags', 'neighbor',
      '-vf', `scale=${w * scale}:${hgt * scale}:flags=neighbor`,
      file,
    ], { stdio: ['pipe', 'inherit', 'inherit'] });
    ff.on('error', reject);
    ff.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg ${code}`))));
    ff.stdin.end(buf);
  });
}

const rgba = renderRGBA();
await png(Buffer.from(rgba.buffer), W, H, `${outDir}/still.png`, 3);

// Face and body, with a margin of wall around the sprite.
const pad = 6;
const x0 = Math.max(0, ELON_POS.x - pad);
const y0 = Math.max(0, ELON_POS.y - pad);
const cw = Math.min(W - x0, ELON.w + pad * 2);
const ch = Math.min(H - y0, ELON.h + pad * 2);
const crop = new Uint8ClampedArray(cw * ch * 4);
for (let y = 0; y < ch; y++) {
  const src = ((y0 + y) * W + x0) * 4;
  crop.set(rgba.subarray(src, src + cw * 4), y * cw * 4);
}
await png(Buffer.from(crop.buffer), cw, ch, `${outDir}/elon_crop.png`, 2);
console.log(`wrote still ${W * 3}x${H * 3} and Elon crop ${cw * 2}x${ch * 2}`);
