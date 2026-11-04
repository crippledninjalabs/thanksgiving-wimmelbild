// Integer pixel buffer. Sprites and scenes write palette indices.
// The finished frame is expanded to RGBA once, then nearest-neighbor scaled.

export class Pix {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.b = new Uint8Array(w * h);
  }

  clear(c) {
    this.b.fill(c);
  }

  idx(x, y) {
    return y * this.w + x;
  }

  set(x, y, c) {
    x |= 0;
    y |= 0;
    if (!c || x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    this.b[this.idx(x, y)] = c;
  }

  get(x, y) {
    x |= 0;
    y |= 0;
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return 0;
    return this.b[this.idx(x, y)];
  }

  fill(x, y, w, h, c) {
    x |= 0;
    y |= 0;
    w |= 0;
    h |= 0;
    const x0 = Math.max(0, x);
    const y0 = Math.max(0, y);
    const x1 = Math.min(this.w, x + w);
    const y1 = Math.min(this.h, y + h);
    for (let yy = y0; yy < y1; yy++) {
      this.b.fill(c, this.idx(x0, yy), this.idx(x1, yy));
    }
  }

  hline(x, y, w, c) {
    this.fill(x, y, w, 1, c);
  }

  vline(x, y, h, c) {
    x |= 0;
    y |= 0;
    for (let i = 0; i < h; i++) this.set(x, y + i, c);
  }

  rect(x, y, w, h, c, edge) {
    this.fill(x, y, w, h, c);
    if (edge == null) return;
    this.hline(x, y, w, edge);
    this.hline(x, y + h - 1, w, edge);
    this.vline(x, y, h, edge);
    this.vline(x + w - 1, y, h, edge);
  }

  blit(spr, dx, dy, opt = {}) {
    const { flip = false, tint = null, clip = null } = opt;
    const { w, h, pix } = spr;
    for (let y = 0; y < h; y++) {
      const ty = dy + y;
      if (ty < 0 || ty >= this.h) continue;
      if (clip && (ty < clip.y || ty >= clip.y + clip.h)) continue;
      for (let x = 0; x < w; x++) {
        const sx = flip ? w - 1 - x : x;
        let c = pix[y * w + sx];
        if (!c) continue;
        if (tint && tint[c]) c = tint[c];
        const tx = dx + x;
        if (tx < 0 || tx >= this.w) continue;
        if (clip && (tx < clip.x || tx >= clip.x + clip.w)) continue;
        this.b[this.idx(tx, ty)] = c;
      }
    }
  }

  /** Shift palette indices inside a disc toward a warmer neighbor. */
  warmDisc(cx, cy, r, map) {
    const r2 = r * r;
    for (let y = cy - r; y <= cy + r; y++) {
      for (let x = cx - r; x <= cx + r; x++) {
        const d = (x - cx) * (x - cx) + (y - cy) * (y - cy);
        if (d > r2) continue;
        const c = this.get(x, y);
        const n = map[c];
        if (n) this.set(x, y, n);
      }
    }
  }

  toSprite() {
    return { w: this.w, h: this.h, pix: this.b };
  }

  toRGBA(pal) {
    const out = new Uint8ClampedArray(this.w * this.h * 4);
    const n = this.w * this.h;
    for (let i = 0; i < n; i++) {
      const c = pal[this.b[i]] || pal[0];
      const o = i * 4;
      out[o] = c[0];
      out[o + 1] = c[1];
      out[o + 2] = c[2];
      out[o + 3] = 255;
    }
    return out;
  }
}

export function spr(rows, map) {
  if (typeof rows === 'string') rows = rows.replace(/^\n/, '').replace(/\n$/, '').split('\n');
  const h = rows.length;
  const w = rows.reduce((m, r) => Math.max(m, r.length), 0);
  const pix = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    const row = rows[y];
    for (let x = 0; x < w; x++) {
      const ch = x < row.length ? row[x] : '.';
      if (ch === '.') continue;
      if (!Object.prototype.hasOwnProperty.call(map, ch)) {
        throw new Error(`Unknown sprite char '${ch}' at ${x},${y} in row "${row}"`);
      }
      pix[y * w + x] = map[ch];
    }
  }
  return { w, h, pix };
}
